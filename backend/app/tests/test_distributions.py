import pytest
import numpy as np
import pandas as pd
from app.services.distribution_service import distribution_service

def test_discrete_distributions():
    # 100 days of rainfall data
    data = [0.0] * 70 + [5.0] * 20 + [25.0] * 10
    df = pd.DataFrame({"rain_sum": data})

    res = distribution_service.analyze_discrete_distributions(
        df=df,
        n_days=14,
        rain_threshold=1.0,
        heavy_rain_threshold=15.0,
    )

    binom = res["binomial"]
    assert binom["n_trials"] == 14
    assert binom["p_success"] == pytest.approx(0.30, abs=1e-2)
    assert binom["mean_np"] == pytest.approx(14 * 0.30, abs=1e-2)
    assert binom["variance_npq"] == pytest.approx(14 * 0.30 * 0.70, abs=1e-2)
    assert len(binom["pmf_distribution"]) == 15

    poisson = res["poisson"]
    assert poisson["estimated_lambda"] > 0
    assert len(poisson["pmf_distribution"]) > 5

    # Check MGF educational formulas are present
    mgf = res["moment_generating_functions"]
    assert "binomial" in mgf
    assert "poisson" in mgf

def test_continuous_distribution_fitting():
    np.random.seed(42)
    data = np.random.gamma(shape=2.0, scale=3.0, size=200)
    df = pd.DataFrame({"rain_sum": data})

    res = distribution_service.fit_continuous_distributions(
        df=df,
        variable_name="rain_sum",
        filter_positive=True,
        requested_distributions=["normal", "gamma", "exponential", "uniform"],
    )

    fitted = res["fitted_distributions"]
    assert "normal" in fitted
    assert "gamma" in fitted
    assert "exponential" in fitted
    assert "uniform" in fitted

    # KS statistics must be valid numbers between 0 and 1
    assert 0 <= fitted["gamma"]["ks_statistic"] <= 1
    assert 0 <= fitted["normal"]["ks_statistic"] <= 1
    assert len(fitted["gamma"]["pdf_points"]) > 10
