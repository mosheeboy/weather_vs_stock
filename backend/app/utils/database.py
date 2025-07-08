import sqlite3
import os
from typing import Optional
import logging

logger = logging.getLogger(__name__)

DATABASE_PATH = "weather_stock_data.db"

def get_database_connection():
    """Get SQLite database connection"""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

async def init_db():
    """Initialize database tables"""
    try:
        conn = get_database_connection()
        cursor = conn.cursor()
        
        # Create weather data table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS weather_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL,
                city TEXT NOT NULL,
                temperature_high REAL,
                temperature_low REAL,
                temperature_avg REAL,
                precipitation REAL,
                humidity REAL,
                wind_speed REAL,
                pressure REAL,
                condition TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(date, city)
            )
        ''')
        
        # Create stock data table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS stock_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL,
                symbol TEXT NOT NULL,
                open_price REAL,
                close_price REAL,
                high_price REAL,
                low_price REAL,
                volume INTEGER,
                percentage_change REAL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(date, symbol)
            )
        ''')
        
        # Create correlation cache table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS correlation_cache (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                symbol TEXT NOT NULL,
                city TEXT NOT NULL,
                timeframe TEXT NOT NULL,
                start_date TEXT NOT NULL,
                end_date TEXT NOT NULL,
                correlation_data TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(symbol, city, timeframe, start_date, end_date)
            )
        ''')
        
        # Create indexes for better performance
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_weather_date_city ON weather_data(date, city)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_stock_date_symbol ON stock_data(date, symbol)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_correlation_lookup ON correlation_cache(symbol, city, timeframe)')
        
        conn.commit()
        conn.close()
        logger.info("Database initialized successfully")
        
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        raise

def cache_weather_data(weather_data_list):
    """Cache weather data in database"""
    try:
        conn = get_database_connection()
        cursor = conn.cursor()
        
        for data in weather_data_list:
            cursor.execute('''
                INSERT OR REPLACE INTO weather_data 
                (date, city, temperature_high, temperature_low, temperature_avg, 
                 precipitation, humidity, wind_speed, pressure, condition)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                data.date.isoformat(),
                data.city,
                data.temperature_high,
                data.temperature_low,
                data.temperature_avg,
                data.precipitation,
                data.humidity,
                data.wind_speed,
                data.pressure,
                data.condition.value
            ))
        
        conn.commit()
        conn.close()
        logger.info(f"Cached {len(weather_data_list)} weather data points")
        
    except Exception as e:
        logger.error(f"Error caching weather data: {e}")
        raise

def cache_stock_data(stock_data_list):
    """Cache stock data in database"""
    try:
        conn = get_database_connection()
        cursor = conn.cursor()
        
        for data in stock_data_list:
            cursor.execute('''
                INSERT OR REPLACE INTO stock_data 
                (date, symbol, open_price, close_price, high_price, 
                 low_price, volume, percentage_change)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                data.date.isoformat(),
                data.symbol,
                data.open_price,
                data.close_price,
                data.high_price,
                data.low_price,
                data.volume,
                data.percentage_change
            ))
        
        conn.commit()
        conn.close()
        logger.info(f"Cached {len(stock_data_list)} stock data points")
        
    except Exception as e:
        logger.error(f"Error caching stock data: {e}")
        raise

def get_cached_weather_data(city: str, start_date: str, end_date: str):
    """Get cached weather data from database"""
    try:
        conn = get_database_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM weather_data 
            WHERE city = ? AND date BETWEEN ? AND ?
            ORDER BY date
        ''', (city, start_date, end_date))
        
        rows = cursor.fetchall()
        conn.close()
        
        return rows
        
    except Exception as e:
        logger.error(f"Error getting cached weather data: {e}")
        return []

def get_cached_stock_data(symbol: str, start_date: str, end_date: str):
    """Get cached stock data from database"""
    try:
        conn = get_database_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM stock_data 
            WHERE symbol = ? AND date BETWEEN ? AND ?
            ORDER BY date
        ''', (symbol, start_date, end_date))
        
        rows = cursor.fetchall()
        conn.close()
        
        return rows
        
    except Exception as e:
        logger.error(f"Error getting cached stock data: {e}")
        return []

def cache_correlation_analysis(analysis_data):
    """Cache correlation analysis results"""
    try:
        conn = get_database_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO correlation_cache 
            (symbol, city, timeframe, start_date, end_date, correlation_data)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            analysis_data.symbol,
            analysis_data.city,
            analysis_data.timeframe,
            analysis_data.start_date.isoformat(),
            analysis_data.end_date.isoformat(),
            analysis_data.json()
        ))
        
        conn.commit()
        conn.close()
        logger.info("Cached correlation analysis")
        
    except Exception as e:
        logger.error(f"Error caching correlation analysis: {e}")
        raise

def get_cached_correlation_analysis(symbol: str, city: str, timeframe: str):
    """Get cached correlation analysis from database"""
    try:
        conn = get_database_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM correlation_cache 
            WHERE symbol = ? AND city = ? AND timeframe = ?
            ORDER BY created_at DESC
            LIMIT 1
        ''', (symbol, city, timeframe))
        
        row = cursor.fetchone()
        conn.close()
        
        return row
        
    except Exception as e:
        logger.error(f"Error getting cached correlation analysis: {e}")
        return None 