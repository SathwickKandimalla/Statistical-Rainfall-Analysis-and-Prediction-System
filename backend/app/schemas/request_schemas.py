from pydantic import BaseModel, Field
from typing import List, Optional

class LocationSearchRequest(BaseModel):
    query: str = Field(..., min_length=2, description="City or place name to search")

class HistoricalDataRequest(BaseModel):
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    start_date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")
    end_date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")
    timezone: str = "auto"
    variables: Optional[List[str]] = None

class ForecastRequest(BaseModel):
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    timezone: str = "auto"

class DescriptiveStatsRequest(BaseModel):
    variable: str = "rain_sum"
    chebyshev_k: float = 2.0
    bins: int = 15
    filter_positive: bool = False

class ProbabilityAnalysisRequest(BaseModel):
    rain_threshold: float = 1.0
    high_humidity_threshold: float = 75.0
    high_temp_threshold: float = 35.0
    high_wind_threshold: float = 20.0

class DiscreteDistributionRequest(BaseModel):
    n_days: int = 14
    rain_threshold: float = 1.0
    heavy_rain_threshold: float = 15.0

class DistributionFitRequest(BaseModel):
    variable: str = "rain_sum"
    filter_positive: bool = True
    distributions: List[str] = ["normal", "gamma", "exponential", "uniform", "beta"]

class SamplingRequest(BaseModel):
    variable: str = "rain_sum"
    sample_size: int = 30
    num_samples: int = 200
    method: str = "srs" # "srs" or "stratified"
    filter_positive: bool = False

class HypothesisMeanRequest(BaseModel):
    variable: str = "rain_sum"
    reference_mean: float = 3.0
    alpha: float = 0.05
    alternative: str = "two-sided" # "two-sided", "greater", "less"

class HypothesisPropRequest(BaseModel):
    rain_threshold: float = 1.0
    reference_proportion: float = 0.25
    alpha: float = 0.05
    alternative: str = "two-sided" # "two-sided", "greater", "less"

class VarianceComparisonRequest(BaseModel):
    variable: str = "rain_sum"
    split_date: Optional[str] = None # date to split dataset into period 1 vs period 2

class CorrelationRequest(BaseModel):
    variables: Optional[List[str]] = None
    var_x: str = "relative_humidity_2m_mean"
    var_y: str = "rain_sum"

class RegressionRequest(BaseModel):
    model_type: str = "multiple" # "simple", "multiple", "polynomial"
    target_variable: str = "rain_sum"
    predictor_variables: List[str] = [
        "temperature_2m_mean",
        "relative_humidity_2m_mean",
        "pressure_msl_mean",
        "wind_speed_10m_max"
    ]
    train_split: float = 0.8
    poly_degree: int = 2

class PredictionRequest(BaseModel):
    model_type: str = "multiple"
    predictor_variables: List[str] = [
        "temperature_2m_mean",
        "relative_humidity_2m_mean",
        "pressure_msl_mean",
        "wind_speed_10m_max"
    ]
    poly_degree: int = 2
