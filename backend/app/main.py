from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.location_routes import router as location_router
from app.api.weather_routes import router as weather_router
from app.api.analysis_routes import router as analysis_router
from app.api.prediction_routes import router as prediction_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="Statistical Rainfall Analysis and Prediction System - A Probability & Statistics Platform for Rainfall Data",
)

# Enable CORS for frontend Vite dev server (and any local port)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(location_router, prefix=settings.API_PREFIX)
app.include_router(weather_router, prefix=settings.API_PREFIX)
app.include_router(analysis_router, prefix=settings.API_PREFIX)
app.include_router(prediction_router, prefix=settings.API_PREFIX)

@app.get("/api/health")
async def health_check():
    return {
        "status": "online",
        "project": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION,
        "engine": "Python FastAPI + SciPy + NumPy + statsmodels",
    }

@app.get("/")
async def root():
    return {
        "message": "Welcome to Statistical Rainfall Analysis and Prediction System API",
        "docs_url": "/docs",
        "health_check": "/api/health",
    }
