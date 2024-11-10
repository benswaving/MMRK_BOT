import React from 'react';
import { Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface PortfolioOverviewProps {
  portfolio: {
    balance: number;
    positions: Array<{
      symbol: string;
      amount: number;
      value: number;
      pnl: number;
    }>;
  };
}

const PortfolioOverview: React.FC<PortfolioOverviewProps> = ({ portfolio }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Portfolio</h2>
        <Wallet className="w-5 h-5" />
      </div>

      <div className="bg-slate-700 p-4 rounded-lg">
        <span className="text-sm text-slate-300">Total Balance</span>
        <div className="text-2xl font-bold mt-1">
          ${portfolio.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Positions</h3>
        <div className="space-y-2">
          {portfolio.positions.map((position, index) => (
            <div key={index} className="bg-slate-700 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">{position.symbol}</span>
                <span>${position.value.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center mt-2 text-sm">
                <span className="text-slate-300">{position.amount}</span>
                <div className={`flex items-center ${position.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {position.pnl >= 0 ? (
                    <ArrowUpRight className="w-4 h-4 mr-1" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 mr-1" />
                  )}
                  {Math.abs(position.pnl)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PortfolioOverview;