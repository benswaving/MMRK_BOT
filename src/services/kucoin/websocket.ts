import CryptoJS from 'crypto-js';
import { KUCOIN_CONFIG } from './config';

export class KuCoinWebSocket {
  private static instance: KuCoinWebSocket;
  private ws: WebSocket | null = null;
  private messageHandlers: Map<string, (data: any) => void> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;

  private constructor() {}

  public static getInstance(): KuCoinWebSocket {
    if (!KuCoinWebSocket.instance) {
      KuCoinWebSocket.instance = new KuCoinWebSocket();
    }
    return KuCoinWebSocket.instance;
  }

  async connect(): Promise<void> {
    try {
      const timestamp = Date.now().toString();
      const signature = CryptoJS.HmacSHA256(timestamp + 'POST' + '/api/v1/bullet-public', KUCOIN_CONFIG.apiSecret).toString(CryptoJS.enc.Base64);
      const passphrase = CryptoJS.HmacSHA256(KUCOIN_CONFIG.apiPassphrase, KUCOIN_CONFIG.apiSecret).toString(CryptoJS.enc.Base64);

      const response = await fetch(`${KUCOIN_CONFIG.apiUrl}/api/v1/bullet-public`, {
        method: 'POST',
        headers: {
          'KC-API-KEY': KUCOIN_CONFIG.apiKey,
          'KC-API-SIGN': signature,
          'KC-API-TIMESTAMP': timestamp,
          'KC-API-PASSPHRASE': passphrase,
          'KC-API-KEY-VERSION': '2'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.data || !data.data.token) {
        throw new Error('Invalid response from KuCoin API');
      }

      const { token, instanceServers } = data.data;
      if (!instanceServers || !instanceServers[0]) {
        throw new Error('No WebSocket servers available');
      }

      const wsEndpoint = `${instanceServers[0].endpoint}?token=${token}&connectId=${Date.now()}`;
      this.ws = new WebSocket(wsEndpoint);
      this.setupWebSocketHandlers();

    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      this.handleReconnect();
    }
  }

  private setupWebSocketHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.reconnectDelay = 2000;
      this.subscribeToMarkets();
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'message') {
          const handler = this.messageHandlers.get(message.topic);
          if (handler) {
            handler(message.data);
          }
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.handleReconnect();
    };
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
      setTimeout(() => this.connect(), this.reconnectDelay);
      this.reconnectDelay *= 2; // Exponential backoff
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  private subscribeToMarkets(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const topics = [
      '/market/ticker:BTC-USDT',
      '/market/candles:BTC-USDT_1min',
      // Add more symbols as needed
    ];

    topics.forEach(topic => {
      const message = {
        id: Date.now(),
        type: 'subscribe',
        topic,
        privateChannel: false,
        response: true
      };

      this.ws.send(JSON.stringify(message));
    });
  }

  onMarketData(symbol: string, callback: (data: any) => void): void {
    const topic = `/market/candles:${symbol}_1min`;
    this.messageHandlers.set(topic, callback);
  }

  onTickerUpdate(symbol: string, callback: (data: any) => void): void {
    const topic = `/market/ticker:${symbol}`;
    this.messageHandlers.set(topic, callback);
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.messageHandlers.clear();
  }
}