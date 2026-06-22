'''
efficientnetb4_dct_detector.py
------------------------------
B4 + DCT-residual channel attention, built ON TOP of DeepfakeBench's
EfficientDetector by inheritance. Only features() is overridden, so loss /
metrics / forward / classifier are all reused unchanged.

Design:
- A DCT channel-attention module (FcaNet) is applied to the final B4 feature map.
- It is wrapped in a learnable residual gate `alpha`, initialised to 0, so at the
  start of training the module is the identity -> the pretrained B4 behaves
  exactly like the baseline. The network only deviates as `alpha` learns.

SETUP (3 steps, see SETUP_DCT.md):
  1. Copy FcaNet's layer code into training/networks/fca_layer.py
     (from https://github.com/cfzd/FcaNet , file model/layer.py :
      MultiSpectralAttentionLayer, MultiSpectralDCTLayer, get_freq_indices).
  2. Register this detector in training/detectors/__init__.py :
         from .efficientnetb4_dct_detector import EfficientDCTDetector
  3. Train with training/config/detector/efficientnetb4_dct.yaml

VERIFY:
- The import path `networks.fca_layer` and the class signature
  MultiSpectralAttentionLayer(channel, dct_h, dct_w, reduction, freq_sel_method)
  must match the file you actually copied from FcaNet.
- `dct_channels` (default 1792) must equal the channel count of
  self.backbone.features(x). Print it once to confirm (see SETUP_DCT.md).
'''
import logging

import torch
import torch.nn as nn

from detectors import DETECTOR
from .efficientnetb4_detector import EfficientDetector

# NOTE: confirm this path/name against the file you copied from FcaNet.
from networks.fca_layer import MultiSpectralAttentionLayer

logger = logging.getLogger(__name__)


class DCTResidualAttention(nn.Module):
    """DCT channel attention (FcaNet) inside a learnable residual gate.

    FcaNet adaptive-pools the feature map to (dct_h, dct_w) before the DCT, so we
    do NOT need the exact spatial size of the B4 feature map -- only its channels.
    """

    def __init__(self, channels, dct_h=7, dct_w=7, reduction=16, freq_sel='top16'):
        super().__init__()
        self.fca = MultiSpectralAttentionLayer(
            channels, dct_h, dct_w, reduction=reduction, freq_sel_method=freq_sel
        )
        # alpha = 0 at init  =>  forward(x) == x  =>  pretrained weights preserved
        self.alpha = nn.Parameter(torch.zeros(1))

    def forward(self, x):
        recalibrated = self.fca(x)              # FcaNet returns x * channel_weights
        return x + self.alpha * (recalibrated - x)


@DETECTOR.register_module(module_name='efficientnetb4_dct')
class EfficientDCTDetector(EfficientDetector):
    def __init__(self, config):
        super().__init__(config)                # builds B4 backbone + loss (reused)
        c = config.get('dct_channels', 1792)    # final feature channels of B4
        dct_h = config.get('dct_h', 7)
        dct_w = config.get('dct_w', 7)
        self.dct_att = DCTResidualAttention(c, dct_h, dct_w)
        logger.info(f'[DCT] DCTResidualAttention added: channels={c}, dct={dct_h}x{dct_w}')

    def features(self, data_dict: dict) -> torch.tensor:
        x = self.backbone.features(data_dict['image'])
        return self.dct_att(x)                  # inject DCT attention (residual)
