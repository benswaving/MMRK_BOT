import { OHLCV } from '../types/trading';

export const generateMockData = (length: number = 1000): OHLCV[] => {
  const data: OHLCV[] = [];
  let price = 50000; // Starting price
  let timestamp = Date.now() - (length * 60 * 1000); // Start from past

  for (let i = 0; i < length; i++) {
    const change = (Math.random() - 0.5) * 100;
    price += change;
    
    const high = price + Math.random() * 50;
    const low = price - Math.random() * 50;
    
    data.push({
      timestamp: timestamp + (i * 60 * 1000),
      open: price - change,
      high,
      low,
      close: price,
      volume: Math.random() * 100 + 50
    });
  }

  return data;
}