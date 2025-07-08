import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Lightbulb, 
  TrendingUp, 
  Cloud, 
  Calendar,
  BarChart3,
  Activity,
  Target,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { correlationApi, analysisApi, weatherApi, stockApi } from '../utils/api';
import { CorrelationResponse, AnalysisSummary, WeatherData, StockData } from '../types';
import TimeSeriesChart from '../components/TimeSeriesChart';
import { useAppContext } from '../context/AppContext';
import { formatTemperature } from '../utils/temperature';

const Insights: React.FC = () => {
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
      console.log('Fetching insights data for:', selectedSymbol, selectedCity);
      
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
      console.error('Error fetching insights data:', err);
      let errorMessage = 'Failed to fetch insights data';
      
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

  const generateInsights = () => {
    if (!correlationData?.analysis || !weatherData.length || !stockData.length) {
      return [];
    }

    const insights = [];
    const analysis = correlationData.analysis;

    // Temperature insights
    if (Math.abs(analysis.temperature_correlation) > 0.3) {
      insights.push({
        type: 'temperature',
        title: 'Temperature Impact Detected',
        description: `Strong correlation (${(analysis.temperature_correlation * 100).toFixed(1)}%) between temperature and ${selectedSymbol} performance`,
        icon: 'thermometer',
        severity: Math.abs(analysis.temperature_correlation) > 0.5 ? 'high' : 'medium'
      });
    }

    // Precipitation insights
    if (Math.abs(analysis.precipitation_correlation) > 0.3) {
      insights.push({
        type: 'precipitation',
        title: 'Precipitation Pattern Found',
        description: `Moderate correlation (${(analysis.precipitation_correlation * 100).toFixed(1)}%) between rainfall and stock movement`,
        icon: 'cloud-rain',
        severity: Math.abs(analysis.precipitation_correlation) > 0.5 ? 'high' : 'medium'
      });
    }

    // Overall correlation insights
    if (Math.abs(analysis.overall_correlation) > 0.4) {
      insights.push({
        type: 'overall',
        title: 'Strong Weather-Stock Relationship',
        description: `Overall correlation of ${(analysis.overall_correlation * 100).toFixed(1)}% suggests weather significantly impacts ${selectedSymbol}`,
        icon: 'trending-up',
        severity: 'high'
      });
    }

    // Volatility insights
    const stockVolatility = stockData.map(s => Math.abs(s.percentage_change));
    const avgVolatility = stockVolatility.reduce((sum, v) => sum + v, 0) / stockVolatility.length;
    
    if (avgVolatility > 2) {
      insights.push({
        type: 'volatility',
        title: 'High Market Volatility',
        description: `Average daily volatility of ${avgVolatility.toFixed(2)}% indicates turbulent market conditions`,
        icon: 'activity',
        severity: 'high'
      });
    }

    // Weather extremes
    const tempRange = Math.max(...weatherData.map(w => w.temperature_high)) - Math.min(...weatherData.map(w => w.temperature_low));
    const tempRangeF = (tempRange * 9/5); // Convert to Fahrenheit
    if (tempRange > 15) {
      insights.push({
        type: 'weather-extreme',
        title: 'Significant Temperature Variation',
        description: `Temperature range of ${tempRangeF.toFixed(1)}°F may impact market sentiment`,
        icon: 'thermometer',
        severity: 'medium'
      });
    }

    return insights;
  };

  const getRecommendations = () => {
    if (!correlationData?.analysis) return [];

    const recommendations = [];
    const analysis = correlationData.analysis;

    if (Math.abs(analysis.temperature_correlation) > 0.4) {
      recommendations.push({
        type: 'temperature',
        text: 'Monitor temperature forecasts for potential market impact',
        priority: 'high'
      });
    }

    if (Math.abs(analysis.precipitation_correlation) > 0.4) {
      recommendations.push({
        type: 'precipitation',
        text: 'Consider weather patterns when making trading decisions',
        priority: 'medium'
      });
    }

    if (analysis.r_squared > 0.3) {
      recommendations.push({
        type: 'model',
        text: 'Weather factors explain significant market variance - use in analysis',
        priority: 'high'
      });
    }

    return recommendations;
  };

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          Market Insights
        </h1>
        <p className="text-text-secondary">
          Discover patterns and insights from weather-stock correlations with time series analysis
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

      {/* Time Series Charts */}
      <motion.div
        className="mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <TimeSeriesChart
          weatherData={weatherData}
          stockData={stockData}
          loading={loading}
        />
      </motion.div>

      {/* Key Insights */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            Key Insights
          </h3>
          <p className="text-text-secondary">
            Automated analysis of weather-stock correlations and patterns
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-32 bg-surface-200 rounded animate-pulse"></div>
            <div className="h-32 bg-surface-200 rounded animate-pulse"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {generateInsights().map((insight, index) => (
              <motion.div
                key={index}
                className={`card-hover ${
                  insight.severity === 'high' ? 'border-l-4 border-accent-negative' :
                  insight.severity === 'medium' ? 'border-l-4 border-accent-warning' :
                  'border-l-4 border-accent-positive'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    insight.severity === 'high' ? 'bg-accent-negative/10' :
                    insight.severity === 'medium' ? 'bg-accent-warning/10' :
                    'bg-accent-positive/10'
                  }`}>
                    {insight.icon === 'thermometer' && <Activity className="h-5 w-5 text-accent-warning" />}
                    {insight.icon === 'cloud-rain' && <Cloud className="h-5 w-5 text-accent-negative" />}
                    {insight.icon === 'trending-up' && <TrendingUp className="h-5 w-5 text-accent-positive" />}
                    {insight.icon === 'activity' && <BarChart3 className="h-5 w-5 text-accent-negative" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-text-primary mb-1">
                      {insight.title}
                    </h4>
                    <p className="text-sm text-text-secondary">
                      {insight.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Recommendations */}
      <motion.div
        className="card mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            Trading Recommendations
          </h3>
          <p className="text-text-secondary">
            Actionable insights based on weather-stock correlation analysis
          </p>
        </div>

        {loading ? (
          <div className="space-y-3">
            <div className="h-4 bg-surface-200 rounded animate-pulse"></div>
            <div className="h-4 bg-surface-200 rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-surface-200 rounded animate-pulse w-1/2"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {getRecommendations().map((rec, index) => (
              <motion.div
                key={index}
                className="flex items-start gap-3 p-3 bg-surface-50 rounded-xl"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
              >
                <CheckCircle className={`h-5 w-5 mt-0.5 ${
                  rec.priority === 'high' ? 'text-accent-positive' : 'text-accent-warning'
                }`} />
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {rec.text}
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    Priority: {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)}
                  </p>
                </div>
              </motion.div>
            ))}
            
            {getRecommendations().length === 0 && (
              <div className="text-center py-8 text-text-secondary">
                <Target className="h-8 w-8 mx-auto mb-2 text-text-tertiary" />
                <p>No specific recommendations available</p>
                <p className="text-sm">Try selecting a different date range or symbol</p>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Pattern Analysis */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            Pattern Analysis
          </h3>
          <p className="text-text-secondary">
            Statistical patterns and trends in the data
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-24 bg-surface-200 rounded animate-pulse"></div>
            <div className="h-24 bg-surface-200 rounded animate-pulse"></div>
            <div className="h-24 bg-surface-200 rounded animate-pulse"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="text-lg font-medium text-text-primary">Correlation Strength</h4>
              <div className="p-3 bg-surface-50 rounded-xl">
                <p className="text-sm text-text-secondary">Overall</p>
                <p className={`text-lg font-bold ${
                  correlationData?.analysis?.overall_correlation && Math.abs(correlationData.analysis.overall_correlation) > 0.5 ? 'text-accent-positive' : 'text-accent-warning'
                }`}>
                  {correlationData?.analysis?.overall_correlation ? (correlationData.analysis.overall_correlation * 100).toFixed(1) : '0'}%
                </p>
                <p className="text-xs text-text-secondary">
                  {correlationData?.analysis?.overall_correlation && Math.abs(correlationData.analysis.overall_correlation) > 0.5 ? 'Strong correlation' : 'Weak correlation'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-lg font-medium text-text-primary">Data Quality</h4>
              <div className="p-3 bg-surface-50 rounded-xl">
                <p className="text-sm text-text-secondary">Sample Size</p>
                <p className="text-lg font-bold text-text-primary">
                  {correlationData?.analysis?.sample_size || '0'}
                </p>
                <p className="text-xs text-text-secondary">
                  Data points analyzed
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-lg font-medium text-text-primary">Model Confidence</h4>
              <div className="p-3 bg-surface-50 rounded-xl">
                <p className="text-sm text-text-secondary">R² Score</p>
                <p className="text-lg font-bold text-text-primary">
                  {correlationData?.analysis?.r_squared ? (correlationData.analysis.r_squared * 100).toFixed(1) : '0'}%
                </p>
                <p className="text-xs text-text-secondary">
                  Variance explained
                </p>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Insights; 