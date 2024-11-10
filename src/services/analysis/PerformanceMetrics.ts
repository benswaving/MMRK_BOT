import { OHLCV } from '../types';
import { Decimal } from 'decimal.js';

export class PerformanceMetrics {
  static calculateVolatilityMetrics(data: OHLCV[], period = 20) {
    const returns = this.calculateReturns(data);
    const volatility = this.calculateVolatility(returns);
    const parkinsonVolatility = this.calculateParkinsonVolatility(data, period);
    const garmanKlassVolatility = this.calculateGarmanKlassVolatility(data, period);

    return {
      standardDeviation: volatility,
      parkinsonVolatility,
      garmanKlassVolatility,
      averageTrueRange: this.calculateATR(data, period),
      volatilityRatio: this.calculateVolatilityRatio(data, period)
    };
  }

  static calculatePerformanceMetrics(data: OHLCV[], trades: any[]) {
    const returns = this.calculateReturns(data);
    const winningTrades = trades.filter(trade => trade.pnl > 0);
    
    return {
      winRate: (winningTrades.length / trades.length) * 100,
      totalReturn: this.calculateTotalReturn(returns),
      sharpeRatio: this.calculateSharpeRatio(returns),
      sortinoRatio: this.calculateSortinoRatio(returns),
      maxDrawdown: this.calculateMaxDrawdown(data),
      profitFactor: this.calculateProfitFactor(trades)
    };
  }

  private static calculateReturns(data: OHLCV[]): number[] {
    return data.slice(1).map((candle, i) => 
      new Decimal(candle.close)
        .minus(data[i].close)
        .dividedBy(data[i].close)
        .times(100)
        .toNumber()
    );
  }

  private static calculateVolatility(returns: number[]): number {
    const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const squaredDiffs = returns.map(ret => Math.pow(ret - mean, 2));
    return Math.sqrt(squaredDiffs.reduce((sum, diff) => sum + diff, 0) / returns.length);
  }

  private static calculateParkinsonVolatility(data: OHLCV[], period: number): number {
    const factor = 1 / (4 * Math.log(2));
    const sum = data.slice(-period).reduce((acc, candle) => {
      const highLowRatio = new Decimal(candle.high).dividedBy(candle.low).ln().pow(2);
      return acc.plus(highLowRatio);
    }, new Decimal(0));

    return sum.dividedBy(period).times(factor).sqrt().toNumber();
  }

  private static calculateGarmanKlassVolatility(data: OHLCV[], period: number): number {
    return data.slice(-period).reduce((acc, candle) => {
      const open = new Decimal(candle.open);
      const high = new Decimal(candle.high);
      const low = new Decimal(candle.low);
      const close = new Decimal(candle.close);

      const highLow = high.ln().minus(low.ln()).pow(2).times(0.5);
      const openClose = open.ln().minus(close.ln()).pow(2).times(-2);
      
      return acc + highLow.plus(openClose).toNumber();
    }, 0) / period;
  }

  private static calculateATR(data: OHLCV[], period: number): number {
    const trueRanges = data.slice(1).map((candle, i) => {
      const prev = data[i];
      const tr1 = candle.high - candle.low;
      const tr2 = Math.abs(candle.high - prev.close);
      const tr3 = Math.abs(candle.low - prev.close);
      return Math.max(tr1, tr2, tr3);
    });

    return trueRanges.slice(-period).reduce((sum, tr) => sum + tr, 0) / period;
  }

  private static calculateVolatilityRatio(data: OHLCV[], period: number): number {
    const volatilities = data.slice(-period).map(candle => 
      (candle.high - candle.low) / candle.open
    );
    
    const currentVol = volatilities[volatilities.length - 1];
    const avgVol = volatilities.reduce((sum, vol) => sum + vol, 0) / period;
    
    return currentVol / avgVol;
  }

  private static calculateTotalReturn(returns: number[]): number {
    return returns.reduce((acc, ret) => new Decimal(1).plus(ret/100).times(acc), new Decimal(1))
      .minus(1)
      .times(100)
      .toNumber();
  }

  private static calculateSharpeRatio(returns: number[], riskFreeRate = 2): number {
    const excessReturns = returns.map(r => r - riskFreeRate / 252);
    const avgExcessReturn = excessReturns.reduce((sum, r) => sum + r, 0) / returns.length;
    const stdDev = this.calculateVolatility(returns);
    
    return (avgExcessReturn * Math.sqrt(252)) / stdDev;
  }

  private static calculateSortinoRatio(returns: number[], riskFreeRate = 2): number {
    const excessReturns = returns.map(r => r - riskFreeRate / 252);
    const avgExcessReturn = excessReturns.reduce((sum, r) => sum + r, 0) / returns.length;
    
    const downside = returns.filter(r => r < 0);
    const downsideDeviation = Math.sqrt(
      downside.reduce((sum, r) => sum + Math.pow(r, 2), 0) / downside.length
    );
    
    return (avgExcessReturn * Math.sqrt(252)) / downsideDeviation;
  }

  private static calculateMaxDrawdown(data: OHLCV[]): number {
    let peak = data[0].close;
    let maxDrawdown = 0;

    data.forEach(candle => {
      if (candle.close > peak) {
        peak = candle.close;
      }
      
      const drawdown = (peak - candle.close) / peak;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    });

    return maxDrawdown * 100;
  }

  private static calculateProfitFactor(trades: any[]): number {
    const grossProfit = trades
      .filter(t => t.pnl > 0)
      .reduce((sum, t) => sum + t.pnl, 0);
      
    const grossLoss = Math.abs(
      trades
        .filter(t => t.pnl < 0)
        .reduce((sum, t) => sum + t.pnl, 0)
    );
    
    return grossLoss === 0 ? grossProfit : grossProfit / grossLoss;
  }
}