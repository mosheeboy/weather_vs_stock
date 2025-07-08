from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime
import logging

from app.models.weather import WeatherData, WeatherResponse, WeatherRequest
from app.services.weather_service import WeatherService
from app.utils.date_utils import parse_date_string, validate_date_range
from app.utils.database import get_cached_weather_data, cache_weather_data

logger = logging.getLogger(__name__)
router = APIRouter()

weather_service = WeatherService()

@router.get("/{city}/{start_date}/{end_date}", response_model=WeatherResponse)
async def get_weather_data(
    city: str,
    start_date: str,
    end_date: str
):
    """Get historical weather data for a city"""
    try:
        # Parse dates
        start_dt = parse_date_string(start_date)
        end_dt = parse_date_string(end_date)
        
        # Validate date range
        if not validate_date_range(start_dt, end_dt):
            raise HTTPException(status_code=400, detail="Invalid date range")
        
        # Check cache first
        cached_data = get_cached_weather_data(city, start_date, end_date)
        if cached_data:
            logger.info(f"Returning cached weather data for {city}")
            weather_data = [
                WeatherData(
                    date=datetime.fromisoformat(row['date']),
                    city=row['city'],
                    temperature_high=row['temperature_high'],
                    temperature_low=row['temperature_low'],
                    temperature_avg=row['temperature_avg'],
                    precipitation=row['precipitation'],
                    humidity=row['humidity'],
                    wind_speed=row['wind_speed'],
                    pressure=row['pressure'],
                    condition=row['condition']
                )
                for row in cached_data
            ]
            
            return WeatherResponse(
                success=True,
                data=weather_data
            )
        
        # Fetch from API
        weather_data = await weather_service.get_historical_weather(
            city=city,
            start_date=start_dt,
            end_date=end_dt
        )
        
        # Cache the data
        if weather_data:
            cache_weather_data(weather_data)
        
        return WeatherResponse(
            success=True,
            data=weather_data
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error fetching weather data: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/cities/available")
async def get_available_cities():
    """Get list of available cities"""
    cities = [
        {"name": "New York", "code": "NYC", "country": "US"},
        {"name": "Los Angeles", "code": "LA", "country": "US"},
        {"name": "Chicago", "code": "CHI", "country": "US"},
        {"name": "Miami", "code": "MIA", "country": "US"},
        {"name": "London", "code": "LON", "country": "UK"},
        {"name": "Tokyo", "code": "TOK", "country": "JP"},
        {"name": "Sydney", "code": "SYD", "country": "AU"},
        {"name": "Toronto", "code": "TOR", "country": "CA"}
    ]
    
    return {"cities": cities}

@router.get("/current/{city}")
async def get_current_weather(city: str):
    """Get current weather for a city"""
    try:
        current_weather = await weather_service.get_current_weather(city)
        return {
            "success": True,
            "data": current_weather
        }
    except Exception as e:
        logger.error(f"Error fetching current weather: {e}")
        raise HTTPException(status_code=500, detail="Internal server error") 