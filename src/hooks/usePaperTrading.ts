import { useState } from 'react';
import type { Position, Balance } from '../types/trading';

export const usePaperTrading = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [balance, setBalance] = useState<Balance>({
    asset: 'USDT',
    free: 10000,
    locked: 0,
    total: 10000
  });

  const executeOrder = async (order: {
    symbol: string;
    side: 'buy' | 'sell';
    amount: number;
    price: number;
  }) => {
    const { symbol, side, amount, price } = order;
    const totalCost = amount * price;

    if (side === 'buy') {
      if (totalCost > balance.free) {
        throw new Error('Insufficient balance');
      }

      // Update balance
      setBalance(prev => ({
        ...prev,
        free: prev.free - totalCost,
        total: prev.total - totalCost
      }));

      // Add position
      setPositions(prev => [...prev, {
        symbol,
        size: amount,
        entryPrice: price,
        currentPrice: price,
        pnl: 0,
        pnlPercentage: 0
      }]);
    } else {
      const position = positions.find(p => p.symbol === symbol);
      if (!position || position.size < amount) {
        throw new Error('Insufficient position size');
      }

      // Update balance
      setBalance(prev => ({
        ...prev,
        free: prev.free + totalCost,
        total: prev.total + totalCost
      }));

      // Update position
      setPositions(prev => prev.map(p => {
        if (p.symbol === symbol) {
          const newSize = p.size - amount;
          return newSize > 0 ? {
            ...p,
            size: newSize
          } : null;
        }
        return p;
      }).filter(Boolean) as Position[]);
    }
  };

  return {
    positions,
    balance,
    executeOrder
  };
};