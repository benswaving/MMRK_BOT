import { KUCOIN_CONFIG, TIMEFRAMES, TOP_COINS } from './config';
import type { Timeframe } from './config';
import type { OHLCV } from '../types';
import { MarketDataService } from '../mockData/MarketDataService';

export class MarketService {
  private static instance: MarketService;
  private baseUrl: string;
  private symbolsCache: string[] | null = null;
  private symbolsCacheExpiry: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private mockDataService: MarketDataService;

  private constructor() {
    this.baseUrl = KUCOIN_CONFIG.apiUrl;
    this.mockDataService = MarketDataService.getInstance();
  }

  public static getInstance(): MarketService {
    if (!MarketService.instance) {
      MarketService.instance = new MarketService();
    }
    return MarketService.instance;
  }

  async getSymbols(): Promise<string[]> {
    try {
      if (this.symbolsCache && Date.now() < this.symbolsCacheExpiry) {
        return this.symbolsCache;
      }

      const response = await fetch(`${this.baseUrl}/api/v1/symbols`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.data) {
        throw new Error('Invalid response format');
      }

      this.symbolsCache = TOP_COINS;
      this.symbolsCacheExpiry = Date.now() + this.CACHE_DURATION;
      return this.symbolsCache;
    } catch (error) {
      console.warn('Failed to fetch symbols, using fallback data:', error);
      return TOP_COINS;
    }
  }

  async getHistoricalData(
    symbol: string,
    timeframe: Timeframe = '1m',
    startTime?: number,
    endTime?: number
  ): Promise<OHLCV[]> {
    try {
      const now = Math.floor(Date.now() / 1000);
      const start = startTime || now - (24 * 60 * 60);
      const end = endTime || now;

      const params = new URLSearchParams({
        symbol,
        type: TIMEFRAMES[timeframe],
        startAt: start.toString(),
        endAt: end.toString()
      });

      const response = await fetch(`${this.baseUrl}/api/v1/market/candles?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.data) {
        return this.mockDataService.getHistoricalData(symbol);
      }

      return data.data
        .map((candle: string[]) => ({
          timestamp: parseInt(candle[0]) * 1000,
          open: parseFloat(candle[1]),
          high: parseFloat(candle[2]),
          low: parseFloat(candle[3]),
          close: parseFloat(candle[4]),
          volume: parseFloat(candle[5])
        }))
        .sort((a: OHLCV, b: OHLCV) => a.timestamp - b.timestamp);
    } catch (error) {
      console.warn('Failed to fetch historical data, using mock data:', error);
      return this.mockDataService.getHistoricalData(symbol);
    }
  }

  async getAllTickers(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/market/allTickers`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.data?.ticker) {
        return this.mockDataService.getAllTickers();
      }

      return data.data.ticker.filter((ticker: any) => 
        TOP_COINS.includes(ticker.symbol)
      );
    } catch (error) {
      console.warn('Failed to fetch tickers, using mock data:', error);
      return this.mockDataService.getAllTickers();
    }
  }

  async subscribeToMarketData(
    symbol: string,
    callback: (data: OHLCV) => void
  ): Promise<() => void> {
    return this.mockDataService.subscribeToRealtimeData(symbol, callback);
  }

  getTimeframes(): string[] {
    return Object.keys(TIMEFRAMES);
  }

  getSupportedSymbols(): string[] {
    return TOP_COINS;
  }
}