import React from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { WeatherData, StockData } from '../types';

interface TimeSeriesChartProps {
  weatherData: WeatherData[];
  stockData: StockData[];
  loading: boolean;
}

const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  weatherData,
  stockData,
  loading,
}) => {
  if (loading) {
    return (
      <motion.div
        className="card h-96"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="h-full bg-surface-200 rounded animate-pulse"></div>
      </motion.div>
    );
  }

  if (!weatherData.length || !stockData.length) {
    return (
      <motion.div
        className="card h-96"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <p className="text-text-secondary">No time series data available</p>
          </div>
        </div>
      </motion.div>
    );
  }

  // Combine weather and stock data by date
  const combinedData = weatherData.map(weather => {
    const stock = stockData.find(s => s.date === weather.date);
    return {
      date: weather.date,
      temperature: weather.temperature_avg,
      precipitation: weather.precipitation,
      humidity: weather.humidity,
      stockPrice: stock?.close_price || 0,
      stockChange: stock?.percentage_change || 0,
    };
  }).filter(item => item.stockPrice > 0);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-xl shadow-apple-lg border border-surface-200">
          <p className="font-semibold text-text-primary mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm text-text-secondary">
              <span style={{ color: entry.color }}>●</span> {entry.name}: {entry.value}
              {entry.dataKey === 'temperature' && '°C'}
              {entry.dataKey === 'precipitation' && 'mm'}
              {entry.dataKey === 'humidity' && '%'}
              {entry.dataKey === 'stockPrice' && '$'}
              {entry.dataKey === 'stockChange' && '%'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-12">
      {/* Section Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-text-primary mb-2">
          Time Series Analysis
        </h2>
        <p className="text-text-secondary">
          Visualize the relationship between weather patterns and stock performance over time
        </p>
      </motion.div>

      {/* Weather vs Stock Price Chart */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            Weather vs Stock Price Over Time
          </h3>
          <p className="text-text-secondary">
            Temperature and stock price trends showing potential correlations
          </p>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={combinedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis 
                yAxisId="left"
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value}°C`}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="temperature"
                stroke="#FF9500"
                strokeWidth={2}
                dot={{ fill: '#FF9500', strokeWidth: 2, r: 4 }}
                name="Temperature (°C)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="stockPrice"
                stroke="#007AFF"
                strokeWidth={2}
                dot={{ fill: '#007AFF', strokeWidth: 2, r: 4 }}
                name="Stock Price ($)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Precipitation vs Stock Change Chart */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            Precipitation vs Stock Performance
          </h3>
          <p className="text-text-secondary">
            How precipitation levels relate to stock price changes
          </p>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={combinedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis 
                yAxisId="left"
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value}mm`}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="precipitation"
                stroke="#30D158"
                fill="#30D158"
                fillOpacity={0.3}
                name="Precipitation (mm)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="stockChange"
                stroke="#FF3B30"
                strokeWidth={2}
                dot={{ fill: '#FF3B30', strokeWidth: 2, r: 4 }}
                name="Stock Change (%)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Humidity vs Stock Performance */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            Humidity vs Stock Performance
          </h3>
          <p className="text-text-secondary">
            Relationship between humidity levels and stock market performance
          </p>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={combinedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis 
                yAxisId="left"
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value}%`}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="humidity"
                stroke="#AF52DE"
                strokeWidth={2}
                dot={{ fill: '#AF52DE', strokeWidth: 2, r: 4 }}
                name="Humidity (%)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="stockChange"
                stroke="#FF3B30"
                strokeWidth={2}
                dot={{ fill: '#FF3B30', strokeWidth: 2, r: 4 }}
                name="Stock Change (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
};

export default TimeSeriesChart; 