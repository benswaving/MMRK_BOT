import * as tf from '@tensorflow/tfjs';
import { OHLCV } from '../indicators/types';
import { Decimal } from 'decimal.js';

export class LSTMPredictor {
  private model: tf.LayersModel | null = null;
  private lookback = 60; // Number of time steps to look back
  private features = 5; // OHLCV features

  async buildModel(): Promise<void> {
    this.model = tf.sequential();
    
    this.model.add(tf.layers.lstm({
      units: 50,
      returnSequences: true,
      inputShape: [this.lookback, this.features],
    }));
    
    this.model.add(tf.layers.dropout({ rate: 0.2 }));
    this.model.add(tf.layers.lstm({ units: 30, returnSequences: false }));
    this.model.add(tf.layers.dropout({ rate: 0.2 }));
    this.model.add(tf.layers.dense({ units: 1 }));

    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
    });
  }

  async train(data: OHLCV[], epochs = 50): Promise<void> {
    if (!this.model) await this.buildModel();

    const { X, y } = this.prepareData(data);
    
    await this.model!.fit(X, y, {
      epochs,
      batchSize: 32,
      validationSplit: 0.2,
      shuffle: true,
    });
  }

  async predict(data: OHLCV[]): Promise<number> {
    if (!this.model) throw new Error('Model not trained');

    const { X } = this.prepareData(data.slice(-this.lookback));
    const prediction = this.model.predict(X) as tf.Tensor;
    
    return prediction.dataSync()[0];
  }

  private prepareData(data: OHLCV[]) {
    const X: number[][][] = [];
    const y: number[] = [];

    for (let i = this.lookback; i < data.length; i++) {
      const sequence = data.slice(i - this.lookback, i).map(d => [
        d.open,
        d.high,
        d.low,
        d.close,
        d.volume,
      ]);
      
      X.push(sequence);
      y.push(data[i].close);
    }

    return {
      X: tf.tensor3d(X),
      y: tf.tensor2d(y, [y.length, 1]),
    };
  }
}