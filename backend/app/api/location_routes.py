from fastapi import APIRouter, Query, HTTPException
from app.services.weather_service import weather_service

router = APIRouter(prefix="/location", tags=["Location"])

@router.get("/search")
async def search_location(query: str = Query(..., min_length=2, description="City or region name")):
    """Search for locations using Open-Meteo Geocoding API."""
    try:
        results = await weather_service.search_locations(query)
        return {"query": query, "count": len(results), "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Location search failed: {str(e)}")
