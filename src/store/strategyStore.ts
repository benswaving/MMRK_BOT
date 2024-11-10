import { create } from 'zustand';
import { AutoStrategyGenerator } from '../services/strategy/AutoStrategyGenerator';

interface AutoStrategy {
  id: string;
  name: string;
  description: string;
  winRate: number;
  isActive: boolean;
}

interface StrategyStore {
  autoStrategies: AutoStrategy[];
  generateStrategies: () => Promise<void>;
  toggleStrategy: (id: string, isActive: boolean) => void;
}

export const useStrategyStore = create<StrategyStore>((set) => ({
  autoStrategies: [],
  generateStrategies: async () => {
    const generator = AutoStrategyGenerator.getInstance();
    const strategies = await generator.generateStrategies('BTC-USDT');
    
    const autoStrategies = strategies.map((strategy, index) => ({
      id: `auto-strategy-${index}`,
      name: strategy.name,
      description: strategy.description,
      winRate: Math.round(70 + Math.random() * 15), // Mock win rate for demo
      isActive: false
    }));

    set({ autoStrategies });
  },
  toggleStrategy: (id: string, isActive: boolean) => {
    set((state) => ({
      autoStrategies: state.autoStrategies.map((strategy) =>
        strategy.id === id ? { ...strategy, isActive } : strategy
      ),
    }));
  },
}));