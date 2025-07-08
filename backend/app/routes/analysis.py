from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime
import logging

from app.models.correlation import AnalysisSummary
from app.services.analysis_service import AnalysisService
from app.utils.date_utils import get_date_range_for_timeframe

logger = logging.getLogger(__name__)
router = APIRouter()

analysis_service = AnalysisService()

@router.get("/summary")
async def get_analysis_summary():
    """Get overall analysis summary"""
    try:
        summary = await analysis_service.get_summary()
        return {
            "success": True,
            "summary": summary
        }
    except Exception as e:
        logger.error(f"Error getting analysis summary: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/trends/{symbol}/{city}")
async def get_trend_analysis(
    symbol: str,
    city: str,
    timeframe: str = "1m"
):
    """Get trend analysis for a symbol-city combination"""
    try:
        start_dt, end_dt = get_date_range_for_timeframe(timeframe)
        
        trends = await analysis_service.get_trends(
            symbol=symbol,
            city=city,
            start_date=start_dt,
            end_date=end_dt
        )
        
        return {
            "success": True,
            "trends": trends
        }
    except Exception as e:
        logger.error(f"Error getting trend analysis: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/insights/{symbol}/{city}")
async def get_insights(
    symbol: str,
    city: str,
    timeframe: str = "1m"
):
    """Get insights and recommendations"""
    try:
        start_dt, end_dt = get_date_range_for_timeframe(timeframe)
        
        insights = await analysis_service.get_insights(
            symbol=symbol,
            city=city,
            start_date=start_dt,
            end_date=end_dt
        )
        
        return {
            "success": True,
            "insights": insights
        }
    except Exception as e:
        logger.error(f"Error getting insights: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/comparison")
async def compare_correlations(
    symbols: str = Query(..., description="Comma-separated list of symbols"),
    city: str = Query(..., description="City to analyze"),
    timeframe: str = "1m"
):
    """Compare correlations across multiple symbols"""
    try:
        symbol_list = [s.strip() for s in symbols.split(",")]
        start_dt, end_dt = get_date_range_for_timeframe(timeframe)
        
        comparison = await analysis_service.compare_symbols(
            symbols=symbol_list,
            city=city,
            start_date=start_dt,
            end_date=end_dt
        )
        
        return {
            "success": True,
            "comparison": comparison
        }
    except Exception as e:
        logger.error(f"Error comparing correlations: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/seasonal/{symbol}/{city}")
async def get_seasonal_analysis(
    symbol: str,
    city: str,
    year: int = Query(..., description="Year to analyze")
):
    """Get seasonal analysis for a symbol-city combination"""
    try:
        seasonal_data = await analysis_service.get_seasonal_analysis(
            symbol=symbol,
            city=city,
            year=year
        )
        
        return {
            "success": True,
            "seasonal": seasonal_data
        }
    except Exception as e:
        logger.error(f"Error getting seasonal analysis: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/volatility/{symbol}/{city}")
async def get_volatility_analysis(
    symbol: str,
    city: str,
    timeframe: str = "1m"
):
    """Get volatility analysis"""
    try:
        start_dt, end_dt = get_date_range_for_timeframe(timeframe)
        
        volatility = await analysis_service.get_volatility_analysis(
            symbol=symbol,
            city=city,
            start_date=start_dt,
            end_date=end_dt
        )
        
        return {
            "success": True,
            "volatility": volatility
        }
    except Exception as e:
        logger.error(f"Error getting volatility analysis: {e}")
        raise HTTPException(status_code=500, detail="Internal server error") 