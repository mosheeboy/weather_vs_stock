import React from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  Cell,
} from 'recharts';
import { CorrelationAnalysis, CorrelationMatrix } from '../types';

interface CorrelationChartsProps {
  analysis: CorrelationAnalysis | null;
  matrix: CorrelationMatrix | null;
  loading: boolean;
}

const CorrelationCharts: React.FC<CorrelationChartsProps> = ({
  analysis,
  matrix,
  loading,
}) => {
  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="card h-64"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <div className="h-full bg-surface-200 rounded animate-pulse"></div>
          </motion.div>
        ))}
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">No correlation data available</p>
      </div>
    );
  }

  // Prepare data for correlation bar chart
  const correlationData = [
    {
      metric: 'Temperature',
      correlation: analysis.temperature_correlation,
      strength: analysis.temperature_strength,
      pValue: analysis.temperature_p_value,
    },
    {
      metric: 'Precipitation',
      correlation: analysis.precipitation_correlation,
      strength: analysis.precipitation_strength,
      pValue: analysis.precipitation_p_value,
    },
    {
      metric: 'Humidity',
      correlation: analysis.humidity_correlation,
      strength: analysis.humidity_strength,
      pValue: analysis.humidity_p_value,
    },
    {
      metric: 'Wind Speed',
      correlation: analysis.wind_speed_correlation,
      strength: analysis.wind_speed_strength,
      pValue: analysis.wind_speed_p_value,
    },
    {
      metric: 'Pressure',
      correlation: analysis.pressure_correlation,
      strength: analysis.pressure_strength,
      pValue: analysis.pressure_p_value,
    },
  ];

  // Color function for correlation strength
  const getCorrelationColor = (correlation: number) => {
    const absCorr = Math.abs(correlation);
    if (absCorr > 0.5) return '#30D158'; // Strong - Green
    if (absCorr > 0.3) return '#FF9500'; // Moderate - Orange
    return '#FF3B30'; // Weak - Red
  };

  // Custom tooltip for correlation chart
  const CorrelationTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-xl shadow-apple-lg border border-surface-200">
          <p className="font-semibold text-text-primary">{label}</p>
          <p className="text-sm text-text-secondary">
            Correlation: <span className="font-medium">{data.correlation.toFixed(3)}</span>
          </p>
          <p className="text-sm text-text-secondary">
            Strength: <span className="font-medium capitalize">{data.strength}</span>
          </p>
          <p className="text-sm text-text-secondary">
            P-value: <span className="font-medium">{data.pValue.toFixed(4)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">

      {/* Correlation Bar Chart */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            Weather vs Stock Correlation Analysis
          </h3>
          <p className="text-text-secondary">
            Correlation coefficients between weather metrics and {analysis.symbol} stock performance
          </p>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={correlationData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis 
                dataKey="metric" 
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                domain={[-1, 1]}
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => value.toFixed(2)}
              />
              <Tooltip content={<CorrelationTooltip />} />
              <Bar 
                dataKey="correlation" 
                radius={[4, 4, 0, 0]}
                fill="#007AFF"
              >
                {correlationData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getCorrelationColor(entry.correlation)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-accent-positive"></div>
            <span className="text-text-secondary">Strong (&gt;0.5)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-accent-warning"></div>
            <span className="text-text-secondary">Moderate (0.3-0.5)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-accent-negative"></div>
            <span className="text-text-secondary">Weak (&lt;0.3)</span>
          </div>
        </div>
      </motion.div>

      {/* Correlation Matrix Heatmap */}
      {matrix && matrix.variables.length > 0 && (
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              Correlation Matrix
            </h3>
            <p className="text-text-secondary">
              Correlation matrix showing relationships between all variables
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <div className="min-w-max">
              {/* Header row */}
              <div className="flex">
                <div className="w-24 h-8 flex items-center justify-center text-xs font-medium text-text-secondary border-b border-r border-surface-200">
                  Variables
                </div>
                {matrix.variables.map((variable, index) => (
                  <div
                    key={index}
                    className="w-20 h-8 flex items-center justify-center text-xs font-medium text-text-secondary border-b border-r border-surface-200"
                  >
                    {variable.length > 8 ? variable.substring(0, 8) + '...' : variable}
                  </div>
                ))}
              </div>
              
              {/* Matrix rows */}
              {matrix.matrix.map((row, rowIndex) => (
                <div key={rowIndex} className="flex">
                  <div className="w-24 h-8 flex items-center justify-center text-xs font-medium text-text-secondary border-r border-surface-200">
                    {matrix.variables[rowIndex].length > 8 
                      ? matrix.variables[rowIndex].substring(0, 8) + '...' 
                      : matrix.variables[rowIndex]
                    }
                  </div>
                  {row.map((value, colIndex) => (
                    <div
                      key={colIndex}
                      className="w-20 h-8 flex items-center justify-center text-xs border-r border-surface-200"
                      style={{
                        backgroundColor: rowIndex === colIndex 
                          ? '#f5f5f7' 
                          : `rgba(0, 122, 255, ${Math.abs(value) * 0.8})`,
                        color: Math.abs(value) > 0.5 ? 'white' : '#1D1D1F'
                      }}
                    >
                      {rowIndex === colIndex ? '1.00' : value.toFixed(2)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}


    </div>
  );
};

export default CorrelationCharts; 