from datetime import datetime, timedelta
from typing import Tuple
import logging

logger = logging.getLogger(__name__)

def get_date_range_for_timeframe(timeframe: str) -> Tuple[datetime, datetime]:
    """Get start and end dates for a given timeframe"""
    end_date = datetime.now()
    
    if timeframe == "1w":
        start_date = end_date - timedelta(days=7)
    elif timeframe == "1m":
        start_date = end_date - timedelta(days=30)
    elif timeframe == "3m":
        start_date = end_date - timedelta(days=90)
    elif timeframe == "1y":
        start_date = end_date - timedelta(days=365)
    else:
        # Default to 1 month
        start_date = end_date - timedelta(days=30)
    
    return start_date, end_date

def validate_date_range(start_date: datetime, end_date: datetime) -> bool:
    """Validate that date range is reasonable"""
    if start_date >= end_date:
        return False
    
    # Check if range is not too large (max 2 years)
    if (end_date - start_date).days > 730:
        return False
    
    # Check if dates are not in the future
    if end_date > datetime.now():
        return False
    
    return True

def format_date_for_api(date: datetime) -> str:
    """Format date for API requests"""
    return date.strftime("%Y-%m-%d")

def parse_date_string(date_string: str) -> datetime:
    """Parse date string to datetime object"""
    try:
        return datetime.strptime(date_string, "%Y-%m-%d")
    except ValueError:
        try:
            return datetime.strptime(date_string, "%Y-%m-%dT%H:%M:%S")
        except ValueError:
            raise ValueError(f"Invalid date format: {date_string}")

def get_weekday_name(date: datetime) -> str:
    """Get weekday name from date"""
    return date.strftime("%A")

def is_weekend(date: datetime) -> bool:
    """Check if date is weekend"""
    return date.weekday() >= 5

def get_business_days_between(start_date: datetime, end_date: datetime) -> int:
    """Get number of business days between two dates"""
    business_days = 0
    current_date = start_date
    
    while current_date <= end_date:
        if not is_weekend(current_date):
            business_days += 1
        current_date += timedelta(days=1)
    
    return business_days 