from fastapi import APIRouter, HTTPException, Body
from typing import Dict, Any, List, Optional
import pandas as pd
from app.api.weather_routes import _active_datasets
from app.services.statistics_service import statistics_service
from app.services.probability_service import probability_service
from app.services.random_variable_service import random_variable_service
from app.services.distribution_service import distribution_service
from app.services.sampling_service import sampling_service
from app.services.hypothesis_service import hypothesis_service
from app.services.correlation_service import correlation_service
from app.services.regression_service import regression_service

router = APIRouter(prefix="/analysis", tags=["Statistical Analysis"])

def _get_dataframe(payload: Dict[str, Any]) -> pd.DataFrame:
    """Helper to retrieve DataFrame from active memory or request records."""
    key = payload.get("dataset_key")
    if key and key in _active_datasets:
        return _active_datasets[key]

    records = payload.get("records")
    if records and isinstance(records, list) and len(records) > 0:
        df = pd.DataFrame(records)
        if "date" in df.columns:
            df["date"] = pd.to_datetime(df["date"], errors="coerce")
            if "month" not in df.columns:
                df["month"] = df["date"].dt.month
            if "year" not in df.columns:
                df["year"] = df["date"].dt.year
        return df

    # Fallback to the latest active dataset if any exists
    if _active_datasets:
        latest_key = list(_active_datasets.keys())[-1]
        return _active_datasets[latest_key]

    raise HTTPException(
        status_code=400,
        detail="No active weather dataset found. Please load historical weather data first."
    )

