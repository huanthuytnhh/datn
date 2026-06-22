"""
sida.py — Global Branch: Scale-Invariant Differential Analysis (Paper 3.2.1).

Input : X~ ∈ R[B, C, 64, h, w]   (block-wise DCT tensor, h=H/8, w=W/8)
Output: D  ∈ R[B, 2304]          (global differential frequency descriptor)

Steps (paper eq. 1-8):
  • inter-block ROW diff  : X~[..,m+1,:] - X~[..,m,:]      -> [B,C,64,h-1,w]
  • inter-block COL diff  : X~[..,:,n+1] - X~[..,:,n]      -> [B,C,64,h,w-1]
  • intra-block diff      : X~[:,l+1] - X~[:,l] (freq dim) -> [B,C,63,h,w] (pad->64)
  • on |.| of each map, compute mean/std/skew/kurt over the (h,w) spatial dims
    -> each gives a (C*64)=192-d vector.
  • D = cat( flat(Mean_k), flat(Std_k), flat(Skew_k), flat(Kurt_k) ),
        k ∈ {row,col,intra}  ->  4 * (3*192) = 2304.
"""
import torch
import torch.nn as nn
import torch.nn.functional as F


def _spatial_stats(x: torch.Tensor, eps: float = 1e-6):
    """x: [B,C,F,h,w] -> mean,std,skew,kurt each [B, C*F] (stats over h,w)."""
    a = x.abs()
    B, C, Fr, h, w = a.shape
    a = a.reshape(B, C, Fr, h * w)
    mean = a.mean(-1)
    diff = a - mean.unsqueeze(-1)
    var = (diff ** 2).mean(-1)
    std = torch.sqrt(var + eps)
    skew = (diff ** 3).mean(-1) / (std ** 3 + eps)
    kurt = (diff ** 4).mean(-1) / (std ** 4 + eps)
    flat = lambda t: t.reshape(B, C * Fr)
    return flat(mean), flat(std), flat(skew), flat(kurt)


class SIDA(nn.Module):
    """Global differential frequency descriptor D ∈ R[B,2304]."""

    def __init__(self):
        super().__init__()

    def forward(self, xt: torch.Tensor) -> torch.Tensor:
        # xt: [B, C, 64, h, w]
        row = xt[:, :, :, 1:, :] - xt[:, :, :, :-1, :]      # [B,C,64,h-1,w]
        col = xt[:, :, :, :, 1:] - xt[:, :, :, :, :-1]      # [B,C,64,h,w-1]
        intra = xt[:, :, 1:, :, :] - xt[:, :, :-1, :, :]    # [B,C,63,h,w]
        intra = F.pad(intra, (0, 0, 0, 0, 0, 1))            # zero-pad freq -> 64

        m_r, s_r, sk_r, k_r = _spatial_stats(row)
        m_c, s_c, sk_c, k_c = _spatial_stats(col)
        m_i, s_i, sk_i, k_i = _spatial_stats(intra)

        # group by statistic, then by derivative type (paper eq. 8)
        mean = torch.cat([m_r, m_c, m_i], dim=1)
        std = torch.cat([s_r, s_c, s_i], dim=1)
        skew = torch.cat([sk_r, sk_c, sk_i], dim=1)
        kurt = torch.cat([k_r, k_c, k_i], dim=1)
        D = torch.cat([mean, std, skew, kurt], dim=1)       # [B, 2304]
        return D


if __name__ == "__main__":
    from sfcl.dct import BlockDCT
    dct = BlockDCT()
    x = torch.rand(2, 3, 376, 376) * 255
    xt = dct(x)
    D = SIDA()(xt)
    print("X~", tuple(xt.shape), "-> D", tuple(D.shape), "(expected [2,2304])")
