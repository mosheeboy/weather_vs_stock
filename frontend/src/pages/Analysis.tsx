import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Cloud, 
  Activity,
  Calendar,
  MapPin
} from 'lucide-react';
import { correlationApi, analysisApi, weatherApi, stockApi } from '../utils/api';
import { CorrelationResponse, AnalysisSummary, WeatherData, StockData } from '../types';
import CorrelationCharts from '../components/CorrelationCharts';
import { useAppContext } from '../context/AppContext';

const Analysis: React.FC = () => {
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
      console.log('Fetching analysis data for:', selectedSymbol, selectedCity);
      
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
      console.error('Error fetching analysis data:', err);
      let errorMessage = 'Failed to fetch analysis data';
      
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
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          Detailed Analysis
        </h1>
        <p className="text-text-secondary">
          Deep dive into weather-stock correlations with advanced analytics and detailed breakdowns
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

      {/* Correlation Charts */}
      <motion.div
        className="mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <CorrelationCharts
          analysis={correlationData?.analysis || null}
          matrix={correlationData?.matrix || null}
          loading={loading}
        />
      </motion.div>

      {/* Weather & Stock Summary */}
      <motion.div
        className="card mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        
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

      {/* Statistical Analysis */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-24 bg-surface-200 rounded animate-pulse"></div>
            <div className="h-24 bg-surface-200 rounded animate-pulse"></div>
            <div className="h-24 bg-surface-200 rounded animate-pulse"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="text-lg font-medium text-text-primary">Temperature Correlation</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 bg-surface-50 rounded-xl">
                  <span className="text-sm text-text-secondary">Correlation</span>
                  <span className="text-sm font-medium text-text-primary">
                    {correlationData?.analysis?.temperature_correlation ? (correlationData.analysis.temperature_correlation * 100).toFixed(1) : '0'}%
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-surface-50 rounded-xl">
                  <span className="text-sm text-text-secondary">P-Value</span>
                  <span className="text-sm font-medium text-text-primary">
                    {correlationData?.analysis?.temperature_p_value ? correlationData.analysis.temperature_p_value.toFixed(4) : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-surface-50 rounded-xl">
                  <span className="text-sm text-text-secondary">Strength</span>
                  <span className="text-sm font-medium text-text-primary">
                    {correlationData?.analysis?.temperature_strength || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-lg font-medium text-text-primary">Precipitation Correlation</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 bg-surface-50 rounded-xl">
                  <span className="text-sm text-text-secondary">Correlation</span>
                  <span className="text-sm font-medium text-text-primary">
                    {correlationData?.analysis?.precipitation_correlation ? (correlationData.analysis.precipitation_correlation * 100).toFixed(1) : '0'}%
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-surface-50 rounded-xl">
                  <span className="text-sm text-text-secondary">P-Value</span>
                  <span className="text-sm font-medium text-text-primary">
                    {correlationData?.analysis?.precipitation_p_value ? correlationData.analysis.precipitation_p_value.toFixed(4) : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-surface-50 rounded-xl">
                  <span className="text-sm text-text-secondary">Strength</span>
                  <span className="text-sm font-medium text-text-primary">
                    {correlationData?.analysis?.precipitation_strength || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-lg font-medium text-text-primary">Overall Analysis</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 bg-surface-50 rounded-xl">
                  <span className="text-sm text-text-secondary">Overall Correlation</span>
                  <span className="text-sm font-medium text-text-primary">
                    {correlationData?.analysis?.overall_correlation ? (correlationData.analysis.overall_correlation * 100).toFixed(1) : '0'}%
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-surface-50 rounded-xl">
                  <span className="text-sm text-text-secondary">Confidence Interval</span>
                  <span className="text-sm font-medium text-text-primary">
                    {correlationData?.analysis?.confidence_interval ? 
                      `${(correlationData.analysis.confidence_interval[0] * 100).toFixed(1)}% - ${(correlationData.analysis.confidence_interval[1] * 100).toFixed(1)}%` : 
                      'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-surface-50 rounded-xl">
                  <span className="text-sm text-text-secondary">Sample Size</span>
                  <span className="text-sm font-medium text-text-primary">
                    {correlationData?.analysis?.sample_size || '0'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Analysis; 