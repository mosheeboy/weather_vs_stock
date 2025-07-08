#!/bin/bash

echo "🌤️  Weather vs Stock Market Correlator - Setup Script"
echo "=================================================="

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

echo "✅ Python and Node.js are installed"

# Backend setup
echo ""
echo "🔧 Setting up Backend..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp env.example .env
    echo "⚠️  Please edit backend/.env with your API keys:"
    echo "   - OpenWeatherMap API key"
    echo "   - Alpha Vantage API key"
fi

echo "✅ Backend setup complete"

# Frontend setup
echo ""
echo "🎨 Setting up Frontend..."
cd ../frontend

# Install dependencies
echo "Installing Node.js dependencies..."
npm install

echo "✅ Frontend setup complete"

# Return to root
cd ..

echo ""
echo "🚀 Setup Complete!"
echo ""
echo "To start the application:"
echo ""
echo "1. Start the backend:"
echo "   cd backend"
echo "   source venv/bin/activate"
echo "   uvicorn app.main:app --reload"
echo ""
echo "2. In a new terminal, start the frontend:"
echo "   cd frontend"
echo "   npm start"
echo ""
echo "3. Open your browser to:"
echo "   http://localhost:3000"
echo ""
echo "📝 Don't forget to:"
echo "   - Add your API keys to backend/.env"
echo "   - Get API keys from:"
echo "     * OpenWeatherMap: https://openweathermap.org/api"
echo "     * Alpha Vantage: https://www.alphavantage.co/"
echo ""
echo "🎉 Happy analyzing!" 