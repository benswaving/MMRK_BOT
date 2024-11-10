import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { MarketRecommendation, TechnicalAnalysis } from '../types/trading';

interface MarketAnalysisProps {
  analysis: TechnicalAnalysis;
  recommendations: MarketRecommendation[];
}

const MarketAnalysis: React.FC<MarketAnalysisProps> = ({ analysis, recommendations }) => {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'bullish':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'bearish':
        return <TrendingDown className="w-5 h-5 text-red-500" />;
      default:
        return <Minus className="w-5 h-5 text-gray-500" />;
    }
  };

  const getRecommendationColor = (recommendation: MarketRecommendation) => {
    switch (recommendation.action) {
      case 'buy':
        return 'text-green-500';
      case 'sell':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-4">Market Analysis</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-700 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Trend</span>
              {getTrendIcon(analysis.trend)}
            </div>
            <div className="mt-2">
              <span className="text-lg font-semibold capitalize">{analysis.trend}</span>
            </div>
          </div>
          <div className="bg-slate-700 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Strength</span>
            </div>
            <div className="mt-2">
              <span className="text-lg font-semibold">{analysis.strength}%</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Technical Indicators</h3>
        <div className="space-y-2">
          {analysis.signals.map((signal, index) => (
            <div key={index} className="bg-slate-700 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{signal.name}</span>
                <span className="text-sm">{signal.value}</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{signal.interpretation}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Recommendations</h3>
        <div className="space-y-2">
          {recommendations.map((rec, index) => (
            <div key={index} className="bg-slate-700 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium ${getRecommendationColor(rec)}`}>
                  {rec.action.toUpperCase()}
                </span>
                <span className="text-sm">{rec.confidence}%</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{rec.reason}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarketAnalysis;