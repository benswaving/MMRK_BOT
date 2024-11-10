import { OHLCV, MACDResult } from './types';
import { MovingAverages } from './MovingAverages';
import { Decimal } from 'decimal.js';

export class MACD {
  static calculate(
    data: OHLCV[],
    fastPeriod = 12,
    slowPeriod = 26,
    signalPeriod = 9
  ): MACDResult[] {
    const fastEMA = MovingAverages.calculateEMA(data, fastPeriod);
    const slowEMA = MovingAverages.calculateEMA(data, slowPeriod);
    
    // Calculate MACD line
    const macdLine: OHLCV[] = slowEMA.map((slow, i) => ({
      time: slow.time,
      open: 0,
      high: 0,
      low: 0,
      close: new Decimal(fastEMA[i + slowPeriod - fastPeriod].value)
        .minus(slow.value)
        .toNumber(),
      volume: 0,
    }));
    
    // Calculate signal line
    const signalLine = MovingAverages.calculateEMA(macdLine, signalPeriod);
    
    // Calculate histogram
    return signalLine.map((signal, i) => ({
      time: signal.time,
      macd: macdLine[i + signalPeriod - 1].close,
      signal: signal.value,
      histogram: new Decimal(macdLine[i + signalPeriod - 1].close)
        .minus(signal.value)
        .toNumber(),
    }));
  }
}