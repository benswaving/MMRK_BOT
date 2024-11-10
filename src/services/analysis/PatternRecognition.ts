import { OHLCV } from '../types';
import { Decimal } from 'decimal.js';

export class PatternRecognition {
  // Candlestick Patterns
  static isDoji(candle: OHLCV, tolerance = 0.1): boolean {
    const bodySize = Math.abs(candle.close - candle.open);
    const totalSize = candle.high - candle.low;
    return bodySize / totalSize < tolerance;
  }

  static isHammer(candle: OHLCV): boolean {
    const bodySize = Math.abs(candle.close - candle.open);
    const upperWick = candle.high - Math.max(candle.open, candle.close);
    const lowerWick = Math.min(candle.open, candle.close) - candle.low;
    
    return lowerWick > 2 * bodySize && upperWick < bodySize;
  }

  static isEngulfing(candles: OHLCV[], index: number): boolean {
    if (index < 1) return false;
    
    const current = candles[index];
    const previous = candles[index - 1];
    
    const currentBody = Math.abs(current.close - current.open);
    const previousBody = Math.abs(previous.close - previous.open);
    
    const isBullish = current.close > current.open && 
                     previous.close < previous.open &&
                     current.open < previous.close &&
                     current.close > previous.open;
                     
    const isBearish = current.close < current.open &&
                     previous.close > previous.open &&
                     current.open > previous.close &&
                     current.close < previous.open;
                     
    return (isBullish || isBearish) && currentBody > previousBody;
  }

  // Trend Analysis
  static identifyTrend(candles: OHLCV[], period = 14): 'uptrend' | 'downtrend' | 'sideways' {
    const highs = candles.slice(-period).map(c => c.high);
    const lows = candles.slice(-period).map(c => c.low);
    
    const highsIncreasing = this.isIncreasing(highs);
    const lowsIncreasing = this.isIncreasing(lows);
    const highsDecreasing = this.isDecreasing(highs);
    const lowsDecreasing = this.isDecreasing(lows);
    
    if (highsIncreasing && lowsIncreasing) return 'uptrend';
    if (highsDecreasing && lowsDecreasing) return 'downtrend';
    return 'sideways';
  }

  static getTrendStrength(candles: OHLCV[], period = 14): number {
    const closes = candles.slice(-period).map(c => c.close);
    const returns = closes.slice(1).map((close, i) => 
      new Decimal(close).minus(closes[i]).dividedBy(closes[i]).toNumber()
    );
    
    const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const stdDev = Math.sqrt(
      returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length
    );
    
    return Math.abs(avgReturn) / stdDev; // Higher ratio indicates stronger trend
  }

  // Support/Resistance Levels
  static findSupportResistance(candles: OHLCV[], period = 20): {
    support: number[];
    resistance: number[];
  } {
    const support: number[] = [];
    const resistance: number[] = [];
    
    for (let i = period; i < candles.length - period; i++) {
      const currentLow = candles[i].low;
      const currentHigh = candles[i].high;
      
      // Check for support
      if (this.isLocalMinimum(candles, i, period)) {
        support.push(currentLow);
      }
      
      // Check for resistance
      if (this.isLocalMaximum(candles, i, period)) {
        resistance.push(currentHigh);
      }
    }
    
    return {
      support: this.consolidateLevels(support),
      resistance: this.consolidateLevels(resistance)
    };
  }

  // Volume Analysis
  static isVolumeBreakout(candles: OHLCV[], index: number, period = 20): boolean {
    if (index < period) return false;
    
    const currentVolume = candles[index].volume;
    const avgVolume = candles
      .slice(index - period, index)
      .reduce((sum, candle) => sum + candle.volume, 0) / period;
    
    return currentVolume > avgVolume * 2;
  }

  // Helper Methods
  private static isIncreasing(values: number[]): boolean {
    let increasing = 0;
    for (let i = 1; i < values.length; i++) {
      if (values[i] > values[i - 1]) increasing++;
    }
    return increasing / (values.length - 1) > 0.6;
  }

  private static isDecreasing(values: number[]): boolean {
    let decreasing = 0;
    for (let i = 1; i < values.length; i++) {
      if (values[i] < values[i - 1]) decreasing++;
    }
    return decreasing / (values.length - 1) > 0.6;
  }

  private static isLocalMinimum(candles: OHLCV[], index: number, period: number): boolean {
    const currentLow = candles[index].low;
    const leftMin = Math.min(...candles.slice(index - period, index).map(c => c.low));
    const rightMin = Math.min(...candles.slice(index + 1, index + period + 1).map(c => c.low));
    return currentLow <= leftMin && currentLow <= rightMin;
  }

  private static isLocalMaximum(candles: OHLCV[], index: number, period: number): boolean {
    const currentHigh = candles[index].high;
    const leftMax = Math.max(...candles.slice(index - period, index).map(c => c.high));
    const rightMax = Math.max(...candles.slice(index + 1, index + period + 1).map(c => c.high));
    return currentHigh >= leftMax && currentHigh >= rightMax;
  }

  private static consolidateLevels(levels: number[]): number[] {
    const grouped = levels.reduce((acc: number[][], level) => {
      const existingGroup = acc.find(group => 
        group.some(l => Math.abs(l - level) / l < 0.01)
      );
      
      if (existingGroup) {
        existingGroup.push(level);
      } else {
        acc.push([level]);
      }
      
      return acc;
    }, []);
    
    return grouped.map(group => 
      group.reduce((sum, level) => sum + level, 0) / group.length
    );
  }
}