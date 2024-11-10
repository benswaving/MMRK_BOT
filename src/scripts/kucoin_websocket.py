import json
import time
import hmac
import base64
import hashlib
import websocket
import requests
from urllib.parse import urljoin

class KuCoinWebSocket:
    def __init__(self, api_key, api_secret, api_passphrase, is_sandbox=False):
        self.api_key = api_key
        self.api_secret = api_secret
        self.api_passphrase = api_passphrase
        self.is_sandbox = is_sandbox
        self.ws = None
        self.base_url = "https://api.kucoin.com" if not is_sandbox else "https://openapi-sandbox.kucoin.com"

    def get_ws_token(self):
        """Get WebSocket token for authentication"""
        endpoint = "/api/v1/bullet-public"
        now = int(time.time() * 1000)
        str_to_sign = str(now) + 'POST' + endpoint
        signature = base64.b64encode(
            hmac.new(self.api_secret.encode('utf-8'), str_to_sign.encode('utf-8'), hashlib.sha256).digest()
        ).decode('utf-8')

        headers = {
            "KC-API-KEY": self.api_key,
            "KC-API-SIGN": signature,
            "KC-API-TIMESTAMP": str(now),
            "KC-API-PASSPHRASE": self.api_passphrase,
            "Content-Type": "application/json"
        }

        response = requests.post(urljoin(self.base_url, endpoint), headers=headers)
        if response.status_code == 200:
            data = response.json()
            return data['data']
        else:
            raise Exception(f"Failed to get WebSocket token: {response.text}")

    def on_message(self, ws, message):
        """Handle incoming WebSocket messages"""
        data = json.loads(message)
        
        if data['type'] == 'message':
            # Process market data
            market_data = data['data']
            print(f"Received market data: {market_data}")
            
            # Example: Extract OHLCV data
            if 'candles' in market_data:
                timestamp, open_price, close_price, high, low, volume = market_data['candles']
                print(f"""
                    Timestamp: {timestamp}
                    Open: {open_price}
                    High: {high}
                    Low: {low}
                    Close: {close_price}
                    Volume: {volume}
                """)

    def on_error(self, ws, error):
        """Handle WebSocket errors"""
        print(f"WebSocket error: {error}")

    def on_close(self, ws, close_status_code, close_msg):
        """Handle WebSocket connection close"""
        print("WebSocket connection closed")

    def on_open(self, ws):
        """Handle WebSocket connection open"""
        print("WebSocket connection established")
        
        # Subscribe to BTC-USDT market data
        subscribe_message = {
            "id": int(time.time() * 1000),
            "type": "subscribe",
            "topic": "/market/candles:BTC-USDT_1min",
            "privateChannel": False,
            "response": True
        }
        ws.send(json.dumps(subscribe_message))

    def connect(self):
        """Establish WebSocket connection"""
        # Get WebSocket connection details
        token_data = self.get_ws_token()
        server = token_data['instanceServers'][0]
        endpoint = f"{server['endpoint']}?token={token_data['token']}"

        # Initialize WebSocket connection
        websocket.enableTrace(True)
        self.ws = websocket.WebSocketApp(
            endpoint,
            on_message=self.on_message,
            on_error=self.on_error,
            on_close=self.on_close,
            on_open=self.on_open
        )

        # Start WebSocket connection
        self.ws.run_forever()

def main():
    # Initialize with your API credentials
    api_key = '66f6a86007397d0001441a61'
    api_secret = '9a18a3c7-041a-41ad-8af5-ce89db0023f8'
    api_passphrase = 'Selanne_08'

    # Create WebSocket client
    client = KuCoinWebSocket(api_key, api_secret, api_passphrase)

    try:
        # Connect to WebSocket
        client.connect()
    except KeyboardInterrupt:
        print("Stopping WebSocket client...")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    main()