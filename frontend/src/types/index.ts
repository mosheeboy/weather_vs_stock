// Weather types
export interface WeatherData {
  date: string;
  city: string;
  temperature_high: number;
  temperature_low: number;
  temperature_avg: number;
  precipitation: number;
  humidity: number;
  wind_speed: number;
  pressure: number;
  condition: string;
}

export interface WeatherCondition {
  CLEAR: 'clear';
  CLOUDY: 'cloudy';
  RAINY: 'rainy';
  STORMY: 'stormy';
  SNOWY: 'snowy';
  FOGGY: 'foggy';
}

// Stock types
export interface StockData {
  date: string;
  symbol: string;
  open_price: number;
  close_price: number;
  high_price: number;
  low_price: number;
  volume: number;
  percentage_change: number;
}

export interface MarketIndex {
  date: string;
  index_name: string;
  value: number;
  change: number;
  change_percent: number;
}

// Correlation types
export interface CorrelationAnalysis {
  symbol: string;
  city: string;
  timeframe: string;
  start_date: string;
  end_date: string;
  temperature_correlation: number;
  precipitation_correlation: number;
  humidity_correlation: number;
  wind_speed_correlation: number;
  pressure_correlation: number;
  temperature_p_value: number;
  precipitation_p_value: number;
  humidity_p_value: number;
  wind_speed_p_value: number;
  pressure_p_value: number;
  temperature_strength: string;
  precipitation_strength: string;
  humidity_strength: string;
  wind_speed_strength: string;
  pressure_strength: string;
  overall_correlation: number;
  confidence_interval: number[];
  r_squared: number;
  sample_size: number;
}

export interface CorrelationMatrix {
  variables: string[];
  matrix: number[][];
  p_values: number[][];
}

export interface WeatherEvent {
  date: string;
  city: string;
  event_type: string;
  description: string;
  market_impact?: number;
  correlation_impact?: number;
}

export interface CorrelationResponse {
  success: boolean;
  analysis?: CorrelationAnalysis;
  matrix?: CorrelationMatrix;
  events?: WeatherEvent[];
  error?: string;
}

// API Response types
export interface WeatherResponse {
  success: boolean;
  data: WeatherData[];
  summary?: any;
  error?: string;
}

export interface StockResponse {
  success: boolean;
  data: StockData[];
  summary?: any;
  error?: string;
}

// UI types
export interface SelectOption {
  value: string;
  label: string;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  category?: string;
}

// Analysis types
export interface AnalysisSummary {
  total_analyses: number;
  strongest_correlation: Record<string, any>;
  weakest_correlation: Record<string, any>;
  most_volatile_period: Record<string, any>;
  notable_patterns: string[];
  recommendations: string[];
}

export interface TrendAnalysis {
  symbol: string;
  city: string;
  period: string;
  total_days: number;
  temperature_trend: {
    direction: string;
    slope: number;
    significance: number;
  };
  stock_trend: {
    direction: string;
    slope: number;
    volatility: number;
  };
  correlation_trend: {
    direction: string;
    current_value: number;
    change: number;
  };
}

export interface Insight {
  symbol: string;
  city: string;
  period: string;
  key_findings: string[];
  recommendations: string[];
  risk_factors: string[];
  confidence_level: number;
} 