import { stockCandlestickData } from './mockData';

export interface BacktestRequest {
  symbol: string;
  strategy: 'SMA_CROSSOVER' | 'RSI_OVERSOLD' | 'MEAN_REVERSION' | 'MACD';
  parameters: Record<string, number>;
  initialCapital: number;
}

export interface BacktestResult {
  totalReturn: number;
  totalReturnPercent: number;
  annualizedReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
  sortinoRatio: number;
  winRate: number;
  profitFactor: number;
  totalTrades: number;
  equityCurve: { time: string; value: number }[];
  trades: {
    entryTime: string;
    exitTime: string;
    entryPrice: number;
    exitPrice: number;
    shares: number;
    pnl: number;
    pnlPercent: number;
  }[];
}

/**
 * Programmatic Trading Engine
 * Handles signal generation, position management, and performance calculation
 */
export class BacktestEngine {
  /**
   * Run a backtest session
   */
  static run(req: BacktestRequest): BacktestResult {
    const data = stockCandlestickData[req.symbol];
    if (!data) throw new Error('Symbol not found');

    const { strategy, parameters, initialCapital } = req;
    let capital = initialCapital;
    let shares = 0;
    let entryPrice = 0;
    let entryTime = '';

    const equityCurve: { time: string; value: number }[] = [];
    const completedTrades: BacktestResult['trades'] = [];

    // Indicators logic
    const smaShort = this.calculateSMA(data, parameters.shortPeriod || 20);
    const smaLong = this.calculateSMA(data, parameters.longPeriod || 50);
    const rsi = this.calculateRSI(data, parameters.rsiPeriod || 14);

    // Main Simulation Loop
    for (let i = 0; i < data.length; i++) {
      const currentCandle = data[i];
      const prevCandle = data[i - 1];

      // Signal Generation
      let signal: 'BUY' | 'SELL' | 'NONE' = 'NONE';

      if (strategy === 'SMA_CROSSOVER') {
        if (prevCandle && smaShort[i - 1] <= smaLong[i - 1] && smaShort[i] > smaLong[i]) {
          signal = 'BUY';
        } else if (prevCandle && smaShort[i - 1] >= smaLong[i - 1] && smaShort[i] < smaLong[i]) {
          signal = 'SELL';
        }
      } else if (strategy === 'RSI_OVERSOLD') {
        const threshold = parameters.rsiBuyThreshold || 30;
        const sellThreshold = parameters.rsiSellThreshold || 70;
        if (rsi[i] < threshold) signal = 'BUY';
        else if (rsi[i] > sellThreshold) signal = 'SELL';
      } else if (strategy === 'MEAN_REVERSION') {
        const sma = smaShort[i];
        const deviation = (currentCandle.close - sma) / sma;
        if (deviation < -(parameters.deviationThreshold || 0.05)) signal = 'BUY';
        else if (deviation > (parameters.deviationThreshold || 0.05)) signal = 'SELL';
      }

      // Execution Logic
      if (signal === 'BUY' && shares === 0) {
        shares = Math.floor(capital / currentCandle.close);
        if (shares > 0) {
          entryPrice = currentCandle.close;
          entryTime = currentCandle.time as string;
          capital -= shares * entryPrice;
        }
      } else if (signal === 'SELL' && shares > 0) {
        const exitPrice = currentCandle.close;
        const pnl = (exitPrice - entryPrice) * shares;
        completedTrades.push({
          entryTime,
          exitTime: currentCandle.time as string,
          entryPrice,
          exitPrice,
          shares,
          pnl,
          pnlPercent: (pnl / (entryPrice * shares)) * 100
        });
        capital += shares * exitPrice;
        shares = 0;
      }

      const currentValue = capital + (shares * currentCandle.close);
      equityCurve.push({ time: currentCandle.time as string, value: +currentValue.toFixed(2) });
    }

    // Force close last position
    if (shares > 0) {
      const lastCandle = data[data.length - 1];
      const pnl = (lastCandle.close - entryPrice) * shares;
      completedTrades.push({
        entryTime,
        exitTime: lastCandle.time as string,
        entryPrice,
        exitPrice: lastCandle.close,
        shares,
        pnl,
        pnlPercent: (pnl / (entryPrice * shares)) * 100
      });
      capital += shares * lastCandle.close;
    }

    return this.calculateMetrics(initialCapital, equityCurve, completedTrades);
  }

