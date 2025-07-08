import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  GitCompare, 
  TrendingUp, 
  Cloud, 
  Plus,
  X,
  BarChart3,
  Activity
} from 'lucide-react';
import { correlationApi, weatherApi, stockApi } from '../utils/api';
import { CorrelationResponse, WeatherData, StockData } from '../types';
import { useAppContext } from '../context/AppContext';

interface ComparisonItem {
  id: string;
  symbol: string;
  city: string;
  correlationData: CorrelationResponse | null;
  weatherData: WeatherData[];
  stockData: StockData[];
  loading: boolean;
}

const Comparison: React.FC = () => {
  const { startDate, endDate } = useAppContext();
  
  const [comparisonItems, setComparisonItems] = useState<ComparisonItem[]>([
    {
      id: '1',
      symbol: 'SPY',
      city: 'NYC',
      correlationData: null,
      weatherData: [],
      stockData: [],
      loading: false
    }
  ]);
  const [error, setError] = useState<string | null>(null);

  const symbols = [
    { value: 'SPY', label: 'S&P 500 ETF (SPY)' },
    { value: '^GSPC', label: 'S&P 500 Index (^GSPC)' },
    { value: 'VOO', label: 'Vanguard S&P 500 (VOO)' },
    { value: 'IVV', label: 'iShares S&P 500 (IVV)' },
    { value: 'QQQ', label: 'NASDAQ-100 ETF (QQQ)' },
    { value: 'AAPL', label: 'Apple Inc. (AAPL)' },
    { value: 'MSFT', label: 'Microsoft Corp. (MSFT)' },
    { value: 'GOOGL', label: 'Alphabet Inc. (GOOGL)' },
  ];

  const cities = [
    { value: 'NYC', label: 'New York' },
    { value: 'LAX', label: 'Los Angeles' },
    { value: 'CHI', label: 'Chicago' },
    { value: 'HOU', label: 'Houston' },
  ];

  const fetchDataForItem = async (item: ComparisonItem) => {
    const updatedItem = { ...item, loading: true };
    setComparisonItems(prev => prev.map(i => i.id === item.id ? updatedItem : i));

    try {
      // Fetch correlation analysis
      const correlationResponse = await correlationApi.getAnalysis(
        item.symbol, 
        item.city, 
        '1w' 
      );
      
      // Fetch weather data
      const weatherResponse = await weatherApi.getHistoricalData(
        item.city,
        startDate,
        endDate
      );
      
      // Fetch stock data
      const stockResponse = await stockApi.getHistoricalData(
        item.symbol,
        startDate,
        endDate
      );

      const updatedItemWithData = {
        ...item,
        correlationData: correlationResponse,
        weatherData: weatherResponse.data || [],
        stockData: stockResponse.data || [],
        loading: false
      };

      setComparisonItems(prev => prev.map(i => i.id === item.id ? updatedItemWithData : i));
    } catch (err) {
      console.error(`Error fetching data for ${item.symbol}:`, err);
      const updatedItemWithError = {
        ...item,
        loading: false
      };
      setComparisonItems(prev => prev.map(i => i.id === item.id ? updatedItemWithError : i));
    }
  };

  const addComparisonItem = () => {
    const newId = (comparisonItems.length + 1).toString();
    const newItem: ComparisonItem = {
      id: newId,
      symbol: 'SPY',
      city: 'NYC',
      correlationData: null,
      weatherData: [],
      stockData: [],
      loading: false
    };
    setComparisonItems(prev => [...prev, newItem]);
  };

  const removeComparisonItem = (id: string) => {
    if (comparisonItems.length > 1) {
      setComparisonItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const updateComparisonItem = (id: string, field: 'symbol' | 'city', value: string) => {
    setComparisonItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  useEffect(() => {
    comparisonItems.forEach(item => {
      if (item.symbol && item.city) {
        fetchDataForItem(item);
      }
    });
  }, [startDate, endDate]);

  const getCorrelationStrength = (correlation: number): string => {
    const absCorr = Math.abs(correlation);
    if (absCorr >= 0.7) return 'Very Strong';
    if (absCorr >= 0.5) return 'Strong';
    if (absCorr >= 0.3) return 'Moderate';
    if (absCorr >= 0.1) return 'Weak';
    return 'Very Weak';
  };

  const getCorrelationColor = (correlation: number): string => {
    const absCorr = Math.abs(correlation);
    if (absCorr >= 0.7) return 'text-accent-positive';
    if (absCorr >= 0.5) return 'text-accent-warning';
    if (absCorr >= 0.3) return 'text-accent-negative';
    return 'text-text-secondary';
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
          Symbol Comparison
        </h1>
        <p className="text-text-secondary">
          Compare correlations across different stocks and cities to identify patterns
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

      {/* Add Symbol Button */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <button
          onClick={addComparisonItem}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Symbol
        </button>
      </motion.div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {comparisonItems.map((item, index) => (
          <motion.div
            key={item.id}
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-text-primary">
                Comparison {index + 1}
              </h3>
              {comparisonItems.length > 1 && (
                <button
                  onClick={() => removeComparisonItem(item.id)}
                  className="p-1 text-text-tertiary hover:text-accent-negative transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Symbol and City Selectors */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Stock Symbol
                </label>
                <div className="relative">
                  <select
                    value={item.symbol}
                    onChange={(e) => updateComparisonItem(item.id, 'symbol', e.target.value)}
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

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  City
                </label>
                <div className="relative">
                  <select
                    value={item.city}
                    onChange={(e) => updateComparisonItem(item.id, 'city', e.target.value)}
                    className="input-field appearance-none pr-10"
                  >
                    {cities.map((city) => (
                      <option key={city.value} value={city.value}>
                        {city.label}
                      </option>
                    ))}
                  </select>
                  <Cloud className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-secondary" />
                </div>
              </div>
            </div>

            {/* Correlation Results */}
            {item.loading ? (
              <div className="space-y-3">
                <div className="h-4 bg-surface-200 rounded animate-pulse"></div>
                <div className="h-4 bg-surface-200 rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-surface-200 rounded animate-pulse w-1/2"></div>
              </div>
            ) : item.correlationData?.analysis ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-surface-50 rounded-xl">
                    <p className="text-sm text-text-secondary">Overall Correlation</p>
                    <p className={`text-lg font-bold ${getCorrelationColor(item.correlationData.analysis.overall_correlation)}`}>
                      {(item.correlationData.analysis.overall_correlation * 100).toFixed(1)}%
                    </p>
                    <p className="text-xs text-text-secondary">
                      {getCorrelationStrength(item.correlationData.analysis.overall_correlation)}
                    </p>
                  </div>
                  <div className="p-3 bg-surface-50 rounded-xl">
                    <p className="text-sm text-text-secondary">Model Fit (R²)</p>
                    <p className="text-lg font-bold text-text-primary">
                      {(item.correlationData.analysis.r_squared * 100).toFixed(1)}%
                    </p>
                    <p className="text-xs text-text-secondary">
                      Variance explained
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-surface-50 rounded-lg">
                    <span className="text-sm text-text-secondary">Temperature</span>
                    <span className={`text-sm font-medium ${getCorrelationColor(item.correlationData.analysis.temperature_correlation)}`}>
                      {(item.correlationData.analysis.temperature_correlation * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-surface-50 rounded-lg">
                    <span className="text-sm text-text-secondary">Precipitation</span>
                    <span className={`text-sm font-medium ${getCorrelationColor(item.correlationData.analysis.precipitation_correlation)}`}>
                      {(item.correlationData.analysis.precipitation_correlation * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-surface-50 rounded-lg">
                    <span className="text-sm text-text-secondary">Humidity</span>
                    <span className={`text-sm font-medium ${getCorrelationColor(item.correlationData.analysis.humidity_correlation)}`}>
                      {(item.correlationData.analysis.humidity_correlation * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="text-xs text-text-secondary">
                  Sample size: {item.correlationData.analysis.sample_size} data points
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-text-secondary">
                <BarChart3 className="h-8 w-8 mx-auto mb-2 text-text-tertiary" />
                <p>No correlation data available</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Comparison Summary */}
      {comparisonItems.length > 1 && (
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              Comparison Summary
            </h3>
            <p className="text-text-secondary">
              Key insights from comparing multiple symbols
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="text-lg font-medium text-text-primary">Strongest Correlation</h4>
              {(() => {
                const validItems = comparisonItems.filter(item => item.correlationData?.analysis);
                if (validItems.length === 0) return <p className="text-text-secondary">No data available</p>;
                
                const strongest = validItems.reduce((max, item) => 
                  Math.abs(item.correlationData!.analysis!.overall_correlation) > Math.abs(max.correlationData!.analysis!.overall_correlation) ? item : max
                );
                
                return (
                  <div className="p-3 bg-accent-positive/10 rounded-xl">
                    <p className="text-sm font-medium text-text-primary">
                      {strongest.symbol} in {strongest.city}
                    </p>
                    <p className="text-lg font-bold text-accent-positive">
                      {(strongest.correlationData!.analysis!.overall_correlation * 100).toFixed(1)}%
                    </p>
                  </div>
                );
              })()}
            </div>

            <div className="space-y-3">
              <h4 className="text-lg font-medium text-text-primary">Weakest Correlation</h4>
              {(() => {
                const validItems = comparisonItems.filter(item => item.correlationData?.analysis);
                if (validItems.length === 0) return <p className="text-text-secondary">No data available</p>;
                
                const weakest = validItems.reduce((min, item) => 
                  Math.abs(item.correlationData!.analysis!.overall_correlation) < Math.abs(min.correlationData!.analysis!.overall_correlation) ? item : min
                );
                
                return (
                  <div className="p-3 bg-accent-negative/10 rounded-xl">
                    <p className="text-sm font-medium text-text-primary">
                      {weakest.symbol} in {weakest.city}
                    </p>
                    <p className="text-lg font-bold text-accent-negative">
                      {(weakest.correlationData!.analysis!.overall_correlation * 100).toFixed(1)}%
                    </p>
                  </div>
                );
              })()}
            </div>

            <div className="space-y-3">
              <h4 className="text-lg font-medium text-text-primary">Average Correlation</h4>
              {(() => {
                const validItems = comparisonItems.filter(item => item.correlationData?.analysis);
                if (validItems.length === 0) return <p className="text-text-secondary">No data available</p>;
                
                const avgCorrelation = validItems.reduce((sum, item) => 
                  sum + item.correlationData!.analysis!.overall_correlation, 0
                ) / validItems.length;
                
                return (
                  <div className="p-3 bg-accent-warning/10 rounded-xl">
                    <p className="text-sm font-medium text-text-primary">
                      Across {validItems.length} symbols
                    </p>
                    <p className="text-lg font-bold text-accent-warning">
                      {(avgCorrelation * 100).toFixed(1)}%
                    </p>
                  </div>
                );
              })()}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Comparison; 