import React from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import TradingChart from './components/TradingChart';
import TradingControls from './components/TradingControls';
import MarketSelector from './components/MarketSelector';
import PortfolioView from './components/PortfolioView';
import StrategyTesting from './components/StrategyTesting';
import { UserManual } from './components/UserManual';

function App() {
  const [showManual, setShowManual] = React.useState(false);

  const handleExecuteOrder = () => {
    // Implement order execution logic
  };

  const handleUpdateStrategy = () => {
    // Implement strategy update logic
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-900 text-white">
        <header className="bg-gray-800 p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Crypto Trading Bot</h1>
          <button
            onClick={() => setShowManual(true)}
            className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded flex items-center gap-2"
          >
            <span className="hidden sm:inline">User Manual</span>
          </button>
        </header>

        <main className="container mx-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <div className="bg-gray-800 rounded-lg p-4 mb-4">
                <MarketSelector onSymbolChange={() => {}} selectedSymbol="BTC-USDT" />
                <TradingChart data={[]} />
                <TradingControls 
                  onExecuteOrder={handleExecuteOrder}
                  onUpdateStrategy={handleUpdateStrategy}
                />
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <StrategyTesting />
              </div>
            </div>
            <div className="lg:col-span-1">
              <PortfolioView />
            </div>
          </div>
        </main>

        {showManual && (
          <UserManual onClose={() => setShowManual(false)} />
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;