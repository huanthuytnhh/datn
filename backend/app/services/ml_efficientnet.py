"""ml_efficientnet.py — EfficientNet-B4 from scratch (port notebook).
_build_efficientnet() -> (DeepFakeModel, MemoryEfficientSwish). Tách từ ml_inference (<=250 dòng)."""
import collections
import math
import re
from functools import partial


GlobalParams = collections.namedtuple("GlobalParams", [
    "batch_norm_momentum", "batch_norm_epsilon", "dropout_rate", "num_classes",
    "width_coefficient", "depth_coefficient", "depth_divisor", "min_depth",
    "drop_connect_rate", "image_size"
])
BlockArgs = collections.namedtuple("BlockArgs", [
    "kernel_size", "num_repeat", "input_filters", "output_filters",
    "expand_ratio", "id_skip", "stride", "se_ratio"
])
GlobalParams.__new__.__defaults__ = (None,) * len(GlobalParams._fields)
BlockArgs.__new__.__defaults__    = (None,) * len(BlockArgs._fields)

efficientnet_params = {"efficientnet-b4": (1.4, 1.8, 380, 0.4)}
blocks_args_str = [
    "r1_k3_s11_e1_i32_o16_se0.25",  "r2_k3_s22_e6_i16_o24_se0.25",
    "r2_k5_s22_e6_i24_o40_se0.25",  "r3_k3_s22_e6_i40_o80_se0.25",
    "r3_k5_s11_e6_i80_o112_se0.25", "r4_k5_s22_e6_i112_o192_se0.25",
    "r1_k3_s11_e6_i192_o320_se0.25",
]
url_map_advprop = {
    "efficientnet-b4": "https://github.com/lukemelas/EfficientNet-PyTorch/releases/download/1.0/adv-efficientnet-b4-44fb3a87.pth",
}




class BlockDecoder:
    @staticmethod
    def _decode_block_string(block_string):
        ops, options = block_string.split("_"), {}
        for op in ops:
            splits = re.split(r"(\d.*)", op)
            if len(splits) >= 2:
                options[splits[0]] = splits[1]
        assert "s" in options and len(options["s"]) in (1, 2)
        return BlockArgs(
            kernel_size=int(options["k"]),   num_repeat=int(options["r"]),
            input_filters=int(options["i"]), output_filters=int(options["o"]),
            expand_ratio=int(options["e"]),  id_skip=("noskip" not in block_string),
            se_ratio=float(options["se"]) if "se" in options else None,
            stride=[int(options["s"][0])],
        )

    @staticmethod
    def decode(string_list):
        return [BlockDecoder._decode_block_string(s) for s in string_list]


