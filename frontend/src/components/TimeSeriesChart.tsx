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
import { celsiusToFahrenheit } from '../utils/temperature';

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
      temperature: celsiusToFahrenheit(weather.temperature_avg),
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
              {entry.dataKey === 'temperature' && '°F'}
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
    <div className="space-y-8">

      {/* Comprehensive Weather vs Stock Chart */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            Weather vs Stock Performance Over Time
          </h3>
          <p className="text-text-secondary">
            Temperature, precipitation, and stock price trends showing potential correlations
          </p>
        </div>
        
        <div className="h-96">
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
                tickFormatter={(value) => `${value}°F`}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <YAxis 
                yAxisId="third"
                orientation="right"
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value}mm`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="temperature"
                stroke="#FF9500"
                strokeWidth={2}
                dot={{ fill: '#FF9500', strokeWidth: 2, r: 3 }}
                name="Temperature (°F)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="stockPrice"
                stroke="#007AFF"
                strokeWidth={2}
                dot={{ fill: '#007AFF', strokeWidth: 2, r: 3 }}
                name="Stock Price ($)"
              />
              <Line
                yAxisId="third"
                type="monotone"
                dataKey="precipitation"
                stroke="#30D158"
                strokeWidth={2}
                dot={{ fill: '#30D158', strokeWidth: 2, r: 3 }}
                name="Precipitation (mm)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
};

export default TimeSeriesChart; 