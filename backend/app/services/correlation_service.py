import logging
from typing import List, Optional, Dict, Any
from datetime import datetime

from app.models.weather import WeatherData
from app.models.stocks import StockData
from app.models.correlation import CorrelationResponse, CorrelationAnalysis, CorrelationMatrix
from app.services.weather_service import WeatherService
from app.services.stock_service import StockService
from app.utils.correlation import (
    perform_correlation_analysis,
    create_correlation_matrix,
    detect_significant_events
)

logger = logging.getLogger(__name__)

class CorrelationService:
    def __init__(self):
        self.weather_service = WeatherService()
        self.stock_service = StockService()
    
    async def analyze_correlation(
        self,
        symbol: str,
        city: str,
        timeframe: str,
        start_date: datetime,
        end_date: datetime
    ) -> CorrelationResponse:
        """Perform comprehensive correlation analysis"""
        try:
            # Fetch weather and stock data
            weather_data = await self.weather_service.get_historical_weather(
                city=city,
                start_date=start_date,
                end_date=end_date
            )
            
            stock_data = await self.stock_service.get_historical_stocks(
                symbol=symbol,
                start_date=start_date,
                end_date=end_date
            )
            
            logger.info(f"Fetched {len(weather_data)} weather records and {len(stock_data)} stock records")
            
            # Debug: Print first few records
            if weather_data:
                logger.info(f"First weather record: {weather_data[0]}")
            if stock_data:
                logger.info(f"First stock record: {stock_data[0]}")
            
            if not weather_data or not stock_data:
                logger.error(f"No data available: weather_data={len(weather_data)}, stock_data={len(stock_data)}")
                return CorrelationResponse(
                    success=False,
                    error="No data available for the specified parameters"
                )
            
            # Perform correlation analysis
            analysis = perform_correlation_analysis(
                weather_data=weather_data,
                stock_data=stock_data,
                symbol=symbol,
                city=city,
                timeframe=timeframe,
                start_date=start_date,
                end_date=end_date
            )
            
            logger.info(f"Correlation analysis completed: overall_correlation={analysis.overall_correlation}, sample_size={analysis.sample_size}")
            
            # Create correlation matrix
            matrix = create_correlation_matrix(weather_data, stock_data)
            
            # Detect significant events
            events = detect_significant_events(weather_data, stock_data)
            
            return CorrelationResponse(
                success=True,
                analysis=analysis,
                matrix=matrix,
                events=events
            )
            
        except Exception as e:
            logger.error(f"Error in analyze_correlation: {e}")
            return CorrelationResponse(
                success=False,
                error=str(e)
            )
    
    async def get_correlation_matrix(
        self,
        symbol: str,
        city: str,
        start_date: datetime,
        end_date: datetime
    ) -> CorrelationMatrix:
        """Get correlation matrix for all variables"""
        try:
            # Fetch data
            weather_data = await self.weather_service.get_historical_weather(
                city=city,
                start_date=start_date,
                end_date=end_date
            )
            
            stock_data = await self.stock_service.get_historical_stocks(
                symbol=symbol,
                start_date=start_date,
                end_date=end_date
            )
            
            if not weather_data or not stock_data:
                return CorrelationMatrix(variables=[], matrix=[], p_values=[])
            
            # Create correlation matrix
            return create_correlation_matrix(weather_data, stock_data)
            
        except Exception as e:
            logger.error(f"Error getting correlation matrix: {e}")
            return CorrelationMatrix(variables=[], matrix=[], p_values=[])
    
    async def get_significant_events(
        self,
        symbol: str,
        city: str,
        start_date: datetime,
        end_date: datetime
    ) -> List[Dict[str, Any]]:
        """Get significant weather events and their market impact"""
        try:
            # Fetch data
            weather_data = await self.weather_service.get_historical_weather(
                city=city,
                start_date=start_date,
                end_date=end_date
            )
            
            stock_data = await self.stock_service.get_historical_stocks(
                symbol=symbol,
                start_date=start_date,
                end_date=end_date
            )
            
            if not weather_data or not stock_data:
                return []
            
            # Detect significant events
            return detect_significant_events(weather_data, stock_data)
            
        except Exception as e:
            logger.error(f"Error getting significant events: {e}")
            return []
    
    async def get_correlation_summary(
        self,
        symbol: str,
        city: str,
        timeframe: str
    ) -> Dict[str, Any]:
        """Get a summary of correlation analysis"""
        try:
            from app.utils.date_utils import get_date_range_for_timeframe
            
            start_date, end_date = get_date_range_for_timeframe(timeframe)
            
            response = await self.analyze_correlation(
                symbol=symbol,
                city=city,
                timeframe=timeframe,
                start_date=start_date,
                end_date=end_date
            )
            
            if not response.success or not response.analysis:
                return {"error": "Unable to perform analysis"}
            
            analysis = response.analysis
            
            # Create summary
            summary = {
                "symbol": symbol,
                "city": city,
                "timeframe": timeframe,
                "overall_correlation": analysis.overall_correlation,
                "r_squared": analysis.r_squared,
                "sample_size": analysis.sample_size,
                "strongest_correlation": self._get_strongest_correlation(analysis),
                "weakest_correlation": self._get_weakest_correlation(analysis),
                "confidence_interval": analysis.confidence_interval,
                "significant_correlations": self._get_significant_correlations(analysis)
            }
            
            return summary
            
        except Exception as e:
            logger.error(f"Error getting correlation summary: {e}")
            return {"error": str(e)}
    
    def _get_strongest_correlation(self, analysis: CorrelationAnalysis) -> Dict[str, Any]:
        """Get the strongest correlation from analysis"""
        correlations = [
            ("temperature", analysis.temperature_correlation, analysis.temperature_strength),
            ("precipitation", analysis.precipitation_correlation, analysis.precipitation_strength),
            ("humidity", analysis.humidity_correlation, analysis.humidity_strength),
            ("wind_speed", analysis.wind_speed_correlation, analysis.wind_speed_strength),
            ("pressure", analysis.pressure_correlation, analysis.pressure_strength)
        ]
        
        strongest = max(correlations, key=lambda x: abs(x[1]))
        
        return {
            "metric": strongest[0],
            "correlation": strongest[1],
            "strength": strongest[2].value
        }
    
    def _get_weakest_correlation(self, analysis: CorrelationAnalysis) -> Dict[str, Any]:
        """Get the weakest correlation from analysis"""
        correlations = [
            ("temperature", analysis.temperature_correlation, analysis.temperature_strength),
            ("precipitation", analysis.precipitation_correlation, analysis.precipitation_strength),
            ("humidity", analysis.humidity_correlation, analysis.humidity_strength),
            ("wind_speed", analysis.wind_speed_correlation, analysis.wind_speed_strength),
            ("pressure", analysis.pressure_correlation, analysis.pressure_strength)
        ]
        
        weakest = min(correlations, key=lambda x: abs(x[1]))
        
        return {
            "metric": weakest[0],
            "correlation": weakest[1],
            "strength": weakest[2].value
        }
    
    def _get_significant_correlations(self, analysis: CorrelationAnalysis) -> List[Dict[str, Any]]:
        """Get correlations that are statistically significant (p < 0.05)"""
        correlations = [
            ("temperature", analysis.temperature_correlation, analysis.temperature_p_value),
            ("precipitation", analysis.precipitation_correlation, analysis.precipitation_p_value),
            ("humidity", analysis.humidity_correlation, analysis.humidity_p_value),
            ("wind_speed", analysis.wind_speed_correlation, analysis.wind_speed_p_value),
            ("pressure", analysis.pressure_correlation, analysis.pressure_p_value)
        ]
        
        significant = [
            {
                "metric": corr[0],
                "correlation": corr[1],
                "p_value": corr[2]
            }
            for corr in correlations
            if corr[2] < 0.05
        ]
        
        return significant 