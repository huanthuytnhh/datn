'''
ecsf_detector.py  —  DeepfakeBench drop-in detector for ECSF-Fast.

PLACE THIS FILE AT:  DeepfakeBench/training/detectors/ecsf_detector.py
and copy ecsf_core.py next to it (or into training/networks/).

Re-uses DeepfakeBench's standard interface (mirrors xception_detector.py):
  build_backbone / build_loss / features / classifier / get_losses /
  get_train_metrics / get_test_metrics / forward.

ECSF-Fast = SFCL-style spatial-frequency detection, but:
  • spatial backbone = EfficientNet-B4 (DeepfakeBench BACKBONE), MOSTLY FROZEN
  • frequency branch = LFBA (light)         instead of SBCM + CNN-F + SIDA
  • fusion = single-stage gated cross-fusion instead of FAAE + HCMA
Trained UNDER the DeepfakeBench protocol so numbers are leaderboard-comparable.
SFCL-HCMF (Qiao et al. 2025) is the architectural inspiration / baseline.
'''
import logging
import torch
import torch.nn as nn
from sklearn import metrics
from metrics.base_metrics_class import calculate_metrics_for_train
from .base_detector import AbstractDetector
from detectors import DETECTOR
from networks import BACKBONE
from loss import LOSSFUNC

from .ecsf_core import ECSFHead   # the light DCT+LFBA+fusion head

logger = logging.getLogger(__name__)


@DETECTOR.register_module(module_name='ecsf')
class ECSFDetector(AbstractDetector):
    def __init__(self, config):
        super().__init__()
        self.config = config
        self.backbone = self.build_backbone(config)      # EfficientNet-B4
        self.loss_func = self.build_loss(config)

        # ---- efficiency recipe 1: freeze most of the backbone (PEFT) ----
        n_unfreeze = config.get('unfreeze_last_blocks', 2)
        self._freeze_backbone(n_unfreeze)

        # spatial feature dim (EfficientNet-B4 = 1792)
        s_dim = config.get('spatial_feat_dim', 1792)
        # use_frequency=False -> spatial-only ablation baseline (measures block-DCT Δ)
        self.head = ECSFHead(
            s_dim=s_dim,
            num_classes=config.get('num_classes', 2),
            denorm_mean=config.get('denorm_mean', None),
            denorm_std=config.get('denorm_std', None),
            use_frequency=config.get('use_frequency', True),
        )
        # ---- efficiency recipe 2: EMA of weights (optional) ----
        self.use_ema = config.get('use_ema', True)

    # ---------------- standard DeepfakeBench hooks ----------------
    def build_backbone(self, config):
        backbone_class = BACKBONE[config['backbone_name']]   # 'efficientnetb4'
        backbone = backbone_class(config['backbone_config'])
        try:
            state_dict = torch.load(config['pretrained'])
            state_dict = {k: v for k, v in state_dict.items() if 'fc' not in k
                          and 'classifier' not in k}
            backbone.load_state_dict(state_dict, False)
            logger.info('ECSF: loaded ImageNet-pretrained B4 backbone.')
        except Exception as e:
            logger.warning(f'ECSF: pretrained load skipped ({e}).')
        return backbone

    def build_loss(self, config):
        return LOSSFUNC[config['loss_func']]()

    def _freeze_backbone(self, n_unfreeze):
        params = list(self.backbone.named_parameters())
        for name, p in params:
            p.requires_grad = False
        # heuristically unfreeze the last n "blocks" + norms (name-based)
        if n_unfreeze > 0:
            tail = params[-max(1, n_unfreeze) * 8:]   # ~last layers
            for name, p in tail:
                p.requires_grad = True
        n_tr = sum(p.numel() for p in self.parameters() if p.requires_grad) / 1e6
        logger.info(f'ECSF: trainable params ~= {n_tr:.2f}M after freeze.')

    def features(self, data_dict: dict) -> torch.tensor:
        # spatial feature map from the (frozen) backbone
        img = data_dict['image']
        feat_map = self.backbone.features(img)               # [B,1792,h,w]
        S = torch.nn.functional.adaptive_avg_pool2d(feat_map, 1).flatten(1)
        # fused logits computed in classifier(); we pass both through a tuple
        return (img, S)

    def classifier(self, features) -> torch.tensor:
        img, S = features
        return self.head(img, S)                             # logits [B,2]

    def get_losses(self, data_dict: dict, pred_dict: dict) -> dict:
        label = data_dict['label']
        pred = pred_dict['cls']
        loss = self.loss_func(pred, label)
        return {'overall': loss, 'cls': loss}

    def get_train_metrics(self, data_dict: dict, pred_dict: dict) -> dict:
        label = data_dict['label']
        pred = pred_dict['cls']
        auc, eer, acc, ap = calculate_metrics_for_train(label.detach(), pred.detach())
        return {'acc': acc, 'auc': auc, 'eer': eer, 'ap': ap}

    def forward(self, data_dict: dict, inference=False) -> dict:
        features = self.features(data_dict)
        pred = self.classifier(features)
        prob = torch.softmax(pred, dim=1)[:, 1]
        return {'cls': pred, 'prob': prob, 'feat': features[1]}