  // ---- Advanced Technical Indicators ----

  private static calculateSMA(data: any[], period: number): number[] {
    const sma: number[] = new Array(data.length).fill(0);
    for (let i = period - 1; i < data.length; i++) {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j].close;
      }
      sma[i] = sum / period;
    }
    return sma;
  }

  private static calculateRSI(data: any[], period: number): number[] {
    const rsi: number[] = new Array(data.length).fill(50);
    let gains = 0;
    let losses = 0;

    for (let i = 1; i < period; i++) {
      const diff = data[i].close - data[i - 1].close;
      if (diff >= 0) gains += diff;
      else losses -= diff;
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    for (let i = period; i < data.length; i++) {
      const diff = data[i].close - data[i - 1].close;
      const currentGain = diff >= 0 ? diff : 0;
      const currentLoss = diff < 0 ? -diff : 0;

      avgGain = (avgGain * (period - 1) + currentGain) / period;
      avgLoss = (avgLoss * (period - 1) + currentLoss) / period;

      const rs = avgGain / avgLoss;
      rsi[i] = 100 - (100 / (1 + rs));
    }
    return rsi;
  }

  // ---- Performance Statistics ----

  private static calculateMetrics(initialCapital: number, equityCurve: any[], trades: any[]): BacktestResult {
    const finalValue = equityCurve[equityCurve.length - 1].value;
    const totalReturn = finalValue - initialCapital;
    const totalReturnPercent = (totalReturn / initialCapital) * 100;

    // Max Drawdown
    let peak = initialCapital;
    let maxDD = 0;
    equityCurve.forEach(p => {
      if (p.value > peak) peak = p.value;
      const dd = (peak - p.value) / peak;
      if (dd > maxDD) maxDD = dd;
    });

    // Sharpe Ratio (Simplified)
    const dailyReturns = [];
    for (let i = 1; i < equityCurve.length; i++) {
      dailyReturns.push((equityCurve[i].value - equityCurve[i - 1].value) / equityCurve[i - 1].value);
    }
    const avgReturn = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
    const stdDev = Math.sqrt(dailyReturns.map(x => Math.pow(x - avgReturn, 2)).reduce((a, b) => a + b, 0) / dailyReturns.length);
    const sharpeRatio = (avgReturn / stdDev) * Math.sqrt(252); // Annualized

    // Win Rate
    const wins = trades.filter(t => t.pnl > 0).length;
    const winRate = (wins / trades.length) * 100;

    // Profit Factor
    const grossProfit = trades.filter(t => t.pnl > 0).reduce((a, b) => a + b.pnl, 0);
    const grossLoss = Math.abs(trades.filter(t => t.pnl < 0).reduce((a, b) => a + b.pnl, 0));
    const profitFactor = grossProfit / (grossLoss || 1);

    return {
      totalReturn: +totalReturn.toFixed(2),
      totalReturnPercent: +totalReturnPercent.toFixed(2),
      annualizedReturn: +(totalReturnPercent * (252 / equityCurve.length)).toFixed(2),
      maxDrawdown: +(maxDD * 100).toFixed(2),
      sharpeRatio: +sharpeRatio.toFixed(2),
      sortinoRatio: +(sharpeRatio * 1.2).toFixed(2), // Mock sortino
      winRate: +winRate.toFixed(2),
      profitFactor: +profitFactor.toFixed(2),
      totalTrades: trades.length,
      equityCurve,
      trades
    };
  }
}
