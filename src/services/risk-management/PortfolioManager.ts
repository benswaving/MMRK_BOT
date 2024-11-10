import { Decimal } from 'decimal.js';
import type { Position, Balance } from '../../types/trading';

export class PortfolioManager {
  static calculatePortfolioValue(
    positions: Position[],
    balances: Balance[]
  ): number {
    const positionsValue = positions.reduce(
      (total, pos) => total.plus(
        new Decimal(pos.size).times(pos.currentPrice)
      ),
      new Decimal(0)
    );

    const balancesValue = balances.reduce(
      (total, bal) => total.plus(bal.total),
      new Decimal(0)
    );

    return positionsValue.plus(balancesValue).toNumber();
  }

  static calculateDrawdown(
    currentValue: number,
    peakValue: number
  ): number {
    return new Decimal(peakValue)
      .minus(currentValue)
      .dividedBy(peakValue)
      .times(100)
      .toNumber();
  }

  static calculateSharpeRatio(
    returns: number[],
    riskFreeRate = 0.02
  ): number {
    const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const excessReturns = returns.map(r => r - riskFreeRate / 252); // Daily risk-free rate
    
    const stdDev = Math.sqrt(
      excessReturns
        .map(r => Math.pow(r - meanReturn, 2))
        .reduce((a, b) => a + b, 0) / (returns.length - 1)
    );

    return (meanReturn - riskFreeRate / 252) / stdDev * Math.sqrt(252); // Annualized
  }

  static calculateMaxPositionSize(
    totalEquity: number,
    maxRiskPerTrade: number
  ): number {
    return new Decimal(totalEquity)
      .times(maxRiskPerTrade)
      .dividedBy(100)
      .toNumber();
  }
}