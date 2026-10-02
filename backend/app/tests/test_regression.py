import pytest
import numpy as np
import pandas as pd
from app.services.regression_service import regression_service

def test_regression_pipeline_and_metrics():
    np.random.seed(55)
    n = 100
    dates = pd.date_range("2023-01-01", periods=n, freq="D")
    humidity = np.random.uniform(40, 95, size=n)
    temp = np.random.uniform(15, 38, size=n)
    wind = np.random.uniform(5, 25, size=n)
    pressure = np.random.uniform(1005, 1018, size=n)
    
    # Synthetic rain strongly dependent on humidity and pressure
    rain = np.maximum(0.0, 0.25 * humidity - 0.1 * temp - 0.05 * (pressure - 1000) + np.random.normal(0, 2, size=n))

    df = pd.DataFrame({
        "date": dates,
        "rain_sum": rain,
        "relative_humidity_2m_mean": humidity,
        "temperature_2m_mean": temp,
        "wind_speed_10m_max": wind,
        "pressure_msl_mean": pressure,
    })

    # Multiple regression
    res_mult = regression_service.train_and_evaluate(
        df=df,
        model_type="multiple",
        target_col="rain_sum",
        train_ratio=0.8,
    )

    assert res_mult["train_observations"] == 80
    assert res_mult["test_observations"] == 20
    assert "r2" in res_mult["validation_metrics"]
    assert "mae_mm" in res_mult["validation_metrics"]
    assert "rmse_mm" in res_mult["validation_metrics"]
    assert len(res_mult["model_parameters"]["coefficients"]) > 0

    # Model comparison
    res_comp = regression_service.compare_all_models(df=df, target_col="rain_sum", train_ratio=0.8)
    assert len(res_comp["comparison_table"]) == 3
    assert "recommended_model" in res_comp
