import type { MarketData, Balance, Position } from '../../types/trading';
import { KuCoinService } from '../kucoin/api';

class PaperTradingService {
  private static instance: PaperTradingService;
  private balances: Balance[] = [];
  private positions: Position[] = [];
  private kucoinService: KuCoinService;

  private constructor() {
    this.kucoinService = KuCoinService.getInstance();
    this.initializeDefaultBalance();
  }

  public static getInstance(): PaperTradingService {
    if (!PaperTradingService.instance) {
      PaperTradingService.instance = new PaperTradingService();
    }
    return PaperTradingService.instance;
  }

  private initializeDefaultBalance() {
    this.balances = [
      {
        asset: 'USDT',
        free: 10000,
        locked: 0,
        total: 10000,
      },
    ];
  }

  async getMarketData(symbol: string): Promise<MarketData> {
    // Use real market data from KuCoin for paper trading
    return this.kucoinService.getMarketData(symbol);
  }

  async getBalances(): Promise<Balance[]> {
    return this.balances;
  }

  async getPositions(): Promise<Position[]> {
    return this.positions;
  }

  async placeOrder(symbol: string, side: 'buy' | 'sell', size: number, price: number): Promise<void> {
    const marketData = await this.getMarketData(symbol);
    const baseAsset = symbol.split('/')[0];
    const quoteAsset = symbol.split('/')[1];
    
    const totalCost = size * price;
    
    if (side === 'buy') {
      const quoteBalance = this.balances.find(b => b.asset === quoteAsset);
      if (!quoteBalance || quoteBalance.free < totalCost) {
        throw new Error('Insufficient funds');
      }

      // Update balances
      quoteBalance.free -= totalCost;
      quoteBalance.total -= totalCost;

      // Add or update position
      const existingPosition = this.positions.find(p => p.symbol === symbol);
      if (existingPosition) {
        existingPosition.size += size;
        existingPosition.entryPrice = (existingPosition.entryPrice + price) / 2;
      } else {
        this.positions.push({
          symbol,
          size,
          entryPrice: price,
          currentPrice: marketData.price,
          pnl: 0,
          pnlPercentage: 0,
        });
      }
    } else {
      const position = this.positions.find(p => p.symbol === symbol);
      if (!position || position.size < size) {
        throw new Error('Insufficient position size');
      }

      // Update position
      position.size -= size;
      if (position.size === 0) {
        this.positions = this.positions.filter(p => p.symbol !== symbol);
      }

      // Update balances
      const quoteBalance = this.balances.find(b => b.asset === quoteAsset);
      if (quoteBalance) {
        quoteBalance.free += totalCost;
        quoteBalance.total += totalCost;
      } else {
        this.balances.push({
          asset: quoteAsset,
          free: totalCost,
          locked: 0,
          total: totalCost,
        });
      }
    }
  }
}