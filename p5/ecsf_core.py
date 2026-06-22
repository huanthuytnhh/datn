"""
ecsf_core.py — Core modules for ECSF-Fast (drop into DeepfakeBench).

Pieces:
  BlockDCT   : block-wise 8x8 DCT front-end (kept from the SFCL idea)
  LFBA       : Learnable Frequency-Band Attention (LIGHT replacement for
               SFCL's SBCM + CNN-F + SIDA)  -> F vector
  GatedFusion: single-stage gated cross-fusion (LIGHT replacement for
               SFCL's FAAE + HCMA)          -> fused vector

Designed to operate on the tensor produced by the DeepfakeBench dataloader
(image already normalized). An optional de-normalization brings it back toward
pixel range before the DCT; controlled by the detector config.
"""
import torch
import torch.nn as nn
import torch.nn.functional as F


# ---------- block-wise DCT ----------
def _dct_matrix(n=8):
    k = torch.arange(n).float()
    M = torch.cos(torch.pi * (2 * k.view(1, -1) + 1) * k.view(-1, 1) / (2 * n))
    M[0, :] *= (1.0 / n) ** 0.5
    M[1:, :] *= (2.0 / n) ** 0.5
    return M


def _zigzag(n=8):
    idx = []
    for s in range(2 * n - 1):
        rng = range(s + 1) if s % 2 else range(s, -1, -1)
        for k in rng:
            r, c = (k, s - k) if s % 2 else (s - k, k)
            if r < n and c < n:
                idx.append(r * n + c)
    return torch.tensor(idx, dtype=torch.long)


