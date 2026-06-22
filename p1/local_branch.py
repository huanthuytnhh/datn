"""
local_branch.py — Local Branch (Paper Sec. 3.2.2).

    X~ [B,3,64,h,w]  --SBCM-->  X_f^local [B,64,3,h,w]
                     --flatten(0,1 of C,3)-->  [B,192,h,w]
                     --CNN-F (Xception-style)-->  F ∈ R[B,2048]

Notes on faithful-but-ambiguous parts (documented choices):
  • Paper: SBCM uses stacked 3D conv blocks, kernel=(x,1,1), x = 7,5,3, sliding
    along the 64 spectral-band dimension; output stated as C=64, depth=3.
    The intermediate channel schedule is not given -> we use 3→16→32→64 and
    reduce the spectral depth 64→3 via strided 3D conv + adaptive pooling.
  • Paper: CNN-F = Xception with the first two conv layers and one
    depthwise-separable block removed, replaced by SBCM, input channels set
    to 192. torchvision/timm Xception is not always available, so we provide a
    self-contained Xception-style body (separable-conv stacks) that takes 192
    channels and emits a 2048-d vector. Swap in timm's `xception` if you want
    the exact original weights/topology.
"""
import torch
import torch.nn as nn
import torch.nn.functional as F


class SBCM(nn.Module):
    """Spectral Band Convolution Module: 3D convs along the 64-band dim."""

    def __init__(self, in_ch: int = 3, out_ch: int = 64):
        super().__init__()
        # kernel sizes along (depth=spectral band, h, w) = (7,1,1)->(5,1,1)->(3,1,1)
        self.net = nn.Sequential(
            nn.Conv3d(in_ch, 16, (7, 1, 1), stride=(2, 1, 1), padding=(3, 0, 0)),
            nn.BatchNorm3d(16), nn.ReLU(inplace=True),
            nn.Conv3d(16, 32, (5, 1, 1), stride=(2, 1, 1), padding=(2, 0, 0)),
            nn.BatchNorm3d(32), nn.ReLU(inplace=True),
            nn.Conv3d(32, out_ch, (3, 1, 1), stride=(2, 1, 1), padding=(1, 0, 0)),
            nn.BatchNorm3d(out_ch), nn.ReLU(inplace=True),
        )
        self.pool_depth = nn.AdaptiveAvgPool3d((3, None, None))  # depth -> 3

    def forward(self, xt: torch.Tensor) -> torch.Tensor:
        # xt: [B,3,64,h,w]  ->  [B,64,3,h,w]
        y = self.net(xt)
        y = self.pool_depth(y)
        return y


class SepConv(nn.Module):
    """Depthwise-separable conv (the Xception building block)."""

    def __init__(self, cin, cout, stride=1):
        super().__init__()
        self.dw = nn.Conv2d(cin, cin, 3, stride, 1, groups=cin, bias=False)
        self.pw = nn.Conv2d(cin, cout, 1, bias=False)
        self.bn = nn.BatchNorm2d(cout)
        self.act = nn.ReLU(inplace=True)

    def forward(self, x):
        return self.act(self.bn(self.pw(self.dw(x))))


class CNNF(nn.Module):
    """Xception-style body: 192-channel spectral-semantic map -> F ∈ R[2048]."""

    def __init__(self, in_ch: int = 192, out_dim: int = 2048):
        super().__init__()
        self.body = nn.Sequential(
            SepConv(in_ch, 256, stride=2),
            SepConv(256, 512, stride=2),
            SepConv(512, 728, stride=1),
            SepConv(728, 728, stride=1),
            SepConv(728, 1024, stride=2),
            SepConv(1024, out_dim, stride=1),
        )
        self.gap = nn.AdaptiveAvgPool2d(1)

    def forward(self, x):
        x = self.body(x)
        x = self.gap(x).flatten(1)
        return x  # [B,2048]


class LocalBranch(nn.Module):
    """Full local frequency branch -> (F vector, SBCM map for FAAE)."""

    def __init__(self, freq_feat_dim: int = 2048):
        super().__init__()
        self.sbcm = SBCM(in_ch=3, out_ch=64)
        self.cnnf = CNNF(in_ch=192, out_dim=freq_feat_dim)

    def forward(self, xt: torch.Tensor):
        sb = self.sbcm(xt)                       # [B,64,3,h,w]
        B, C, D, h, w = sb.shape
        sb_map = sb.reshape(B, C * D, h, w)      # [B,192,h,w]  (eq. 9 flatten)
        F_vec = self.cnnf(sb_map)                # [B,2048]
        return F_vec, sb_map


if __name__ == "__main__":
    from sfcl.dct import BlockDCT
    x = torch.rand(2, 3, 376, 376) * 255
    xt = BlockDCT()(x)
    f, m = LocalBranch()(xt)
    print("X~", tuple(xt.shape))
    print("F ", tuple(f.shape), "(expected [2,2048])")
    print("SBCM map", tuple(m.shape), "(expected [2,192,h,w])")
