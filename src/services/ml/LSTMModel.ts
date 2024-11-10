import * as tf from '@tensorflow/tfjs';
import { OHLCV } from '../types';
import { FeatureEngineering } from './FeatureEngineering';

export class LSTMModel {
  private model: tf.LayersModel | null = null;
  private lookback: number = 50;
  private batchSize: number = 32;
  private epochs: number = 50;
  private trained: boolean = false;

  async build() {
    this.model = tf.sequential();

    // First LSTM layer with return sequences
    this.model.add(tf.layers.lstm({
      units: 50,
      returnSequences: true,
      inputShape: [this.lookback, 21], // Number of features
    }));
    this.model.add(tf.layers.dropout({ rate: 0.2 }));

    // Second LSTM layer
    this.model.add(tf.layers.lstm({
      units: 30,
      returnSequences: false,
    }));
    this.model.add(tf.layers.dropout({ rate: 0.2 }));

    // Dense layers
    this.model.add(tf.layers.dense({ units: 20, activation: 'relu' }));
    this.model.add(tf.layers.dense({ units: 1 }));

    // Compile model
    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mse'],
    });
  }

  async train(data: OHLCV[]) {
    if (!this.model) {
      await this.build();
    }

    // Engineer features
    const features = FeatureEngineering.engineerFeatures(data);
    
    // Prepare sequences
    const { sequences, targets } = this.prepareSequences(features);

    // Split data
    const splitIndex = Math.floor(sequences.length * 0.8);
    const trainSequences = sequences.slice(0, splitIndex);
    const trainTargets = targets.slice(0, splitIndex);
    const valSequences = sequences.slice(splitIndex);
    const valTargets = targets.slice(splitIndex);

    // Convert to tensors
    const trainX = tf.tensor3d(trainSequences);
    const trainY = tf.tensor2d(trainTargets, [trainTargets.length, 1]);
    const valX = tf.tensor3d(valSequences);
    const valY = tf.tensor2d(valTargets, [valTargets.length, 1]);

    // Train model
    await this.model!.fit(trainX, trainY, {
      epochs: this.epochs,
      batchSize: this.batchSize,
      validationData: [valX, valY],
      shuffle: true,
      callbacks: {
        onEpochEnd: async (epoch, logs) => {
          console.log(`Epoch ${epoch + 1}: loss = ${logs?.loss.toFixed(4)}, val_loss = ${logs?.val_loss.toFixed(4)}`);
        },
      },
    });

    this.trained = true;

    // Clean up tensors
    trainX.dispose();
    trainY.dispose();
    valX.dispose();
    valY.dispose();
  }

  async predict(data: OHLCV[]): Promise<number> {
    if (!this.model || !this.trained) {
      throw new Error('Model not trained');
    }

    // Engineer features
    const features = FeatureEngineering.engineerFeatures(data);
    
    // Prepare sequence
    const sequence = features.slice(-this.lookback);
    const input = tf.tensor3d([this.extractFeatures(sequence)]);

    // Make prediction
    const prediction = this.model.predict(input) as tf.Tensor;
    const result = prediction.dataSync()[0];

    // Clean up tensors
    input.dispose();
    prediction.dispose();

    return result;
  }

  private prepareSequences(features: any[]) {
    const sequences = [];
    const targets = [];

    for (let i = this.lookback; i < features.length; i++) {
      sequences.push(this.extractFeatures(features.slice(i - this.lookback, i)));
      targets.push(features[i].target);
    }

    return { sequences, targets };
  }

  private extractFeatures(sequence: any[]) {
    return sequence.map(feature => [
      feature.open,
      feature.high,
      feature.low,
      feature.close,
      feature.bodySize,
      feature.upperWick,
      feature.lowerWick,
      feature.totalRange,
      feature.bodyToRangeRatio,
      feature.sma20,
      feature.sma50,
      feature.rsi,
      feature.macd,
      feature.signal,
      feature.histogram,
      feature.bbUpper,
      feature.bbLower,
      feature.bbWidth,
      feature.volume,
      feature.volumeRatio,
      feature.volatility,
    ]);
  }

  async save(path: string) {
    if (!this.model) {
      throw new Error('No model to save');
    }
    await this.model.save(`localstorage://${path}`);
  }

  async load(path: string) {
    this.model = await tf.loadLayersModel(`localstorage://${path}`);
    this.trained = true;
  }
}