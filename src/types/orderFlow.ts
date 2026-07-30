export type DarkPoolPrintSide = 'BUY_SIDE' | 'SELL_SIDE' | 'CROSS' | 'NEUTRAL';
export type OrderExecutionType = 'TWAP' | 'VWAP' | 'POV' | 'IMPLEMENTATION_SHORTFALL';

export interface DarkPoolPrint {
  id: string;
  symbol: string;
  timestamp: string;
  price: number;
  size: number;
  notionalValue: number;
  side: DarkPoolPrintSide;
  signature: 'BLOCK' | 'SWEEP' | 'ICEBERG_PARTIAL' | 'DARK_POOL_PRINT';
  exchangeCode: string;
  isAnomaly: boolean;
  institutionalConfidence: number;
}

export interface OptionGammaStrike {
  strike: number;
  callGamma: number;
  putGamma: number;
  netGamma: number;
  callOpenInterest: number;
  putOpenInterest: number;
  callVolume: number;
  putVolume: number;
  isPinStrike: boolean;
  isZeroGammaFlip: boolean;
}

export interface OptionGammaProfile {
  symbol: string;
  spotPrice: number;
  totalCallGamma: number;
  totalPutGamma: number;
  totalNetGamma: number;
  zeroGammaStrike: number;
  maxPainStrike: number;
  callWall: number;
  putWall: number;
  gexRegime: 'LONG_GAMMA_STABILIZING' | 'SHORT_GAMMA_VOLATILE';
  strikes: OptionGammaStrike[];
}

export interface Level2OrderBookItem {
  price: number;
  size: number;
  ordersCount: number;
  cumulativeSize: number;
}

export interface Level2Book {
  symbol: string;
  timestamp: string;
  bids: Level2OrderBookItem[];
  asks: Level2OrderBookItem[];
  spread: number;
  bidLiquidity: number;
  askLiquidity: number;
  imbalanceRatio: number;
}

export interface ExecutionSimRequest {
  symbol: string;
  totalShares: number;
  algoType: OrderExecutionType;
  durationMinutes: number;
  urgencyLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface ExecutionSlice {
  minute: number;
  timeLabel: string;
  sharesExecuted: number;
  cumulativeShares: number;
  executionPrice: number;
  benchmarkVwap: number;
  slippageBps: number;
  marketImpact: number;
}

export interface ExecutionSimResult {
  symbol: string;
  algoType: OrderExecutionType;
  totalSharesRequested: number;
  totalSharesExecuted: number;
  averageExecutionPrice: number;
  benchmarkVwap: number;
  benchmarkArrivalPrice: number;
  totalSlippageBps: number;
  totalMarketImpactUsd: number;
  executionTimeMinutes: number;
  slices: ExecutionSlice[];
}

export interface MonteCarloPathPoint {
  step: number;
  label: string;
  medianPrice: number;
  percentile5: number;
  percentile25: number;
  percentile75: number;
  percentile95: number;
}

export interface MonteCarloRiskAnalysis {
  symbol: string;
  portfolioValue: number;
  confidenceLevels: {
    var95: number;
    var99: number;
    cvar95: number;
    cvar99: number;
    var95Percent: number;
    var99Percent: number;
  };
  stressScenarios: {
    name: string;
    description: string;
    pnlImpact: number;
    pnlPercent: number;
  }[];
  paths: MonteCarloPathPoint[];
}
