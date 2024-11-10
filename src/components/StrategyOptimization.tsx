import React from 'react';
import { Settings, TrendingUp, BarChart2, RefreshCw } from 'lucide-react';
import { StrategyEvolution } from '../services/strategy/StrategyEvolution';

interface StrategyOptimizationProps {
  strategyId: string;
}

export const StrategyOptimization: React.FC<StrategyOptimizationProps> = ({ strategyId }) => {
  const evolution = StrategyEvolution.getInstance();
  const performanceHistory = evolution.getPerformanceHistory(strategyId);
  const latestPerformance = evolution.getLatestPerformance(strategyId);

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Settings className="text-blue-400" />
          <h3 className="text-lg font-semibold">Strategy Optimization</h3>
        </div>
        <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
          <RefreshCw size={20} />
        </button>
      </div>

      {latestPerformance && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-700 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="text-green-400" />
              <h4 className="font-medium">Performance Metrics</h4>
            </div>
            <div className="space-y-1">
              <p className="text-sm">
                Win Rate: {latestPerformance.metrics.winRate.toFixed(1)}%
              </p>
              <p className="text-sm">
                Sharpe Ratio: {latestPerformance.metrics.sharpeRatio.toFixed(2)}
              </p>
              <p className="text-sm">
                Max Drawdown: {latestPerformance.metrics.maxDrawdown.toFixed(2)}%
              </p>
            </div>
          </div>

          <div className="bg-gray-700 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <BarChart2 className="text-blue-400" />
              <h4 className="font-medium">Current Parameters</h4>
            </div>
            <div className="space-y-1">
              {Object.entries(latestPerformance.parameters).map(([key, value]) => (
                <p key={key} className="text-sm">
                  {key}: {typeof value === 'number' ? value.toFixed(2) : value}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h4 className="font-medium">Performance History</h4>
        <div className="space-y-2">
          {performanceHistory.map((performance, index) => (
            <div
              key={index}
              className="bg-gray-700 p-3 rounded-lg flex items-center justify-between"
            >
              <div>
                <p className="text-sm text-gray-400">
                  {new Date(performance.timestamp).toLocaleString()}
                </p>
                <p className="font-medium">
                  Win Rate: {performance.metrics.winRate.toFixed(1)}%
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Sharpe Ratio</p>
                <p className="font-medium">
                  {performance.metrics.sharpeRatio.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};