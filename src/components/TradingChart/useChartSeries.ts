import { useCallback, useRef } from 'react';
import { IChartApi, ISeriesApi } from 'lightweight-charts';
import { SeriesRefs } from './types';

export const useChartSeries = () => {
  const seriesRef = useRef<SeriesRefs>({});

  const initializeSeries = useCallback((chart: IChartApi) => {
    // Clear existing series
    Object.values(seriesRef.current).forEach(series => {
      if (series) {
        try {
          chart.removeSeries(series);
        } catch (error) {
          console.warn('Failed to remove series:', error);
        }
      }
    });
    seriesRef.current = {};

    // Initialize candlestick series
    const candlesticks = chart.addCandlestickSeries({
      upColor: '#22C55E',
      downColor: '#EF4444',
      borderVisible: false,
      wickUpColor: '#22C55E',
      wickDownColor: '#EF4444',
    });

    seriesRef.current.candlesticks = candlesticks;
    return seriesRef.current;
  }, []);

  const removeSeries = useCallback((chart: IChartApi, series?: ISeriesApi<any>) => {
    if (series && chart) {
      try {
        chart.removeSeries(series);
      } catch (error) {
        console.warn('Failed to remove series:', error);
      }
    }
  }, []);

  return {
    seriesRef,
    initializeSeries,
    removeSeries,
  };
};