"""risk.py — chuyển prob_fake → risk_score (đã calibrate) + band + decision_hint.
Định vị eKYC: trả TÍN HIỆU RỦI RO, không phải nhãn cứng. Ngưỡng per-tenant (mặc định global, override env).
"""
import math
import os

# Ngưỡng band mặc định (per-tenant sẽ override sau — theo FPR budget của khách).
RISK_LOW = float(os.getenv("RISK_BAND_LOW", "0.30"))
RISK_HIGH = float(os.getenv("RISK_BAND_HIGH", "0.70"))
# Temperature scaling (1.0 = identity; nạp T đã fit từ mt_calibrate.py để risk_score đáng tin hơn).
RISK_TEMPERATURE = float(os.getenv("RISK_TEMPERATURE", "1.0"))


def to_risk_score(prob_fake: float, temperature: float = RISK_TEMPERATURE) -> float:
    """Calibrate prob → risk_score (temperature scaling). T=1 giữ nguyên."""
    if temperature == 1.0:
        return float(max(0.0, min(1.0, prob_fake)))
    p = min(max(float(prob_fake), 1e-6), 1 - 1e-6)
    z = math.log(p / (1 - p)) / temperature
    return 1.0 / (1.0 + math.exp(-z))


def risk_band(score: float, low: float = RISK_LOW, high: float = RISK_HIGH) -> str:
    return "low" if score < low else ("high" if score >= high else "medium")


def decision_hint(band: str) -> str:
    """GỢI Ý cho khách (KHÔNG phải quyết định cuối — eKYC provider tự quyết)."""
    return {"low": "pass", "medium": "review", "high": "reject"}[band]


def thresholds_dict(low: float = RISK_LOW, high: float = RISK_HIGH) -> dict:
    return {"low": round(low, 3), "high": round(high, 3)}
