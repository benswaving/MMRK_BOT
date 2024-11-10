import React from 'react';
import { Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface Trade {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  price: number;
  size: number;
  timestamp: number;
}

interface TradeHistoryProps {
  trades: Trade[];
}

export const TradeHistory: React.FC<TradeHistoryProps> = ({ trades }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Trade History</h3>
      
      <div className="space-y-2">
        {trades.map((trade) => (
          <div
            key={trade.id}
            className="flex items-center justify-between p-2 bg-gray-700 rounded-lg"
          >
            <div className="flex items-center gap-3">
              {trade.side === 'buy' ? (
                <ArrowUpRight
                  size={20}
                  className="text-green-400"
                />
              ) : (
                <ArrowDownRight
                  size={20}
                  className="text-red-400"
                />
              )}
              
              <div>
                <p className="font-medium">{trade.symbol}</p>
                <p className="text-sm text-gray-400">
                  {trade.size} @ ${trade.price.toLocaleString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-gray-400">
              <Clock size={16} />
              <span className="text-sm">
                {new Date(trade.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};