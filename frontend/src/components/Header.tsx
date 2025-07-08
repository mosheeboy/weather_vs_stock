import React from 'react';
import { motion } from 'framer-motion';
import { Menu, Cloud, TrendingUp } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
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
              <p className="text-xs text-text-secondary">
                Market Correlator
              </p>
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

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            <button className="btn-primary text-sm">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header; 