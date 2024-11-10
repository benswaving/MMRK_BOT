export interface OHLCV {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface IndicatorValue {
  time: number;
  value: number;
}

export interface MACDResult {
  time: number;
  macd: number;
  signal: number;
  histogram: number;
}

export interface BBResult {
  time: number;
  upper: number;
  middle: number;
  lower: number;
}

export interface StochRSIResult {
  time: number;
  k: number;
  d: number;
}