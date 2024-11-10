import { useState, useEffect } from 'react';
import { MarketDataService } from '../services/mockData/MarketDataService';
import type { OHLCV } from '../types/trading';

export const useMarketData = (symbol: string) => {
  const [marketData, setMarketData] = useState<OHLCV[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const marketService = MarketDataService.getInstance();

    const fetchHistoricalData = async () => {
      try {
        setIsLoading(true);
        const data = await marketService.getHistoricalData(symbol);
        if (mounted) {
          setMarketData(data);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError('Failed to fetch market data');
          console.error('Error fetching market data:', err);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    const initializeRealtimeData = async () => {
      const unsubscribe = await marketService.subscribeToRealtimeData(
        symbol,
        (newCandle) => {
          if (mounted) {
            setMarketData(prev => {
              const updated = [...prev.slice(-999), newCandle];
              return updated.sort((a, b) => a.timestamp - b.timestamp);
            });
          }
        }
      );

      return unsubscribe;
    };

    fetchHistoricalData();
    let unsubscribe: (() => void) | undefined;
    
    initializeRealtimeData().then(unsub => {
      unsubscribe = unsub;
    });

    return () => {
      mounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [symbol]);

  return { marketData, isLoading, error };
};