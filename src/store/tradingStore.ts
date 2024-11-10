import { create } from 'zustand';
import type { Position, Balance } from '../types/trading';

interface TradingStore {
  mode: 'live' | 'paper';
  isTrading: boolean;
  positions: Position[];
  balances: Balance[];
  selectedSymbol: string;
  setMode: (mode: 'live' | 'paper') => void;
  toggleTrading: () => void;
  setPositions: (positions: Position[]) => void;
  setBalances: (balances: Balance[]) => void;
  setSelectedSymbol: (symbol: string) => void;
}

export const useTradingStore = create<TradingStore>((set) => ({
  mode: 'paper',
  isTrading: false,
  positions: [],
  balances: [{
    asset: 'USDT',
    free: 10000,
    locked: 0,
    total: 10000
  }],
  selectedSymbol: 'BTC-USDT',
  setMode: (mode) => set({ mode }),
  toggleTrading: () => set((state) => ({ isTrading: !state.isTrading })),
  setPositions: (positions) => set({ positions }),
  setBalances: (balances) => set({ balances }),
  setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol }),
}));