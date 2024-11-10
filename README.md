# Crypto Trading Bot

A full-featured cryptocurrency trading bot with a React frontend and Python backend.

## Features

- Real-time market data visualization
- Technical analysis indicators
- Automated trading strategies
- Machine learning predictions
- Risk management system
- Paper trading mode
- Backtesting capabilities

## Setup

### Frontend
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Backend
```bash
# Install Python dependencies
cd src/scripts
pip install -r requirements.txt

# Configure your API keys in config.json
# Start the trading system
python main.py
```

## Configuration

1. Copy `src/scripts/config.json.example` to `src/scripts/config.json`
2. Add your KuCoin API credentials:
   ```json
   {
     "api_key": "your_api_key",
     "api_secret": "your_api_secret",
     "api_passphrase": "your_api_passphrase",
     "trading_pairs": ["BTC-USDT", "ETH-USDT", "SOL-USDT"],
     "ui_port": 5173
   }
   ```

## Usage

1. Start both the frontend and backend
2. Open http://localhost:5173 in your browser
3. Configure your trading preferences
4. Monitor your trades and performance

## License

MIT