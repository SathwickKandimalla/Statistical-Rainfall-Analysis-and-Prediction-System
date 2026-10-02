import pytest
import numpy as np
import pandas as pd
from app.services.hypothesis_service import hypothesis_service

def test_hypothesis_testing_mean():
    np.random.seed(99)
    # Sample with mean ~ 10.0
    data = np.random.normal(loc=10.0, scale=2.0, size=60)
    df = pd.DataFrame({"rain_sum": data})

    # Test H0: μ = 10.0 (True null)
    res_true_null = hypothesis_service.test_mean_t_test(
        df=df, variable_name="rain_sum", reference_mean=10.0, alpha=0.05
    )
    assert res_true_null["decision"] == "Fail to reject H0"
    assert res_true_null["test_details"]["p_value"] > 0.05

    # Test H0: μ = 3.0 (False null, true mean is 10)
    res_false_null = hypothesis_service.test_mean_t_test(
        df=df, variable_name="rain_sum", reference_mean=3.0, alpha=0.05
    )
    assert res_false_null["decision"] == "Reject H0"
    assert res_false_null["test_details"]["p_value"] < 0.001

def test_hypothesis_testing_proportion():
    # 80 rainy days out of 100 -> p_hat = 0.80
    data = [5.0] * 80 + [0.0] * 20
    df = pd.DataFrame({"rain_sum": data})

    # Test against baseline p0 = 0.25
    res = hypothesis_service.test_proportion_z_test(
        df=df, rain_threshold=1.0, reference_prop=0.25, alpha=0.05
    )
    assert res["decision"] == "Reject H0"
    assert res["sample_proportion_p_hat"] == 0.80
