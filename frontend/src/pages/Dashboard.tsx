import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Cloud, 
  BarChart3, 
  Activity,
  Calendar,
  MapPin
} from 'lucide-react';
import { correlationApi, analysisApi } from '../utils/api';
import { CorrelationResponse, AnalysisSummary } from '../types';

const Dashboard: React.FC = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('SPY');
  const [selectedCity, setSelectedCity] = useState('NYC');
  const [selectedTimeframe, setSelectedTimeframe] = useState('1m');
  const [correlationData, setCorrelationData] = useState<CorrelationResponse | null>(null);
  const [summaryData, setSummaryData] = useState<AnalysisSummary | null>(null);
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

  const timeframes = [
    { value: '1m', label: '1 Month' },
  ];

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching data for:', selectedSymbol, selectedCity, selectedTimeframe);
      
      // Fetch correlation analysis
      const correlationResponse = await correlationApi.getAnalysis(
        selectedSymbol, 
        selectedCity, 
        selectedTimeframe
      );
      setCorrelationData(correlationResponse);
      
      // Fetch summary data
      const summaryResponse = await analysisApi.getSummary();
      setSummaryData(summaryResponse.summary);
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedSymbol, selectedCity, selectedTimeframe]);

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
          Analyze correlations between weather patterns and stock market performance
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
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          {/* Symbol Selector */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Stock Symbol (NYC, 1 Month)
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
        </div>
      </motion.div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          className="card-hover"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Overall Correlation</p>
              {loading ? (
                <div className="h-8 bg-surface-200 rounded animate-pulse"></div>
              ) : (
                <>
                  <p className="text-2xl font-bold text-text-primary">
                    {correlationData?.analysis?.overall_correlation?.toFixed(2) || '0.00'}
                  </p>
                  <p className={`text-xs ${
                    Math.abs(correlationData?.analysis?.overall_correlation || 0) > 0.5 
                      ? 'text-accent-positive' 
                      : Math.abs(correlationData?.analysis?.overall_correlation || 0) > 0.3 
                        ? 'text-accent-warning' 
                        : 'text-accent-negative'
                  }`}>
                    {Math.abs(correlationData?.analysis?.overall_correlation || 0) > 0.5 ? 'Strong' : 
                     Math.abs(correlationData?.analysis?.overall_correlation || 0) > 0.3 ? 'Moderate' : 'Weak'}
                  </p>
                </>
              )}
            </div>
            <div className="p-3 bg-primary-100 rounded-xl">
              <BarChart3 className="h-6 w-6 text-primary-500" />
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
              <p className="text-sm text-text-secondary">Temperature Correlation</p>
              {loading ? (
                <div className="h-8 bg-surface-200 rounded animate-pulse"></div>
              ) : (
                <>
                  <p className="text-2xl font-bold text-text-primary">
                    {correlationData?.analysis?.temperature_correlation?.toFixed(2) || '0.00'}
                  </p>
                  <p className={`text-xs ${
                    Math.abs(correlationData?.analysis?.temperature_correlation || 0) > 0.5 
                      ? 'text-accent-positive' 
                      : Math.abs(correlationData?.analysis?.temperature_correlation || 0) > 0.3 
                        ? 'text-accent-warning' 
                        : 'text-accent-negative'
                  }`}>
                    {Math.abs(correlationData?.analysis?.temperature_correlation || 0) > 0.5 ? 'Strong' : 
                     Math.abs(correlationData?.analysis?.temperature_correlation || 0) > 0.3 ? 'Moderate' : 'Weak'}
                  </p>
                </>
              )}
            </div>
            <div className="p-3 bg-accent-warning/10 rounded-xl">
              <Activity className="h-6 w-6 text-accent-warning" />
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
              <p className="text-sm text-text-secondary">Sample Size</p>
              {loading ? (
                <div className="h-8 bg-surface-200 rounded animate-pulse"></div>
              ) : (
                <>
                  <p className="text-2xl font-bold text-text-primary">
                    {correlationData?.analysis?.sample_size || '0'}
                  </p>
                  <p className="text-xs text-text-secondary">Data points</p>
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
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Confidence</p>
              {loading ? (
                <div className="h-8 bg-surface-200 rounded animate-pulse"></div>
              ) : (
                <>
                                <p className="text-2xl font-bold text-text-primary">
                {correlationData?.analysis?.r_squared ? (correlationData.analysis.r_squared * 100).toFixed(0) : '0'}%
              </p>
              <p className={`text-xs ${
                (correlationData?.analysis?.r_squared || 0) > 0.7 
                  ? 'text-accent-positive' 
                  : (correlationData?.analysis?.r_squared || 0) > 0.4 
                    ? 'text-accent-warning' 
                    : 'text-accent-negative'
              }`}>
                {(correlationData?.analysis?.r_squared || 0) > 0.7 ? 'High' : 
                 (correlationData?.analysis?.r_squared || 0) > 0.4 ? 'Medium' : 'Low'}
              </p>
                </>
              )}
            </div>
            <div className="p-3 bg-accent-positive/10 rounded-xl">
              <Cloud className="h-6 w-6 text-accent-positive" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Chart Section */}
      <motion.div
        className="card mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-text-primary">
            Correlation Analysis
          </h2>
          <button className="btn-secondary text-sm">
            Export Data
          </button>
        </div>
        
        {/* Placeholder for chart */}
        <div className="h-96 bg-surface-50 rounded-xl flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-text-tertiary mx-auto mb-4" />
            <p className="text-text-secondary">Chart will be displayed here</p>
            <p className="text-sm text-text-tertiary">
              Interactive correlation visualization
            </p>
          </div>
        </div>
      </motion.div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Correlation Matrix */}
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Correlation Matrix
          </h3>
          <div className="h-64 bg-surface-50 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-8 w-8 text-text-tertiary mx-auto mb-2" />
              <p className="text-text-secondary text-sm">Heatmap will be displayed here</p>
            </div>
          </div>
        </motion.div>

        {/* Recent Events */}
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Significant Events
          </h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-surface-50 rounded-xl">
              <div className="w-2 h-2 bg-accent-warning rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-text-primary">
                  Extreme Heat Event
                </p>
                <p className="text-xs text-text-secondary">
                  July 15, 2023 - Market impact: +2.3%
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-surface-50 rounded-xl">
              <div className="w-2 h-2 bg-accent-negative rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-text-primary">
                  Heavy Rainfall
                </p>
                <p className="text-xs text-text-secondary">
                  June 28, 2023 - Market impact: -1.8%
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-surface-50 rounded-xl">
              <div className="w-2 h-2 bg-accent-positive rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-text-primary">
                  Clear Weather
                </p>
                <p className="text-xs text-text-secondary">
                  June 15, 2023 - Market impact: +0.9%
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard; 