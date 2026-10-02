import pytest
import pandas as pd
from app.services.probability_service import probability_service

def test_probability_and_bayes_theorem():
    # Synthetic dataset with 100 days
    # 40 rainy days, 50 high humidity days, 30 days having both rain and high humidity
    records = []
    for i in range(100):
        if i < 30: # Rain + High Hum
            records.append({"rain_sum": 5.0, "relative_humidity_2m_mean": 85.0})
        elif i < 40: # Rain + Low Hum
            records.append({"rain_sum": 3.0, "relative_humidity_2m_mean": 60.0})
        elif i < 60: # Dry + High Hum
            records.append({"rain_sum": 0.0, "relative_humidity_2m_mean": 80.0})
        else: # Dry + Low Hum
            records.append({"rain_sum": 0.0, "relative_humidity_2m_mean": 50.0})

    df = pd.DataFrame(records)

    res = probability_service.analyze_events(
        df=df,
        rain_threshold=1.0,
        high_humidity_threshold=75.0,
    )

    ev = res["events"]
    assert ev["A"]["count"] == 40
    assert ev["A"]["probability"] == 0.40
    assert ev["B"]["count"] == 50
    assert ev["B"]["probability"] == 0.50

    # Joint: A and B = 30 / 100 = 0.30
    assert res["joint_and_union"]["p_A_and_B"] == 0.30
    # Union: 40 + 50 - 30 = 60 / 100 = 0.60
    assert res["joint_and_union"]["p_A_or_B"] == 0.60
    assert res["joint_and_union"]["addition_rule_check"]["satisfied"] is True

    # Conditional: P(Rain | High Hum) = 30 / 50 = 0.60
    assert res["conditional"]["p_rain_given_high_humidity"] == 0.60
    # P(High Hum | Rain) = 30 / 40 = 0.75
    assert res["conditional"]["p_high_humidity_given_rain"] == 0.75

    # Bayes theorem verification
    bayes = res["bayes_theorem"]
    assert bayes["matches_direct_conditional"] is True
    assert bayes["posterior_p_rain_given_high_hum"] == pytest.approx(0.60, abs=1e-3)

    # Independence test
    indep = res["independence_test"]
    # P(A)*P(B) = 0.4 * 0.5 = 0.20 != 0.30 -> Dependent
    assert indep["p_A_times_p_B"] == pytest.approx(0.20, abs=1e-3)
    assert indep["verdict"] == "Positive Association"
