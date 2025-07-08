import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Cloud, 
  BarChart3, 
  Activity,
  Calendar,
  MapPin,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { correlationApi, analysisApi, weatherApi, stockApi } from '../utils/api';
import { CorrelationResponse, AnalysisSummary, WeatherData, StockData } from '../types';
import { useAppContext } from '../context/AppContext';

const Dashboard: React.FC = () => {
  const {
    selectedSymbol,
    selectedCity,
    startDate,
    endDate,
  } = useAppContext();

  const [correlationData, setCorrelationData] = useState<CorrelationResponse | null>(null);
  const [summaryData, setSummaryData] = useState<AnalysisSummary | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching data for:', selectedSymbol, selectedCity);
      
      const startDateStr = startDate;
      const endDateStr = endDate;
      
      console.log('Date range:', { startDateStr, endDateStr });
      
      // Fetch correlation analysis
      const correlationResponse = await correlationApi.getAnalysis(
        selectedSymbol, 
        selectedCity, 
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
          Overview of correlations between weather patterns and stock market performance
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

      {/* Key Metrics Cards */}
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          className="card-hover cursor-pointer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => window.location.hash = '#/analysis'}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-1">Detailed Analysis</h3>
              <p className="text-sm text-text-secondary">View correlation charts and detailed breakdowns</p>
            </div>
            <ArrowRight className="h-5 w-5 text-text-secondary" />
          </div>
        </motion.div>

        <motion.div
          className="card-hover cursor-pointer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => window.location.hash = '#/comparison'}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-1">Compare Symbols</h3>
              <p className="text-sm text-text-secondary">Compare correlations across different stocks</p>
            </div>
            <ArrowRight className="h-5 w-5 text-text-secondary" />
          </div>
        </motion.div>

        <motion.div
          className="card-hover cursor-pointer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => window.location.hash = '#/insights'}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-1">Market Insights</h3>
              <p className="text-sm text-text-secondary">Discover patterns and time series analysis</p>
            </div>
            <ArrowRight className="h-5 w-5 text-text-secondary" />
          </div>
        </motion.div>
      </div>

      {/* Summary Card */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.9 }}
      >
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            Quick Summary
          </h3>
          <p className="text-text-secondary">
            Current analysis overview for {selectedSymbol} and {selectedCity}
          </p>
        </div>
        
        {loading ? (
          <div className="space-y-3">
            <div className="h-4 bg-surface-200 rounded animate-pulse"></div>
            <div className="h-4 bg-surface-200 rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-surface-200 rounded animate-pulse w-1/2"></div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-text-secondary">
              <span className="font-medium text-text-primary">{selectedSymbol}</span> shows a 
              <span className={`font-medium ${correlationData?.analysis?.overall_correlation && correlationData.analysis.overall_correlation > 0 ? 'text-accent-positive' : 'text-accent-negative'}`}>
                {' '}{correlationData?.analysis?.overall_correlation ? (correlationData.analysis.overall_correlation * 100).toFixed(1) : '0'}% correlation
              </span> with weather patterns in {selectedCity}.
            </p>
            <p className="text-sm text-text-secondary">
              The model explains <span className="font-medium text-text-primary">
                {correlationData?.analysis?.r_squared ? (correlationData.analysis.r_squared * 100).toFixed(1) : '0'}%
              </span> of the variance in stock performance based on weather factors.
            </p>
            <p className="text-sm text-text-secondary">
              Analysis period: <span className="font-medium text-text-primary">
                {startDate} to {endDate}
              </span> with <span className="font-medium text-text-primary">
                {correlationData?.analysis?.sample_size || '0'} data points
              </span>.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard; 