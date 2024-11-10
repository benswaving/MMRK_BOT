import React from 'react';
import { Wallet } from 'lucide-react';
import type { Position, Balance } from '../types/trading';

interface PortfolioPanelProps {
  positions: Position[];
  balances: Balance[];
}

export const PortfolioPanel: React.FC<PortfolioPanelProps> = ({
  positions,
  balances,
}) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
        <Wallet className="w-5 h-5" />
        Portfolio
      </h2>

      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-2">Balances</h3>
          <div className="space-y-2">
            {balances.map((balance) => (
              <div
                key={balance.asset}
                className="flex justify-between items-center bg-gray-700 p-3 rounded-lg"
              >
                <span className="text-sm">{balance.asset}</span>
                <span className="text-sm font-medium">
                  {balance.free.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-2">
            Open Positions
          </h3>
          <div className="space-y-2">
            {positions.length === 0 ? (
              <p className="text-sm text-gray-400">No open positions</p>
            ) : (
              positions.map((position, index) => (
                <div
                  key={index}
                  className="bg-gray-700 p-3 rounded-lg space-y-1"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{position.symbol}</span>
                    <span
                      className={`text-sm font-medium ${
                        position.pnl >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {position.pnl.toFixed(2)} USDT
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <span>Size: {position.size}</span>
                    <span>Entry: {position.entryPrice}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};