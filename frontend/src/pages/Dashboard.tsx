import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Cloud, 
  BarChart3, 
  Activity,
  Calendar,
  MapPin,
  AlertTriangle
} from 'lucide-react';
import { correlationApi, analysisApi, weatherApi, stockApi } from '../utils/api';
import { CorrelationResponse, AnalysisSummary, WeatherData, StockData } from '../types';
import CorrelationCharts from '../components/CorrelationCharts';
import TimeSeriesChart from '../components/TimeSeriesChart';
import DateRangePicker from '../components/DateRangePicker';

const Dashboard: React.FC = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('SPY');
  const [selectedCity, setSelectedCity] = useState('NYC');
  // Remove selectedTimeframe and its state
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    return sevenDaysAgo.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [correlationData, setCorrelationData] = useState<CorrelationResponse | null>(null);
  const [summaryData, setSummaryData] = useState<AnalysisSummary | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const symbols = [
    { value: 'SPY', label: 'S&P 500 ETF (SPY)' },
    { value: '^GSPC', label: 'S&P 500 Index (^GSPC)' },
    { value: 'VOO', label: 'Vanguard S&P 500 (VOO)' },
    { value: 'IVV', label: 'iShares S&P 500 (IVV)' },
    { value: 'QQQ', label: 'NASDAQ-100 ETF (QQQ)' },
  ];

  const cities = [
    { value: 'NYC', label: 'New York' },
  ];

  // Remove timeframes array and all references

  // Update fetchData to use only startDate and endDate
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching data for:', selectedSymbol, selectedCity);
      
      // Use the selected date range directly
      const startDateStr = startDate;
      const endDateStr = endDate;
      
      console.log('Date range:', { startDateStr, endDateStr });
      
      // Fetch correlation analysis
      const correlationResponse = await correlationApi.getAnalysis(
        selectedSymbol, 
        selectedCity, 
        // Remove selectedTimeframe from API call
        '1w' 
      );
      setCorrelationData(correlationResponse);
      
      // Fetch weather data
      const weatherResponse = await weatherApi.getHistoricalData(
        selectedCity,
        startDateStr,
        endDateStr
      );
      setWeatherData(weatherResponse.data || []);
      
      // Fetch stock data
      const stockResponse = await stockApi.getHistoricalData(
        selectedSymbol,
        startDateStr,
        endDateStr
      );
      setStockData(stockResponse.data || []);
      
      // Fetch summary data
      const summaryResponse = await analysisApi.getSummary();
      setSummaryData(summaryResponse.summary);
      
    } catch (err) {
      console.error('Error fetching data:', err);
      let errorMessage = 'Failed to fetch data';
      
      if (err instanceof Error) {
        if (err.message.includes('500')) {
          errorMessage = 'Server error - please try a different date range';
        } else if (err.message.includes('400')) {
          errorMessage = 'Invalid date range - please select a different period';
        } else if (err.message.includes('404')) {
          errorMessage = 'Data not found for the selected period';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedSymbol, selectedCity, startDate, endDate]);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Section */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          Weather vs Stock Market Correlator
        </h1>
        <p className="text-text-secondary">
          Analyze correlations between weather patterns and stock market performance over different timeframes
        </p>
      </motion.div>

      {/* Error Display */}
      {error && (
        <motion.div
          className="mb-4 p-4 bg-accent-negative/10 border border-accent-negative/20 rounded-xl text-accent-negative"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-sm">Error: {error}</p>
        </motion.div>
      )}

      {/* Controls Section */}
      <motion.div
        className="card mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Symbol Selector */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Stock Symbol
            </label>
            <div className="relative">
              <select
                value={selectedSymbol}
                onChange={(e) => setSelectedSymbol(e.target.value)}
                className="input-field appearance-none pr-10"
              >
                {symbols.map((symbol) => (
                  <option key={symbol.value} value={symbol.value}>
                    {symbol.label}
                  </option>
                ))}
              </select>
              <TrendingUp className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-secondary" />
            </div>
          </div>

          {/* Date Range Picker */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Select Date Range
            </label>
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onDateRangeChange={(start, end) => {
                setStartDate(start);
                setEndDate(end);
              }}
            />
            <p className="text-xs text-text-secondary mt-1">
              Click start date, then end date (up to 7 days)
            </p>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics Cards - Streamlined */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">

        <motion.div
          className="card-hover"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Sample Size</p>
              {loading ? (
                <div className="h-8 bg-surface-200 rounded animate-pulse"></div>
              ) : (
                <>
                  <p className="text-2xl font-bold text-text-primary">
                    {correlationData?.analysis?.sample_size || '0'}
                  </p>
                  <p className="text-xs text-text-secondary">
                    Data points analyzed
                  </p>
                </>
              )}
            </div>
            <div className="p-3 bg-accent-positive/10 rounded-xl">
              <TrendingUp className="h-6 w-6 text-accent-positive" />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="card-hover"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Significant Events</p>
              {loading ? (
                <div className="h-8 bg-surface-200 rounded animate-pulse"></div>
              ) : (
                <>
                  <p className="text-2xl font-bold text-text-primary">
                    3
                  </p>
                  <p className="text-xs text-text-secondary">
                    Weather events detected
                  </p>
                </>
              )}
            </div>
            <div className="p-3 bg-accent-negative/10 rounded-xl">
              <AlertTriangle className="h-6 w-6 text-accent-negative" />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="card-hover"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Model Fit (R²)</p>
              {loading ? (
                <div className="h-8 bg-surface-200 rounded animate-pulse"></div>
              ) : (
                <>
                  <p className="text-2xl font-bold text-text-primary">
                    {correlationData?.analysis?.r_squared ? (correlationData.analysis.r_squared * 100).toFixed(0) : '0'}%
                  </p>
                  <p className="text-xs text-text-secondary">
                    Variance explained by weather
                  </p>
                </>
              )}
            </div>
            <div className="p-3 bg-accent-warning/10 rounded-xl">
              <BarChart3 className="h-6 w-6 text-accent-warning" />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="card-hover"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Weather & Stock Range</p>
              {loading ? (
                <div className="h-8 bg-surface-200 rounded animate-pulse"></div>
              ) : (
                <>
                  <p className="text-2xl font-bold text-text-primary">
                    {(() => {
                      if (!weatherData.length || !stockData.length) return 'N/A';
                      const weatherHigh = Math.max(...weatherData.map(w => w.temperature_high));
                      const weatherLow = Math.min(...weatherData.map(w => w.temperature_low));
                      const stockHigh = Math.max(...stockData.map(s => s.high_price));
                      const stockLow = Math.min(...stockData.map(s => s.low_price));
                      const stockChange = ((stockHigh - stockLow) / stockLow * 100);
                      return `${stockChange.toFixed(1)}%`;
                    })()}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {(() => {
                      if (!weatherData.length || !stockData.length) return 'No data';
                      const weatherHigh = Math.max(...weatherData.map(w => w.temperature_high));
                      const weatherLow = Math.min(...weatherData.map(w => w.temperature_low));
                      return `${weatherLow.toFixed(0)}°C - ${weatherHigh.toFixed(0)}°C`;
                    })()}
                  </p>
                </>
              )}
            </div>
            <div className="p-3 bg-accent-warning/10 rounded-xl">
              <Activity className="h-6 w-6 text-accent-warning" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Correlation Charts */}
      <div className="mb-12">
        <CorrelationCharts
          analysis={correlationData?.analysis || null}
          matrix={correlationData?.matrix || null}
          loading={loading}
        />
      </div>

      {/* Weather & Stock Summary */}
      <motion.div
        className="card mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            Weather & Stock Performance Summary
          </h3>
          <p className="text-text-secondary">
            Detailed breakdown of weather extremes and corresponding stock performance
          </p>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-32 bg-surface-200 rounded animate-pulse"></div>
            <div className="h-32 bg-surface-200 rounded animate-pulse"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Weather Summary */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-text-primary">Weather Summary</h4>
              {weatherData.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-surface-50 rounded-xl">
                    <span className="text-sm text-text-secondary">Temperature Range</span>
                    <span className="text-sm font-medium text-text-primary">
                      {Math.min(...weatherData.map(w => w.temperature_low)).toFixed(1)}°C - {Math.max(...weatherData.map(w => w.temperature_high)).toFixed(1)}°C
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-surface-50 rounded-xl">
                    <span className="text-sm text-text-secondary">Average Temperature</span>
                    <span className="text-sm font-medium text-text-primary">
                      {(weatherData.reduce((sum, w) => sum + w.temperature_avg, 0) / weatherData.length).toFixed(1)}°C
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-surface-50 rounded-xl">
                    <span className="text-sm text-text-secondary">Total Precipitation</span>
                    <span className="text-sm font-medium text-text-primary">
                      {weatherData.reduce((sum, w) => sum + w.precipitation, 0).toFixed(1)}mm
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-surface-50 rounded-xl">
                    <span className="text-sm text-text-secondary">Average Humidity</span>
                    <span className="text-sm font-medium text-text-primary">
                      {(weatherData.reduce((sum, w) => sum + w.humidity, 0) / weatherData.length).toFixed(0)}%
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-text-secondary">No weather data available</p>
              )}
            </div>

            {/* Stock Summary */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-text-primary">Stock Performance</h4>
              {stockData.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-surface-50 rounded-xl">
                    <span className="text-sm text-text-secondary">Price Range</span>
                    <span className="text-sm font-medium text-text-primary">
                      ${Math.min(...stockData.map(s => s.low_price)).toFixed(2)} - ${Math.max(...stockData.map(s => s.high_price)).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-surface-50 rounded-xl">
                    <span className="text-sm text-text-secondary">Total Change</span>
                    <span className={`text-sm font-medium ${
                      (() => {
                        const firstPrice = stockData[0]?.open_price || 0;
                        const lastPrice = stockData[stockData.length - 1]?.close_price || 0;
                        const change = ((lastPrice - firstPrice) / firstPrice) * 100;
                        return change >= 0 ? 'text-accent-positive' : 'text-accent-negative';
                      })()
                    }`}>
                      {(() => {
                        const firstPrice = stockData[0]?.open_price || 0;
                        const lastPrice = stockData[stockData.length - 1]?.close_price || 0;
                        const change = ((lastPrice - firstPrice) / firstPrice) * 100;
                        return `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
                      })()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-surface-50 rounded-xl">
                    <span className="text-sm text-text-secondary">Average Volume</span>
                    <span className="text-sm font-medium text-text-primary">
                      {(stockData.reduce((sum, s) => sum + s.volume, 0) / stockData.length).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-surface-50 rounded-xl">
                    <span className="text-sm text-text-secondary">Volatility</span>
                    <span className="text-sm font-medium text-text-primary">
                      {(() => {
                        const changes = stockData.map(s => Math.abs(s.percentage_change));
                        const avgChange = changes.reduce((sum, c) => sum + c, 0) / changes.length;
                        return `${avgChange.toFixed(2)}%`;
                      })()}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-text-secondary">No stock data available</p>
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* Time Series Charts */}
      <div className="mb-12">
        <TimeSeriesChart
          weatherData={weatherData}
          stockData={stockData}
          loading={loading}
        />
      </div>


    </div>
  );
};

export default Dashboard; 