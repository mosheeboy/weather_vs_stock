from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class StockData(BaseModel):
    """Stock data model"""
    date: datetime
    symbol: str
    open_price: float = Field(..., description="Opening price")
    close_price: float = Field(..., description="Closing price")
    high_price: float = Field(..., description="High price")
    low_price: float = Field(..., description="Low price")
    volume: int = Field(..., description="Trading volume")
    percentage_change: float = Field(..., description="Daily percentage change")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class StockSummary(BaseModel):
    """Stock summary for a time period"""
    symbol: str
    start_date: datetime
    end_date: datetime
    start_price: float
    end_price: float
    total_return: float
    avg_volume: float
    max_price: float
    min_price: float
    volatility: float
    data_points: int

class StockRequest(BaseModel):
    """Request model for stock data"""
    symbol: str
    start_date: datetime
    end_date: datetime

class StockResponse(BaseModel):
    """Response model for stock data"""
    success: bool
    data: List[StockData]
    summary: Optional[StockSummary] = None
    error: Optional[str] = None

class MarketIndex(BaseModel):
    """Market index data"""
    date: datetime
    index_name: str
    value: float
    change: float
    change_percent: float 