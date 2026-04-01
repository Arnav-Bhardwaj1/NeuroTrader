import type { CandlestickData } from './types';

export type IndicatorType = 'SMA' | 'EMA' | 'RSI' | 'MACD';
export type Operator = '>' | '<' | 'CROSSES_ABOVE' | 'CROSSES_BELOW';

export interface StrategyRule {
  indicator: IndicatorType;
  period: number;
  operator: Operator;
  value: number; // For simple comparison or constant
}

export interface Strategy {
  name: string;
  entryRules: StrategyRule[];
  exitRules: StrategyRule[];
}

export interface Trade {
  type: 'BUY' | 'SELL';
  price: number;
  time: string;
  shares: number;
  total: number;
}

export interface BacktestResults {
  trades: Trade[];
  equityCurve: { time: string; value: number }[];
  totalReturn: number;
  totalReturnPercent: number;
  winRate: number;
  maxDrawdown: number;
  sharpeRatio: number;
}

/**
 * StrategyBacktester provides mathematical utilities for technical analysis
 * and a simulation engine for paper trading strategies.
 */
export class StrategyBacktester {
  /**
   * Simple Moving Average (SMA)
   */
  static sma(data: number[], period: number): number[] {
    const results: number[] = [];
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        results.push(NaN);
        continue;
      }
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      results.push(sum / period);
    }
    return results;
  }

  /**
   * Exponential Moving Average (EMA)
   */
  static ema(data: number[], period: number): number[] {
    const results: number[] = [];
    const multiplier = 2 / (period + 1);
    let previousEma = NaN;

    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        results.push(NaN);
        continue;
      }
      if (isNaN(previousEma)) {
        // First EMA is SMA
        previousEma = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
      } else {
        previousEma = (data[i] - previousEma) * multiplier + previousEma;
      }
      results.push(previousEma);
    }
    return results;
  }

  /**
   * Relative Strength Index (RSI)
   */
  static rsi(data: number[], period: number = 14): number[] {
    const results: number[] = [];
    let gains: number[] = [];
    let losses: number[] = [];

    for (let i = 1; i < data.length; i++) {
      const diff = data[i] - data[i - 1];
      gains.push(diff > 0 ? diff : 0);
      losses.push(diff < 0 ? Math.abs(diff) : 0);
    }

    let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
    let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

    for (let i = 0; i <= data.length; i++) {
      if (i <= period) {
        results.push(NaN);
        continue;
      }

      const currentGain = gains[i - 1];
      const currentLoss = losses[i - 1];

      avgGain = (avgGain * (period - 1) + currentGain) / period;
      avgLoss = (avgLoss * (period - 1) + currentLoss) / period;

      const rs = avgGain / avgLoss;
      const rsi = 100 - 100 / (1 + rs);
      results.push(rsi);
    }

    return results;
  }

  /**
   * Backtest a strategy against historical data
   */
  static runBacktest(
    data: CandlestickData[],
    strategy: Strategy,
    initialCapital: number = 100000
  ): BacktestResults {
    const prices = data.map((d) => d.close);
    const indicators: Record<string, number[]> = {};

    // Pre-calculate needed indicators
    const allRules = [...strategy.entryRules, ...strategy.exitRules];
    allRules.forEach((rule) => {
      const key = `${rule.indicator}_${rule.period}`;
      if (!indicators[key]) {
        if (rule.indicator === 'SMA') indicators[key] = this.sma(prices, rule.period);
        if (rule.indicator === 'EMA') indicators[key] = this.ema(prices, rule.period);
        if (rule.indicator === 'RSI') indicators[key] = this.rsi(prices, rule.period);
      }
    });

    let capital = initialCapital;
    let position = 0;
    const trades: Trade[] = [];
    const equityCurve: { time: string; value: number }[] = [];

    for (let i = 0; i < data.length; i++) {
      const currentPrice = data[i].close;
      const currentTime = data[i].time;

      // Check Entry
      if (position === 0) {
        const shouldBuy = strategy.entryRules.every((rule) => {
          const values = indicators[`${rule.indicator}_${rule.period}`];
          const val = values[i];
          const prevVal = values[i - 1];
          if (isNaN(val)) return false;

          switch (rule.operator) {
            case '>': return val > rule.value;
            case '<': return val < rule.value;
            case 'CROSSES_ABOVE': return val > rule.value && prevVal <= rule.value;
            case 'CROSSES_BELOW': return val < rule.value && prevVal >= rule.value;
            default: return false;
          }
        });

        if (shouldBuy) {
          position = Math.floor(capital / currentPrice);
          const cost = position * currentPrice;
          capital -= cost;
          trades.push({ type: 'BUY', price: currentPrice, time: currentTime as string, shares: position, total: cost });
        }
      }
      // Check Exit
      else {
        const shouldSell = strategy.exitRules.some((rule) => {
          const values = indicators[`${rule.indicator}_${rule.period}`];
          const val = values[i];
          const prevVal = values[i - 1];
          if (isNaN(val)) return false;

          switch (rule.operator) {
            case '>': return val > rule.value;
            case '<': return val < rule.value;
            case 'CROSSES_ABOVE': return val > rule.value && prevVal <= rule.value;
            case 'CROSSES_BELOW': return val < rule.value && prevVal >= rule.value;
            default: return false;
          }
        });

        if (shouldSell) {
          const revenue = position * currentPrice;
          capital += revenue;
          trades.push({ type: 'SELL', price: currentPrice, time: currentTime as string, shares: position, total: revenue });
          position = 0;
        }
      }

      equityCurve.push({
        time: currentTime as string,
        value: capital + position * currentPrice
      });
    }

    const finalValue = capital + position * currentPrice;
    const totalReturn = finalValue - initialCapital;

    // Performance metrics
    let wins = 0;
    let totalCompletedTrades = 0;
    for (let i = 0; i < trades.length - 1; i += 2) {
      if (trades[i + 1]) {
        totalCompletedTrades++;
        if (trades[i + 1].total > trades[i].total) wins++;
      }
    }

    let maxDrawdown = 0;
    let peak = initialCapital;
    equityCurve.forEach((p) => {
      if (p.value > peak) peak = p.value;
      const dd = (peak - p.value) / peak;
      if (dd > maxDrawdown) maxDrawdown = dd;
    });

    return {
      trades,
      equityCurve,
      totalReturn,
      totalReturnPercent: (totalReturn / initialCapital) * 100,
      winRate: totalCompletedTrades > 0 ? (wins / totalCompletedTrades) * 100 : 0,
      maxDrawdown: maxDrawdown * 100,
      sharpeRatio: 1.5 // Mock for now
    };
  }
}
