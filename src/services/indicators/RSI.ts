import { OHLCV, IndicatorValue } from './types';
import { Decimal } from 'decimal.js';

export class RSI {
  static calculate(data: OHLCV[], period = 14): IndicatorValue[] {
    const result: IndicatorValue[] = [];
    let gains: Decimal[] = [];
    let losses: Decimal[] = [];
    
    // Calculate initial gains and losses
    for (let i = 1; i < data.length; i++) {
      const change = new Decimal(data[i].close).minus(data[i - 1].close);
      gains.push(change.gt(0) ? change : new Decimal(0));
      losses.push(change.lt(0) ? change.abs() : new Decimal(0));
    }
    
    // Calculate first RSI using simple average
    let avgGain = gains.slice(0, period).reduce((a, b) => a.plus(b), new Decimal(0)).dividedBy(period);
    let avgLoss = losses.slice(0, period).reduce((a, b) => a.plus(b), new Decimal(0)).dividedBy(period);
    
    result.push({
      time: data[period].time,
      value: calculateRSI(avgGain, avgLoss),
    });
    
    // Calculate subsequent RSIs using smoothed average
    for (let i = period; i < gains.length; i++) {
      avgGain = avgGain.times(period - 1).plus(gains[i]).dividedBy(period);
      avgLoss = avgLoss.times(period - 1).plus(losses[i]).dividedBy(period);
      
      result.push({
        time: data[i + 1].time,
        value: calculateRSI(avgGain, avgLoss),
      });
    }
    
    return result;
  }
}

function calculateRSI(avgGain: Decimal, avgLoss: Decimal): number {
  if (avgLoss.eq(0)) return 100;
  const rs = avgGain.dividedBy(avgLoss);
  return new Decimal(100).minus(new Decimal(100).dividedBy(rs.plus(1))).toNumber();
}