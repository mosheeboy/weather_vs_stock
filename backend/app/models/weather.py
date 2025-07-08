from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class WeatherCondition(str, Enum):
    CLEAR = "clear"
    CLOUDY = "cloudy"
    RAINY = "rainy"
    STORMY = "stormy"
    SNOWY = "snowy"
    FOGGY = "foggy"

class WeatherData(BaseModel):
    """Weather data model"""
    date: datetime
    city: str
    temperature_high: float = Field(..., description="High temperature in Celsius")
    temperature_low: float = Field(..., description="Low temperature in Celsius")
    temperature_avg: float = Field(..., description="Average temperature in Celsius")
    precipitation: float = Field(..., description="Precipitation in mm")
    humidity: float = Field(..., description="Humidity percentage")
    wind_speed: float = Field(..., description="Wind speed in m/s")
    pressure: float = Field(..., description="Atmospheric pressure in hPa")
    condition: WeatherCondition = Field(..., description="Weather condition")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class WeatherSummary(BaseModel):
    """Weather summary for a time period"""
    city: str
    start_date: datetime
    end_date: datetime
    avg_temperature: float
    total_precipitation: float
    avg_humidity: float
    avg_wind_speed: float
    most_common_condition: WeatherCondition
    data_points: int

class WeatherRequest(BaseModel):
    """Request model for weather data"""
    city: str
    start_date: datetime
    end_date: datetime

class WeatherResponse(BaseModel):
    """Response model for weather data"""
    success: bool
    data: List[WeatherData]
    summary: Optional[WeatherSummary] = None
    error: Optional[str] = None 