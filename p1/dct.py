"""
dct.py — Block-wise DCT front-end (Paper Sec. 3.2).

Re-implementation of the frequency front-end described in:
    Qiao, Tian, Wang. "Towards Generalizable Deepfake Detection with
    Spatial-Frequency Collaborative Learning and Hierarchical Cross-Modal
    Fusion." arXiv:2504.17223 (2025).  [no official code released]

Pipeline (paper, verbatim intent):
  1. RGB -> YCbCr.
  2. Block-wise DCT with block size 8x8 on all 3 channels (JPEG-style).
  3. Zigzag-scan each 8x8 block -> 64 coeffs ordered low->high frequency.
  4. Re-arrange into a 4D tensor  X~ ∈ R[C, 64, H/8, W/8]  that explicitly
     preserves spatial–frequency relationships.

Everything here is differentiable (pure tensor ops), so it can sit inside
the network and run on GPU.
"""
import torch
import torch.nn as nn
import torch.nn.functional as F

# ----- RGB <-> YCbCr (BT.601, the convention used by JPEG) -----
_RGB2YCBCR = torch.tensor([
    [ 0.299,     0.587,     0.114   ],
    [-0.168736, -0.331264,  0.5     ],
    [ 0.5,      -0.418688, -0.081312],
])
_YCBCR_OFF = torch.tensor([0.0, 128.0, 128.0])


def rgb_to_ycbcr(x: torch.Tensor) -> torch.Tensor:
    """x: [B,3,H,W] in [0,255] -> YCbCr [B,3,H,W]."""
    m = _RGB2YCBCR.to(x.device, x.dtype)
    off = _YCBCR_OFF.to(x.device, x.dtype).view(1, 3, 1, 1)
    out = torch.einsum('ij,bjhw->bihw', m, x) + off
    return out


# ----- 8x8 DCT-II as a fixed linear basis -----
def _dct_matrix(n: int = 8) -> torch.Tensor:
    k = torch.arange(n).float()
    i = k.view(-1, 1)
    j = k.view(1, -1)
    M = torch.cos(torch.pi * (2 * j + 1) * i / (2 * n))
    M[0, :] *= 1.0 / (n ** 0.5)
    M[1:, :] *= (2.0 / n) ** 0.5
    return M  # [n,n], applies as M @ x @ M^T per block


# ----- zigzag order for an 8x8 block (JPEG) -----
def _zigzag_index(n: int = 8):
    idx = []
    for s in range(2 * n - 1):
        ks = range(s + 1) if s % 2 else range(s, -1, -1)
        for k in ks:
            r, c = (k, s - k) if s % 2 else (s - k, k)
            if r < n and c < n:
                idx.append(r * n + c)
    return torch.tensor(idx, dtype=torch.long)  # [64]


class BlockDCT(nn.Module):
    """RGB[B,3,H,W] (0..255) -> X~ [B,3,64,H/8,W/8], zigzag low->high freq."""

    def __init__(self, block: int = 8, to_ycbcr: bool = True):
        super().__init__()
        self.block = block
        self.to_ycbcr = to_ycbcr
        self.register_buffer('M', _dct_matrix(block))
        self.register_buffer('zz', _zigzag_index(block))

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        b = self.block
        if self.to_ycbcr:
            x = rgb_to_ycbcr(x)
        x = x - 128.0  # center, as in JPEG before DCT

        # auto-pad to a multiple of the block size (EfficientNet's native
        # 380x380 is not divisible by 8 -> reflect-pad to 384x384)
        B, C, H, W = x.shape
        ph = (b - H % b) % b
        pw = (b - W % b) % b
        if ph or pw:
            x = F.pad(x, (0, pw, 0, ph), mode='reflect')
            B, C, H, W = x.shape
        # split into non-overlapping 8x8 blocks
        x = x.unfold(2, b, b).unfold(3, b, b)          # [B,C,H/8,W/8,8,8]
        # 2D DCT per block:  M @ block @ M^T
        x = torch.einsum('pq,bcijqr->bcijpr', self.M, x)
        x = torch.einsum('bcijpr,rs->bcijps', x, self.M.t())
        # flatten the 8x8 -> 64 and apply zigzag ordering
        x = x.reshape(B, C, H // b, W // b, b * b)     # [B,C,H/8,W/8,64]
        x = x.index_select(-1, self.zz)                # zigzag low->high
        # -> [B, C, 64, H/8, W/8]
        x = x.permute(0, 1, 4, 2, 3).contiguous()
        return x


if __name__ == "__main__":
    dct = BlockDCT()
    x = torch.rand(2, 3, 380 // 8 * 8, 380 // 8 * 8) * 255  # 376x376 divisible by 8
    y = dct(x)
    print("input ", tuple(x.shape))
    print("X~ out", tuple(y.shape), "(expected [2,3,64,H/8,W/8])")
