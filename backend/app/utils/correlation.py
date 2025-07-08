import pandas as pd
import numpy as np
from scipy import stats
from typing import List, Tuple, Dict, Any
from datetime import datetime, timedelta
import logging

from app.models.weather import WeatherData
from app.models.stocks import StockData
from app.models.correlation import CorrelationAnalysis, CorrelationStrength, CorrelationMatrix

logger = logging.getLogger(__name__)

def calculate_correlation_strength(correlation_coefficient: float) -> CorrelationStrength:
    """Determine correlation strength based on coefficient value"""
    abs_corr = abs(correlation_coefficient)
    
    if abs_corr < 0.3:
        return CorrelationStrength.WEAK
    elif abs_corr < 0.7:
        return CorrelationStrength.MODERATE
    else:
        return CorrelationStrength.STRONG

def calculate_correlation_with_p_value(x: List[float], y: List[float]) -> Tuple[float, float]:
    """Calculate Pearson correlation coefficient and p-value"""
    if len(x) != len(y) or len(x) < 2:
        return 0.0, 1.0
    
    try:
        correlation, p_value = stats.pearsonr(x, y)
        return correlation, p_value
    except Exception as e:
        logger.error(f"Error calculating correlation: {e}")
        return 0.0, 1.0

def calculate_confidence_interval(correlation: float, sample_size: int, confidence: float = 0.95) -> List[float]:
    """Calculate confidence interval for correlation coefficient"""
    if sample_size < 3:
        return [0.0, 0.0]
    
    try:
        # Fisher's z-transformation
        z_corr = 0.5 * np.log((1 + correlation) / (1 - correlation))
        
        # Standard error
        se = 1 / np.sqrt(sample_size - 3)
        
        # Critical value for confidence level
        alpha = 1 - confidence
        z_critical = stats.norm.ppf(1 - alpha / 2)
        
        # Confidence interval in z-space
        z_lower = z_corr - z_critical * se
        z_upper = z_corr + z_critical * se
        
        # Transform back to correlation space
        lower = (np.exp(2 * z_lower) - 1) / (np.exp(2 * z_lower) + 1)
        upper = (np.exp(2 * z_upper) - 1) / (np.exp(2 * z_upper) + 1)
        
        return [lower, upper]
    except Exception as e:
        logger.error(f"Error calculating confidence interval: {e}")
        return [0.0, 0.0]

def align_weather_stock_data(weather_data: List[WeatherData], stock_data: List[StockData]) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """Align weather and stock data by date"""
    # Convert to DataFrames
    weather_df = pd.DataFrame([
        {
            'date': data.date.date(),
            'temperature_avg': data.temperature_avg,
            'precipitation': data.precipitation,
            'humidity': data.humidity,
            'wind_speed': data.wind_speed,
            'pressure': data.pressure
        }
        for data in weather_data
    ])
    
    stock_df = pd.DataFrame([
        {
            'date': data.date.date(),
            'close_price': data.close_price,
            'percentage_change': data.percentage_change,
            'volume': data.volume
        }
        for data in stock_data
    ])
    
    # Merge on date
    merged_df = pd.merge(weather_df, stock_df, on='date', how='inner')
    
    if merged_df.empty:
        return pd.DataFrame(), pd.DataFrame()
    
    # Separate weather and stock data
    weather_aligned = merged_df[['date', 'temperature_avg', 'precipitation', 'humidity', 'wind_speed', 'pressure']]
    stock_aligned = merged_df[['date', 'close_price', 'percentage_change', 'volume']]
    
    return weather_aligned, stock_aligned

