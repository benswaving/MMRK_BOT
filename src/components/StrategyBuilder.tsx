import React, { useState } from 'react';
import { Plus, Trash2, Save, Coins } from 'lucide-react';
import { TOP_COINS } from '../services/kucoin/config';
import type { StrategyRule, StrategyCondition } from '../services/strategy/Strategy';

interface StrategyBuilderProps {
  onSave: (strategy: {
    name: string;
    description: string;
    parameters: { [key: string]: number };
    rules: StrategyRule[];
    symbols: string[];
  }) => void;
}

export const StrategyBuilder: React.FC<StrategyBuilderProps> = ({ onSave }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([]);
  const [parameters, setParameters] = useState({
    smaPeriod: 20,
    rsiPeriod: 14,
    macdFast: 12,
    macdSlow: 26,
    macdSignal: 9,
    bbPeriod: 20,
    bbStdDev: 2,
  });
  const [rules, setRules] = useState<StrategyRule[]>([]);

  const addRule = () => {
    setRules([
      ...rules,
      {
        type: 'entry',
        side: 'long',
        conditions: [],
        operator: 'and',
      },
    ]);
  };

  const removeRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const addCondition = (ruleIndex: number) => {
    const newRules = [...rules];
    newRules[ruleIndex].conditions.push({
      indicator: 'rsi',
      comparison: 'above',
      value: 50,
    });
    setRules(newRules);
  };

  const removeCondition = (ruleIndex: number, conditionIndex: number) => {
    const newRules = [...rules];
    newRules[ruleIndex].conditions = newRules[ruleIndex].conditions.filter(
      (_, i) => i !== conditionIndex
    );
    setRules(newRules);
  };

  const updateCondition = (
    ruleIndex: number,
    conditionIndex: number,
    updates: Partial<StrategyCondition>
  ) => {
    const newRules = [...rules];
    newRules[ruleIndex].conditions[conditionIndex] = {
      ...newRules[ruleIndex].conditions[conditionIndex],
      ...updates,
    };
    setRules(newRules);
  };

  const toggleSymbol = (symbol: string) => {
    setSelectedSymbols(prev => 
      prev.includes(symbol)
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    );
  };

  const handleSave = () => {
    if (selectedSymbols.length === 0) {
      alert('Please select at least one trading pair');
      return;
    }

    onSave({
      name,
      description,
      parameters,
      rules,
      symbols: selectedSymbols,
    });
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Strategy Builder</h3>

      <div className="space-y-4">
        {/* Basic Info */}
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Strategy Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-gray-700 rounded-lg px-3 py-2"
          />
          <textarea
            placeholder="Strategy Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-gray-700 rounded-lg px-3 py-2 h-24"
          />
        </div>

        {/* Trading Pairs Selection */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Coins className="text-blue-400" size={20} />
            <h4 className="font-medium">Trading Pairs</h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {TOP_COINS.map((symbol) => (
              <button
                key={symbol}
                onClick={() => toggleSymbol(symbol)}
                className={`p-2 rounded-lg text-sm ${
                  selectedSymbols.includes(symbol)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                {symbol}
              </button>
            ))}
          </div>
        </div>

        {/* Parameters */}
        <div className="space-y-2">
          <h4 className="font-medium">Parameters</h4>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(parameters).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm text-gray-400 mb-1">
                  {key}
                </label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setParameters({
                    ...parameters,
                    [key]: parseFloat(e.target.value),
                  })}
                  className="w-full bg-gray-700 rounded-lg px-3 py-2"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Rules */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Rules</h4>
            <button
              onClick={addRule}
              className="flex items-center gap-2 px-3 py-1 bg-blue-600 rounded-lg"
            >
              <Plus size={16} />
              Add Rule
            </button>
          </div>

          {rules.map((rule, ruleIndex) => (
            <div key={ruleIndex} className="bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <select
                    value={rule.type}
                    onChange={(e) => {
                      const newRules = [...rules];
                      newRules[ruleIndex].type = e.target.value as 'entry' | 'exit';
                      setRules(newRules);
                    }}
                    className="bg-gray-600 rounded-lg px-3 py-1"
                  >
                    <option value="entry">Entry</option>
                    <option value="exit">Exit</option>
                  </select>
                  <select
                    value={rule.side}
                    onChange={(e) => {
                      const newRules = [...rules];
                      newRules[ruleIndex].side = e.target.value as 'long' | 'short';
                      setRules(newRules);
                    }}
                    className="bg-gray-600 rounded-lg px-3 py-1"
                  >
                    <option value="long">Long</option>
                    <option value="short">Short</option>
                  </select>
                  <select
                    value={rule.operator}
                    onChange={(e) => {
                      const newRules = [...rules];
                      newRules[ruleIndex].operator = e.target.value as 'and' | 'or';
                      setRules(newRules);
                    }}
                    className="bg-gray-600 rounded-lg px-3 py-1"
                  >
                    <option value="and">AND</option>
                    <option value="or">OR</option>
                  </select>
                </div>
                <button
                  onClick={() => removeRule(ruleIndex)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="space-y-2">
                {rule.conditions.map((condition, conditionIndex) => (
                  <div key={conditionIndex} className="flex items-center gap-2">
                    <select
                      value={condition.indicator}
                      onChange={(e) => updateCondition(ruleIndex, conditionIndex, {
                        indicator: e.target.value,
                      })}
                      className="bg-gray-600 rounded-lg px-3 py-1"
                    >
                      <option value="rsi">RSI</option>
                      <option value="macd">MACD</option>
                      <option value="sma20">SMA 20</option>
                      <option value="sma50">SMA 50</option>
                      <option value="bbUpper">BB Upper</option>
                      <option value="bbLower">BB Lower</option>
                    </select>
                    <select
                      value={condition.comparison}
                      onChange={(e) => updateCondition(ruleIndex, conditionIndex, {
                        comparison: e.target.value as StrategyCondition['comparison'],
                      })}
                      className="bg-gray-600 rounded-lg px-3 py-1"
                    >
                      <option value="above">Above</option>
                      <option value="below">Below</option>
                      <option value="crosses_above">Crosses Above</option>
                      <option value="crosses_below">Crosses Below</option>
                    </select>
                    <input
                      type="number"
                      value={condition.value}
                      onChange={(e) => updateCondition(ruleIndex, conditionIndex, {
                        value: parseFloat(e.target.value),
                      })}
                      className="w-24 bg-gray-600 rounded-lg px-3 py-1"
                    />
                    <button
                      onClick={() => removeCondition(ruleIndex, conditionIndex)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addCondition(ruleIndex)}
                  className="flex items-center gap-2 px-3 py-1 bg-gray-600 rounded-lg text-sm"
                >
                  <Plus size={14} />
                  Add Condition
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 rounded-lg"
        >
          <Save size={18} />
          Save Strategy
        </button>
      </div>
    </div>
  );
};