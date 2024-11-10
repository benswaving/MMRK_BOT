import { KUCOIN_CONFIG, TOP_COINS } from './config';

export class KuCoinService {
  private config = KUCOIN_CONFIG;
  private socket: WebSocket | null = null;
  private messageHandlers: Map<string, (data: any) => void> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;

  constructor() {
    this.initializeWebSocket();
  }

  private async initializeWebSocket() {
    try {
      // Add required headers for KuCoin API
      const headers = {
        'Content-Type': 'application/json',
        'KC-API-KEY': this.config.apiKey,
        'KC-API-TIMESTAMP': Date.now().toString(),
        'KC-API-PASSPHRASE': this.config.apiPassphrase
      };

      const response = await fetch(`${this.config.apiUrl}/api/v1/bullet-public`, {
        method: 'POST',
        headers
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
      
      this.socket = new WebSocket(wsEndpoint);
      this.setupWebSocketHandlers();
    } catch (error) {
      console.error('WebSocket initialization failed:', error);
      this.handleReconnect();
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnection attempt ${this.reconnectAttempts} of ${this.maxReconnectAttempts}`);
      setTimeout(() => this.initializeWebSocket(), this.reconnectDelay);
      this.reconnectDelay *= 2; // Exponential backoff
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  private setupWebSocketHandlers() {
    if (!this.socket) return;

    this.socket.onopen = () => {
      console.log('WebSocket connected successfully');
      this.reconnectAttempts = 0;
      this.reconnectDelay = 2000;
      this.subscribeToMarkets();
    };

    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'welcome') {
          console.log('WebSocket connection authenticated');
          return;
        }
        if (message.type === 'error') {
          console.error('WebSocket error message:', message);
          return;
        }
        const handler = this.messageHandlers.get(message.topic);
        if (handler) {
          handler(message.data);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.socket.onclose = (event) => {
      console.log(`WebSocket closed with code ${event.code}. Reason: ${event.reason}`);
      this.handleReconnect();
    };
  }

  private subscribeToMarkets() {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not ready for subscription');
      return;
    }

    TOP_COINS.forEach(symbol => {
      try {
        const topic = `/market/candles:${symbol}_1min`;
        const message = {
          id: Date.now(),
          type: 'subscribe',
          topic,
          privateChannel: false,
          response: true
        };
        this.socket.send(JSON.stringify(message));
        console.log(`Subscribed to ${symbol}`);
      } catch (error) {
        console.error(`Failed to subscribe to ${symbol}:`, error);
      }
    });
  }

  public onMarketData(symbol: string, callback: (data: any) => void) {
    const topic = `/market/candles:${symbol}_1min`;
    this.messageHandlers.set(topic, callback);
  }

  public async getHistoricalData(symbol: string, startTime: number, endTime: number) {
    try {
      const response = await fetch(
        `${this.config.apiUrl}/api/v1/market/candles?type=1min&symbol=${symbol}&startAt=${startTime}&endAt=${endTime}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'KC-API-KEY': this.config.apiKey,
            'KC-API-TIMESTAMP': Date.now().toString(),
            'KC-API-PASSPHRASE': this.config.apiPassphrase
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Failed to fetch historical data:', error);
      return [];
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.messageHandlers.clear();
  }
}