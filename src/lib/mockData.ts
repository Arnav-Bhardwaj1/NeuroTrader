import type { Stock, CandlestickData, Holding, Transaction, MarketIndex, Signal, SectorPerformance } from '../types';

// ---- Generate realistic candlestick data ----
function generateCandlestickData(basePrice: number, days: number, volatility: number = 0.02): CandlestickData[] {
  const data: CandlestickData[] = [];
  let currentPrice = basePrice * 0.85;
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const change = (Math.random() - 0.48) * volatility * currentPrice;
    const open = currentPrice;
    const close = open + change;
    const high = Math.max(open, close) + Math.random() * volatility * currentPrice * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * currentPrice * 0.5;
    const volume = Math.floor(Math.random() * 50000000) + 10000000;

    data.push({
      time: date.toISOString().split('T')[0],
      open: +open.toFixed(2),
      high: +high.toFixed(2),
      low: +low.toFixed(2),
      close: +close.toFixed(2),
      volume,
    });
    currentPrice = close;
  }
  return data;
}

// ---- Stocks ----
export const stocks: Stock[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 213.25, change: 3.42, changePercent: 1.63, volume: 54200000, marketCap: '3.28T', pe: 33.2, high52w: 237.23, low52w: 164.08, sector: 'Technology' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 171.83, change: -1.27, changePercent: -0.73, volume: 28100000, marketCap: '2.13T', pe: 25.1, high52w: 191.75, low52w: 130.67, sector: 'Technology' },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.42, change: 8.91, changePercent: 3.72, volume: 112300000, marketCap: '789B', pe: 68.4, high52w: 278.98, low52w: 138.80, sector: 'Automotive' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 428.50, change: 2.15, changePercent: 0.50, volume: 22500000, marketCap: '3.18T', pe: 36.8, high52w: 468.35, low52w: 362.90, sector: 'Technology' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 875.30, change: 22.45, changePercent: 2.63, volume: 45800000, marketCap: '2.16T', pe: 65.2, high52w: 974.00, low52w: 473.20, sector: 'Technology' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 186.40, change: -0.85, changePercent: -0.45, volume: 38200000, marketCap: '1.94T', pe: 58.3, high52w: 201.20, low52w: 151.61, sector: 'Consumer' },
  { symbol: 'META', name: 'Meta Platforms', price: 523.60, change: 6.30, changePercent: 1.22, volume: 18900000, marketCap: '1.33T', pe: 28.7, high52w: 542.81, low52w: 390.42, sector: 'Technology' },
  { symbol: 'JPM', name: 'JPMorgan Chase', price: 198.75, change: 1.45, changePercent: 0.73, volume: 9800000, marketCap: '571B', pe: 11.8, high52w: 210.58, low52w: 165.20, sector: 'Finance' },
  { symbol: 'V', name: 'Visa Inc.', price: 282.30, change: -0.95, changePercent: -0.34, volume: 7200000, marketCap: '574B', pe: 30.5, high52w: 295.70, low52w: 252.70, sector: 'Finance' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', price: 156.40, change: 0.89, changePercent: 0.57, volume: 6500000, marketCap: '377B', pe: 15.2, high52w: 168.85, low52w: 143.13, sector: 'Healthcare' },
  { symbol: 'WMT', name: 'Walmart Inc.', price: 168.20, change: 1.10, changePercent: 0.66, volume: 8100000, marketCap: '451B', pe: 28.4, high52w: 175.50, low52w: 149.40, sector: 'Consumer' },
  { symbol: 'XOM', name: 'Exxon Mobil', price: 113.80, change: -2.30, changePercent: -1.98, volume: 15200000, marketCap: '454B', pe: 13.5, high52w: 123.75, low52w: 95.77, sector: 'Energy' },
];

// ---- Candlestick data per stock ----
export const stockCandlestickData: Record<string, CandlestickData[]> = {};
stocks.forEach((stock) => {
  stockCandlestickData[stock.symbol] = generateCandlestickData(stock.price, 365, stock.symbol === 'TSLA' || stock.symbol === 'NVDA' ? 0.035 : 0.02);
});

