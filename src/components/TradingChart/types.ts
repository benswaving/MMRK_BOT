import { IChartApi, ISeriesApi, UTCTimestamp } from 'lightweight-charts';
import { OHLCV } from '../../types/trading';

export interface IndicatorState {
  sma20: boolean;
  sma50: boolean;
  sma200: boolean;
  bollinger: boolean;
  rsi: boolean;
  macd: boolean;
}

export interface ChartData {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface SeriesRefs {
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

export interface TradingChartProps {
  data: OHLCV[];
  width?: number;
  height?: number;
}

export interface ChartContainerProps {
  width: number;
  height: number;
  onChartReady: (chart: IChartApi) => void;
}

export interface IndicatorControlsProps {
  indicators: IndicatorState;
  onToggle: (indicator: keyof IndicatorState) => void;
}