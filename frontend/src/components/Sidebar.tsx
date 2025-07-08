import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Home, BarChart3, GitCompare, Lightbulb } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const menuItems = [
    { icon: Home, label: 'Dashboard', href: '/' },
    { icon: BarChart3, label: 'Analysis', href: '/analysis' },
    { icon: GitCompare, label: 'Comparison', href: '/comparison' },
    { icon: Lightbulb, label: 'Insights', href: '/insights' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            className="fixed left-0 top-0 h-full w-80 bg-white shadow-apple-xl z-50 lg:hidden"
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-surface-200">
                <h2 className="text-lg font-semibold text-text-primary">
                  Menu
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-surface-100 transition-colors"
                >
                  <X className="h-5 w-5 text-text-primary" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-6">
                <ul className="space-y-2">
                  {menuItems.map((item) => (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        className="flex items-center space-x-3 p-3 rounded-xl hover:bg-surface-100 transition-colors text-text-primary"
                        onClick={onClose}
                      >
                        <item.icon className="h-5 w-5" />
                        <span className="font-medium">{item.label}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Footer */}
              <div className="p-6 border-t border-surface-200">
                <div className="text-center">
                  <p className="text-sm text-text-secondary">
                    Weather vs Stock Market Correlator
                  </p>
                  <p className="text-xs text-text-tertiary mt-1">
                    Version 1.0.0
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Sidebar; 