import React, { useCallback, useEffect, useRef, useState } from 'react';
import { IChartApi, UTCTimestamp } from 'lightweight-charts';
import { ChartData, IndicatorState, TradingChartProps } from './types';
import { useChartSeries } from './useChartSeries';
import IndicatorControls from './IndicatorControls';
import ChartContainer from './ChartContainer';

const TradingChart: React.FC<TradingChartProps> = ({ 
  data,
  width: initialWidth = 800,
  height: initialHeight = 400 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: initialWidth, height: initialHeight });
  const [indicators, setIndicators] = useState<IndicatorState>({
    sma20: true,
    sma50: true,
    sma200: false,
    bollinger: true,
    rsi: false,
    macd: false
  });

  const chartRef = useRef<IChartApi | null>(null);
  const { seriesRef, initializeSeries, removeSeries } = useChartSeries();

  // Update dimensions when container size changes
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height: height - 48 }); // Subtract indicator controls height
      }
    };

    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  const validateAndTransformData = useCallback((rawData: typeof data): ChartData[] => {
    return rawData
      .filter(candle => 
        candle.timestamp && 
        !isNaN(candle.timestamp) && 
        candle.open && 
        candle.high && 
        candle.low && 
        candle.close
      )
      .map(candle => ({
        time: Math.floor(candle.timestamp / 1000) as UTCTimestamp,
        open: Number(candle.open),
        high: Number(candle.high),
        low: Number(candle.low),
        close: Number(candle.close)
      }))
      .sort((a, b) => (a.time - b.time));
  }, []);

  const handleChartReady = useCallback((chart: IChartApi) => {
    chartRef.current = chart;
    initializeSeries(chart);
  }, [initializeSeries]);

  // Rest of the component remains the same...

  return (
    <div ref={containerRef} className="flex flex-col h-full bg-gray-800 rounded-lg p-4">
      <IndicatorControls 
        indicators={indicators}
        onToggle={handleIndicatorToggle}
      />
      <div className="flex-1 relative min-h-0 mt-4">
        <ChartContainer
          width={dimensions.width}
          height={dimensions.height}
          onChartReady={handleChartReady}
        />
      </div>
    </div>
  );
};

export default TradingChart;