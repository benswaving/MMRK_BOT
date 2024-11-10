import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { MarketData } from '../types/trading';

interface MarketOverviewProps {
  data: MarketData[];
}

export const MarketOverview: React.FC<MarketOverviewProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.map((market) => (
        <div
          key={market.symbol}
          className="bg-gray-800 p-4 rounded-lg flex items-center justify-between"
        >
          <div>
            <h3 className="text-lg font-semibold text-white">{market.symbol}</h3>
            <p className="text-2xl font-bold text-white">
              ${market.price.toLocaleString()}
            </p>
          </div>
          <div className={`flex items-center ${
            market.change24h >= 0 ? 'text-green-500' : 'text-red-500'
          }`}>
            {market.change24h >= 0 ? (
              <TrendingUp size={24} />
            ) : (
              <TrendingDown size={24} />
            )}
            <span className="ml-2 text-lg font-semibold">
              {Math.abs(market.change24h).toFixed(2)}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};