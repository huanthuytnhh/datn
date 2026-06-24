"""Test tài liệu hóa spec 2.1 — logic quyết định eKYC (cascade liveness -> deepfake).

KHÔNG cần server / model. `decide_ekyc` tái hiện thuần rule quyết định:

    LIVE      -> chạy tiếp deepfake (kết quả = nhãn deepfake truyền vào)
    SPOOF     -> FAIL  (chặn ngay, không cần deepfake)
    UNCERTAIN -> REVIEW (đẩy sang xét tay)

Đây là test chốt spec, không phải test triển khai thực tế — nếu rule trong
code đổi, test này phải đổi theo (và buộc cập nhật tài liệu).
"""

from typing import Optional


def decide_ekyc(liveness: str, deepfake: Optional[str] = None) -> str:
    """Rule quyết định eKYC.

    Args:
        liveness: một trong "LIVE" / "SPOOF" / "UNCERTAIN".
        deepfake: nhãn deepfake ("REAL"/"FAKE") — chỉ dùng khi liveness == LIVE.

    Returns:
        Quyết định cuối: "FAIL" | "REVIEW" | giá trị `deepfake` (khi LIVE).
    """
    liveness = liveness.upper()
    if liveness == "SPOOF":
        return "FAIL"
    if liveness == "UNCERTAIN":
        return "REVIEW"
    if liveness == "LIVE":
        # Mặt thật -> nhánh deepfake quyết định kết quả.
        return deepfake if deepfake is not None else "PENDING_DEEPFAKE"
    raise ValueError(f"liveness không hợp lệ: {liveness!r}")


def test_live_runs_deepfake_branch():
    # LIVE -> kết quả do nhánh deepfake quyết định.
    assert decide_ekyc("LIVE", deepfake="REAL") == "REAL"
    assert decide_ekyc("LIVE", deepfake="FAKE") == "FAKE"


def test_spoof_fails():
    assert decide_ekyc("SPOOF") == "FAIL"


def test_uncertain_review():
    assert decide_ekyc("UNCERTAIN") == "REVIEW"
