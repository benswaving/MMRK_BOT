import React from 'react';
import { X } from 'lucide-react';

interface UserManualProps {
  onClose: () => void;
}

export const UserManual: React.FC<UserManualProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">User Manual</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            <section>
              <h3 className="text-xl font-semibold mb-3">Getting Started</h3>
              <p className="text-gray-300 mb-2">To start paper trading with real data:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-1">
                <li>Select your preferred trading pair from the available options</li>
                <li>Choose a timeframe for the chart (1m, 5m, 15m, 30m, 1h, 4h, 1d)</li>
                <li>Enable the technical indicators you want to use</li>
                <li>Monitor real-time market data and indicators</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3">Paper Trading</h3>
              <p className="text-gray-300 mb-2">You start with 10,000 USDT in your paper trading account. To place trades:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-1">
                <li>Use the Trading Controls panel to place buy/sell orders</li>
                <li>Monitor your positions in the Portfolio panel</li>
                <li>Track your performance and risk metrics</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3">Strategy Testing</h3>
              <p className="text-gray-300 mb-2">To test trading strategies:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-1">
                <li>Use pre-built strategies or create your own in the Strategy Builder</li>
                <li>Set your backtest parameters (date range, initial capital)</li>
                <li>Run the backtest to see performance metrics</li>
                <li>Enable auto-generated strategies for live paper trading</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3">Risk Management</h3>
              <p className="text-gray-300 mb-2">The system includes built-in risk management features:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-1">
                <li>Position sizing recommendations</li>
                <li>Stop-loss and take-profit calculations</li>
                <li>Portfolio risk monitoring</li>
                <li>Maximum drawdown controls</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3">Machine Learning Features</h3>
              <p className="text-gray-300 mb-2">The system includes AI-powered features:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-1">
                <li>Price prediction using LSTM neural networks</li>
                <li>Pattern recognition</li>
                <li>Automatic strategy optimization</li>
                <li>Market sentiment analysis</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};