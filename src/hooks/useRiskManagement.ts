import { useCallback } from 'react';
import { RiskManager } from '../services/risk-management/RiskManager';
import { useTradingStore } from '../store/tradingStore';

export const useRiskManagement = () => {
  const { positions, balances } = useTradingStore();
  const riskManager = RiskManager.getInstance();

  const calculatePositionSize = useCallback((
    entryPrice: number,
    stopLoss: number,
    volatility: number
  ) => {
    const balance = balances.find(b => b.asset === 'USDT');
    if (!balance) return 0;

    return riskManager.calculatePositionSize(
      balance,
      entryPrice,
      stopLoss,
      volatility
    );
  }, [balances]);

  const validateNewPosition = useCallback((newPositionRisk: number) => {
    return riskManager.validateNewPosition(positions, balances, newPositionRisk);
  }, [positions, balances]);

  const calculateStopLoss = useCallback((
    entryPrice: number,
    side: 'long' | 'short',
    atr: number
  ) => {
    return riskManager.calculateStopLoss(entryPrice, side, atr);
  }, []);

  const calculateTakeProfit = useCallback((
    entryPrice: number,
    stopLoss: number
  ) => {
    return riskManager.calculateTakeProfit(entryPrice, stopLoss);
  }, []);

  const checkDrawdownLimit = useCallback((peakValue: number) => {
    return riskManager.checkDrawdownLimit(positions, balances, peakValue);
  }, [positions, balances]);

  return {
    calculatePositionSize,
    validateNewPosition,
    calculateStopLoss,
    calculateTakeProfit,
    checkDrawdownLimit,
    maxRiskPerTrade: riskManager.getMaxRiskPerTrade(),
    maxPortfolioRisk: riskManager.getMaxPortfolioRisk(),
    maxDrawdown: riskManager.getMaxDrawdown(),
  };
};