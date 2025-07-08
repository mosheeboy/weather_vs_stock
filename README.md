# Weather vs. Stock Market Correlator

A modern full-stack web application that analyzes correlations between weather patterns and stock market performance, combining Apple's clean design philosophy with Google Material Design principles.

## Features

- **Real-time Data Analysis**: Fetch historical weather and stock market data
- **Correlation Analysis**: Calculate correlation coefficients between weather metrics and market performance
- **Interactive Visualizations**: Beautiful charts and heatmaps with smooth animations
- **Multi-city Support**: Analyze data for NYC, LA, Chicago, Miami, and more
- **Flexible Timeframes**: 1 week, 1 month, 3 months, 1 year analysis periods
- **Responsive Design**: Mobile-first approach with Apple-inspired UI

## Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **Pandas & NumPy**: Data manipulation and statistical analysis
- **SQLite**: Data caching and storage
- **APScheduler**: Automated data updates

### Frontend
- **React 18 + TypeScript**: Modern frontend framework
- **Tailwind CSS**: Utility-first styling
- **Recharts**: Beautiful data visualizations
- **Framer Motion**: Smooth animations
- **React Query**: API state management

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- API keys for OpenWeatherMap and Alpha Vantage

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

5. **Run the backend**:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

## API Keys Required

### OpenWeatherMap API
- Sign up at [OpenWeatherMap](https://openweathermap.org/api)
- Get your API key from the dashboard
- Add to `.env` as `OPENWEATHER_API_KEY`

### Alpha Vantage API
- Sign up at [Alpha Vantage](https://www.alphavantage.co/)
- Get your API key from the dashboard
- Add to `.env` as `ALPHA_VANTAGE_API_KEY`

## Environment Variables

Create a `.env` file in the backend directory:

```env
OPENWEATHER_API_KEY=your_openweather_api_key
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key
DATABASE_URL=sqlite:///./weather_stock_data.db
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

## API Endpoints

### Weather Data
- `GET /api/weather/{city}/{start_date}/{end_date}` - Get historical weather data

### Stock Data
- `GET /api/stocks/{symbol}/{start_date}/{end_date}` - Get historical stock data

### Correlation Analysis
- `GET /api/correlation/{symbol}/{city}/{timeframe}` - Get correlation analysis
- `GET /api/analysis/summary` - Get analysis summary
- `POST /api/analysis/custom` - Custom date range analysis

## Project Structure

```
weather-stock-app/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application
│   │   ├── models/              # Data models
│   │   ├── routes/              # API routes
│   │   ├── services/            # Business logic
│   │   └── utils/               # Utility functions
│   ├── requirements.txt         # Python dependencies
│   └── .env.example            # Environment template
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── pages/               # Page components
│   │   ├── hooks/               # Custom hooks
│   │   ├── utils/               # Utility functions
│   │   ├── types/               # TypeScript types
│   │   └── styles/              # Global styles
│   ├── package.json             # Node dependencies
│   └── tailwind.config.js       # Tailwind configuration
└── README.md                    # This file
```

## Features

### Weather Metrics
- Temperature (high, low, average)
- Precipitation levels
- Humidity
- Wind speed
- Atmospheric pressure
- Weather conditions

### Market Metrics
- Daily closing prices
- Daily percentage changes
- Volume data
- Market volatility (VIX)

### Analysis Features
- Correlation coefficient calculations
- Trend analysis
- Statistical significance testing
- Interactive visualizations
- Export functionality

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details 