import { TOP_COINS } from './config';

export class MarketDataService {
  private static instance: MarketDataService;
  private historicalData: Map<string, any[]> = new Map();
  private lastUpdate: number = Date.now();

  private constructor() {
    this.initializeHistoricalData();
  }

  static getInstance(): MarketDataService {
    if (!MarketDataService.instance) {
      MarketDataService.instance = new MarketDataService();
    }
    return MarketDataService.instance;
  }

  private initializeHistoricalData(): void {
    TOP_COINS.forEach(symbol => {
      this.historicalData.set(symbol, this.generateMockHistoricalData(symbol));
    });
  }

  private generateMockHistoricalData(symbol: string): any[] {
    const data = [];
    const basePrice = this.getBasePrice(symbol);
    const now = Date.now();
    
    for (let i = 0; i < 200; i++) {
      const time = now - (200 - i) * 60000; // 1-minute intervals
      const volatility = 0.002; // 0.2% volatility
      
      const open = basePrice * (1 + (Math.random() - 0.5) * volatility);
      const close = open * (1 + (Math.random() - 0.5) * volatility);
      const high = Math.max(open, close) * (1 + Math.random() * volatility);
      const low = Math.min(open, close) * (1 - Math.random() * volatility);
      const volume = basePrice * Math.random() * 100;

      data.push({
        time: time / 1000, // Convert to seconds for chart library
        open,
        high,
        low,
        close,
        volume
      });
    }

    return data;
  }

  private getBasePrice(symbol: string): number {
    const prices: { [key: string]: number } = {
      'BTC-USDT': 45000,
      'ETH-USDT': 2500,
      'BNB-USDT': 300,
      'XRP-USDT': 0.5,
      'ADA-USDT': 0.4,
      'DOGE-USDT': 0.08,
      'SOL-USDT': 80,
      'TRX-USDT': 0.08,
      'DOT-USDT': 6,
      'MATIC-USDT': 0.8
    };
    return prices[symbol] || 100;
  }

  async getHistoricalData(symbol: string, interval: string = '1m'): Promise<any[]> {
    try {
      if (!this.historicalData.has(symbol)) {
        this.historicalData.set(symbol, this.generateMockHistoricalData(symbol));
      }
      return this.historicalData.get(symbol) || [];
    } catch (error) {
      console.error('Failed to fetch historical data:', error);
      return this.generateMockHistoricalData(symbol);
    }
  }

  async updateRealtimeData(symbol: string): Promise<any> {
    const currentData = this.historicalData.get(symbol) || [];
    if (currentData.length === 0) return null;

    const lastCandle = currentData[currentData.length - 1];
    const now = Date.now() / 1000;
    
    if (now - this.lastUpdate > 60) {
      const newCandle = this.generateNewCandle(symbol, lastCandle);
      currentData.push(newCandle);
      if (currentData.length > 200) currentData.shift();
      this.historicalData.set(symbol, currentData);
      this.lastUpdate = now;
    }

    return currentData;
  }

  private generateNewCandle(symbol: string, lastCandle: any): any {
    const basePrice = lastCandle.close;
    const volatility = 0.002;
    
    const open = basePrice * (1 + (Math.random() - 0.5) * volatility);
    const close = open * (1 + (Math.random() - 0.5) * volatility);
    const high = Math.max(open, close) * (1 + Math.random() * volatility);
    const low = Math.min(open, close) * (1 - Math.random() * volatility);
    const volume = basePrice * Math.random() * 100;

    return {
      time: Date.now() / 1000,
      open,
      high,
      low,
      close,
      volume
    };
  }

  getSupportedSymbols(): string[] {
    return TOP_COINS;
  }

  getTimeframes(): string[] {
    return ['1m', '5m', '15m', '30m', '1h', '4h', '1d'];
  }
}