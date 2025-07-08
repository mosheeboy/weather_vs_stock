import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Calendar, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onDateRangeChange: (startDate: string, endDate: string) => void;
  isSingleDay?: boolean;
  maxDays?: number;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onDateRangeChange,
  isSingleDay = false,
  maxDays = 7
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState<'start' | 'end'>('start');
  const [tempStartDate, setTempStartDate] = useState<Date | null>(null);
  const [tempEndDate, setTempEndDate] = useState<Date | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        resetTempDates();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const resetTempDates = () => {
    setTempStartDate(null);
    setTempEndDate(null);
    setSelectionMode('start');
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateRange = () => {
    if (!startDate || !endDate) return 'Select date range';
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isSingleDay) {
      return formatDate(start);
    }
    
    if (start.toDateString() === end.toDateString()) {
      return formatDate(start);
    }
    
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = (year: number, month: number) => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const isDateInRange = (date: Date) => {
    if (!tempStartDate) return false;
    
    if (isSingleDay) {
      return date.toDateString() === tempStartDate.toDateString();
    }
    
    if (!tempEndDate) {
      return date.toDateString() === tempStartDate.toDateString();
    }
    
    return date >= tempStartDate && date <= tempEndDate;
  };

  const isDateSelectable = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date <= today;
  };

  const handleDateClick = (date: Date) => {
    if (!isDateSelectable(date)) return;

    if (selectionMode === 'start') {
      setTempStartDate(date);
      if (isSingleDay) {
        // For single day, immediately set both dates
        setTempEndDate(date);
        onDateRangeChange(
          date.toISOString().split('T')[0],
          date.toISOString().split('T')[0]
        );
        setIsOpen(false);
        resetTempDates();
      } else {
        // For range, switch to end date selection
        setSelectionMode('end');
      }
    } else {
      // End date selection
      if (tempStartDate) {
        const daysDiff = Math.ceil((date.getTime() - tempStartDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff < 0) {
          // If end date is before start date, swap them
          setTempEndDate(tempStartDate);
          setTempStartDate(date);
        } else if (daysDiff > maxDays - 1) {
          // If more than maxDays, adjust end date to be exactly maxDays from start
          const adjustedEndDate = new Date(tempStartDate);
          adjustedEndDate.setDate(tempStartDate.getDate() + maxDays - 1);
          setTempEndDate(adjustedEndDate);
        } else {
          setTempEndDate(date);
        }
        
        // Apply the selection
        const finalStartDate = tempStartDate.toISOString().split('T')[0];
        const finalEndDate = (tempEndDate || date).toISOString().split('T')[0];
        
        onDateRangeChange(finalStartDate, finalEndDate);
        setIsOpen(false);
        resetTempDates();
      }
    }
  };

  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return { year: today.getFullYear(), month: today.getMonth() };
  });

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      if (direction === 'prev') {
        if (prev.month === 0) {
          return { year: prev.year - 1, month: 11 };
        }
        return { year: prev.year, month: prev.month - 1 };
      } else {
        if (prev.month === 11) {
          return { year: prev.year + 1, month: 0 };
        }
        return { year: prev.year, month: prev.month + 1 };
      }
    });
  };

  const calendarDays = generateCalendarDays(currentMonth.year, currentMonth.month);
  const monthName = new Date(currentMonth.year, currentMonth.month).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  // Portal modal rendering
  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99999] pointer-events-auto"
          style={{ pointerEvents: 'auto' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            ref={modalRef}
            className="bg-surface-primary rounded-xl shadow-2xl p-6 w-80 max-w-[90vw] z-[99999] pointer-events-auto"
            style={{ pointerEvents: 'auto' }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text-primary">
                  {isSingleDay ? 'Select Date' : 'Select Date Range'}
                </h3>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    resetTempDates();
                  }}
                  className="p-1 hover:bg-surface-hover rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-text-secondary" />
                </button>
              </div>

              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h4 className="text-sm font-medium text-text-primary">{monthName}</h4>
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Selection Mode Indicator */}
              {!isSingleDay && (
                <div className="mb-3 p-2 bg-accent-primary/10 rounded-lg">
                  <p className="text-xs text-accent-primary font-medium">
                    {selectionMode === 'start' ? 'Click to select start date' : `Click to select end date (max ${maxDays} days)`}
                  </p>
                </div>
              )}

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {/* Day headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-xs font-medium text-text-secondary py-2">
                    {day}
                  </div>
                ))}

                {/* Calendar days */}
                {calendarDays.map((date, index) => (
                  <div key={index} className="text-center">
                    {date ? (
                      <button
                        onClick={() => handleDateClick(date)}
                        disabled={!isDateSelectable(date)}
                        className={`
                          w-8 h-8 rounded-lg text-sm font-medium transition-all
                          ${isDateInRange(date)
                            ? 'bg-accent-primary text-white'
                            : isDateSelectable(date)
                            ? 'hover:bg-surface-hover text-text-primary'
                            : 'text-text-tertiary cursor-not-allowed'
                          }
                          ${date.toDateString() === tempStartDate?.toDateString() && selectionMode === 'end'
                            ? 'ring-2 ring-accent-primary ring-offset-2'
                            : ''
                          }
                        `}
                      >
                        {date.getDate()}
                      </button>
                    ) : (
                      <div className="w-8 h-8" />
                    )}
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    resetTempDates();
                  }}
                  className="flex-1 px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-hover rounded-lg transition-colors"
                >
                  Cancel
                </button>
                                 {tempStartDate && !isSingleDay && (
                   <button
                     onClick={() => {
                       if (tempStartDate) {
                         const endDate = new Date(tempStartDate);
                         endDate.setDate(tempStartDate.getDate() + maxDays - 1);
                         onDateRangeChange(
                           tempStartDate.toISOString().split('T')[0],
                           endDate.toISOString().split('T')[0]
                         );
                       }
                       setIsOpen(false);
                       resetTempDates();
                     }}
                     className="flex-1 px-4 py-2 text-sm font-medium bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors"
                   >
                     Apply {maxDays} Days
                   </button>
                 )}
              </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="input-field appearance-none pr-10 text-left cursor-pointer hover:bg-surface-hover transition-colors"
      >
        <span className="truncate">{formatDateRange()}</span>
        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-secondary" />
      </button>
      {/* Portal for Modal */}
      {typeof window !== 'undefined' && ReactDOM.createPortal(modalContent, document.body)}
    </div>
  );
};

export default DateRangePicker; 