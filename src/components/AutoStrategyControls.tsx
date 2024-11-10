import React, { useState, useEffect } from 'react';
import { Brain, Play, Pause } from 'lucide-react';
import { useStrategyStore } from '../store/strategyStore';

export const AutoStrategyControls: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const { autoStrategies, generateStrategies, toggleStrategy } = useStrategyStore();

  const handleGenerate = async () => {
    setIsGenerating(true);
    await generateStrategies();
    setIsGenerating(false);
  };

  const handleToggleRun = () => {
    setIsRunning(!isRunning);
    autoStrategies.forEach(strategy => {
      toggleStrategy(strategy.id, !isRunning);
    });
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Auto-Generated Strategies</h3>
        <div className="flex gap-2">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              isGenerating
                ? 'bg-gray-700 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            } transition-colors`}
          >
            <Brain className="w-5 h-5" />
            {isGenerating ? 'Generating...' : 'Generate'}
          </button>
          <button
            onClick={handleToggleRun}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
            } transition-colors`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5" />
                Stop
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Run All
              </>
            )}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {autoStrategies.map(strategy => (
          <div
            key={strategy.id}
            className="flex items-center justify-between bg-gray-700 rounded-lg p-3"
          >
            <div>
              <h4 className="font-medium">{strategy.name}</h4>
              <p className="text-sm text-gray-400">{strategy.description}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="text-gray-400">Win Rate:</span>{' '}
                <span className="text-green-400">{strategy.winRate}%</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={strategy.isActive}
                  onChange={() => toggleStrategy(strategy.id, !strategy.isActive)}
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};