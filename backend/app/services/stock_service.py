import os
import requests
import logging
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import random
import numpy as np

from app.models.stocks import StockData, MarketIndex

logger = logging.getLogger(__name__)

class StockService:
    def __init__(self):
        self.api_key = os.getenv("ALPHA_VANTAGE_API_KEY")
        self.base_url = "https://www.alphavantage.co/query"
        
        logger.info(f"StockService initialized with API key: {self.api_key[:10] if self.api_key else 'None'}...")
        
        if not self.api_key:
            logger.warning("Alpha Vantage API key not found. Using mock data.")
    
    async def get_historical_stocks(
        self, 
        symbol: str, 
        start_date: datetime, 
        end_date: datetime
    ) -> List[StockData]:
        """Get historical stock data for a symbol"""
        try:
            # For now, always use mock data to get the app working
            logger.info(f"Using mock data for {symbol} (Alpha Vantage API temporarily disabled)")
            return self._generate_mock_stock_data(symbol, start_date, end_date)
            
            # Original Alpha Vantage code (commented out for debugging)
            # if not self.api_key:
            #     logger.info(f"No API key found, using mock data for {symbol}")
            #     return self._generate_mock_stock_data(symbol, start_date, end_date)
            # 
            # logger.info(f"Starting stock data fetch for {symbol} from {start_date} to {end_date}")
            # 
            # # Alpha Vantage daily adjusted endpoint
            params = {
                "function": "TIME_SERIES_DAILY_ADJUSTED",
                "symbol": symbol,
                "apikey": self.api_key,
                "outputsize": "full"
            }
            
            logger.info(f"Making Alpha Vantage API call for {symbol}")
            response = requests.get(self.base_url, params=params)
            logger.info(f"Alpha Vantage API response status: {response.status_code}")
            response.raise_for_status()
            
            data = response.json()
            
            logger.info(f"Alpha Vantage API response for {symbol}: {list(data.keys())}")
            
            if "Error Message" in data:
                logger.error(f"Alpha Vantage API error: {data['Error Message']}")
                return self._generate_mock_stock_data(symbol, start_date, end_date)
            
            time_series = data.get("Time Series (Daily)", {})
            logger.info(f"Time series data for {symbol}: {len(time_series)} records")
            stock_data = []
            
            for date_str, daily_data in time_series.items():
                date = datetime.strptime(date_str, "%Y-%m-%d")
                
                if start_date <= date <= end_date:
                    logger.info(f"Processing stock data for {date_str}")
                    # Calculate percentage change
                    open_price = float(daily_data["1. open"])
                    close_price = float(daily_data["4. close"])
                    percentage_change = ((close_price - open_price) / open_price) * 100
                    
                    stock_data.append(StockData(
                        date=date,
                        symbol=symbol,
                        open_price=open_price,
                        close_price=close_price,
                        high_price=float(daily_data["2. high"]),
                        low_price=float(daily_data["3. low"]),
                        volume=int(daily_data["6. volume"]),
                        percentage_change=percentage_change
                    ))
            
            # Sort by date
            stock_data.sort(key=lambda x: x.date)
            return stock_data
            
        except Exception as e:
            logger.error(f"Error in get_historical_stocks: {e}")
            logger.info(f"Falling back to mock data for {symbol}")
            return self._generate_mock_stock_data(symbol, start_date, end_date)
        
        # If we reach here, something went wrong, use mock data
        logger.warning(f"No stock data generated for {symbol}, using mock data")
        return self._generate_mock_stock_data(symbol, start_date, end_date)
    
    async def get_current_stock(self, symbol: str) -> Dict[str, Any]:
        """Get current stock price for a symbol"""
        try:
            if not self.api_key:
                return self._generate_mock_current_stock(symbol)
            
            params = {
                "function": "GLOBAL_QUOTE",
                "symbol": symbol,
                "apikey": self.api_key
            }
            
            response = requests.get(self.base_url, params=params)
            response.raise_for_status()
            
            data = response.json()
            
            if "Error Message" in data:
                logger.error(f"Alpha Vantage API error: {data['Error Message']}")
                return self._generate_mock_current_stock(symbol)
            
            quote = data.get("Global Quote", {})
            
            if not quote:
                return self._generate_mock_current_stock(symbol)
            
            return {
                "symbol": quote.get("01. symbol", symbol),
                "price": float(quote.get("05. price", 0)),
                "change": float(quote.get("09. change", 0)),
                "change_percent": quote.get("10. change percent", "0%"),
                "volume": int(quote.get("06. volume", 0)),
                "high": float(quote.get("03. high", 0)),
                "low": float(quote.get("04. low", 0))
            }
            
        except Exception as e:
            logger.error(f"Error getting current stock: {e}")
            return self._generate_mock_current_stock(symbol)
    
    async def get_market_indices(self) -> List[MarketIndex]:
        """Get current market indices"""
        try:
            indices = ["^GSPC", "^IXIC", "^DJI", "^VIX"]
            market_data = []
            
            for index in indices:
                try:
                    current_data = await self.get_current_stock(index)
                    
                    market_data.append(MarketIndex(
                        date=datetime.now(),
                        index_name=index,
                        value=current_data["price"],
                        change=current_data["change"],
                        change_percent=float(current_data["change_percent"].replace("%", ""))
                    ))
                    
                except Exception as e:
                    logger.error(f"Error fetching index {index}: {e}")
            
            return market_data
            
        except Exception as e:
            logger.error(f"Error getting market indices: {e}")
            return self._generate_mock_market_indices()
    
    def _generate_mock_stock_data(
        self, 
        symbol: str, 
        start_date: datetime, 
        end_date: datetime
    ) -> List[StockData]:
        """Generate mock stock data for testing"""
        stock_data = []
        current_date = start_date
        
        print(f"DEBUG: Generating mock stock data for {symbol} from {start_date} to {end_date}")
        
        # Base prices for different symbols
        base_prices = {
            "AAPL": 150, "MSFT": 300, "GOOGL": 2500, "AMZN": 3000,
            "TSLA": 800, "JPM": 150, "JNJ": 170, "V": 250,
            "WMT": 140, "PG": 150, "^GSPC": 4000, "^IXIC": 12000,
            "^DJI": 35000, "^VIX": 20, "SPY": 400, "VOO": 380, "IVV": 400, "QQQ": 350
        }
        
        base_price = base_prices.get(symbol, 100)
        
        while current_date <= end_date:
            # Generate data for all days (including weekends) to match weather data
            # Add some trend and volatility
            trend = 0.001 * (current_date - start_date).days  # Small daily trend
            volatility = 0.02  # 2% daily volatility
            
            # Generate price with trend and random walk
            price_change = np.random.normal(trend, volatility)
            base_price *= (1 + price_change)
            
            # Ensure price doesn't go negative
            base_price = max(base_price, 1)
            
            open_price = base_price
            close_price = base_price * (1 + np.random.normal(0, 0.01))
            high_price = max(open_price, close_price) * (1 + abs(np.random.normal(0, 0.005)))
            low_price = min(open_price, close_price) * (1 - abs(np.random.normal(0, 0.005)))
            
            percentage_change = ((close_price - open_price) / open_price) * 100
            
            stock_data.append(StockData(
                date=current_date,
                symbol=symbol,
                open_price=open_price,
                close_price=close_price,
                high_price=high_price,
                low_price=low_price,
                volume=int(random.uniform(1000000, 10000000)),
                percentage_change=percentage_change
            ))
            
            current_date += timedelta(days=1)
        
        print(f"DEBUG: Generated {len(stock_data)} stock records")
        return stock_data
    
    def _generate_mock_current_stock(self, symbol: str) -> Dict[str, Any]:
        """Generate mock current stock data"""
        base_prices = {
            "AAPL": 150, "MSFT": 300, "GOOGL": 2500, "AMZN": 3000,
            "TSLA": 800, "JPM": 150, "JNJ": 170, "V": 250,
            "WMT": 140, "PG": 150, "^GSPC": 4000, "^IXIC": 12000,
            "^DJI": 35000, "^VIX": 20, "SPY": 400, "VOO": 380, "IVV": 400, "QQQ": 350
        }
        
        base_price = base_prices.get(symbol, 100)
        price = base_price * (1 + random.uniform(-0.1, 0.1))
        change = price * random.uniform(-0.05, 0.05)
        
        return {
            "symbol": symbol,
            "price": price,
            "change": change,
            "change_percent": f"{change/price*100:.2f}%",
            "volume": int(random.uniform(1000000, 10000000)),
            "high": price * (1 + random.uniform(0, 0.02)),
            "low": price * (1 - random.uniform(0, 0.02))
        }
    
    def _generate_mock_market_indices(self) -> List[MarketIndex]:
        """Generate mock market indices data"""
        indices = [
            ("^GSPC", 4000, "S&P 500"),
            ("^IXIC", 12000, "NASDAQ"),
            ("^DJI", 35000, "Dow Jones"),
            ("^VIX", 20, "VIX")
        ]
        
        market_data = []
        for symbol, base_value, name in indices:
            value = base_value * (1 + random.uniform(-0.05, 0.05))
            change = value * random.uniform(-0.02, 0.02)
            
            market_data.append(MarketIndex(
                date=datetime.now(),
                index_name=name,
                value=value,
                change=change,
                change_percent=change/value*100
            ))
        
        return market_data 