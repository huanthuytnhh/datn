"""cascade.py — quyết định eKYC cascade (liveness prefilter -> deepfake).

Thuần rule, không I/O. Endpoint /v1/detect/cascade dùng hàm này để gộp.
Khớp logic client cũ (ekyc_demo df_decision + nhánh stopped/uncertain)."""

_HINT_TO_FINAL = {"pass": "PASS", "review": "REVIEW", "reject": "FAIL"}


def cascade_decision(liveness_verdict: str, deepfake_decision_hint: str | None = None) -> tuple[str, str]:
    """Trả (final_decision, reason).

    liveness SPOOF     -> FAIL   (chặn, không chạy deepfake)
    liveness UNCERTAIN -> REVIEW (đẩy xét tay)
    liveness LIVE      -> map decision_hint: pass->PASS, review->REVIEW, reject->FAIL (mặc định REVIEW)
    """
    v = (liveness_verdict or "").upper()
    if v == "SPOOF":
        return "FAIL", "Liveness SPOOF — chặn tại prefilter (không chạy deepfake)."
    if v == "UNCERTAIN":
        return "REVIEW", "Liveness UNCERTAIN — chuyển người duyệt."
    if v == "LIVE":
        final = _HINT_TO_FINAL.get((deepfake_decision_hint or "").lower(), "REVIEW")
        return final, f"Liveness LIVE → Deepfake ({deepfake_decision_hint}) → {final}."
    raise ValueError(f"liveness verdict không hợp lệ: {liveness_verdict!r}")