def perform_correlation_analysis(
    weather_data: List[WeatherData],
    stock_data: List[StockData],
    symbol: str,
    city: str,
    timeframe: str,
    start_date: datetime,
    end_date: datetime
) -> CorrelationAnalysis:
    """Perform comprehensive correlation analysis"""
    
    # Align data
    weather_aligned, stock_aligned = align_weather_stock_data(weather_data, stock_data)
    
    print(f"DEBUG: weather_aligned shape: {weather_aligned.shape}, stock_aligned shape: {stock_aligned.shape}")
    
    if weather_aligned.empty or stock_aligned.empty:
        raise ValueError("No overlapping data found for correlation analysis")
    
    # Calculate correlations for each weather metric
    temp_corr, temp_p = calculate_correlation_with_p_value(
        weather_aligned['temperature_avg'].tolist(),
        stock_aligned['close_price'].tolist()
    )
    
    precip_corr, precip_p = calculate_correlation_with_p_value(
        weather_aligned['precipitation'].tolist(),
        stock_aligned['close_price'].tolist()
    )
    
    humidity_corr, humidity_p = calculate_correlation_with_p_value(
        weather_aligned['humidity'].tolist(),
        stock_aligned['close_price'].tolist()
    )
    
    wind_corr, wind_p = calculate_correlation_with_p_value(
        weather_aligned['wind_speed'].tolist(),
        stock_aligned['close_price'].tolist()
    )
    
    pressure_corr, pressure_p = calculate_correlation_with_p_value(
        weather_aligned['pressure'].tolist(),
        stock_aligned['close_price'].tolist()
    )
    
    # Calculate overall correlation (average of absolute correlations)
    correlations = [temp_corr, precip_corr, humidity_corr, wind_corr, pressure_corr]
    overall_correlation = np.mean([abs(corr) for corr in correlations])
    
    # Calculate R-squared
    r_squared = overall_correlation ** 2
    
    # Calculate confidence interval
    confidence_interval = calculate_confidence_interval(overall_correlation, len(weather_aligned))
    
    # Create correlation analysis object
    analysis = CorrelationAnalysis(
        symbol=symbol,
        city=city,
        timeframe=timeframe,
        start_date=start_date,
        end_date=end_date,
        temperature_correlation=temp_corr,
        precipitation_correlation=precip_corr,
        humidity_correlation=humidity_corr,
        wind_speed_correlation=wind_corr,
        pressure_correlation=pressure_corr,
        temperature_p_value=temp_p,
        precipitation_p_value=precip_p,
        humidity_p_value=humidity_p,
        wind_speed_p_value=wind_p,
        pressure_p_value=pressure_p,
        temperature_strength=calculate_correlation_strength(temp_corr),
        precipitation_strength=calculate_correlation_strength(precip_corr),
        humidity_strength=calculate_correlation_strength(humidity_corr),
        wind_speed_strength=calculate_correlation_strength(wind_corr),
        pressure_strength=calculate_correlation_strength(pressure_corr),
        overall_correlation=overall_correlation,
        confidence_interval=confidence_interval,
        r_squared=r_squared,
        sample_size=len(weather_aligned)
    )
    
    return analysis

def create_correlation_matrix(weather_data: List[WeatherData], stock_data: List[StockData]) -> CorrelationMatrix:
    """Create correlation matrix for all variables"""
    
    weather_aligned, stock_aligned = align_weather_stock_data(weather_data, stock_data)
    
    if weather_aligned.empty or stock_aligned.empty:
        return CorrelationMatrix(variables=[], matrix=[], p_values=[])
    
    # Combine all variables
    combined_df = pd.concat([
        weather_aligned[['temperature_avg', 'precipitation', 'humidity', 'wind_speed', 'pressure']],
        stock_aligned[['close_price', 'percentage_change', 'volume']]
    ], axis=1)
    
    # Calculate correlation matrix
    correlation_matrix = combined_df.corr().values.tolist()
    
    # Calculate p-values matrix
    p_values_matrix = []
    variables = combined_df.columns.tolist()
    
    for i, var1 in enumerate(variables):
        p_row = []
        for j, var2 in enumerate(variables):
            if i == j:
                p_row.append(0.0)
            else:
                _, p_val = calculate_correlation_with_p_value(
                    combined_df[var1].tolist(),
                    combined_df[var2].tolist()
                )
                p_row.append(p_val)
        p_values_matrix.append(p_row)
    
    return CorrelationMatrix(
        variables=variables,
        matrix=correlation_matrix,
        p_values=p_values_matrix
    )

def detect_significant_events(weather_data: List[WeatherData], stock_data: List[StockData]) -> List[Dict[str, Any]]:
    """Detect significant weather events and their market impact"""
    events = []
    
    if not weather_data or not stock_data:
        return events
    
    # Create date mapping for stock data
    stock_dict = {data.date.date(): data for data in stock_data}
    
    for weather in weather_data:
        weather_date = weather.date.date()
        
        # Check for extreme weather conditions
        is_extreme = False
        event_type = ""
        description = ""
        
        if weather.temperature_avg > 35:  # Very hot
            is_extreme = True
            event_type = "extreme_heat"
            description = f"Extreme heat: {weather.temperature_avg:.1f}°C"
        elif weather.temperature_avg < -10:  # Very cold
            is_extreme = True
            event_type = "extreme_cold"
            description = f"Extreme cold: {weather.temperature_avg:.1f}°C"
        elif weather.precipitation > 50:  # Heavy rain
            is_extreme = True
            event_type = "heavy_rain"
            description = f"Heavy rain: {weather.precipitation:.1f}mm"
        elif weather.wind_speed > 20:  # High winds
            is_extreme = True
            event_type = "high_winds"
            description = f"High winds: {weather.wind_speed:.1f} m/s"
        
        if is_extreme and weather_date in stock_dict:
            stock = stock_dict[weather_date]
            events.append({
                "date": weather.date,
                "city": weather.city,
                "event_type": event_type,
                "description": description,
                "market_impact": stock.percentage_change,
                "correlation_impact": abs(stock.percentage_change)
            })
    
    # Sort by correlation impact
    events.sort(key=lambda x: x["correlation_impact"], reverse=True)
    
    return events[:10]  # Return top 10 events 