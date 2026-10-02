import time
import httpx
from typing import Dict, Any, List, Optional
from app.config import settings

class WeatherService:
    def __init__(self):
        # In-memory cache: key -> {"timestamp": float, "data": Any}
        self._cache: Dict[str, Dict[str, Any]] = {}
        self.default_variables = [
            "temperature_2m_mean",
            "temperature_2m_max",
            "temperature_2m_min",
            "relative_humidity_2m_mean",
            "precipitation_sum",
            "rain_sum",
            "precipitation_hours",
            "wind_speed_10m_max",
            "wind_gusts_10m_max",
            "pressure_msl_mean",
        ]

    def _get_cache(self, key: str) -> Optional[Any]:
        if key in self._cache:
            entry = self._cache[key]
            if time.time() - entry["timestamp"] < settings.CACHE_TTL_SECONDS:
                return entry["data"]
            else:
                del self._cache[key]
        return None

    def _set_cache(self, key: str, data: Any):
        self._cache[key] = {
            "timestamp": time.time(),
            "data": data,
        }

    async def search_locations(self, query: str) -> List[Dict[str, Any]]:
        """Search locations using Open-Meteo Geocoding API."""
        cache_key = f"geo_{query.strip().lower()}"
        cached = self._get_cache(cache_key)
        if cached:
            return cached

        params = {
            "name": query.strip(),
            "count": 10,
            "language": "en",
            "format": "json",
        }

        async with httpx.AsyncClient(timeout=15.0) as client:
            try:
                response = await client.get(settings.OPEN_METEO_GEOCODING_URL, params=params)
                response.raise_for_status()
                data = response.json()
            except Exception as e:
                # Return empty list if geocoding fails or times out
                print(f"Geocoding error for '{query}': {e}")
                return []

        results = []
        for item in data.get("results", []):
            results.append({
                "id": item.get("id"),
                "name": item.get("name"),
                "latitude": item.get("latitude"),
                "longitude": item.get("longitude"),
                "country": item.get("country", ""),
                "admin1": item.get("admin1", ""), # State / province
                "timezone": item.get("timezone", "UTC"),
                "country_code": item.get("country_code", ""),
            })

        if results:
            self._set_cache(cache_key, results)
        return results

    async def fetch_historical_weather(
        self,
        latitude: float,
        longitude: float,
        start_date: str,
        end_date: str,
        timezone: str = "auto",
        requested_variables: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """Fetch historical daily weather data from Open-Meteo Historical Weather API."""
        vars_to_request = requested_variables or self.default_variables
        cache_key = f"hist_{latitude:.4f}_{longitude:.4f}_{start_date}_{end_date}_{','.join(sorted(vars_to_request))}"
        cached = self._get_cache(cache_key)
        if cached:
            return cached

        params = {
            "latitude": latitude,
            "longitude": longitude,
            "start_date": start_date,
            "end_date": end_date,
            "daily": ",".join(vars_to_request),
            "timezone": timezone,
        }

        async with httpx.AsyncClient(timeout=25.0) as client:
            response = await client.get(settings.OPEN_METEO_HISTORICAL_URL, params=params)
            
            # If variable not found or bad request, retry removing non-essential variables
            if response.status_code == 400:
                err_text = response.text
                print(f"Historical API 400 warning: {err_text}")
                # Try with essential core variables
                core_vars = [v for v in vars_to_request if v in ["temperature_2m_mean", "relative_humidity_2m_mean", "rain_sum", "precipitation_sum", "wind_speed_10m_max", "pressure_msl_mean"]]
                params["daily"] = ",".join(core_vars)
                response = await client.get(settings.OPEN_METEO_HISTORICAL_URL, params=params)

            response.raise_for_status()
            data = response.json()

        data["metadata"] = {
            "data_source": "Open-Meteo Historical Weather API (Reanalysis / ERA5 / ERA5-Land models)",
            "latitude": latitude,
            "longitude": longitude,
            "start_date": start_date,
            "end_date": end_date,
            "timezone": data.get("timezone", timezone),
            "retrieval_timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "total_days_requested": len(data.get("daily", {}).get("time", [])),
            "variables_returned": list(data.get("daily", {}).keys()),
            "transparency_note": "Historical data is based on high-resolution meteorological atmospheric reanalysis models provided through Open-Meteo. Values represent physical grid estimates rather than a single direct local rain gauge.",
        }

        self._set_cache(cache_key, data)
        return data

    async def fetch_forecast_weather(
        self,
        latitude: float,
        longitude: float,
        timezone: str = "auto",
    ) -> Dict[str, Any]:
        """Fetch future forecast daily weather predictors from Open-Meteo Forecast API."""
        cache_key = f"fore_{latitude:.4f}_{longitude:.4f}_{timezone}"
        cached = self._get_cache(cache_key)
        if cached:
            return cached

        forecast_vars = [
            "temperature_2m_mean",
            "temperature_2m_max",
            "temperature_2m_min",
            "relative_humidity_2m_mean",
            "pressure_msl_mean",
            "wind_speed_10m_max",
            "precipitation_hours",
            "rain_sum",
        ]

        params = {
            "latitude": latitude,
            "longitude": longitude,
            "daily": ",".join(forecast_vars),
            "timezone": timezone,
            "forecast_days": 10,
        }

        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(settings.OPEN_METEO_FORECAST_URL, params=params)
            response.raise_for_status()
            data = response.json()

        data["metadata"] = {
            "data_source": "Open-Meteo Weather Forecast API",
            "latitude": latitude,
            "longitude": longitude,
            "timezone": data.get("timezone", timezone),
            "retrieval_timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "transparency_note": "These values are official meteorological forecast outputs from Open-Meteo used as PREDICTOR INPUTS for our statistical regression model. They do not constitute our project's model-based rainfall estimate.",
        }

        self._set_cache(cache_key, data)
        return data

weather_service = WeatherService()
