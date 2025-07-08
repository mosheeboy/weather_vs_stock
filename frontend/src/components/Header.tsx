import React from 'react';
import { motion } from 'framer-motion';
import { Menu, Cloud, TrendingUp, ChevronDown } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import DateRangePicker from './DateRangePicker';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const {
    selectedSymbol,
    setSelectedSymbol,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    selectedCity,
    weatherData,
  } = useAppContext();

  let high = null, low = null;
  if (weatherData && weatherData.length > 0) {
    high = Math.max(...weatherData.map(w => w.temperature_high));
    low = Math.min(...weatherData.map(w => w.temperature_low));
  }

  const symbols = [
    { value: 'SPY', label: 'SPY' },
    { value: '^GSPC', label: '^GSPC' },
    { value: 'VOO', label: 'VOO' },
    { value: 'IVV', label: 'IVV' },
    { value: 'QQQ', label: 'QQQ' },
  ];

  return (
    <motion.header 
      className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-white/20"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <Menu className="h-6 w-6 text-text-primary" />
          </button>

          {/* Logo and title */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-primary-500 rounded-xl">
                <Cloud className="h-5 w-5 text-white" />
              </div>
              <div className="p-2 bg-accent-positive rounded-xl">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-text-primary">
                Weather vs Stock
              </h1>
            </div>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <a 
              href="/" 
              className="text-text-primary hover:text-primary-500 transition-colors font-medium"
            >
              Dashboard
            </a>
            <a 
              href="/analysis" 
              className="text-text-primary hover:text-primary-500 transition-colors font-medium"
            >
              Analysis
            </a>
            <a 
              href="/comparison" 
              className="text-text-primary hover:text-primary-500 transition-colors font-medium"
            >
              Comparison
            </a>
            <a 
              href="/insights" 
              className="text-text-primary hover:text-primary-500 transition-colors font-medium"
            >
              Insights
            </a>
          </nav>

          {/* Global Controls */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Symbol Selector */}
            <div className="relative">
              <select
                value={selectedSymbol}
                onChange={(e) => setSelectedSymbol(e.target.value)}
                className="appearance-none bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 pr-8 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {symbols.map((symbol) => (
                  <option key={symbol.value} value={symbol.value}>
                    {symbol.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary pointer-events-none" />
            </div>

            {/* Date Range Picker */}
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onDateRangeChange={(start, end) => {
                setStartDate(start);
                setEndDate(end);
              }}
            />
          </div>

          {/* Mobile controls (simplified) */}
          <div className="lg:hidden flex items-center space-x-2">
            <div className="text-xs text-text-secondary">
              {selectedSymbol} • NYC
            </div>
            {selectedCity && (
              <span className="text-sm text-text-secondary ml-2">{selectedCity}</span>
            )}
            {high !== null && low !== null && (
              <span className="ml-4 px-3 py-1 rounded bg-surface-200 text-xs font-medium text-text-primary">
                High: {high}°  Low: {low}°
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Date Range Picker */}
      <div className="lg:hidden border-t border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <select
                  value={selectedSymbol}
                  onChange={(e) => setSelectedSymbol(e.target.value)}
                  className="appearance-none bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-1.5 pr-6 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {symbols.map((symbol) => (
                    <option key={symbol.value} value={symbol.value}>
                      {symbol.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-1.5 top-1/2 transform -translate-y-1/2 h-3 w-3 text-text-secondary pointer-events-none" />
              </div>
            </div>

            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onDateRangeChange={(start, end) => {
                setStartDate(start);
                setEndDate(end);
              }}
            />
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header; 