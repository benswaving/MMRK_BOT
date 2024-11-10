import React from 'react';
import { TrendingUp, TrendingDown, Clock, DollarSign } from 'lucide-react';

interface Trade {
  symbol: string;
  entryPrice: number;
  exitPrice: number;
  size: number;
  pnl: number;
  entryTime: number;
  exitTime: number;
}

interface BacktestResultsProps {
  results: {
    trades: Trade[];
    metrics: {
      totalTrades: number;
      winRate: number;
      profitFactor: number;
      sharpeRatio: number;
      maxDrawdown: number;
    };
  } | null;
}

const BacktestResults: React.FC<BacktestResultsProps> = ({ results }) => {
  if (!results) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg">
        <p className="text-gray-400">Run a backtest to see results</p>
      </div>
    );
  }

  const { trades, metrics } = results;

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Backtest Results</h3>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-700 p-3 rounded-lg">
          <p className="text-sm text-gray-400 mb-1">Total Trades</p>
          <p className="text-xl font-bold">{metrics.totalTrades}</p>
        </div>

        <div className="bg-gray-700 p-3 rounded-lg">
          <p className="text-sm text-gray-400 mb-1">Win Rate</p>
          <div className="flex items-center gap-2">
            {metrics.winRate >= 50 ? (
              <TrendingUp className="text-green-400" />
            ) : (
              <TrendingDown className="text-red-400" />
            )}
            <p className="text-xl font-bold">{metrics.winRate.toFixed(2)}%</p>
          </div>
        </div>

        <div className="bg-gray-700 p-3 rounded-lg">
          <p className="text-sm text-gray-400 mb-1">Profit Factor</p>
          <p className="text-xl font-bold">{metrics.profitFactor.toFixed(2)}</p>
        </div>

        <div className="bg-gray-700 p-3 rounded-lg">
          <p className="text-sm text-gray-400 mb-1">Sharpe Ratio</p>
          <p className="text-xl font-bold">{metrics.sharpeRatio.toFixed(2)}</p>
        </div>

        <div className="bg-gray-700 p-3 rounded-lg">
          <p className="text-sm text-gray-400 mb-1">Max Drawdown</p>
          <p className="text-xl font-bold text-red-400">
            {metrics.maxDrawdown.toFixed(2)}%
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold">Trade History</h4>
        <div className="space-y-2">
          {trades.map((trade, index) => (
            <div
              key={index}
              className="bg-gray-700 p-3 rounded-lg flex justify-between items-center"
            >
              <div>
                <p className="text-sm text-gray-400">
                  {new Date(trade.entryTime).toLocaleString()}
                </p>
                <p className="font-medium">{trade.symbol}</p>
              </div>
              <div className="text-right">
                <p className={`font-bold ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${trade.pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-gray-400">
                  {trade.size} @ ${trade.entryPrice.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BacktestResults;