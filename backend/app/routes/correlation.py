from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime
import logging

from app.models.correlation import CorrelationResponse, CorrelationRequest
from app.services.correlation_service import CorrelationService
from app.utils.date_utils import get_date_range_for_timeframe, validate_date_range
from app.utils.database import get_cached_correlation_analysis, cache_correlation_analysis

logger = logging.getLogger(__name__)
router = APIRouter()

correlation_service = CorrelationService()

@router.get("/{symbol}/{city}/{timeframe}", response_model=CorrelationResponse)
async def get_correlation_analysis(
    symbol: str,
    city: str,
    timeframe: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    """Get correlation analysis between weather and stock data"""
    try:
        # Determine date range
        if start_date and end_date:
            start_dt = datetime.fromisoformat(start_date)
            end_dt = datetime.fromisoformat(end_date)
        else:
            start_dt, end_dt = get_date_range_for_timeframe(timeframe)
        
        # Validate date range
        if not validate_date_range(start_dt, end_dt):
            raise HTTPException(status_code=400, detail="Invalid date range")
        
        # Check cache first
        cached_analysis = get_cached_correlation_analysis(symbol, city, timeframe)
        if cached_analysis:
            logger.info(f"Returning cached correlation analysis for {symbol}-{city}")
            # Parse cached data and return
            # This would need to be implemented based on your caching strategy
            pass
        
        # Perform correlation analysis
        analysis_result = await correlation_service.analyze_correlation(
            symbol=symbol,
            city=city,
            timeframe=timeframe,
            start_date=start_dt,
            end_date=end_dt
        )
        
        # Cache the analysis
        if analysis_result.analysis:
            cache_correlation_analysis(analysis_result.analysis)
        
        return analysis_result
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error performing correlation analysis: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/custom", response_model=CorrelationResponse)
async def custom_correlation_analysis(request: CorrelationRequest):
    """Perform custom correlation analysis with specific parameters"""
    try:
        # Determine date range
        if request.start_date and request.end_date:
            start_dt = request.start_date
            end_dt = request.end_date
        else:
            start_dt, end_dt = get_date_range_for_timeframe(request.timeframe)
        
        # Validate date range
        if not validate_date_range(start_dt, end_dt):
            raise HTTPException(status_code=400, detail="Invalid date range")
        
        # Perform correlation analysis
        analysis_result = await correlation_service.analyze_correlation(
            symbol=request.symbol,
            city=request.city,
            timeframe=request.timeframe,
            start_date=start_dt,
            end_date=end_dt
        )
        
        return analysis_result
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error performing custom correlation analysis: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/matrix/{symbol}/{city}/{timeframe}")
async def get_correlation_matrix(
    symbol: str,
    city: str,
    timeframe: str
):
    """Get correlation matrix for all variables"""
    try:
        start_dt, end_dt = get_date_range_for_timeframe(timeframe)
        
        matrix_result = await correlation_service.get_correlation_matrix(
            symbol=symbol,
            city=city,
            start_date=start_dt,
            end_date=end_dt
        )
        
        return {
            "success": True,
            "matrix": matrix_result
        }
        
    except Exception as e:
        logger.error(f"Error getting correlation matrix: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/events/{symbol}/{city}/{timeframe}")
async def get_significant_events(
    symbol: str,
    city: str,
    timeframe: str
):
    """Get significant weather events and their market impact"""
    try:
        start_dt, end_dt = get_date_range_for_timeframe(timeframe)
        
        events = await correlation_service.get_significant_events(
            symbol=symbol,
            city=city,
            start_date=start_dt,
            end_date=end_dt
        )
        
        return {
            "success": True,
            "events": events
        }
        
    except Exception as e:
        logger.error(f"Error getting significant events: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/strength/{correlation_value}")
async def get_correlation_strength(correlation_value: float):
    """Get correlation strength interpretation"""
    from app.utils.correlation import calculate_correlation_strength
    
    strength = calculate_correlation_strength(correlation_value)
    
    return {
        "correlation_value": correlation_value,
        "strength": strength,
        "interpretation": {
            "weak": "Little to no relationship",
            "moderate": "Some relationship exists",
            "strong": "Strong relationship exists"
        }
    } 