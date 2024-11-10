import { LSTMModel } from './LSTMModel';
import { FeatureEngineering } from './FeatureEngineering';
import { MarketService } from '../kucoin/market';
import { OHLCV } from '../types';

export class PredictionService {
  private static instance: PredictionService;
  private initialized: boolean = false;
  private models: Map<string, LSTMModel> = new Map();
  private marketService: MarketService;

  private constructor() {
    this.marketService = MarketService.getInstance();
  }

  static getInstance(): PredictionService {
    if (!PredictionService.instance) {
      PredictionService.instance = new PredictionService();
    }
    return PredictionService.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    // Initialize models for each symbol
    const symbols = ['BTC-USDT', 'ETH-USDT', 'SOL-USDT'];
    
    for (const symbol of symbols) {
      const model = new LSTMModel();
      await model.build();
      this.models.set(symbol, model);
      
      // Train with historical data
      const historicalData = await this.marketService.getHistoricalData(symbol);
      await model.train(historicalData);
    }
    
    this.initialized = true;
  }

  async getPrediction(symbol: string): Promise<{
    predictedPrice: number;
    confidence: number;
  }> {
    if (!this.initialized) {
      throw new Error('PredictionService not initialized');
    }

    const model = this.models.get(symbol);
    if (!model) {
      throw new Error(`No model available for ${symbol}`);
    }

    // Get recent data for prediction
    const recentData = await this.marketService.getHistoricalData(symbol);
    const prediction = await model.predict(recentData);
    
    // Calculate confidence based on model metrics
    const confidence = Math.min(85, 70 + Math.random() * 20); // Mock confidence score

    return {
      predictedPrice: prediction,
      confidence
    };
  }

  isModelTrained(): boolean {
    return this.initialized;
  }

  async trainModel(symbol: string): Promise<void> {
    const model = this.models.get(symbol);
    if (!model) {
      throw new Error(`No model available for ${symbol}`);
    }

    const historicalData = await this.marketService.getHistoricalData(symbol);
    await model.train(historicalData);
  }
}