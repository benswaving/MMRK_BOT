import React from 'react';
import type { OrderBook as OrderBookType } from '../services/types';

interface OrderBookProps {
  data: OrderBookType;
  maxRows?: number;
}

export const OrderBook: React.FC<OrderBookProps> = ({ data, maxRows = 10 }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Order Book</h3>
      
      <div className="grid grid-cols-3 gap-2 text-sm font-medium text-gray-400 mb-2">
        <div>Price</div>
        <div className="text-right">Size</div>
        <div className="text-right">Total</div>
      </div>

      <div className="space-y-4">
        {/* Asks (Sell orders) */}
        <div className="space-y-1">
          {data.asks.slice(0, maxRows).map((ask, i) => (
            <div key={i} className="grid grid-cols-3 gap-2 text-sm">
              <div className="text-red-400">${ask.price.toLocaleString()}</div>
              <div className="text-right">{ask.size.toLocaleString()}</div>
              <div className="text-right">
                ${(ask.price * ask.size).toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        {/* Spread */}
        <div className="border-t border-b border-gray-700 py-2 text-center text-sm text-gray-400">
          Spread: $
          {(data.asks[0]?.price - data.bids[0]?.price).toLocaleString()}
        </div>

        {/* Bids (Buy orders) */}
        <div className="space-y-1">
          {data.bids.slice(0, maxRows).map((bid, i) => (
            <div key={i} className="grid grid-cols-3 gap-2 text-sm">
              <div className="text-green-400">${bid.price.toLocaleString()}</div>
              <div className="text-right">{bid.size.toLocaleString()}</div>
              <div className="text-right">
                ${(bid.price * bid.size).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};