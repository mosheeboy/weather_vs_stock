from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime
import logging

from app.models.stocks import StockData, StockResponse, StockRequest
from app.services.stock_service import StockService
from app.utils.date_utils import parse_date_string, validate_date_range
from app.utils.database import get_cached_stock_data, cache_stock_data

logger = logging.getLogger(__name__)
router = APIRouter()

stock_service = StockService()

@router.get("/{symbol}/{start_date}/{end_date}", response_model=StockResponse)
async def get_stock_data(
    symbol: str,
    start_date: str,
    end_date: str
):
    """Get historical stock data for a symbol"""
    try:
        # Parse dates
        start_dt = parse_date_string(start_date)
        end_dt = parse_date_string(end_date)
        
        # Validate date range
        if not validate_date_range(start_dt, end_dt):
            raise HTTPException(status_code=400, detail="Invalid date range")
        
        # Check cache first
        cached_data = get_cached_stock_data(symbol, start_date, end_date)
        if cached_data:
            logger.info(f"Returning cached stock data for {symbol}")
            stock_data = [
                StockData(
                    date=datetime.fromisoformat(row['date']),
                    symbol=row['symbol'],
                    open_price=row['open_price'],
                    close_price=row['close_price'],
                    high_price=row['high_price'],
                    low_price=row['low_price'],
                    volume=row['volume'],
                    percentage_change=row['percentage_change']
                )
                for row in cached_data
            ]
            
            return StockResponse(
                success=True,
                data=stock_data
            )
        
        # Fetch from API
        stock_data = await stock_service.get_historical_stocks(
            symbol=symbol,
            start_date=start_dt,
            end_date=end_dt
        )
        
        # Cache the data
        if stock_data:
            cache_stock_data(stock_data)
        
        return StockResponse(
            success=True,
            data=stock_data
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error fetching stock data: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/symbols/available")
async def get_available_symbols():
    """Get list of available stock symbols"""
    symbols = [
        {"symbol": "AAPL", "name": "Apple Inc.", "sector": "Technology"},
        {"symbol": "MSFT", "name": "Microsoft Corporation", "sector": "Technology"},
        {"symbol": "GOOGL", "name": "Alphabet Inc.", "sector": "Technology"},
        {"symbol": "AMZN", "name": "Amazon.com Inc.", "sector": "Consumer Discretionary"},
        {"symbol": "TSLA", "name": "Tesla Inc.", "sector": "Consumer Discretionary"},
        {"symbol": "JPM", "name": "JPMorgan Chase & Co.", "sector": "Financial"},
        {"symbol": "JNJ", "name": "Johnson & Johnson", "sector": "Healthcare"},
        {"symbol": "V", "name": "Visa Inc.", "sector": "Financial"},
        {"symbol": "WMT", "name": "Walmart Inc.", "sector": "Consumer Staples"},
        {"symbol": "PG", "name": "Procter & Gamble Co.", "sector": "Consumer Staples"},
        {"symbol": "^GSPC", "name": "S&P 500", "sector": "Index"},
        {"symbol": "^IXIC", "name": "NASDAQ Composite", "sector": "Index"},
        {"symbol": "^DJI", "name": "Dow Jones Industrial Average", "sector": "Index"},
        {"symbol": "^VIX", "name": "CBOE Volatility Index", "sector": "Index"}
    ]
    
    return {"symbols": symbols}

@router.get("/current/{symbol}")
async def get_current_stock(symbol: str):
    """Get current stock price for a symbol"""
    try:
        current_stock = await stock_service.get_current_stock(symbol)
        return {
            "success": True,
            "data": current_stock
        }
    except Exception as e:
        logger.error(f"Error fetching current stock: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/market/indices")
async def get_market_indices():
    """Get current market indices"""
    try:
        indices = await stock_service.get_market_indices()
        return {
            "success": True,
            "data": indices
        }
    except Exception as e:
        logger.error(f"Error fetching market indices: {e}")
        raise HTTPException(status_code=500, detail="Internal server error") 