import pytest
import numpy as np
import pandas as pd
from app.services.sampling_service import sampling_service

def test_clt_simulation():
    np.random.seed(123)
    # Strongly skewed exponential data
    pop = np.random.exponential(scale=4.0, size=500)
    df = pd.DataFrame({"rain_sum": pop})

    res = sampling_service.simulate_clt(
        df=df,
        variable_name="rain_sum",
        sample_size=30,
        num_samples=250,
        method="srs",
    )

    pop_params = res["population_parameters"]
    samp_dist = res["sampling_distribution"]

    # Mean of sample means must be close to true population mean
    assert samp_dist["mean_of_sample_means"] == pytest.approx(pop_params["mean_mu"], rel=0.10)
    # Empirical standard error should approximate theoretical sigma / sqrt(n)
    assert samp_dist["empirical_standard_error"] == pytest.approx(samp_dist["theoretical_standard_error"], rel=0.20)
    # Skewness of sampling distribution should be significantly lower than population skewness
    assert abs(samp_dist["skewness_of_means"]) < abs(pop_params["skewness"])

def test_point_and_interval_estimation():
    np.random.seed(42)
    data = np.random.normal(loc=10.0, scale=2.0, size=50)
    df = pd.DataFrame({"rain_sum": data})

    res = sampling_service.compute_estimation(df=df, variable_name="rain_sum", rain_threshold=5.0)

    pts = res["point_estimates"]
    assert pts["sample_mean_x_bar"] == pytest.approx(10.0, abs=1.0)
    assert pts["sample_size_n"] == 50

    # 95% Confidence Interval for mean must enclose the sample mean
    ci95 = res["confidence_intervals_mean"]["intervals"]["95%"]
    assert ci95["lower_bound"] < pts["sample_mean_x_bar"] < ci95["upper_bound"]
