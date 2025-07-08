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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  // Update isDateSelectable to disallow today
  const isDateSelectable = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today; // strictly before today
  };

  const handleDateClick = (date: Date) => {
    if (!isDateSelectable(date)) return;
    setErrorMsg(null);

    if (selectionMode === 'start') {
      setTempStartDate(date);
      setTempEndDate(null);
      setSelectionMode('end');
    } else {
      // End date selection
      if (tempStartDate) {
        if (date.toDateString() === tempStartDate.toDateString()) {
          // If already selected as single day, deselect
          if (tempEndDate && tempEndDate.toDateString() === date.toDateString()) {
            setTempStartDate(null);
            setTempEndDate(null);
            onDateRangeChange('', ''); // clear parent selection
            setIsOpen(false);
            resetTempDates();
            return;
          }
          // Single day selection
          setTempEndDate(date);
          onDateRangeChange(date.toISOString().split('T')[0], date.toISOString().split('T')[0]);
          setIsOpen(false);
          resetTempDates();
        } else {
          const daysDiff = Math.ceil((date.getTime() - tempStartDate.getTime()) / (1000 * 60 * 60 * 24));
          if (daysDiff < 0) {
            setTempEndDate(tempStartDate);
            setTempStartDate(date);
          } else if (daysDiff > maxDays - 1) {
            setErrorMsg(`Please select a range of ${maxDays} days or less.`);
            return;
          } else {
            setTempEndDate(date);
          }
          // Apply the selection
          const finalStartDate = tempStartDate.toISOString().split('T')[0];
          const finalEndDate = (date).toISOString().split('T')[0];
          onDateRangeChange(finalStartDate, finalEndDate);
          setIsOpen(false);
          resetTempDates();
        }
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

  // Dropdown calendar content (no overlay, not centered)
  const dropdownContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={modalRef}
          className="absolute left-0 mt-2 bg-white rounded-xl shadow-2xl border border-surface-200 p-6 w-80 max-w-[90vw] z-[99999]"
          style={{ pointerEvents: 'auto' }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
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

              {/* Error Message */}
              {errorMsg && (
                <div className="mb-2 p-2 bg-red-100 text-red-700 rounded text-xs text-center">
                  {errorMsg}
                </div>
              )}

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
                      (() => {
                        const isRangeStart = tempStartDate && date.toDateString() === tempStartDate.toDateString();
                        const isRangeEnd = tempEndDate && date.toDateString() === tempEndDate.toDateString();
                        const isInRange = tempStartDate && tempEndDate && date > tempStartDate && date < tempEndDate;
                        const isSingleDay = tempStartDate && tempEndDate && tempStartDate.toDateString() === tempEndDate.toDateString();
                        // Only show highlight if there is a selection
                        const hasSelection = tempStartDate && tempEndDate;
                        let rounding = '';
                        if (hasSelection && isSingleDay && isRangeStart) {
                          rounding = 'rounded-full';
                        } else if (hasSelection && !isSingleDay && isRangeStart) {
                          rounding = 'rounded-l-full';
                        } else if (hasSelection && !isSingleDay && isRangeEnd) {
                          rounding = 'rounded-r-full';
                        } else {
                          rounding = 'rounded-none';
                        }
                        return (
                          <button
                            onClick={() => handleDateClick(date)}
                            disabled={!isDateSelectable(date)}
                            className={`
                              w-8 h-8 text-sm transition-all
                              ${hasSelection && (isRangeStart || isRangeEnd)
                                ? 'bg-blue-600 text-white font-bold'
                                : hasSelection && isInRange
                                ? 'bg-blue-100 text-blue-700'
                                : isDateSelectable(date)
                                ? 'text-gray-900 hover:bg-blue-100 hover:text-blue-700'
                                : 'text-gray-300 cursor-not-allowed bg-transparent'
                              }
                              ${rounding}
                              ${date.toDateString() === tempStartDate?.toDateString() && selectionMode === 'end'
                                ? 'ring-2 ring-blue-400 ring-offset-2'
                                : ''
                              }
                            `}
                          >
                            {date.getDate()}
                          </button>
                        );
                      })()
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
                <button
                  onClick={() => {
                    onDateRangeChange('', '');
                    setIsOpen(false);
                    resetTempDates();
                  }}
                  className="flex-1 px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-hover rounded-lg transition-colors"
                >
                  Clear Dates
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
      )}
    </AnimatePresence>
  );

  return (
    <div className="relative inline-block w-full">
      {/* Trigger Button */}
      <button
        onClick={() => {
          setIsOpen(true);
          const today = new Date();
          setCurrentMonth({ year: today.getFullYear(), month: today.getMonth() });
        }}
        className="input-field appearance-none pr-10 text-left cursor-pointer hover:bg-surface-hover transition-colors w-full"
      >
        <span className="truncate">{formatDateRange()}</span>
        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-secondary" />
      </button>
      {/* Dropdown for Calendar */}
      {dropdownContent}
    </div>
  );
};

export default DateRangePicker; 