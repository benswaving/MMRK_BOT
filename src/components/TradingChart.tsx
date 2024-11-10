import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, UTCTimestamp } from 'lightweight-charts';
import { OHLCV } from '../types/trading';
import { TimeframeSelector } from './TimeframeSelector';
import type { Timeframe } from '../services/kucoin/market';

interface ChartData {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface IndicatorState {
  sma20: boolean;
  sma50: boolean;
  sma200: boolean;
  bollinger: boolean;
  rsi: boolean;
  macd: boolean;
}

interface SeriesRefs {
  candlesticks?: ISeriesApi<'Candlestick'>;
  sma20?: ISeriesApi<'Line'>;
  sma50?: ISeriesApi<'Line'>;
  sma200?: ISeriesApi<'Line'>;
  bbUpper?: ISeriesApi<'Line'>;
  bbLower?: ISeriesApi<'Line'>;
  rsi?: ISeriesApi<'Line'>;
  macd?: ISeriesApi<'Line'>;
  signal?: ISeriesApi<'Line'>;
  histogram?: ISeriesApi<'Histogram'>;
}

interface TradingChartProps {
  data: OHLCV[];
  onTimeframeChange: (timeframe: Timeframe) => void;
  width?: number;
  height?: number;
}

const TradingChart: React.FC<TradingChartProps> = ({ 
  data, 
  onTimeframeChange,
  width = 800, 
  height = 400 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<SeriesRefs>({});
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>('1m');
  const [indicators, setIndicators] = useState<IndicatorState>({
    sma20: true,
    sma50: true,
    sma200: false,
    bollinger: true,
    rsi: false,
    macd: false
  });

  const initializeChart = useCallback(() => {
    if (!containerRef.current) return;

    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
      seriesRef.current = {};
    }

    const chart = createChart(containerRef.current, {
      width,
      height,
      layout: {
        background: { type: ColorType.Solid, color: '#1E293B' },
        textColor: '#D1D5DB',
      },
      grid: {
        vertLines: { color: '#334155' },
        horzLines: { color: '#334155' },
      },
      crosshair: {
        mode: 0,
      },
      rightPriceScale: {
        borderColor: '#334155',
      },
      timeScale: {
        borderColor: '#334155',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    const candlesticks = chart.addCandlestickSeries({
      upColor: '#22C55E',
      downColor: '#EF4444',
      borderVisible: false,
      wickUpColor: '#22C55E',
      wickDownColor: '#EF4444',
    });

    seriesRef.current.candlesticks = candlesticks;
  }, [width, height]);

  const validateAndTransformData = useCallback((rawData: OHLCV[]): ChartData[] => {
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

  const handleTimeframeChange = (timeframe: Timeframe) => {
    setSelectedTimeframe(timeframe);
    onTimeframeChange(timeframe);
  };

  useEffect(() => {
    initializeChart();
    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
        seriesRef.current = {};
      }
    };
  }, [initializeChart]);

  useEffect(() => {
    if (!data?.length || !seriesRef.current.candlesticks) return;

    const validData = validateAndTransformData(data);
    if (!validData.length) return;

    seriesRef.current.candlesticks?.setData(validData);
  }, [data, validateAndTransformData]);

  const handleIndicatorToggle = useCallback((indicator: keyof IndicatorState) => {
    setIndicators(prev => ({
      ...prev,
      [indicator]: !prev[indicator]
    }));
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-4 p-4 bg-slate-800 rounded-lg">
          {Object.entries(indicators).map(([key, value]) => (
            <label key={key} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={value}
                onChange={() => handleIndicatorToggle(key as keyof IndicatorState)}
                className="form-checkbox h-4 w-4 text-blue-600 rounded"
              />
              <span className="text-gray-200 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            </label>
          ))}
        </div>
        <TimeframeSelector
          selectedTimeframe={selectedTimeframe}
          onTimeframeChange={handleTimeframeChange}
        />
      </div>
      <div className="relative w-full h-full">
        <div ref={containerRef} className="w-full h-full" />
      </div>
    </div>
  );
};

export default TradingChart;