class BlockDCT(nn.Module):
    """image [B,3,H,W] -> X~ [B,3,64,H/8,W/8] (zigzag low->high)."""
    def __init__(self, block=8):
        super().__init__()
        self.b = block
        self.register_buffer("M", _dct_matrix(block))
        self.register_buffer("zz", _zigzag(block))

    def forward(self, x):
        b = self.b
        B, C, H, W = x.shape
        ph, pw = (b - H % b) % b, (b - W % b) % b
        if ph or pw:
            x = F.pad(x, (0, pw, 0, ph), mode="reflect")
            B, C, H, W = x.shape
        x = x.unfold(2, b, b).unfold(3, b, b)               # [B,C,H/8,W/8,8,8]
        x = torch.einsum("pq,bcijqr->bcijpr", self.M, x)
        x = torch.einsum("bcijpr,rs->bcijps", x, self.M.t())
        x = x.reshape(B, C, H // b, W // b, b * b)           # [B,C,H/8,W/8,64]
        x = x.index_select(-1, self.zz)
        return x.permute(0, 1, 4, 2, 3).contiguous()         # [B,C,64,H/8,W/8]


# ---------- LFBA: learnable frequency-band attention ----------
class LFBA(nn.Module):
    """X~ [B,3,64,h,w] -> F [B, out_dim].  Replaces SBCM+CNN-F+SIDA (light)."""
    def __init__(self, in_ch=3, n_bands=64, out_dim=256):
        super().__init__()
        d = in_ch * n_bands  # 192
        # band-attention: descriptor over spatial -> per-band weight
        self.att = nn.Sequential(
            nn.Linear(d, d // 2), nn.ReLU(inplace=True),
            nn.Linear(d // 2, d), nn.Sigmoid())
        # light conv head over reweighted spectral map
        self.head = nn.Sequential(
            nn.Conv2d(d, d, 3, 1, 1, groups=d, bias=False),  # depthwise
            nn.Conv2d(d, 256, 1, bias=False), nn.BatchNorm2d(256), nn.ReLU(True),
            nn.Conv2d(256, 256, 3, 2, 1, groups=1, bias=False),
            nn.BatchNorm2d(256), nn.ReLU(True))
        self.gap = nn.AdaptiveAvgPool2d(1)
        self.proj = nn.Linear(256, out_dim)
        self.in_ch, self.n_bands = in_ch, n_bands

    def forward(self, xt):
        B, C, Fr, h, w = xt.shape
        desc = xt.mean(dim=(-1, -2)).reshape(B, C * Fr)      # [B,192]
        a = self.att(desc).view(B, C, Fr, 1, 1)              # band weights
        xt = xt * a                                          # reweight bands
        m = xt.reshape(B, C * Fr, h, w)                      # [B,192,h,w]
        m = self.head(m)
        return self.proj(self.gap(m).flatten(1))             # [B,out_dim]


# ---------- frequency-conditioned gated fusion ----------
class GatedFusion(nn.Module):
    """Frequency-conditioned gated fusion with a spatial residual.

    Spatial S and frequency F are projected to d, concatenated, then a
    frequency-aware gate modulates the mixed representation while a spatial
    residual preserves the backbone signal:
        Sp = Ws.S ; Fp = Wf.F
        g     = sigmoid(Wg.[Sp;Fp])           # frequency-aware gate, (0,1)^d
        mix   = relu(Wm.[Sp;Fp])              # joint spatial-frequency mix
        out   = Sp + g * mix                  # spatial residual + gated fusion

    `use_frequency=False` bypasses the frequency branch entirely and returns the
    spatial path only (out = Sp) -- the CLEAN spatial-only ablation that the
    block-DCT contribution Δ is measured against (same head, freq toggled).

    Replaces the earlier single-stage variant whose softmax(.,dim=size-1) gate
    was a mathematical no-op (always 1) -> frequency barely reached the output.
    """
    def __init__(self, s_dim, f_dim=256, d=256, use_frequency=True):
        super().__init__()
        self.use_frequency = use_frequency
        self.s = nn.Linear(s_dim, d)
        self.bn_s = nn.BatchNorm1d(d)                        # scale-balance spatial
        if use_frequency:
            self.f = nn.Linear(f_dim, d)
            self.bn_f = nn.BatchNorm1d(d)                    # scale-balance frequency
            self.mix = nn.Linear(2 * d, d)
            self.gate = nn.Sequential(nn.Linear(2 * d, d), nn.Sigmoid())
        self.d = d

    def forward(self, S, Fv=None):
        Sp = self.bn_s(self.s(S))                            # unit-scale spatial
        if not self.use_frequency or Fv is None:
            return Sp                                        # spatial-only ablation
        Fp = self.bn_f(self.f(Fv))                           # unit-scale frequency
        cat = torch.cat([Sp, Fp], dim=-1)                    # [B,2d]
        g = self.gate(cat)                                   # [B,d] frequency-aware gate
        mix = torch.relu(self.mix(cat))                      # [B,d] joint mix
        return Sp + g * mix                                  # [B,d]


# ---------- assembled head (backbone passed in by the detector) ----------
class ECSFHead(nn.Module):
    """Everything except the (frozen) spatial backbone.

    `use_frequency=False` removes the block-DCT + LFBA branch and runs the
    spatial path only -> the ablation baseline for measuring the block-DCT Δ.
    """
    def __init__(self, s_dim=1792, num_classes=2, denorm_mean=None, denorm_std=None,
                 use_frequency=True):
        super().__init__()
        self.use_frequency = use_frequency
        if use_frequency:
            self.dct = BlockDCT()
            self.lfba = LFBA(out_dim=256)
        self.fusion = GatedFusion(s_dim=s_dim, f_dim=256, d=256, use_frequency=use_frequency)
        self.cls = nn.Sequential(
            nn.Linear(256, 128), nn.ReLU(inplace=True), nn.Dropout(0.5),
            nn.Linear(128, num_classes))
        # optional de-normalization back toward pixel space for the DCT branch
        self.register_buffer("mean", torch.tensor(denorm_mean).view(1, 3, 1, 1)
                             if denorm_mean else torch.zeros(1, 3, 1, 1))
        self.register_buffer("std", torch.tensor(denorm_std).view(1, 3, 1, 1)
                             if denorm_std else torch.ones(1, 3, 1, 1))

    def forward(self, image, S):
        if not self.use_frequency:
            return self.cls(self.fusion(S))                  # spatial-only ablation
        img_for_dct = image * self.std + self.mean           # de-normalize if set
        xt = self.dct(img_for_dct)
        Fv = self.lfba(xt)
        return self.cls(self.fusion(S, Fv))


if __name__ == "__main__":
    # standalone shape test with a MOCK B4 backbone (DeepfakeBench not needed)
    B = 4
    image = torch.randn(B, 3, 256, 256)        # normalized image (as DFB provides)
    S = torch.randn(B, 1792)                   # pretend B4 spatial vector
    head = ECSFHead(s_dim=1792,
                    denorm_mean=[0.485, 0.456, 0.406],
                    denorm_std=[0.229, 0.224, 0.225])
    logits = head(image, S)
    n = sum(p.numel() for p in head.parameters()) / 1e6
    print("ECSF head (no backbone) params: %.2fM" % n)
    print("logits", tuple(logits.shape), "(expected [4,2])")
    logits.sum().backward()
    print("backward ok")
