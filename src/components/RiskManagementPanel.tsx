import React from 'react';
import { Shield } from 'lucide-react';
import type { Position, Balance } from '../types/trading';

interface RiskManagementPanelProps {
  positions: Position[];
  balances: Balance[];
  returns: number[];
}

export const RiskManagementPanel: React.FC<RiskManagementPanelProps> = ({
  positions,
  balances,
  returns,
}) => {
  const calculateMetrics = () => {
    const totalBalance = balances.reduce((sum, b) => sum + b.total, 0);
    const totalRisk = positions.reduce((sum, p) => sum + Math.abs(p.pnl), 0);
    const riskPercentage = (totalRisk / totalBalance) * 100;

    return {
      totalBalance,
      totalRisk,
      riskPercentage,
    };
  };

  const { totalBalance, riskPercentage } = calculateMetrics();

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
        <Shield className="w-5 h-5" />
        Risk Management
      </h2>

      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-2">
            Portfolio Risk
          </h3>
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm">Risk Level</span>
              <span
                className={`text-sm font-medium ${
                  riskPercentage < 10
                    ? 'text-green-400'
                    : riskPercentage < 20
                    ? 'text-yellow-400'
                    : 'text-red-400'
                }`}
              >
                {riskPercentage.toFixed(2)}%
              </span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  riskPercentage < 10
                    ? 'bg-green-400'
                    : riskPercentage < 20
                    ? 'bg-yellow-400'
                    : 'bg-red-400'
                }`}
                style={{ width: `${Math.min(riskPercentage, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-2">
            Position Sizing
          </h3>
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm">Recommended Size</span>
              <span className="text-sm font-medium">
                {(totalBalance * 0.02).toFixed(2)} USDT
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Based on 2% risk per trade
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-2">
            Stop Loss Settings
          </h3>
          <div className="space-y-2">
            {positions.map((position, index) => (
              <div
                key={index}
                className="bg-gray-700 p-3 rounded-lg flex justify-between items-center"
              >
                <span className="text-sm">{position.symbol}</span>
                <span className="text-sm font-medium text-red-400">
                  -{(position.entryPrice * 0.02).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};