import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "Statistical Rainfall Analysis and Prediction System"
    PROJECT_VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Open-Meteo API Endpoints
    OPEN_METEO_GEOCODING_URL: str = os.getenv(
        "OPEN_METEO_GEOCODING_URL", "https://geocoding-api.open-meteo.com/v1/search"
    )
    OPEN_METEO_HISTORICAL_URL: str = os.getenv(
        "OPEN_METEO_HISTORICAL_URL", "https://archive-api.open-meteo.com/v1/archive"
    )
    OPEN_METEO_FORECAST_URL: str = os.getenv(
        "OPEN_METEO_FORECAST_URL", "https://api.open-meteo.com/v1/forecast"
    )
    
    # Default Coordinates (Hyderabad, India)
    DEFAULT_LATITUDE: float = 17.3850
    DEFAULT_LONGITUDE: float = 78.4867
    DEFAULT_TIMEZONE: str = "Asia/Kolkata"
    DEFAULT_CITY: str = "Hyderabad"
    
    # Cache duration in seconds (1 hour for weather data)
    CACHE_TTL_SECONDS: int = 3600

settings = Settings()
