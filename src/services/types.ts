export interface OHLCV {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketData {
  symbol: string;
  price: number;
  volume: number;
  timestamp: number;
}

export interface OrderBook {
  asks: Array<{ price: number; size: number }>;
  bids: Array<{ price: number; size: number }>;
  timestamp: number;
}

export interface Position {
  symbol: string;
  size: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercentage: number;
}

export interface Balance {
  asset: string;
  free: number;
  locked: number;
  total: number;
}