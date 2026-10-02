import pytest
import numpy as np
import pandas as pd
from app.services.statistics_service import statistics_service

def test_descriptive_statistics_calculations():
    # Known dataset: [0, 0, 2, 4, 6, 8, 10, 12, 14, 16] -> N=10, Sum=72, Mean=7.2
    data = [0.0, 0.0, 2.0, 4.0, 6.0, 8.0, 10.0, 12.0, 14.0, 16.0]
    series = pd.Series(data)

    res = statistics_service.compute_descriptive_statistics(
        series=series,
        variable_name="rain_sum",
        chebyshev_k=2.0,
        n_bins=5,
    )

    ct = res["central_tendency"]
    assert ct["mean"] == pytest.approx(7.2, rel=1e-2)
    assert ct["median"] == pytest.approx(7.0, rel=1e-2)

    disp = res["dispersion"]
    assert disp["min"] == 0.0
    assert disp["max"] == 16.0
    assert disp["range"] == 16.0
    assert disp["variance_sample"] > 0
    assert disp["std_sample"] == pytest.approx(np.std(data, ddof=1), rel=1e-2)

    # Chebyshev theorem check
    cheb = res["chebyshev"]
    assert cheb["k"] == 2.0
    assert cheb["theoretical_lower_bound_pct"] == 75.0 # 1 - 1/4 = 0.75
    assert cheb["is_satisfied"] is True
    assert cheb["actual_proportion_pct"] >= cheb["theoretical_lower_bound_pct"]

def test_frequency_table_and_ogive():
    data = np.random.exponential(scale=5.0, size=100)
    series = pd.Series(data)

    res = statistics_service.compute_descriptive_statistics(
        series=series,
        n_bins=10,
    )

    ft = res["frequency_table"]
    assert len(ft) == 10
    total_freq = sum(row["frequency"] for row in ft)
    assert total_freq == 100

    # Ogive check: last cumulative frequency in less-than must equal total N
    ogive = res["ogive"]
    assert ogive[-1]["less_than_cum_freq"] == 100
    assert ogive[0]["less_than_cum_freq"] == 0
