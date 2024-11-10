import { OHLCV, Ticker } from '../../types/trading';
import { TOP_COINS } from '../kucoin/config';

export class MarketDataService {
  private static instance: MarketDataService;
  private historicalData: Map<string, OHLCV[]> = new Map();
  private tickers: Map<string, Ticker> = new Map();
  private updateInterval: number = 1000; // 1 second updates
  private candleInterval: number = 60000; // 1 minute candles

  private constructor() {
    this.initializeHistoricalData();
    this.initializeTickers();
  }

  static getInstance(): MarketDataService {
    if (!MarketDataService.instance) {
      MarketDataService.instance = new MarketDataService();
    }
    return MarketDataService.instance;
  }

  private initializeHistoricalData(): void {
    TOP_COINS.forEach(symbol => {
      this.historicalData.set(symbol, this.generateMockData(symbol));
    });
  }

  private initializeTickers(): void {
    TOP_COINS.forEach(symbol => {
      const lastCandle = this.historicalData.get(symbol)?.slice(-1)[0];
      if (lastCandle) {
        this.tickers.set(symbol, {
          symbol,
          price: lastCandle.close,
          volume: lastCandle.volume,
          change24h: (Math.random() - 0.5) * 5,
          high24h: lastCandle.high,
          low24h: lastCandle.low,
          lastUpdated: Date.now()
        });
      }
    });
  }

  private generateMockData(symbol: string, length: number = 1000): OHLCV[] {
    const data: OHLCV[] = [];
    let price = this.getBasePrice(symbol);
    const now = Date.now();
    const startTime = now - (length * this.candleInterval);

    for (let i = 0; i < length; i++) {
      const timestamp = startTime + (i * this.candleInterval);
      const volatility = 0.002;
      const change = (Math.random() - 0.5) * volatility * price;
      
      price += change;
      const high = price + Math.random() * price * volatility;
      const low = price - Math.random() * price * volatility;
      
      data.push({
        timestamp,
        open: price - change,
        high,
        low,
        close: price,
        volume: Math.random() * price * 10
      });
    }

    return data.sort((a, b) => a.timestamp - b.timestamp);
  }

  private getBasePrice(symbol: string): number {
    const prices: { [key: string]: number } = {
      'BTC-USDT': 45000,
      'ETH-USDT': 2500,
      'BNB-USDT': 300,
      'SOL-USDT': 80,
      'XRP-USDT': 0.5,
      'ADA-USDT': 0.4,
      'AVAX-USDT': 35,
      'DOGE-USDT': 0.08,
      'DOT-USDT': 6,
      'MATIC-USDT': 0.8
    };
    return prices[symbol] || 100;
  }

  async getHistoricalData(symbol: string): Promise<OHLCV[]> {
    if (!this.historicalData.has(symbol)) {
      this.historicalData.set(symbol, this.generateMockData(symbol));
    }
    return [...(this.historicalData.get(symbol) || [])];
  }

  async getAllTickers(): Promise<any[]> {
    const tickers = [];
    for (const [symbol, ticker] of this.tickers) {
      tickers.push({
        symbol,
        buy: ticker.price * (1 + 0.0001),
        sell: ticker.price * (1 - 0.0001),
        changeRate: (ticker.change24h / 100).toFixed(4),
        changePrice: (ticker.price * ticker.change24h / 100).toFixed(2),
        high: ticker.high24h,
        low: ticker.low24h,
        vol: ticker.volume,
        volValue: ticker.volume * ticker.price,
        last: ticker.price
      });
    }
    return tickers;
  }

  async subscribeToRealtimeData(
    symbol: string,
    callback: (data: OHLCV) => void
  ): Promise<() => void> {
    let lastUpdate = Date.now();

    const interval = setInterval(() => {
      const data = this.historicalData.get(symbol) || [];
      const lastCandle = data[data.length - 1];
      const currentTime = Date.now();
      const newCandleTime = Math.floor(currentTime / this.candleInterval) * this.candleInterval;

      if (newCandleTime > lastCandle.timestamp) {
        const newCandle = this.generateNextCandle(lastCandle, newCandleTime);
        const updatedData = [...data.slice(-999), newCandle].sort((a, b) => a.timestamp - b.timestamp);
        this.historicalData.set(symbol, updatedData);
        this.updateTickers();
        callback(newCandle);
      }
    }, this.updateInterval);

    return () => clearInterval(interval);
  }

  private generateNextCandle(lastCandle: OHLCV, timestamp: number): OHLCV {
    const volatility = 0.002;
    const change = (Math.random() - 0.5) * volatility * lastCandle.close;
    const price = lastCandle.close + change;
    
    return {
      timestamp,
      open: lastCandle.close,
      high: Math.max(price + Math.random() * price * volatility, price),
      low: Math.min(price - Math.random() * price * volatility, price),
      close: price,
      volume: Math.random() * price * 10
    };
  }

  private updateTickers(): void {
    TOP_COINS.forEach(symbol => {
      const data = this.historicalData.get(symbol);
      if (data) {
        const lastCandle = data[data.length - 1];
        const prevTicker = this.tickers.get(symbol);
        
        this.tickers.set(symbol, {
          symbol,
          price: lastCandle.close,
          volume: lastCandle.volume,
          change24h: prevTicker ? prevTicker.change24h + (Math.random() - 0.5) * 0.1 : 0,
          high24h: Math.max(lastCandle.high, prevTicker?.high24h || 0),
          low24h: Math.min(lastCandle.low, prevTicker?.low24h || Infinity),
          lastUpdated: Date.now()
        });
      }
    });
  }
}