def _build_efficientnet():
    import torch
    import torch.nn as nn
    import torch.nn.functional as F
    from torch.utils import model_zoo

    class SwishImplementation(torch.autograd.Function):
        @staticmethod
        def forward(ctx, i):
            ctx.save_for_backward(i)
            return i * torch.sigmoid(i)
        @staticmethod
        def backward(ctx, grad_output):
            i = ctx.saved_tensors[0]
            s = torch.sigmoid(i)
            return grad_output * (s * (1 + i * (1 - s)))

    class MemoryEfficientSwish(nn.Module):
        def forward(self, x):
            return SwishImplementation.apply(x)

    class Swish(nn.Module):
        def forward(self, x):
            return x * torch.sigmoid(x)

    def round_filters(filters, gp):
        if not gp.width_coefficient:
            return filters
        filters *= gp.width_coefficient
        min_depth = gp.min_depth or gp.depth_divisor
        nf = max(min_depth, int(filters + gp.depth_divisor / 2) // gp.depth_divisor * gp.depth_divisor)
        if nf < 0.9 * filters:
            nf += gp.depth_divisor
        return int(nf)

    def round_repeats(repeats, gp):
        if not gp.depth_coefficient:
            return repeats
        return int(math.ceil(gp.depth_coefficient * repeats))

    def drop_connect(inputs, p, training):
        if not training:
            return inputs
        keep_prob = 1 - p
        rand = keep_prob + torch.rand(
            [inputs.shape[0], 1, 1, 1], dtype=inputs.dtype, device=inputs.device
        )
        return inputs / keep_prob * rand.floor()

    class Conv2dStaticSamePadding(nn.Conv2d):
        def __init__(self, in_channels, out_channels, kernel_size, image_size=None, **kwargs):
            super().__init__(in_channels, out_channels, kernel_size, **kwargs)
            self.stride = self.stride if len(self.stride) == 2 else [self.stride[0]] * 2
            assert image_size is not None
            ih = iw = image_size if isinstance(image_size, int) else image_size[0]
            kh, kw = self.weight.size()[-2:]
            sh, sw = self.stride
            pad_h = max((math.ceil(ih / sh) - 1) * sh + (kh - 1) * self.dilation[0] + 1 - ih, 0)
            pad_w = max((math.ceil(iw / sw) - 1) * sw + (kw - 1) * self.dilation[1] + 1 - iw, 0)
            self.static_padding = (
                nn.ZeroPad2d((pad_w // 2, pad_w - pad_w // 2, pad_h // 2, pad_h - pad_h // 2))
                if (pad_h > 0 or pad_w > 0) else nn.Identity()
            )

        def forward(self, x):
            return F.conv2d(
                self.static_padding(x), self.weight, self.bias,
                self.stride, self.padding, self.dilation, self.groups
            )

    class MBConvBlock(nn.Module):
        def __init__(self, block_args, global_params):
            super().__init__()
            self._block_args = block_args
            bn_mom = 1 - global_params.batch_norm_momentum
            bn_eps = global_params.batch_norm_epsilon
            self.has_se  = block_args.se_ratio is not None and 0 < block_args.se_ratio <= 1
            self.id_skip = block_args.id_skip
            Conv2d = partial(Conv2dStaticSamePadding, image_size=global_params.image_size)
            inp = block_args.input_filters
            oup = inp * block_args.expand_ratio
            if block_args.expand_ratio != 1:
                self._expand_conv = Conv2d(inp, oup, 1, bias=False)
                self._bn0 = nn.BatchNorm2d(oup, momentum=bn_mom, eps=bn_eps)
            k, s = block_args.kernel_size, block_args.stride
            self._depthwise_conv = Conv2d(oup, oup, k, stride=s, groups=oup, bias=False)
            self._bn1 = nn.BatchNorm2d(oup, momentum=bn_mom, eps=bn_eps)
            if self.has_se:
                nsc = max(1, int(inp * block_args.se_ratio))
                self._se_reduce = Conv2d(oup, nsc, 1)
                self._se_expand = Conv2d(nsc, oup, 1)
            final_oup = block_args.output_filters
            self._project_conv = Conv2d(oup, final_oup, 1, bias=False)
            self._bn2   = nn.BatchNorm2d(final_oup, momentum=bn_mom, eps=bn_eps)
            self._swish = MemoryEfficientSwish()

        def forward(self, inputs, drop_connect_rate=None):
            x = inputs
            if self._block_args.expand_ratio != 1:
                x = self._swish(self._bn0(self._expand_conv(inputs)))
            x = self._swish(self._bn1(self._depthwise_conv(x)))
            if self.has_se:
                xs = self._se_expand(self._swish(
                    self._se_reduce(F.adaptive_avg_pool2d(x, 1))
                ))
                x = torch.sigmoid(xs) * x
            x = self._bn2(self._project_conv(x))
            if (self.id_skip and self._block_args.stride == [1]
                    and self._block_args.input_filters == self._block_args.output_filters):
                if drop_connect_rate:
                    x = drop_connect(x, drop_connect_rate, self.training)
                x = x + inputs
            return x

        def set_swish(self, memory_efficient=True):
            self._swish = MemoryEfficientSwish() if memory_efficient else Swish()

    class EfficientNet(nn.Module):
        def __init__(self, model_name="efficientnet-b4", pretrained=False):
            super().__init__()
            blocks_args = BlockDecoder.decode(blocks_args_str)
            w, d, s, p  = efficientnet_params[model_name]
            gp = GlobalParams(
                batch_norm_momentum=0.99, batch_norm_epsilon=1e-3,
                dropout_rate=p, drop_connect_rate=0.2, num_classes=2,
                width_coefficient=w, depth_coefficient=d, depth_divisor=8,
                min_depth=None, image_size=s
            )
            self._global_params = gp
            Conv2d = partial(Conv2dStaticSamePadding, image_size=gp.image_size)
            bn_mom, bn_eps = 1 - gp.batch_norm_momentum, gp.batch_norm_epsilon
            out_ch = round_filters(32, gp)
            self._conv_stem = Conv2d(3, out_ch, 3, stride=2, bias=False)
            self._bn0       = nn.BatchNorm2d(out_ch, momentum=bn_mom, eps=bn_eps)
            self._blocks = nn.ModuleList()
            for ba in blocks_args:
                ba = ba._replace(
                    input_filters=round_filters(ba.input_filters, gp),
                    output_filters=round_filters(ba.output_filters, gp),
                    num_repeat=round_repeats(ba.num_repeat, gp)
                )
                self._blocks.append(MBConvBlock(ba, gp))
                if ba.num_repeat > 1:
                    ba = ba._replace(input_filters=ba.output_filters, stride=[1])
                    for _ in range(ba.num_repeat - 1):
                        self._blocks.append(MBConvBlock(ba, gp))
                in_ch = ba.output_filters
            out_ch = round_filters(1280, gp)
            self._conv_head   = Conv2d(in_ch, out_ch, 1, bias=False)
            self._bn1         = nn.BatchNorm2d(out_ch, momentum=bn_mom, eps=bn_eps)
            self._avg_pooling = nn.AdaptiveAvgPool2d(1)
            self._dropout     = nn.Dropout(gp.dropout_rate)
            self._fc          = nn.Linear(out_ch, gp.num_classes)
            self._swish       = MemoryEfficientSwish()
            if pretrained:
                self._load_pretrained(model_name)

        def _load_pretrained(self, model_name):
            try:
                state_dict = model_zoo.load_url(url_map_advprop[model_name])
                state_dict.pop("_fc.weight", None)
                state_dict.pop("_fc.bias",   None)
                missing, unexpected = self.load_state_dict(state_dict, strict=False)
                print(f"Pretrained loaded | missing: {len(missing)} | unexpected: {len(unexpected)}")
            except Exception as e:
                print(f"[WARN] Cannot load pretrained: {e}")

        def forward(self, x):
            x = self._swish(self._bn0(self._conv_stem(x)))
            for idx, block in enumerate(self._blocks):
                dc = self._global_params.drop_connect_rate
                if dc:
                    dc *= idx / len(self._blocks)
                x = block(x, drop_connect_rate=dc)
            x = self._swish(self._bn1(self._conv_head(x)))
            x = self._avg_pooling(x).flatten(1)
            x = self._dropout(x)
            return self._fc(x)

    class DeepFakeModel(nn.Module):
        def __init__(self):
            super().__init__()
            self.model = EfficientNet("efficientnet-b4", pretrained=False)

        def forward(self, x):
            return self.model(x)

    return DeepFakeModel, MemoryEfficientSwish
