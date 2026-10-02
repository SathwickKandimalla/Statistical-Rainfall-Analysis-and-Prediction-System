from fastapi import APIRouter, Query, UploadFile, File, HTTPException
from typing import Optional, List
import pandas as pd
from app.services.weather_service import weather_service
from app.services.data_cleaning_service import data_cleaning_service

router = APIRouter(prefix="/weather", tags=["Weather"])

# In-memory storage for active working dataset per session
_active_datasets = {}

@router.get("/historical")
async def get_historical_weather(
    latitude: float = Query(..., ge=-90.0, le=90.0),
    longitude: float = Query(..., ge=-180.0, le=180.0),
    start_date: str = Query(..., pattern=r"^\d{4}-\d{2}-\d{2}$"),
    end_date: str = Query(..., pattern=r"^\d{4}-\d{2}-\d{2}$"),
    timezone: str = Query("auto"),
    rain_threshold: float = Query(1.0, ge=0.0),
):
    """
    Fetch, validate, clean, and return historical daily weather data from Open-Meteo.
    """
    if start_date > end_date:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid date range: start_date ({start_date}) must be before or equal to end_date ({end_date})."
        )

    try:
        raw_response = await weather_service.fetch_historical_weather(
            latitude=latitude,
            longitude=longitude,
            start_date=start_date,
            end_date=end_date,
            timezone=timezone,
        )

        daily_data = raw_response.get("daily", {})
        cleaned_df, quality_report = data_cleaning_service.clean_api_daily_data(
            daily_data, rain_threshold=rain_threshold
        )

        # Store in session dataset key
        dataset_key = f"{latitude:.4f}_{longitude:.4f}_{start_date}_{end_date}"
        _active_datasets[dataset_key] = cleaned_df

        # Downsample or format records for frontend tabular display (up to 1000 rows directly, or summary)
        records = cleaned_df.to_dict(orient="records")
        for r in records:
            if isinstance(r.get("date"), pd.Timestamp):
                r["date"] = r["date"].strftime("%Y-%m-%d")

        return {
            "dataset_key": dataset_key,
            "metadata": raw_response.get("metadata", {}),
            "units": raw_response.get("daily_units", {}),
            "quality_report": quality_report,
            "total_records": len(records),
            "records": records,
        }
    except HTTPException:
        raise
    except Exception as e:
        status = 400 if ("400" in str(e) or "Bad Request" in str(e)) else 500
        raise HTTPException(status_code=status, detail=f"Failed to fetch historical weather: {str(e)}")

@router.get("/forecast")
async def get_forecast_weather(
    latitude: float = Query(..., ge=-90.0, le=90.0),
    longitude: float = Query(..., ge=-180.0, le=180.0),
    timezone: str = Query("auto"),
):
    """Fetch 10-day future weather predictor variables from Open-Meteo Forecast API."""
    try:
        data = await weather_service.fetch_forecast_weather(
            latitude=latitude,
            longitude=longitude,
            timezone=timezone,
        )
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch forecast: {str(e)}")

@router.post("/upload")
async def upload_weather_file(
    file: UploadFile = File(...),
):
    """Upload custom CSV or XLSX dataset with automatic column mapping."""
    try:
        content = await file.read()
        cleaned_df, quality_report = data_cleaning_service.parse_uploaded_file(
            content_bytes=content, filename=file.filename
        )
        dataset_key = f"upload_{file.filename}"
        _active_datasets[dataset_key] = cleaned_df

        records = cleaned_df.to_dict(orient="records")
        for r in records:
            if isinstance(r.get("date"), pd.Timestamp):
                r["date"] = r["date"].strftime("%Y-%m-%d")

        return {
            "dataset_key": dataset_key,
            "quality_report": quality_report,
            "total_records": len(records),
            "records": records,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"File parsing failed: {str(e)}")