// ---- Market Indices ----
export const marketIndices: MarketIndex[] = [
  { name: 'S&P 500', value: 5234.18, change: 28.45, changePercent: 0.55, sparkline: [5180, 5195, 5210, 5190, 5220, 5205, 5234] },
  { name: 'NASDAQ', value: 16428.82, change: 112.30, changePercent: 0.69, sparkline: [16200, 16280, 16350, 16290, 16380, 16350, 16429] },
  { name: 'DOW', value: 39475.90, change: -45.20, changePercent: -0.11, sparkline: [39550, 39520, 39490, 39510, 39480, 39500, 39476] },
  { name: 'Russell 2000', value: 2084.35, change: 15.67, changePercent: 0.76, sparkline: [2050, 2060, 2070, 2055, 2075, 2070, 2084] },
];

// ---- Portfolio Holdings ----
export const holdings: Holding[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', shares: 50, avgCost: 178.50, currentPrice: 213.25, sector: 'Technology' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', shares: 20, avgCost: 520.00, currentPrice: 875.30, sector: 'Technology' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', shares: 30, avgCost: 380.00, currentPrice: 428.50, sector: 'Technology' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', shares: 40, avgCost: 142.30, currentPrice: 171.83, sector: 'Technology' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', shares: 25, avgCost: 160.00, currentPrice: 186.40, sector: 'Consumer' },
  { symbol: 'JPM', name: 'JPMorgan Chase', shares: 35, avgCost: 172.40, currentPrice: 198.75, sector: 'Finance' },
  { symbol: 'TSLA', name: 'Tesla Inc.', shares: 15, avgCost: 195.00, currentPrice: 248.42, sector: 'Automotive' },
  { symbol: 'V', name: 'Visa Inc.', shares: 20, avgCost: 260.50, currentPrice: 282.30, sector: 'Finance' },
];

// ---- Transactions ----
export const transactions: Transaction[] = [
  { id: '1', symbol: 'NVDA', action: 'BUY', shares: 5, price: 845.20, timestamp: '2026-03-23 14:32', total: 4226.00 },
  { id: '2', symbol: 'AAPL', action: 'BUY', shares: 10, price: 210.50, timestamp: '2026-03-22 10:15', total: 2105.00 },
  { id: '3', symbol: 'TSLA', action: 'SELL', shares: 5, price: 252.30, timestamp: '2026-03-21 15:45', total: 1261.50 },
  { id: '4', symbol: 'MSFT', action: 'BUY', shares: 10, price: 425.80, timestamp: '2026-03-20 11:20', total: 4258.00 },
  { id: '5', symbol: 'GOOGL', action: 'BUY', shares: 15, price: 168.40, timestamp: '2026-03-19 09:45', total: 2526.00 },
  { id: '6', symbol: 'AMZN', action: 'SELL', shares: 10, price: 189.20, timestamp: '2026-03-18 13:10', total: 1892.00 },
  { id: '7', symbol: 'JPM', action: 'BUY', shares: 20, price: 195.60, timestamp: '2026-03-17 10:30', total: 3912.00 },
  { id: '8', symbol: 'V', action: 'BUY', shares: 10, price: 278.90, timestamp: '2026-03-16 14:55', total: 2789.00 },
];

// ---- AI Signals ----
export const signals: Signal[] = [
  { id: '1', symbol: 'NVDA', name: 'NVIDIA Corp.', action: 'BUY', confidence: 92, price: 875.30, targetPrice: 1050.00, reasoning: 'Strong AI chip demand, datacenter revenue growth exceeding estimates. Institutional accumulation pattern detected.', timestamp: '2 hours ago' },
  { id: '2', symbol: 'TSLA', name: 'Tesla Inc.', action: 'BUY', confidence: 78, price: 248.42, targetPrice: 310.00, reasoning: 'Robotaxi catalyst approaching. Price breaking above 200-day MA with volume confirmation.', timestamp: '4 hours ago' },
  { id: '3', symbol: 'XOM', name: 'Exxon Mobil', action: 'SELL', confidence: 85, price: 113.80, targetPrice: 98.00, reasoning: 'Oil demand weakness from China data. Breaking below key support at $115 with bearish divergence on RSI.', timestamp: '6 hours ago' },
  { id: '4', symbol: 'AAPL', name: 'Apple Inc.', action: 'HOLD', confidence: 65, price: 213.25, targetPrice: 225.00, reasoning: 'Solid fundamentals but limited near-term catalysts. AI integration in iOS still early-stage.', timestamp: '8 hours ago' },
  { id: '5', symbol: 'META', name: 'Meta Platforms', action: 'BUY', confidence: 88, price: 523.60, targetPrice: 620.00, reasoning: 'Reels monetization accelerating. AI-driven ad targeting improving ROAS for advertisers.', timestamp: '12 hours ago' },
  { id: '6', symbol: 'JPM', name: 'JPMorgan Chase', action: 'BUY', confidence: 74, price: 198.75, targetPrice: 220.00, reasoning: 'Rising rate environment benefiting NIM. Strong trading desk performance.', timestamp: '1 day ago' },
];

