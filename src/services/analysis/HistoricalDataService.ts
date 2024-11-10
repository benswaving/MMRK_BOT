import { OHLCV } from '../types';
import { Decimal } from 'decimal.js';

export class HistoricalDataService {
  private static instance: HistoricalDataService;
  private data: Map<string, OHLCV[]> = new Map();
  private readonly maxDataPoints = 1000;

  private constructor() {}

  public static getInstance(): HistoricalDataService {
    if (!HistoricalDataService.instance) {
      HistoricalDataService.instance = new HistoricalDataService();
    }
    return HistoricalDataService.instance;
  }

  public addData(symbol: string, newData: OHLCV[]): void {
    const existingData = this.data.get(symbol) || [];
    const combinedData = [...existingData, ...newData]
      .sort((a, b) => a.timestamp - b.timestamp);
    
    // Keep only the most recent data points
    if (combinedData.length > this.maxDataPoints) {
      combinedData.splice(0, combinedData.length - this.maxDataPoints);
    }
    
    this.data.set(symbol, combinedData);
  }

  public getData(symbol: string, period?: number): OHLCV[] {
    const data = this.data.get(symbol) || [];
    if (period) {
      return data.slice(-period);
    }
    return data;
  }

  public calculateReturns(symbol: string, period = 20): number[] {
    const data = this.getData(symbol, period + 1);
    return data.slice(1).map((candle, i) => 
      new Decimal(candle.close)
        .minus(data[i].close)
        .dividedBy(data[i].close)
        .times(100)
        .toNumber()
    );
  }

  public calculateVolatility(symbol: string, period = 20): number {
    const returns = this.calculateReturns(symbol, period);
    const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    
    const squaredDiffs = returns.map(ret => Math.pow(ret - mean, 2));
    const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / returns.length;
    
    return Math.sqrt(variance);
  }

  public calculateCorrelation(symbol1: string, symbol2: string, period = 20): number {
    const returns1 = this.calculateReturns(symbol1, period);
    const returns2 = this.calculateReturns(symbol2, period);
    
    if (returns1.length !== returns2.length) return 0;
    
    const mean1 = returns1.reduce((sum, ret) => sum + ret, 0) / returns1.length;
    const mean2 = returns2.reduce((sum, ret) => sum + ret, 0) / returns2.length;
    
    let numerator = 0;
    let denominator1 = 0;
    let denominator2 = 0;
    
    for (let i = 0; i < returns1.length; i++) {
      const diff1 = returns1[i] - mean1;
      const diff2 = returns2[i] - mean2;
      
      numerator += diff1 * diff2;
      denominator1 += diff1 * diff1;
      denominator2 += diff2 * diff2;
    }
    
    return numerator / Math.sqrt(denominator1 * denominator2);
  }

  public findHighestVolumePeriods(symbol: string, period = 20): OHLCV[] {
    const data = this.getData(symbol);
    return [...data]
      .sort((a, b) => b.volume - a.volume)
      .slice(0, period);
  }

  public calculateAverageVolume(symbol: string, period = 20): number {
    const data = this.getData(symbol, period);
    return data.reduce((sum, candle) => sum + candle.volume, 0) / data.length;
  }
}