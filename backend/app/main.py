from dotenv import load_dotenv
import os

# Load environment variables FIRST
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.routes import weather, stocks, correlation, analysis
from app.utils.database import init_db

# Create FastAPI app
app = FastAPI(
    title="Weather vs Stock Market Correlator",
    description="API for analyzing correlations between weather patterns and stock market performance",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(weather.router, prefix="/api/weather", tags=["weather"])
app.include_router(stocks.router, prefix="/api/stocks", tags=["stocks"])
app.include_router(correlation.router, prefix="/api/correlation", tags=["correlation"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["analysis"])

@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    await init_db()

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Weather vs Stock Market Correlator API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

@app.get("/debug/stock/{symbol}")
async def debug_stock(symbol: str):
    """Debug endpoint to test stock data generation"""
    from app.services.stock_service import StockService
    from datetime import datetime, timedelta
    import logging
    
    logger = logging.getLogger(__name__)
    
    stock_service = StockService()
    start_date = datetime.now() - timedelta(days=30)
    end_date = datetime.now()
    
    debug_info = {
        "symbol": symbol,
        "api_key": stock_service.api_key[:10] + "..." if stock_service.api_key else "None",
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "steps": []
    }
    
    try:
        # Step 1: Check if API key exists
        debug_info["steps"].append(f"API key check: {'Present' if stock_service.api_key else 'Missing'}")
        
        # Step 2: Try to get stock data
        debug_info["steps"].append("Calling get_historical_stocks...")
        stock_data = await stock_service.get_historical_stocks(symbol, start_date, end_date)
        debug_info["steps"].append(f"get_historical_stocks returned {len(stock_data)} records")
        
        # Step 3: Check the data
        debug_info["stock_data_count"] = len(stock_data)
        if stock_data:
            debug_info["sample_data"] = stock_data[0].dict()
            debug_info["steps"].append(f"Sample data: {stock_data[0].dict()}")
        else:
            debug_info["sample_data"] = None
            debug_info["steps"].append("No stock data generated")
            
        # Step 4: Try mock data directly
        debug_info["steps"].append("Testing mock data generation directly...")
        mock_data = stock_service._generate_mock_stock_data(symbol, start_date, end_date)
        debug_info["mock_data_count"] = len(mock_data)
        debug_info["steps"].append(f"Mock data generation returned {len(mock_data)} records")
        
        return debug_info
        
    except Exception as e:
        debug_info["error"] = str(e)
        debug_info["steps"].append(f"Exception occurred: {str(e)}")
        return debug_info 