import { OHLCV, StochRSIResult } from './types';
import { RSI } from './RSI';
import { Decimal } from 'decimal.js';

export class StochRSI {
  static calculate(
    data: OHLCV[],
    period = 14,
    smoothK = 3,
    smoothD = 3
  ): StochRSIResult[] {
    const rsiValues = RSI.calculate(data, period);
    const result: StochRSIResult[] = [];
    
    for (let i = period - 1; i < rsiValues.length; i++) {
      const rsiPeriod = rsiValues.slice(i - period + 1, i + 1);
      const highestRSI = Math.max(...rsiPeriod.map(v => v.value));
      const lowestRSI = Math.min(...rsiPeriod.map(v => v.value));
      
      const k = new Decimal(rsiValues[i].value - lowestRSI)
        .dividedBy(highestRSI - lowestRSI)
        .times(100)
        .toNumber();
      
      result.push({
        time: rsiValues[i].time,
        k,
        d: k, // Will be smoothed later
      });
    }
    
    // Smooth K values
    const smoothedK = this.smoothValues(result.map(r => r.k), smoothK);
    
    // Calculate and smooth D values
    const smoothedD = this.smoothValues(smoothedK, smoothD);
    
    return result.map((r, i) => ({
      time: r.time,
      k: smoothedK[i],
      d: smoothedD[i],
    }));
  }
  
  private static smoothValues(values: number[], period: number): number[] {
    const result: number[] = [];
    
    for (let i = period - 1; i < values.length; i++) {
      const sum = values
        .slice(i - period + 1, i + 1)
        .reduce((acc, val) => acc + val, 0);
      
      result.push(sum / period);
    }
    
    return result;
  }
}