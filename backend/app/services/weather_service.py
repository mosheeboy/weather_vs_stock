import os
import requests
import logging
import asyncio
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import random
import numpy as np

from app.models.weather import WeatherData, WeatherCondition

logger = logging.getLogger(__name__)

class WeatherService:
    def __init__(self):
        self.api_key = os.getenv("OPENWEATHER_API_KEY")
        self.base_url = "http://api.openweathermap.org/data/2.5"
        
        if not self.api_key:
            logger.warning("OpenWeatherMap API key not found. Using mock data.")
    
    async def get_historical_weather(
        self, 
        city: str, 
        start_date: datetime, 
        end_date: datetime
    ) -> List[WeatherData]:
        """Get historical weather data for a city"""
        try:
            if not self.api_key:
                return self._generate_mock_weather_data(city, start_date, end_date)
            
            # For now, use mock data since historical data requires paid subscription
            # In a production app, you'd use a paid service or historical data API
            logger.info(f"Using mock weather data for {city} from {start_date} to {end_date}")
            return self._generate_mock_weather_data(city, start_date, end_date)
            
        except Exception as e:
            logger.error(f"Error in get_historical_weather: {e}")
            return self._generate_mock_weather_data(city, start_date, end_date)
    
    async def get_current_weather(self, city: str) -> Dict[str, Any]:
        """Get current weather for a city"""
        try:
            if not self.api_key:
                return self._generate_mock_current_weather(city)
            
            url = f"{self.base_url}/weather"
            params = {
                "q": city,
                "appid": self.api_key,
                "units": "metric"
            }
            
            response = requests.get(url, params=params)
            response.raise_for_status()
            
            data = response.json()
            
            logger.info(f"Successfully fetched current weather for {city}")
            
            return {
                "city": data["name"],
                "temperature": data["main"]["temp"],
                "humidity": data["main"]["humidity"],
                "pressure": data["main"]["pressure"],
                "wind_speed": data["wind"]["speed"],
                "condition": data["weather"][0]["main"],
                "description": data["weather"][0]["description"]
            }
            
        except Exception as e:
            logger.error(f"Error getting current weather for {city}: {e}")
            return self._generate_mock_current_weather(city)
    
    def _get_city_coordinates(self, city: str) -> Dict[str, float]:
        """Get coordinates for a city"""
        coordinates = {
            "NYC": {"lat": 40.7128, "lon": -74.0060},
            "LA": {"lat": 34.0522, "lon": -118.2437},
            "CHI": {"lat": 41.8781, "lon": -87.6298},
            "MIA": {"lat": 25.7617, "lon": -80.1918},
            "LON": {"lat": 51.5074, "lon": -0.1278},
            "TOK": {"lat": 35.6762, "lon": 139.6503},
            "SYD": {"lat": -33.8688, "lon": 151.2093},
            "TOR": {"lat": 43.6532, "lon": -79.3832}
        }
        
        return coordinates.get(city.upper(), coordinates["NYC"])
    
    def _map_weather_condition(self, condition: str) -> WeatherCondition:
        """Map OpenWeatherMap condition to our enum"""
        condition_mapping = {
            "Clear": WeatherCondition.CLEAR,
            "Clouds": WeatherCondition.CLOUDY,
            "Rain": WeatherCondition.RAINY,
            "Thunderstorm": WeatherCondition.STORMY,
            "Snow": WeatherCondition.SNOWY,
            "Mist": WeatherCondition.FOGGY,
            "Fog": WeatherCondition.FOGGY
        }
        
        return condition_mapping.get(condition, WeatherCondition.CLEAR)
    
    def _generate_mock_weather_data(
        self, 
        city: str, 
        start_date: datetime, 
        end_date: datetime
    ) -> List[WeatherData]:
        """Generate mock weather data for testing"""
        weather_data = []
        current_date = start_date
        
        # Base temperatures for different cities
        base_temps = {
            "NYC": 15, "LA": 20, "CHI": 12, "MIA": 25,
            "LON": 12, "TOK": 16, "SYD": 18, "TOR": 10
        }
        
        base_temp = base_temps.get(city.upper(), 15)
        
        while current_date <= end_date:
            # Add seasonal variation
            day_of_year = current_date.timetuple().tm_yday
            seasonal_variation = 10 * np.sin(2 * np.pi * day_of_year / 365)
            
            # Add some randomness
            temp_variation = random.uniform(-5, 5)
            avg_temp = base_temp + seasonal_variation + temp_variation
            
            weather_data.append(WeatherData(
                date=current_date,
                city=city,
                temperature_high=avg_temp + random.uniform(3, 8),
                temperature_low=avg_temp - random.uniform(3, 8),
                temperature_avg=avg_temp,
                precipitation=random.uniform(0, 20),
                humidity=random.uniform(40, 80),
                wind_speed=random.uniform(0, 15),
                pressure=random.uniform(1000, 1020),
                condition=random.choice(list(WeatherCondition))
            ))
            
            current_date += timedelta(days=1)
        
        return weather_data
    
    def _generate_mock_current_weather(self, city: str) -> Dict[str, Any]:
        """Generate mock current weather data"""
        return {
            "city": city,
            "temperature": random.uniform(10, 30),
            "humidity": random.uniform(40, 80),
            "pressure": random.uniform(1000, 1020),
            "wind_speed": random.uniform(0, 15),
            "condition": "Clear",
            "description": "clear sky"
        } 