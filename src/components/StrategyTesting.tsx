import React, { useState } from 'react';
import { Brain } from 'lucide-react';
import BacktestResults from './BacktestResults';
import { AutoStrategyControls } from './AutoStrategyControls';

const StrategyTesting: React.FC = () => {
  const [selectedStrategy, setSelectedStrategy] = useState('');
  const [backtestResults, setBacktestResults] = useState(null);
  const [isAutoTrading, setIsAutoTrading] = useState(false);

  const strategies = [
    { id: 'sma-cross', name: 'SMA Crossover' },
    { id: 'rsi-bounce', name: 'RSI Bounce' },
    { id: 'macd-cross', name: 'MACD Crossover' },
    { id: 'bollinger-bounce', name: 'Bollinger Bounce' }
  ];

  const handleStrategySelect = (strategyId: string) => {
    setSelectedStrategy(strategyId);
  };

  const handleBacktest = async () => {
    // Implement backtest logic here
    const results = {
      trades: [],
      metrics: {
        totalTrades: 0,
        winRate: 0,
        profitFactor: 0,
        sharpeRatio: 0,
        maxDrawdown: 0
      }
    };
    setBacktestResults(results);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <Brain className="w-6 h-6 text-blue-400" />
        <h2 className="text-xl font-semibold">Strategy Testing & Auto Trading</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Select Strategy</h3>
            <div className="space-y-2">
              {strategies.map((strategy) => (
                <button
                  key={strategy.id}
                  onClick={() => handleStrategySelect(strategy.id)}
                  className={`w-full text-left px-4 py-2 rounded ${
                    selectedStrategy === strategy.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {strategy.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Strategy Parameters</h3>
            <div className="space-y-2">
              <input
                type="number"
                placeholder="Initial Capital (USDT)"
                className="w-full bg-gray-700 rounded px-4 py-2"
                defaultValue={10000}
              />
              <input
                type="number"
                placeholder="Risk per trade (%)"
                className="w-full bg-gray-700 rounded px-4 py-2"
                defaultValue={1}
              />
            </div>
          </div>

          <button
            onClick={handleBacktest}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
          >
            Run Backtest
          </button>
        </div>

        <div>
          <BacktestResults results={backtestResults} />
        </div>
      </div>

      <div className="mt-6">
        <AutoStrategyControls />
      </div>
    </div>
  );
};

export default StrategyTesting;