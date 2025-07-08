import React, { createContext, useContext, useState, ReactNode } from 'react';
import { WeatherData } from '../types';

interface AppContextType {
  selectedSymbol: string;
  setSelectedSymbol: (symbol: string) => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  weatherData: WeatherData[];
  setWeatherData: (data: WeatherData[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [selectedSymbol, setSelectedSymbol] = useState('SPY');
  const [selectedCity, setSelectedCity] = useState('NYC');
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    return sevenDaysAgo.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);

  const value = {
    selectedSymbol,
    setSelectedSymbol,
    selectedCity,
    setSelectedCity,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    weatherData,
    setWeatherData,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}; 