import React, { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';
import type { OrderBook } from '../services/types';

interface MarketDepthProps {
  data: OrderBook;
}

export const MarketDepth: React.FC<MarketDepthProps> = ({ data }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (chartContainerRef.current) {
      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: { color: '#1a1a1a' },
          textColor: '#d1d5db',
        },
        grid: {
          vertLines: { color: '#2d2d2d' },
          horzLines: { color: '#2d2d2d' },
        },
        width: chartContainerRef.current.clientWidth,
        height: 300,
      });

      const areaSeries = chart.addAreaSeries({
        topColor: 'rgba(76, 175, 80, 0.4)',
        bottomColor: 'rgba(76, 175, 80, 0.0)',
        lineColor: 'rgba(76, 175, 80, 1)',
        lineWidth: 2,
      });

      const bidsData = data.bids.map((bid, index) => ({
        value: bid.size,
        time: index,
      }));

      areaSeries.setData(bidsData);
      chartRef.current = chart;

      const handleResize = () => {
        if (chartContainerRef.current) {
          chart.applyOptions({
            width: chartContainerRef.current.clientWidth,
          });
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        chart.remove();
      };
    }
  }, [data]);

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Market Depth</h3>
      <div ref={chartContainerRef} className="w-full h-[300px]" />
    </div>
  );
};