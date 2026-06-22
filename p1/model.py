"""
model.py — Full SFCL-HCMF network (Paper Fig. 2).

Assembles:           BlockDCT  ─┬─►  LocalBranch (SBCM+CNN-F) ─► F (2048), SBCM map
                                └─►  SIDA (Global Branch)      ─► D (2304)
  Spatial: EfficientNet-B4 ─► shallow map X_S, deep vector S (1792)
  Shallow fusion: FAAE(X_S, SBCM map) ─► enhanced spatial (feeds the deep vector)
  Deep fusion:    HCMA(S, F, D)        ─► F_fused ─► Classifier ─► {real, fake}

This is a re-implementation of (no official code released):
  Qiao, Tian, Wang, "Towards Generalizable Deepfake Detection with
  Spatial-Frequency Collaborative Learning and Hierarchical Cross-Modal
  Fusion", arXiv:2504.17223, 2025  (later: SFCL, IJCB 2025).

Intended use: a faithful BASELINE to compare against — cite the paper; do not
present as original work.
"""
import torch
import torch.nn as nn

from sfcl.dct import BlockDCT
from sfcl.sida import SIDA
from sfcl.local_branch import LocalBranch
from sfcl.fusion import FAAE, HCMA
from sfcl.spatial import SpatialBackbone


class SFCL_HCMF(nn.Module):
    def __init__(self, num_classes: int = 2, backbone: str = "auto",
                 pretrained: bool = True, d_model: int = 1024,
                 use_local: bool = True, use_sida: bool = True,
                 use_faae: bool = True, use_hcma: bool = True):
        super().__init__()
        # ablation flags (paper Tables 3 & 4): toggle each key component
        self.use_local = use_local
        self.use_sida = use_sida
        self.use_faae = use_faae
        self.use_hcma = use_hcma
        self.dct = BlockDCT()
        self.spatial = SpatialBackbone(backbone=backbone, pretrained=pretrained)
        self.local = LocalBranch(freq_feat_dim=2048)
        self.sida = SIDA()
        self.faae = FAAE(spatial_ch=self.spatial.SHALLOW_CH, freq_ch=192)
        self.hcma = HCMA(s_dim=self.spatial.DEEP_DIM, f_dim=2048,
                         d_dim=2304, d_model=d_model)
        # FAAE-enhanced shallow map -> a compact vector mixed into S
        self.enh_pool = nn.Sequential(
            nn.AdaptiveAvgPool2d(1), nn.Flatten())
        self.enh_proj = nn.Linear(self.spatial.SHALLOW_CH, self.spatial.DEEP_DIM)
        # fallback simple-concat fusion head (when HCMA is ablated)
        self.concat_head = nn.Sequential(
            nn.Linear(self.spatial.DEEP_DIM + 2048 + 2304, d_model),
            nn.ReLU(inplace=True))
        self.classifier = nn.Sequential(
            nn.Linear(d_model, 512), nn.ReLU(inplace=True), nn.Dropout(0.5),
            nn.Linear(512, num_classes))

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # x: [B,3,H,W] in 0..255
        xt = self.dct(x)                      # [B,3,64,h,w]
        shallow, S = self.spatial(x)          # map, [B,1792]
        F_vec, sb_map = self.local(xt)        # [B,2048], [B,192,h,w]
        D = self.sida(xt) if self.use_sida else torch.zeros(
            x.size(0), 2304, device=x.device)
        if not self.use_local:
            F_vec = torch.zeros_like(F_vec)
        # shallow fusion enhances spatial features with frequency context
        if self.use_faae:
            enh = self.faae(shallow, sb_map)
            S = S + self.enh_proj(self.enh_pool(enh))
        # deep cross-modal fusion (HCMA) or simple concat fallback
        if self.use_hcma:
            fused = self.hcma(S, F_vec, D)    # [B,d_model]
        else:
            fused = self.concat_head(torch.cat([S, F_vec, D], dim=1))
        return self.classifier(fused)         # [B,num_classes]


def build_model(**kw) -> SFCL_HCMF:
    return SFCL_HCMF(**kw)


if __name__ == "__main__":
    model = build_model(backbone="stub", pretrained=False)
    n_param = sum(p.numel() for p in model.parameters()) / 1e6
    x = torch.rand(2, 3, 376, 376) * 255
    out = model(x)
    print(f"params: {n_param:.1f}M")
    print("logits", tuple(out.shape), "(expected [2,2])")
    # quick backward sanity
    loss = out.sum(); loss.backward()
    print("backward ok")
