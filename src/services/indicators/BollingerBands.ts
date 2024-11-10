import { OHLCV, BBResult } from './types';
import { MovingAverages } from './MovingAverages';
import { Decimal } from 'decimal.js';

export class BollingerBands {
  static calculate(
    data: OHLCV[],
    period = 20,
    multiplier = 2
  ): BBResult[] {
    const sma = MovingAverages.calculateSMA(data, period);
    const result: BBResult[] = [];
    
    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1);
      const middle = sma[i - (period - 1)].value;
      
      // Calculate standard deviation
      const squaredDiffs = slice.map(candle => 
        new Decimal(candle.close)
          .minus(middle)
          .pow(2)
      );
      
      const variance = squaredDiffs
        .reduce((acc, val) => acc.plus(val), new Decimal(0))
        .dividedBy(period);
      
      const stdDev = variance.sqrt().times(multiplier);
      
      result.push({
        time: data[i].time,
        upper: new Decimal(middle).plus(stdDev).toNumber(),
        middle,
        lower: new Decimal(middle).minus(stdDev).toNumber(),
      });
    }
    
    return result;
  }
}