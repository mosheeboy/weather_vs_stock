import React from 'react';
import { motion } from 'framer-motion';
import { GitCompare } from 'lucide-react';

const Comparison: React.FC = () => {
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
          Compare correlations across different stocks and cities
        </p>
      </motion.div>

      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="h-96 bg-surface-50 rounded-xl flex items-center justify-center">
          <div className="text-center">
            <GitCompare className="h-12 w-12 text-text-tertiary mx-auto mb-4" />
            <p className="text-text-secondary">Comparison page content</p>
            <p className="text-sm text-text-tertiary">
              Multi-symbol correlation comparison
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Comparison; 