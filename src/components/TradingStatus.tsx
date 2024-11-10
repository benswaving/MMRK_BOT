import React from 'react';
import { Activity, AlertCircle } from 'lucide-react';

interface TradingStatusProps {
  status: {
    isTrading: boolean;
    mode: 'live' | 'paper';
    lastUpdate: number;
    activeStrategies: number;
    pendingOrders: number;
    errors: string[];
  };
}

export const TradingStatus: React.FC<TradingStatusProps> = ({ status }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="text-blue-400" />
        <h3 className="text-lg font-semibold">Trading Status</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-700 p-3 rounded-lg">
          <p className="text-sm text-gray-400 mb-1">Status</p>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              status.isTrading ? 'bg-green-400' : 'bg-red-400'
            }`} />
            <p className="font-medium">
              {status.isTrading ? 'Trading Active' : 'Trading Paused'}
            </p>
          </div>
        </div>

        <div className="bg-gray-700 p-3 rounded-lg">
          <p className="text-sm text-gray-400 mb-1">Mode</p>
          <p className={`font-medium ${
            status.mode === 'live' ? 'text-red-400' : 'text-blue-400'
          }`}>
            {status.mode.toUpperCase()}
          </p>
        </div>

        <div className="bg-gray-700 p-3 rounded-lg">
          <p className="text-sm text-gray-400 mb-1">Active Strategies</p>
          <p className="font-medium">{status.activeStrategies}</p>
        </div>

        <div className="bg-gray-700 p-3 rounded-lg">
          <p className="text-sm text-gray-400 mb-1">Pending Orders</p>
          <p className="font-medium">{status.pendingOrders}</p>
        </div>
      </div>

      {status.errors.length > 0 && (
        <div className="mt-4 bg-red-900/50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="text-red-400" />
            <h4 className="font-medium">Errors</h4>
          </div>
          <div className="space-y-1">
            {status.errors.map((error, index) => (
              <p key={index} className="text-sm text-red-400">
                {error}
              </p>
            ))}
          </div>
        </div>
      )}

      <p className="text-sm text-gray-400 mt-4">
        Last Update: {new Date(status.lastUpdate).toLocaleString()}
      </p>
    </div>
  );
}