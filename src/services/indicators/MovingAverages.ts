import { OHLCV, IndicatorValue } from './types';
import { Decimal } from 'decimal.js';

export class MovingAverages {
  static calculateSMA(data: OHLCV[], period: number): IndicatorValue[] {
    const result: IndicatorValue[] = [];
    
    for (let i = period - 1; i < data.length; i++) {
      const sum = data
        .slice(i - period + 1, i + 1)
        .reduce((acc, candle) => acc.plus(candle.close), new Decimal(0));
      
      result.push({
        time: data[i].time,
        value: sum.dividedBy(period).toNumber(),
      });
    }
    
    return result;
  }

  static calculateEMA(data: OHLCV[], period: number): IndicatorValue[] {
    const result: IndicatorValue[] = [];
    const multiplier = 2 / (period + 1);
    
    // First EMA uses SMA as initial value
    const sma = this.calculateSMA(data.slice(0, period), period)[0];
    result.push(sma);
    
    for (let i = period; i < data.length; i++) {
      const currentPrice = new Decimal(data[i].close);
      const prevEMA = new Decimal(result[result.length - 1].value);
      
      const ema = currentPrice
        .times(multiplier)
        .plus(prevEMA.times(1 - multiplier));
      
      result.push({
        time: data[i].time,
        value: ema.toNumber(),
      });
    }
    
    return result;
  }

  static calculateDEMA(data: OHLCV[], period: number): IndicatorValue[] {
    const ema1 = this.calculateEMA(data, period);
    const ema2 = this.calculateEMA(
      ema1.map((e, i) => ({ ...data[i + period - 1], close: e.value })),
      period
    );
    
    return ema2.map((e, i) => ({
      time: e.time,
      value: 2 * ema1[i + period - 1].value - e.value,
    }));
  }
}