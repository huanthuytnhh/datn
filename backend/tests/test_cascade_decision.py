"""Doc test — quyết định cascade eKYC (liveness prefilter -> deepfake).
Mirror rule trong app/services/cascade.py:cascade_decision. Không spin app/DB."""
import pytest
from app.services.cascade import cascade_decision


def test_spoof_blocks_with_fail():
    final, reason = cascade_decision("SPOOF")
    assert final == "FAIL"
    assert "prefilter" in reason.lower()


def test_uncertain_review():
    final, _ = cascade_decision("UNCERTAIN")
    assert final == "REVIEW"


def test_live_maps_decision_hint():
    assert cascade_decision("LIVE", "pass")[0] == "PASS"
    assert cascade_decision("LIVE", "review")[0] == "REVIEW"
    assert cascade_decision("LIVE", "reject")[0] == "FAIL"


def test_live_unknown_hint_defaults_review():
    assert cascade_decision("LIVE", None)[0] == "REVIEW"
    assert cascade_decision("LIVE", "weird")[0] == "REVIEW"


def test_invalid_verdict_raises():
    with pytest.raises(ValueError):
        cascade_decision("BOGUS")