// ---- Sector Performance ----
export const sectorPerformance: SectorPerformance[] = [
  { sector: 'Technology', change: 1.85, stocks: ['AAPL', 'MSFT', 'GOOGL', 'NVDA', 'META'] },
  { sector: 'Healthcare', change: 0.42, stocks: ['JNJ', 'UNH', 'PFE'] },
  { sector: 'Finance', change: 0.65, stocks: ['JPM', 'V', 'BAC'] },
  { sector: 'Consumer', change: -0.28, stocks: ['AMZN', 'WMT', 'COST'] },
  { sector: 'Energy', change: -1.45, stocks: ['XOM', 'CVX', 'COP'] },
  { sector: 'Automotive', change: 2.10, stocks: ['TSLA', 'F', 'GM'] },
  { sector: 'Real Estate', change: -0.82, stocks: ['PLD', 'AMT', 'EQIX'] },
  { sector: 'Utilities', change: 0.15, stocks: ['NEE', 'DUK', 'SO'] },
];

// ---- Activity Feed ----
export const activityFeed = [
  { id: '1', icon: 'signal', text: 'AI detected strong BUY signal for NVDA', detail: '92% confidence', time: '2h ago', type: 'signal' as const },
  { id: '2', icon: 'brain', text: 'Sentiment analysis completed for TSLA', detail: 'Bullish — Score: 0.72', time: '3h ago', type: 'sentiment' as const },
  { id: '3', icon: 'alert', text: 'Price alert triggered: XOM below $115', detail: 'Down 1.98% today', time: '4h ago', type: 'alert' as const },
  { id: '4', icon: 'prediction', text: 'Price prediction updated for AAPL', detail: 'Target: $225 (30 days)', time: '5h ago', type: 'prediction' as const },
  { id: '5', icon: 'portfolio', text: 'Portfolio rebalancing suggestion ready', detail: 'Overweight in Tech sector', time: '6h ago', type: 'portfolio' as const },
  { id: '6', icon: 'signal', text: 'AI detected SELL signal for XOM', detail: '85% confidence', time: '6h ago', type: 'signal' as const },
  { id: '7', icon: 'brain', text: 'Market summary generated', detail: 'Overall: Cautiously bullish', time: '8h ago', type: 'sentiment' as const },
];

// ---- Portfolio performance over time (for chart) ----
export const portfolioPerformanceData = (() => {
  const data = [];
  let portfolioValue = 85000;
  let benchmarkValue = 85000;
  const now = new Date();
  for (let i = 90; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    portfolioValue += (Math.random() - 0.45) * 800;
    benchmarkValue += (Math.random() - 0.47) * 600;
    data.push({
      date: date.toISOString().split('T')[0],
      portfolio: +portfolioValue.toFixed(2),
      benchmark: +benchmarkValue.toFixed(2),
    });
  }
  return data;
})();

export const getPortfolioStats = () => {
  const totalValue = holdings.reduce((s, h) => s + h.shares * h.currentPrice, 0);
  const totalCost = holdings.reduce((s, h) => s + h.shares * h.avgCost, 0);
  const dayPnl = holdings.reduce((s, h) => {
    const stock = stocks.find((st) => st.symbol === h.symbol);
    return s + (stock ? stock.change * h.shares : 0);
  }, 0);
  return {
    totalValue,
    totalCost,
    dayChange: dayPnl,
    dayChangePercent: (dayPnl / totalValue) * 100,
    totalReturn: totalValue - totalCost,
    totalReturnPercent: ((totalValue - totalCost) / totalCost) * 100,
  };
};
