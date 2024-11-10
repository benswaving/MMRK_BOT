import json
import time
import hmac
import base64
import hashlib
import websocket
import requests
from urllib.parse import urljoin
import numpy as np
from typing import List, Dict, Any

class TradingBot:
    def __init__(self, api_key: str, api_secret: str, api_passphrase: str):
        self.api_key = api_key
        self.api_secret = api_secret
        self.api_passphrase = api_passphrase
        self.base_url = "https://api.kucoin.com"
        self.ws = None
        self.historical_data = {}
        self.active_strategies = []
        self.paper_trading = {
            'balance': 10000,  # Initial USDT balance
            'positions': {}
        }
        self.running = True

    def get_server_time(self) -> int:
        """Get KuCoin server time"""
        response = requests.get(f"{self.base_url}/api/v1/timestamp")
        return int(response.json()['data'])

    def sign_request(self, endpoint: str, method: str, params: dict = None) -> dict:
        """Sign API request"""
        timestamp = str(int(time.time() * 1000))
        params_str = ''
        if params:
            sorted_params = sorted(params.items())
            params_str = '&'.join([f"{key}={value}" for key, value in sorted_params])

        str_to_sign = f"{timestamp}{method}{endpoint}{params_str}"
        signature = base64.b64encode(
            hmac.new(self.api_secret.encode('utf-8'), str_to_sign.encode('utf-8'), hashlib.sha256).digest()
        ).decode('utf-8')

        passphrase = base64.b64encode(
            hmac.new(self.api_secret.encode('utf-8'), self.api_passphrase.encode('utf-8'), hashlib.sha256).digest()
        ).decode('utf-8')

        headers = {
            "KC-API-KEY": self.api_key,
            "KC-API-SIGN": signature,
            "KC-API-TIMESTAMP": timestamp,
            "KC-API-PASSPHRASE": passphrase,
            "KC-API-KEY-VERSION": "2",
            "Content-Type": "application/json"
        }

        return headers

    def get_historical_data(self, symbol: str, interval: str = '1min', start_time: int = None, end_time: int = None) -> List[Dict]:
        """Fetch historical candlestick data"""
        endpoint = f"/api/v1/market/candles"
        params = {
            "symbol": symbol,
            "type": interval
        }
        if start_time:
            params["startAt"] = start_time
        if end_time:
            params["endAt"] = end_time

        headers = self.sign_request(endpoint, "GET", params)
        response = requests.get(f"{self.base_url}{endpoint}", headers=headers, params=params)
        
        if response.status_code == 200:
            data = response.json()['data']
            return [
                {
                    'timestamp': int(candle[0]),
                    'open': float(candle[1]),
                    'high': float(candle[2]),
                    'low': float(candle[3]),
                    'close': float(candle[4]),
                    'volume': float(candle[5])
                }
                for candle in data
            ]
        else:
            raise Exception(f"Failed to fetch historical data: {response.text}")

    def calculate_indicators(self, data: List[Dict]) -> Dict[str, Any]:
        """Calculate technical indicators"""
        closes = np.array([candle['close'] for candle in data])
        
        # Calculate SMAs
        sma20 = np.mean(closes[-20:]) if len(closes) >= 20 else None
        sma50 = np.mean(closes[-50:]) if len(closes) >= 50 else None
        
        # Calculate RSI
        def calculate_rsi(prices: np.array, period: int = 14) -> float:
            deltas = np.diff(prices)
            gain = np.where(deltas > 0, deltas, 0)
            loss = np.where(deltas < 0, -deltas, 0)
            
            avg_gain = np.mean(gain[-period:])
            avg_loss = np.mean(loss[-period:])
            
            if avg_loss == 0:
                return 100
            
            rs = avg_gain / avg_loss
            return 100 - (100 / (1 + rs))
        
        rsi = calculate_rsi(closes) if len(closes) >= 15 else None
        
        # Calculate Bollinger Bands
        if len(closes) >= 20:
            sma = np.mean(closes[-20:])
            std = np.std(closes[-20:])
            upper_band = sma + (2 * std)
            lower_band = sma - (2 * std)
        else:
            upper_band = lower_band = None

        return {
            'sma20': sma20,
            'sma50': sma50,
            'rsi': rsi,
            'bb_upper': upper_band,
            'bb_lower': lower_band,
            'current_price': closes[-1] if len(closes) > 0 else None
        }

    def check_signals(self, indicators: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Check for trading signals based on indicators"""
        signals = []
        
        if all(v is not None for v in indicators.values()):
            # Trend following strategy
            if indicators['sma20'] > indicators['sma50']:
                signals.append({
                    'type': 'buy',
                    'strategy': 'trend_following',
                    'confidence': 0.8
                })
            elif indicators['sma20'] < indicators['sma50']:
                signals.append({
                    'type': 'sell',
                    'strategy': 'trend_following',
                    'confidence': 0.8
                })
            
            # Mean reversion strategy
            if indicators['current_price'] < indicators['bb_lower'] and indicators['rsi'] < 30:
                signals.append({
                    'type': 'buy',
                    'strategy': 'mean_reversion',
                    'confidence': 0.9
                })
            elif indicators['current_price'] > indicators['bb_upper'] and indicators['rsi'] > 70:
                signals.append({
                    'type': 'sell',
                    'strategy': 'mean_reversion',
                    'confidence': 0.9
                })
        
        return signals

    def execute_paper_trade(self, symbol: str, trade_type: str, amount: float, price: float) -> Dict:
        """Execute paper trade"""
        if trade_type == 'buy':
            cost = amount * price
            if cost > self.paper_trading['balance']:
                return {'success': False, 'message': 'Insufficient balance'}
            
            self.paper_trading['balance'] -= cost
            if symbol not in self.paper_trading['positions']:
                self.paper_trading['positions'][symbol] = 0
            self.paper_trading['positions'][symbol] += amount
            
        elif trade_type == 'sell':
            if symbol not in self.paper_trading['positions'] or self.paper_trading['positions'][symbol] < amount:
                return {'success': False, 'message': 'Insufficient position'}
            
            self.paper_trading['balance'] += amount * price
            self.paper_trading['positions'][symbol] -= amount
            
            if self.paper_trading['positions'][symbol] == 0:
                del self.paper_trading['positions'][symbol]
        
        return {
            'success': True,
            'type': trade_type,
            'symbol': symbol,
            'amount': amount,
            'price': price,
            'timestamp': int(time.time())
        }

    def stop(self):
        """Stop the trading bot"""
        self.running = False
        if self.ws:
            self.ws.close()

    def run(self, symbols: List[str] = ['BTC-USDT']):
        """Main bot loop"""
        print(f"Starting trading bot...")
        print(f"Initial balance: {self.paper_trading['balance']} USDT")
        
        while self.running:
            try:
                for symbol in symbols:
                    # Fetch latest data
                    data = self.get_historical_data(symbol, interval='1min', start_time=int(time.time())-3600)
                    
                    # Calculate indicators
                    indicators = self.calculate_indicators(data)
                    
                    # Check for signals
                    signals = self.check_signals(indicators)
                    
                    # Execute trades based on signals
                    for signal in signals:
                        current_price = indicators['current_price']
                        trade_amount = 0.001  # Fixed trade amount for demonstration
                        
                        if signal['type'] == 'buy':
                            result = self.execute_paper_trade(symbol, 'buy', trade_amount, current_price)
                        else:
                            result = self.execute_paper_trade(symbol, 'sell', trade_amount, current_price)
                        
                        if result['success']:
                            print(f"""
                                Trade executed:
                                Type: {signal['type']}
                                Symbol: {symbol}
                                Amount: {trade_amount}
                                Price: {current_price}
                                Strategy: {signal['strategy']}
                                Confidence: {signal['confidence']}
                                Balance: {self.paper_trading['balance']} USDT
                                Positions: {self.paper_trading['positions']}
                            """)
                
                # Sleep to avoid hitting rate limits
                time.sleep(60)  # Check every minute
                
            except Exception as e:
                print(f"Error in main loop: {e}")
                time.sleep(5)