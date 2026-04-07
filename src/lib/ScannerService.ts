export interface StockNode {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: number;
  volume: number;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
}

export interface MarketSector {
  id: string;
  name: string;
  performance: number;
  stocks: StockNode[];
  aiSignal: 'OVERWEIGHT' | 'UNDERWEIGHT' | 'NEUTRAL' | 'FOCUS';
  momentumScore: number;
}

export interface ScannerData {
  sectors: MarketSector[];
  lastUpdated: string;
  marketSentiment: number; // 0-100
}

export class ScannerService {
  private static sectors: MarketSector[] = this.generateMockScannerData();

  private static generateMockScannerData(): MarketSector[] {
    const sectorNames = [
      { name: 'Technology', stocks: ['AAPL', 'MSFT', 'NVDA', 'AMD', 'CRM', 'ORCL', 'ADBE'] },
      { name: 'Financials', stocks: ['JPM', 'BAC', 'GS', 'MS', 'V', 'MA'] },
      { name: 'Healthcare', stocks: ['PFE', 'JNJ', 'UNH', 'ABBV', 'MRK'] },
      { name: 'Consumer Cyclical', stocks: ['AMZN', 'TSLA', 'HD', 'MCD', 'NKE'] },
      { name: 'Communication Services', stocks: ['GOOGL', 'META', 'NFLX', 'DIS'] },
      { name: 'Energy', stocks: ['XOM', 'CVX', 'SLB', 'COP'] },
      { name: 'Utilities', stocks: ['NEE', 'DUK', 'SO'] },
      { name: 'Real Estate', stocks: ['PLD', 'AMT', 'CCI'] }
    ];

    const signals: Array<MarketSector['aiSignal']> = ['OVERWEIGHT', 'UNDERWEIGHT', 'NEUTRAL', 'FOCUS'];

    return sectorNames.map(s => {
      const performance = (Math.random() * 10) - 5; // -5% to +5%
      const stocks: StockNode[] = s.stocks.map(sym => {
        const stockPerf = performance + (Math.random() * 4 - 2);
        return {
          symbol: sym,
          name: sym === 'AAPL' ? 'Apple Inc.' : sym === 'TSLA' ? 'Tesla' : `${sym} Corp`,
          price: 50 + Math.random() * 500,
          change: parseFloat((stockPerf * 1.5).toFixed(2)),
          changePercent: parseFloat(stockPerf.toFixed(2)),
          marketCap: 50 + Math.random() * 2000, // In Billions
          volume: 1000000 + Math.random() * 50000000,
          sentiment: stockPerf > 1 ? 'BULLISH' : stockPerf < -1 ? 'BEARISH' : 'NEUTRAL'
        };
      });

      return {
        id: s.name.toLowerCase().replace(' ', '-'),
        name: s.name,
        performance: parseFloat(performance.toFixed(2)),
        stocks: stocks.sort((a, b) => b.marketCap - a.marketCap),
        aiSignal: signals[Math.floor(Math.random() * signals.length)],
        momentumScore: Math.floor(Math.random() * 100)
      };
    }).sort((a, b) => b.performance - a.performance);
  }

  static getScannerData(): ScannerData {
    return {
      sectors: this.sectors,
      lastUpdated: new Date().toLocaleTimeString(),
      marketSentiment: 62 // Mock market sentiment
    };
  }

  static getSectorByStock(symbol: string): MarketSector | undefined {
    return this.sectors.find(s => s.stocks.some(st => st.symbol === symbol));
  }

  static getAiSectorInsights() {
    return this.sectors.map(s => ({
      sector: s.name,
      signal: s.aiSignal,
      reason: this.getAiReason(s),
      score: s.momentumScore
    }));
  }

  private static getAiReason(sector: MarketSector): string {
    if (sector.performance > 2) return 'Strong institutional accumulation detected in large cap leaders.';
    if (sector.performance < -2) return 'Heavy distribution following technical breakdown of key support levels.';
    if (sector.aiSignal === 'FOCUS') return 'Unusual options activity and sentiment spike across multiple components.';
    if (sector.aiSignal === 'OVERWEIGHT') return 'Positive macro tailwinds and sector rotation favors this group.';
    return 'Consolidation phase with neutral flow dynamics.';
  }
}
