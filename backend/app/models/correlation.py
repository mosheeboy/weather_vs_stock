from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class CorrelationStrength(str, Enum):
    WEAK = "weak"
    MODERATE = "moderate"
    STRONG = "strong"

class CorrelationAnalysis(BaseModel):
    """Correlation analysis model"""
    symbol: str
    city: str
    timeframe: str
    start_date: datetime
    end_date: datetime
    
    # Correlation coefficients
    temperature_correlation: float = Field(..., description="Correlation with temperature")
    precipitation_correlation: float = Field(..., description="Correlation with precipitation")
    humidity_correlation: float = Field(..., description="Correlation with humidity")
    wind_speed_correlation: float = Field(..., description="Correlation with wind speed")
    pressure_correlation: float = Field(..., description="Correlation with pressure")
    
    # Statistical significance
    temperature_p_value: float
    precipitation_p_value: float
    humidity_p_value: float
    wind_speed_p_value: float
    pressure_p_value: float
    
    # Strength indicators
    temperature_strength: CorrelationStrength
    precipitation_strength: CorrelationStrength
    humidity_strength: CorrelationStrength
    wind_speed_strength: CorrelationStrength
    pressure_strength: CorrelationStrength
    
    # Overall metrics
    overall_correlation: float
    confidence_interval: List[float]
    r_squared: float
    sample_size: int
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class CorrelationMatrix(BaseModel):
    """Correlation matrix for multiple variables"""
    variables: List[str]
    matrix: List[List[float]]
    p_values: List[List[float]]

class WeatherEvent(BaseModel):
    """Significant weather event"""
    date: datetime
    city: str
    event_type: str
    description: str
    market_impact: Optional[float] = None
    correlation_impact: Optional[float] = None

class AnalysisSummary(BaseModel):
    """Summary of analysis results"""
    total_analyses: int
    strongest_correlation: Dict[str, Any]
    weakest_correlation: Dict[str, Any]
    most_volatile_period: Dict[str, Any]
    notable_patterns: List[str]
    recommendations: List[str]

class CorrelationRequest(BaseModel):
    """Request model for correlation analysis"""
    symbol: str
    city: str
    timeframe: str
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

class CorrelationResponse(BaseModel):
    """Response model for correlation analysis"""
    success: bool
    analysis: Optional[CorrelationAnalysis] = None
    matrix: Optional[CorrelationMatrix] = None
    events: Optional[List[WeatherEvent]] = None
    error: Optional[str] = None 