# ---------------- Module I: Descriptive Statistics ----------------
@router.post("/descriptive")
async def analyze_descriptive(payload: Dict[str, Any] = Body(...)):
    try:
        df = _get_dataframe(payload)
        var = payload.get("variable", "rain_sum")
        chebyshev_k = float(payload.get("chebyshev_k", 2.0))
        bins = int(payload.get("bins", 15))
        filter_pos = bool(payload.get("filter_positive", False))

        stats_res = statistics_service.compute_descriptive_statistics(
            series=df[var],
            variable_name=var,
            chebyshev_k=chebyshev_k,
            n_bins=bins,
            filter_positive=filter_pos,
        )
        summary = statistics_service.compute_monthly_and_annual_summary(df)
        stats_res["monthly_summary"] = summary.get("monthly_summary", [])
        stats_res["annual_summary"] = summary.get("annual_summary", [])

        return stats_res
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ---------------- Module II: Probability ----------------
@router.post("/probability")
async def analyze_probability(payload: Dict[str, Any] = Body(...)):
    try:
        df = _get_dataframe(payload)
        r_thresh = float(payload.get("rain_threshold", 1.0))
        h_thresh = float(payload.get("high_humidity_threshold", 75.0))
        t_thresh = float(payload.get("high_temp_threshold", 35.0))
        w_thresh = float(payload.get("high_wind_threshold", 20.0))

        return probability_service.analyze_events(
            df=df,
            rain_threshold=r_thresh,
            high_humidity_threshold=h_thresh,
            high_temp_threshold=t_thresh,
            high_wind_threshold=w_thresh,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ---------------- Module III: Random Variables ----------------
@router.post("/random-variables")
async def analyze_random_variables(payload: Dict[str, Any] = Body(...)):
    try:
        df = _get_dataframe(payload)
        var = payload.get("variable", "rain_sum")
        return random_variable_service.analyze_random_variables(df=df, rain_col=var)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ---------------- Module IV: Discrete Distributions ----------------
@router.post("/discrete-distributions")
async def analyze_discrete_distributions(payload: Dict[str, Any] = Body(...)):
    try:
        df = _get_dataframe(payload)
        n_days = int(payload.get("n_days", 14))
        r_thresh = float(payload.get("rain_threshold", 1.0))
        h_thresh = float(payload.get("heavy_rain_threshold", 15.0))

        return distribution_service.analyze_discrete_distributions(
            df=df,
            n_days=n_days,
            rain_threshold=r_thresh,
            heavy_rain_threshold=h_thresh,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ---------------- Module V: Continuous Distributions ----------------
@router.post("/continuous-distributions")
async def analyze_continuous_distributions(payload: Dict[str, Any] = Body(...)):
    try:
        df = _get_dataframe(payload)
        var = payload.get("variable", "rain_sum")
        filter_pos = bool(payload.get("filter_positive", True))
        dists = payload.get("distributions", ["normal", "gamma", "exponential", "uniform", "beta"])

        return distribution_service.fit_continuous_distributions(
            df=df,
            variable_name=var,
            filter_positive=filter_pos,
            requested_distributions=dists,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ---------------- Module VI: Sampling & CLT ----------------
@router.post("/sampling")
async def simulate_sampling(payload: Dict[str, Any] = Body(...)):
    try:
        df = _get_dataframe(payload)
        var = payload.get("variable", "rain_sum")
        sample_size = int(payload.get("sample_size", 30))
        num_samples = int(payload.get("num_samples", 300))
        method = payload.get("method", "srs")
        filter_pos = bool(payload.get("filter_positive", False))

        return sampling_service.simulate_clt(
            df=df,
            variable_name=var,
            sample_size=sample_size,
            num_samples=num_samples,
            method=method,
            filter_positive=filter_pos,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/estimation")
async def compute_estimation(payload: Dict[str, Any] = Body(...)):
    try:
        df = _get_dataframe(payload)
        var = payload.get("variable", "rain_sum")
        r_thresh = float(payload.get("rain_threshold", 1.0))

        return sampling_service.compute_estimation(df=df, variable_name=var, rain_threshold=r_thresh)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/variance-comparison")
async def compare_variances(payload: Dict[str, Any] = Body(...)):
    try:
        df = _get_dataframe(payload)
        var = payload.get("variable", "rain_sum")
        split_date = payload.get("split_date")

        return sampling_service.compare_variances_f_test(df=df, variable_name=var, split_date=split_date)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ---------------- Module VII: Hypothesis Testing for Mean ----------------
@router.post("/hypothesis-mean")
async def test_hypothesis_mean(payload: Dict[str, Any] = Body(...)):
    try:
        df = _get_dataframe(payload)
        var = payload.get("variable", "rain_sum")
        mu0 = float(payload.get("reference_mean", 3.0))
        alpha = float(payload.get("alpha", 0.05))
        alt = payload.get("alternative", "two-sided")

        return hypothesis_service.test_mean_t_test(
            df=df, variable_name=var, reference_mean=mu0, alpha=alpha, alternative=alt
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ---------------- Module VIII: Hypothesis Testing for Proportions ----------------
@router.post("/hypothesis-proportion")
async def test_hypothesis_proportion(payload: Dict[str, Any] = Body(...)):
    try:
        df = _get_dataframe(payload)
        r_thresh = float(payload.get("rain_threshold", 1.0))
        p0 = float(payload.get("reference_proportion", 0.25))
        alpha = float(payload.get("alpha", 0.05))
        alt = payload.get("alternative", "two-sided")

        return hypothesis_service.test_proportion_z_test(
            df=df, rain_threshold=r_thresh, reference_prop=p0, alpha=alpha, alternative=alt
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ---------------- Module IX: Correlation & Covariance ----------------
@router.post("/correlation")
async def analyze_correlation(payload: Dict[str, Any] = Body(...)):
    try:
        df = _get_dataframe(payload)
        vars_list = payload.get("variables")
        var_x = payload.get("var_x", "relative_humidity_2m_mean")
        var_y = payload.get("var_y", "rain_sum")

        return correlation_service.compute_correlation_analysis(
            df=df, variables=vars_list, var_x=var_x, var_y=var_y
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ---------------- Module X: Regression Analysis ----------------
@router.post("/regression")
async def train_regression(payload: Dict[str, Any] = Body(...)):
    try:
        df = _get_dataframe(payload)
        m_type = payload.get("model_type", "multiple")
        target = payload.get("target_variable", "rain_sum")
        preds = payload.get("predictor_variables")
        split = float(payload.get("train_split", 0.8))
        deg = int(payload.get("poly_degree", 2))

        return regression_service.train_and_evaluate(
            df=df,
            model_type=m_type,
            target_col=target,
            feature_cols=preds,
            train_ratio=split,
            poly_degree=deg,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/model-comparison")
async def compare_regression_models(payload: Dict[str, Any] = Body(...)):
    try:
        df = _get_dataframe(payload)
        target = payload.get("target_variable", "rain_sum")
        split = float(payload.get("train_split", 0.8))

        return regression_service.compare_all_models(df=df, target_col=target, train_ratio=split)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
