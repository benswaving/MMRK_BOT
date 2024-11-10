import { Decimal } from 'decimal.js';
import type { Balance } from '../../types/trading';

export class PositionSizer {
  static calculatePosition(
    balance: Balance,
    riskPercentage: number,
    entryPrice: number,
    stopLoss: number
  ): number {
    const riskAmount = new Decimal(balance.free)
      .times(riskPercentage)
      .dividedBy(100);
    
    const priceDiff = new Decimal(entryPrice)
      .minus(stopLoss)
      .abs();
    
    const positionSize = riskAmount
      .dividedBy(priceDiff)
      .toNumber();
    
    return Math.floor(positionSize * 100000) / 100000; // Round to 5 decimals
  }

  static calculateStopLoss(
    entryPrice: number,
    side: 'long' | 'short',
    atr: number,
    multiplier = 2
  ): number {
    const stopDistance = new Decimal(atr)
      .times(multiplier);
    
    return side === 'long'
      ? new Decimal(entryPrice).minus(stopDistance).toNumber()
      : new Decimal(entryPrice).plus(stopDistance).toNumber();
  }

  static calculateTakeProfit(
    entryPrice: number,
    stopLoss: number,
    riskRewardRatio = 2
  ): number {
    const riskDistance = new Decimal(entryPrice)
      .minus(stopLoss)
      .abs();
    
    const profitDistance = riskDistance.times(riskRewardRatio);
    
    return stopLoss < entryPrice
      ? new Decimal(entryPrice).plus(profitDistance).toNumber()
      : new Decimal(entryPrice).minus(profitDistance).toNumber();
  }
}