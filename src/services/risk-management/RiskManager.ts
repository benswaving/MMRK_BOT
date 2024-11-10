import { Decimal } from 'decimal.js';
import type { Position, Balance } from '../../types/trading';
import { PositionSizer } from './PositionSizer';
import { PortfolioManager } from './PortfolioManager';

export class RiskManager {
  private static instance: RiskManager;
  private maxRiskPerTrade: number = 0.02; // 2% per trade
  private maxPortfolioRisk: number = 0.1; // 10% total portfolio risk
  private maxDrawdown: number = 0.15; // 15% maximum drawdown
  private riskFreeRate: number = 0.02; // 2% annual risk-free rate

  private constructor() {}

  public static getInstance(): RiskManager {
    if (!RiskManager.instance) {
      RiskManager.instance = new RiskManager();
    }
    return RiskManager.instance;
  }

  calculatePositionSize(
    balance: Balance,
    entryPrice: number,
    stopLoss: number,
    volatility: number
  ): number {
    // Adjust risk based on volatility
    const adjustedRisk = this.adjustRiskForVolatility(this.maxRiskPerTrade, volatility);
    
    // Calculate position size based on risk
    return PositionSizer.calculatePosition(
      balance,
      adjustedRisk * 100, // Convert to percentage
      entryPrice,
      stopLoss
    );
  }

  calculateStopLoss(
    entryPrice: number,
    side: 'long' | 'short',
    atr: number
  ): number {
    return PositionSizer.calculateStopLoss(entryPrice, side, atr);
  }

  calculateTakeProfit(
    entryPrice: number,
    stopLoss: number
  ): number {
    return PositionSizer.calculateTakeProfit(entryPrice, stopLoss);
  }

  validateNewPosition(
    positions: Position[],
    balances: Balance[],
    newPositionRisk: number
  ): boolean {
    const portfolioValue = PortfolioManager.calculatePortfolioValue(positions, balances);
    const currentRisk = this.calculatePortfolioRisk(positions, portfolioValue);
    
    return (currentRisk + newPositionRisk) <= this.maxPortfolioRisk;
  }

  checkDrawdownLimit(
    positions: Position[],
    balances: Balance[],
    peakValue: number
  ): boolean {
    const currentValue = PortfolioManager.calculatePortfolioValue(positions, balances);
    const drawdown = PortfolioManager.calculateDrawdown(currentValue, peakValue);
    
    return drawdown <= this.maxDrawdown * 100;
  }

  calculatePortfolioMetrics(
    positions: Position[],
    balances: Balance[],
    returns: number[]
  ) {
    const portfolioValue = PortfolioManager.calculatePortfolioValue(positions, balances);
    const sharpeRatio = PortfolioManager.calculateSharpeRatio(returns, this.riskFreeRate);
    
    return {
      portfolioValue,
      sharpeRatio,
      currentRisk: this.calculatePortfolioRisk(positions, portfolioValue),
      riskCapacity: this.maxPortfolioRisk - this.calculatePortfolioRisk(positions, portfolioValue),
    };
  }

  private calculatePortfolioRisk(positions: Position[], portfolioValue: number): number {
    return positions.reduce((totalRisk, position) => {
      const positionValue = new Decimal(position.size)
        .times(position.currentPrice)
        .toNumber();
      
      return totalRisk + (positionValue / portfolioValue);
    }, 0);
  }

  private adjustRiskForVolatility(baseRisk: number, volatility: number): number {
    const volatilityFactor = Math.max(0.5, Math.min(1.5, 1 / volatility));
    return baseRisk * volatilityFactor;
  }

  // Getters and setters for risk parameters
  setMaxRiskPerTrade(risk: number) {
    this.maxRiskPerTrade = Math.max(0.001, Math.min(0.05, risk));
  }

  setMaxPortfolioRisk(risk: number) {
    this.maxPortfolioRisk = Math.max(0.05, Math.min(0.2, risk));
  }

  setMaxDrawdown(drawdown: number) {
    this.maxDrawdown = Math.max(0.1, Math.min(0.25, drawdown));
  }

  getMaxRiskPerTrade(): number {
    return this.maxRiskPerTrade;
  }

  getMaxPortfolioRisk(): number {
    return this.maxPortfolioRisk;
  }

  getMaxDrawdown(): number {
    return this.maxDrawdown;
  }
}