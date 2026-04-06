import { format, subDays, startOfDay } from 'date-fns';

export interface TradeEntry {
  id: string;
  symbol: string;
  type: 'LONG' | 'SHORT';
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  entryTime: string;
  exitTime: string;
  pnl: number;
  pnlPercentage: number;
  status: 'WIN' | 'LOSS';
  setup: string;
  notes: string;
  tags: string[];
}

export interface JournalStats {
  totalPnL: number;
  winRate: number;
  profitFactor: number;
  averageWin: number;
  averageLoss: number;
  expectancy: number;
  totalTrades: number;
  maxDrawdown: number;
  recoveryFactor: number;
}

export interface PsychologyInsight {
  title: string;
  description: string;
  score: number;
  type: 'STRENGTH' | 'WEEKNESS' | 'NEUTRAL';
}

const PSYCHOLOGY_INSIGHTS: PsychologyInsight[] = [
  {
    title: 'Discipline Master',
    description: 'You stuck to your plan on 90% of trades this week. High emotional regulation detected.',
    score: 95,
    type: 'STRENGTH'
  },
  {
    title: 'FOMO Alert',
    description: 'Several entries were made after a significant move already occurred. Practice patience.',
    score: 45,
    type: 'WEEKNESS'
  },
  {
    title: 'Early Exit Pattern',
    description: 'You tend to close winning trades before they reach profit targets. Let your winners run.',
    score: 60,
    type: 'WEEKNESS'
  },
  {
    title: 'Risk Management',
    description: 'Stop losses are consistently placed and respected. Your capital preservation is excellent.',
    score: 88,
    type: 'STRENGTH'
  },
  {
    title: 'Revenge Trading Risk',
    description: 'Detected multiple quick entries after a loss. Take a 15-minute break after a red trade.',
    score: 30,
    type: 'WEEKNESS'
  }
];

export class JournalService {
  private static trades: TradeEntry[] = this.generateMockTrades();

  private static generateMockTrades(): TradeEntry[] {
    const symbols = ['AAPL', 'TSLA', 'NVDA', 'BTC/USD', 'ETH/USD', 'AMD', 'MSFT'];
    const setups = ['Breakout', 'Mean Reversion', 'Trend Following', 'Gap Fill', 'Fibonacci Retracement'];
    const trades: TradeEntry[] = [];

    for (let i = 0; i < 20; i++) {
      const entryTime = subDays(new Date(), Math.floor(Math.random() * 30));
      const exitTime = new Date(entryTime.getTime() + Math.random() * 3600000 * 4); // 1-4 hours later
      const entryPrice = 100 + Math.random() * 1000;
      const isWin = Math.random() > 0.45;
      const pnlPercentage = isWin ? (0.5 + Math.random() * 5) : -(0.5 + Math.random() * 3);
      const pnl = (entryPrice * pnlPercentage) / 100 * 10; // Assuming 10 shares for mock

      trades.push({
        id: Math.random().toString(36).substr(2, 9),
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        type: Math.random() > 0.5 ? 'LONG' : 'SHORT',
        entryPrice: parseFloat(entryPrice.toFixed(2)),
        exitPrice: parseFloat((entryPrice * (1 + pnlPercentage / 100)).toFixed(2)),
        quantity: 10,
        entryTime: format(entryTime, 'yyyy-MM-dd HH:mm'),
        exitTime: format(exitTime, 'yyyy-MM-dd HH:mm'),
        pnl: parseFloat(pnl.toFixed(2)),
        pnlPercentage: parseFloat(pnlPercentage.toFixed(2)),
        status: isWin ? 'WIN' : 'LOSS',
        setup: setups[Math.floor(Math.random() * setups.length)],
        notes: 'Simulated trade for analysis.',
        tags: ['Automated', 'Test']
      });
    }

    return trades.sort((a, b) => new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime());
  }

  static getTrades(): TradeEntry[] {
    return this.trades;
  }

  static getStats(): JournalStats {
    const wins = this.trades.filter(t => t.status === 'WIN');
    const losses = this.trades.filter(t => t.status === 'LOSS');

    const totalPnL = this.trades.reduce((acc, t) => acc + t.pnl, 0);
    const winRate = (wins.length / this.trades.length) * 100;

    const grossProfit = wins.reduce((acc, t) => acc + t.pnl, 0);
    const grossLoss = Math.abs(losses.reduce((acc, t) => acc + t.pnl, 0));
    const profitFactor = grossLoss === 0 ? grossProfit : grossProfit / grossLoss;

    const averageWin = wins.length === 0 ? 0 : grossProfit / wins.length;
    const averageLoss = losses.length === 0 ? 0 : grossLoss / losses.length;

    // Expectancy = (Win% * AvgWin) - (Loss% * AvgLoss)
    const expectancy = (winRate / 100 * averageWin) - ((1 - winRate / 100) * averageLoss);

    return {
      totalPnL: parseFloat(totalPnL.toFixed(2)),
      winRate: parseFloat(winRate.toFixed(1)),
      profitFactor: parseFloat(profitFactor.toFixed(2)),
      averageWin: parseFloat(averageWin.toFixed(2)),
      averageLoss: parseFloat(averageLoss.toFixed(2)),
      expectancy: parseFloat(expectancy.toFixed(2)),
      totalTrades: this.trades.length,
      maxDrawdown: 12.5, // Mocked
      recoveryFactor: 2.1 // Mocked
    };
  }

  static getAiInsight(): PsychologyInsight {
    // Return a random insight based on win rate for a sense of "intelligence"
    const stats = this.getStats();
    if (stats.winRate > 60) {
      return PSYCHOLOGY_INSIGHTS[0]; // Discipline Master
    } else if (stats.winRate < 40) {
      return PSYCHOLOGY_INSIGHTS[4]; // Revenge Trading
    }
    return PSYCHOLOGY_INSIGHTS[Math.floor(Math.random() * PSYCHOLOGY_INSIGHTS.length)];
  }

  static getEquityCurve() {
    let balance = 10000;
    return this.trades.slice().reverse().map(t => {
      balance += t.pnl;
      return {
        time: t.exitTime,
        value: balance
      };
    });
  }
}
