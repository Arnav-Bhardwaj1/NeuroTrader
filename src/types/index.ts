export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: string;
  pe: number;
  high52w: number;
  low52w: number;
  sector: string;
  logo?: string;
}

export interface CandlestickData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface PredictionData {
  targetPrice: number;
  confidence: number;
  direction: 'bullish' | 'bearish' | 'neutral';
  timeframe: string;
  reasoning: string;
  predictionLine: { time: string; value: number }[];
  upperBand: { time: string; value: number }[];
  lowerBand: { time: string; value: number }[];
}

export interface SentimentData {
  overall: number; // -1 to 1
  label: 'Bullish' | 'Bearish' | 'Neutral';
  headlines: { title: string; source: string; sentiment: number; time: string }[];
  breakdown: { category: string; score: number }[];
}

export interface Signal {
  id: string;
  symbol: string;
  name: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  price: number;
  targetPrice: number;
  reasoning: string;
  timestamp: string;
}

export interface Holding {
  symbol: string;
  name: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  sector: string;
}

export interface Transaction {
  id: string;
  symbol: string;
  action: 'BUY' | 'SELL';
  shares: number;
  price: number;
  timestamp: string;
  total: number;
}

export interface PortfolioStats {
  totalValue: number;
  totalCost: number;
  dayChange: number;
  dayChangePercent: number;
  totalReturn: number;
  totalReturnPercent: number;
}

export interface MarketIndex {
  name: string;
  value: number;
  change: number;
  changePercent: number;
  sparkline: number[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface RiskData {
  volatility: number;
  beta: number;
  sharpe: number;
  maxDrawdown: number;
  compositeScore: number; // 0-100
  riskLevel: 'Low' | 'Medium' | 'High' | 'Very High';
}

export interface SectorPerformance {
  sector: string;
  change: number;
  stocks: string[];
}
