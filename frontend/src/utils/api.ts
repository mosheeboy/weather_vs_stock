import axios from 'axios';
import { 
  WeatherResponse, 
  StockResponse, 
  CorrelationResponse,
  AnalysisSummary,
  TrendAnalysis,
  Insight
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Weather API
export const weatherApi = {
  getHistoricalData: async (city: string, startDate: string, endDate: string): Promise<WeatherResponse> => {
    const response = await api.get(`/api/weather/${city}/${startDate}/${endDate}`);
    return response.data;
  },

  getCurrentWeather: async (city: string) => {
    const response = await api.get(`/api/weather/current/${city}`);
    return response.data;
  },

  getAvailableCities: async () => {
    const response = await api.get('/api/weather/cities/available');
    return response.data;
  },
};

// Stock API
export const stockApi = {
  getHistoricalData: async (symbol: string, startDate: string, endDate: string): Promise<StockResponse> => {
    const response = await api.get(`/api/stocks/${symbol}/${startDate}/${endDate}`);
    return response.data;
  },

  getCurrentStock: async (symbol: string) => {
    const response = await api.get(`/api/stocks/current/${symbol}`);
    return response.data;
  },

  getAvailableSymbols: async () => {
    const response = await api.get('/api/stocks/symbols/available');
    return response.data;
  },

  getMarketIndices: async () => {
    const response = await api.get('/api/stocks/market/indices');
    return response.data;
  },
};

// Correlation API
export const correlationApi = {
  getAnalysis: async (symbol: string, city: string, timeframe: string): Promise<CorrelationResponse> => {
    const response = await api.get(`/api/correlation/${symbol}/${city}/${timeframe}`);
    return response.data;
  },

  getCustomAnalysis: async (params: {
    symbol: string;
    city: string;
    timeframe: string;
    start_date?: string;
    end_date?: string;
  }): Promise<CorrelationResponse> => {
    const response = await api.post('/api/correlation/custom', params);
    return response.data;
  },

  getCorrelationMatrix: async (symbol: string, city: string, timeframe: string) => {
    const response = await api.get(`/api/correlation/matrix/${symbol}/${city}/${timeframe}`);
    return response.data;
  },

  getSignificantEvents: async (symbol: string, city: string, timeframe: string) => {
    const response = await api.get(`/api/correlation/events/${symbol}/${city}/${timeframe}`);
    return response.data;
  },

  getCorrelationStrength: async (correlationValue: number) => {
    const response = await api.get(`/api/correlation/strength/${correlationValue}`);
    return response.data;
  },
};

// Analysis API
export const analysisApi = {
  getSummary: async (): Promise<{ success: boolean; summary: AnalysisSummary }> => {
    const response = await api.get('/api/analysis/summary');
    return response.data;
  },

  getTrends: async (symbol: string, city: string, timeframe: string = '1m'): Promise<{ success: boolean; trends: TrendAnalysis }> => {
    const response = await api.get(`/api/analysis/trends/${symbol}/${city}?timeframe=${timeframe}`);
    return response.data;
  },

  getInsights: async (symbol: string, city: string, timeframe: string = '1m'): Promise<{ success: boolean; insights: Insight }> => {
    const response = await api.get(`/api/analysis/insights/${symbol}/${city}?timeframe=${timeframe}`);
    return response.data;
  },

  compareSymbols: async (symbols: string[], city: string, timeframe: string = '1m') => {
    const symbolsParam = symbols.join(',');
    const response = await api.get(`/api/analysis/comparison?symbols=${symbolsParam}&city=${city}&timeframe=${timeframe}`);
    return response.data;
  },

  getSeasonalAnalysis: async (symbol: string, city: string, year: number) => {
    const response = await api.get(`/api/analysis/seasonal/${symbol}/${city}?year=${year}`);
    return response.data;
  },

  getVolatilityAnalysis: async (symbol: string, city: string, timeframe: string = '1m') => {
    const response = await api.get(`/api/analysis/volatility/${symbol}/${city}?timeframe=${timeframe}`);
    return response.data;
  },
};

// Error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    if (error.response?.status === 404) {
      throw new Error('Data not found');
    } else if (error.response?.status === 500) {
      throw new Error('Server error occurred');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout');
    } else {
      throw new Error(error.response?.data?.detail || 'An error occurred');
    }
  }
);

export default api; 