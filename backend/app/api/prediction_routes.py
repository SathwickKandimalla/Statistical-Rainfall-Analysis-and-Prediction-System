from fastapi import APIRouter, HTTPException, Body
from typing import Dict, Any
import pandas as pd
from app.api.weather_routes import _active_datasets
from app.services.weather_service import weather_service
from app.services.prediction_service import prediction_service

router = APIRouter(prefix="/prediction", tags=["Prediction"])

@router.post("")
async def generate_prediction(payload: Dict[str, Any] = Body(...)):
    """
    Generate model-based rainfall estimate using historical data, trained regression model,
    and Open-Meteo forecast API inputs.
    """
    try:
        # Retrieve historical dataframe
        df = None
        key = payload.get("dataset_key")
        if key and key in _active_datasets:
            df = _active_datasets[key]
        elif _active_datasets:
            df = list(_active_datasets.values())[-1]

        if df is None:
            raise HTTPException(
                status_code=400,
                detail="No historical dataset available to train regression model. Please load historical weather data first."
            )

        # Get coordinates to fetch forecast predictors
        lat = payload.get("latitude")
        lon = payload.get("longitude")
        timezone = payload.get("timezone", "auto")

        if lat is None or lon is None:
            # Fallback to defaults
            lat = 17.3850
            lon = 78.4867

        # Fetch future atmospheric predictor variables from Open-Meteo Forecast API
        forecast_response = await weather_service.fetch_forecast_weather(
            latitude=float(lat),
            longitude=float(lon),
            timezone=timezone,
        )
        forecast_daily = forecast_response.get("daily", {})

        model_type = payload.get("model_type", "multiple")
        poly_deg = int(payload.get("poly_degree", 2))

        # Generate model-based estimates with 95% prediction intervals
        prediction_results = prediction_service.generate_short_term_estimate(
            historical_df=df,
            forecast_daily=forecast_daily,
            model_type=model_type,
            poly_degree=poly_deg,
        )

        prediction_results["forecast_metadata"] = forecast_response.get("metadata", {})
        prediction_results["coordinates"] = {"latitude": lat, "longitude": lon}

        return prediction_results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction pipeline failed: {str(e)}")
