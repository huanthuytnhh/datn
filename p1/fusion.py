"""
fusion.py — Hierarchical Cross-Modal Fusion (Paper Sec. 3.3).

FAAE  (3.3.1, eq 10-13): shallow-layer frequency-aware attention enhancement.
    Inputs : shallow spatial map X_S, SBCM spectral map X_f^local.
    Output : enhanced spatial map Y_S (same shape as X_S).

HCMA  (3.3.2, eq 14-17): deep hybrid cross-modal attention fusion.
    Inputs : spatial vector S (1792), local-freq vector F (2048),
             global-freq descriptor D (2304).
    Output : fused vector F_fused -> classifier.

Documented choices where the paper is dimensionally loose:
  • HCMA: paper text says project S,F to R^1792 but the W_Q/W_K/W_V are
    R^{1024x1024}. We project both modalities to d_model=1024 (matching the
    weight matrices) and run 8-head attention. A single fused vector is a
    1-token sequence, so to keep attention non-degenerate we treat the 8 heads
    as the sequence dimension (tokens = heads, head_dim = 1024/8 = 128).
  • FAAE: implemented as channel/spatial-aligned cross-modal gating that injects
    frequency context into the shallow spatial features (the eq 13 residual form
    Y_S = X_S + BN(Conv_S(alpha ⊙ Conv_F(X_f) · σ(γ_S)))).
"""
import torch
import torch.nn as nn
import torch.nn.functional as F


class FAAE(nn.Module):
    """Frequency-Aware Attention Enhancement (shallow fusion)."""

    def __init__(self, spatial_ch: int, freq_ch: int = 192, mid: int = 64):
        super().__init__()
        self.q_f = nn.Conv2d(freq_ch, mid, 1)
        self.q_s = nn.Conv2d(spatial_ch, mid, 1)
        self.k_f = nn.Conv2d(freq_ch, mid, 1)
        self.k_s = nn.Conv2d(spatial_ch, mid, 1)
        self.conv_f = nn.Conv2d(freq_ch, spatial_ch, 1)   # align freq -> spatial ch
        self.conv_s = nn.Conv2d(spatial_ch, spatial_ch, 1)
        self.bn = nn.BatchNorm2d(spatial_ch)
        self.gamma = nn.Parameter(torch.zeros(1))         # γ_S, starts at 0
        self.mid = mid

    def forward(self, x_s: torch.Tensor, x_f: torch.Tensor) -> torch.Tensor:
        # align freq map spatial size to spatial map
        if x_f.shape[-2:] != x_s.shape[-2:]:
            x_f = F.interpolate(x_f, size=x_s.shape[-2:], mode='bilinear',
                                align_corners=False)
        B, _, H, W = x_s.shape
        # cross-modal query/key (eq 10-11): concat freq+spatial projections
        q = torch.cat([self.q_f(x_f), self.q_s(x_s)], dim=1).flatten(2)   # [B,2mid,HW]
        k = torch.cat([self.k_f(x_f), self.k_s(x_s)], dim=1).flatten(2)   # [B,2mid,HW]
        # attention over spatial positions (eq 12)
        alpha = torch.softmax(
            torch.bmm(q.transpose(1, 2), k) / (2 * H) ** 0.5, dim=-1)     # [B,HW,HW]
        # frequency context, gated, injected into spatial (eq 13)
        ctx = self.conv_f(x_f).flatten(2).transpose(1, 2)                 # [B,HW,Cs]
        ctx = torch.bmm(alpha, ctx).transpose(1, 2).reshape(B, -1, H, W)  # [B,Cs,H,W]
        y_s = x_s + self.bn(self.conv_s(ctx * torch.sigmoid(self.gamma)))
        return y_s


class HCMA(nn.Module):
    """Hybrid Cross-Modal Attention Fusion (deep fusion)."""

    def __init__(self, s_dim: int = 1792, f_dim: int = 2048,
                 d_dim: int = 2304, d_model: int = 1024, heads: int = 8):
        super().__init__()
        self.heads = heads
        self.dk = d_model // heads
        self.s_proj = nn.Linear(s_dim, d_model)     # S'  (eq: S' ∈ R^d_model)
        self.f_proj = nn.Linear(f_dim, d_model)     # F'
        self.Wq = nn.Linear(d_model, d_model, bias=False)
        self.Wk = nn.Linear(d_model, d_model, bias=False)
        self.Wv = nn.Linear(d_model, d_model, bias=False)
        self.res_conv = nn.Conv1d(1, 1, 1)          # 1x1 over the d_model channels
        self.res_bn = nn.BatchNorm1d(d_model)
        self.gate = nn.Linear(d_dim, d_model)       # W_g ∈ R^{d_model x 2304} (eq 16)

    def forward(self, S: torch.Tensor, Fv: torch.Tensor, D: torch.Tensor):
        B = S.shape[0]
        Sp = self.s_proj(S)                         # [B,d_model]
        Fp = self.f_proj(Fv)                        # [B,d_model]
        # tokens = heads (see module docstring)
        q = self.Wq(Sp).view(B, self.heads, self.dk)
        k = self.Wk(Fp).view(B, self.heads, self.dk)
        v = self.Wv(Fp).view(B, self.heads, self.dk)
        att = torch.softmax(
            torch.bmm(q, k.transpose(1, 2)) / (self.dk) ** 0.5, dim=-1)   # [B,h,h]
        A = torch.bmm(att, v).reshape(B, -1)                              # [B,d_model]
        # residual (eq 15): A + BN(Conv1x1(S'))
        res = self.res_bn(self.res_conv(Sp.unsqueeze(1)).squeeze(1))
        A_res = A + res
        # dynamic gating from global differential descriptor (eq 16-17)
        g = torch.sigmoid(self.gate(D))                                   # [B,d_model]
        F_fused = A_res * g
        return F_fused


if __name__ == "__main__":
    # FAAE shape test
    xs = torch.randn(2, 256, 47, 47)   # shallow spatial map
    xf = torch.randn(2, 192, 47, 47)   # SBCM map
    ys = FAAE(spatial_ch=256)(xs, xf)
    print("FAAE  Y_S", tuple(ys.shape), "(expected == X_S)")
    # HCMA shape test
    S = torch.randn(2, 1792); Fv = torch.randn(2, 2048); D = torch.randn(2, 2304)
    ff = HCMA()(S, Fv, D)
    print("HCMA  F_fused", tuple(ff.shape), "(expected [2,1024])")
