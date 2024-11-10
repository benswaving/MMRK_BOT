export const KUCOIN_CONFIG = {
  apiUrl: 'https://api.kucoin.com',
  wsUrl: 'wss://ws-api.kucoin.com',
  apiKey: import.meta.env.VITE_KUCOIN_API_KEY,
  apiSecret: import.meta.env.VITE_KUCOIN_SECRET,
  apiPassphrase: import.meta.env.VITE_KUCOIN_PASSPHRASE,
  sandbox: false
};

export const TOP_COINS = [
  'BTC-USDT',
  'ETH-USDT',
  'BNB-USDT',
  'SOL-USDT',
  'XRP-USDT',
  'ADA-USDT',
  'AVAX-USDT',
  'DOGE-USDT',
  'DOT-USDT',
  'MATIC-USDT'
];

export const TIMEFRAMES = {
  '1m': '1min',
  '5m': '5min',
  '15m': '15min',
  '30m': '30min',
  '1h': '1hour',
  '4h': '4hour',
  '1d': '1day'
} as const;

export type Timeframe = keyof typeof TIMEFRAMES;