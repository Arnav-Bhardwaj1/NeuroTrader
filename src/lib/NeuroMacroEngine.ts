/**
 * NeuroMacroEngine.ts
 * Quantitative Engine for Global Yield Curve Analytics, Probit Recession Probability Modeling,
 * 7x7 Rolling Cross-Asset Correlation Heatmaps, Fed Net Liquidity Index, and Statistical Arbitrage Z-Score Scanners.
 */

export interface YieldPoint {
  maturity: '1M' | '3M' | '6M' | '1Y' | '2Y' | '5Y' | '10Y' | '30Y';
  currentYield: number;
  prevYearYield: number;
  historicalAvg: number;
}

export interface YieldCurveAnalysis {
  currentCurve: YieldPoint[];
  spread10y2y: number; // 10Y minus 2Y Yield Spread in %
  spread10y3m: number; // 10Y minus 3M Yield Spread in %
  isInverted: boolean;
  recessionProbPercent: number; // Probit model 12-month recession probability
  fedFundsRate: number;
  regime: 'EXPANSION' | 'SLOWDOWN' | 'CONTRACTION' | 'RECOVERY';
  historicalSpreads: Array<{ date: string; spread10y2y: number; spread10y3m: number }>;
}

export interface CorrelationMatrixData {
  assetNames: string[];
  rollingWindowDays: number;
  matrix: number[][];
  historicalRolling: Array<{
    date: string;
    btcVsSpy: number;
    goldVsYields: number;
    oilVsEnergy: number;
    dxyVsEmerging: number;
  }>;
}

export interface FedLiquidityMetric {
  date: string;
  fedBalanceSheetUsdTrillion: number;
  reverseRepoUsdTrillion: number;
  treasuryGeneralAccountUsdTrillion: number;
  netLiquidityUsdTrillion: number; // Balance Sheet - RRP - TGA
  spyPrice: number;
}

export interface StatArbSignal {
  id: string;
  pair: string;
  assetA: string;
  assetB: string;
  cointegrationPValue: number;
  currentZScore: number;
  halfLifeDays: number;
  signalType: 'LONG_SPREAD' | 'SHORT_SPREAD' | 'NEUTRAL';
  recommendedAction: string;
  expectedReturnPct: number;
  historicalSpread: Array<{ date: string; zScore: number }>;
}

export class NeuroMacroEngine {
  /**
   * Get Treasury Yield Curve & Recession Probit Model Analytics
   */
  public static getYieldCurveData(): YieldCurveAnalysis {
    const currentCurve: YieldPoint[] = [
      { maturity: '1M', currentYield: 5.35, prevYearYield: 5.42, historicalAvg: 3.80 },
      { maturity: '3M', currentYield: 5.22, prevYearYield: 5.38, historicalAvg: 3.90 },
      { maturity: '6M', currentYield: 5.08, prevYearYield: 5.25, historicalAvg: 4.05 },
      { maturity: '1Y', currentYield: 4.82, prevYearYield: 5.02, historicalAvg: 4.15 },
      { maturity: '2Y', currentYield: 4.45, prevYearYield: 4.78, historicalAvg: 4.25 },
      { maturity: '5Y', currentYield: 4.18, prevYearYield: 4.35, historicalAvg: 4.30 },
      { maturity: '10Y', currentYield: 4.22, prevYearYield: 4.28, historicalAvg: 4.40 },
      { maturity: '30Y', currentYield: 4.48, prevYearYield: 4.42, historicalAvg: 4.60 },
    ];

    const y10 = currentCurve.find(p => p.maturity === '10Y')?.currentYield || 4.22;
    const y2 = currentCurve.find(p => p.maturity === '2Y')?.currentYield || 4.45;
    const y3m = currentCurve.find(p => p.maturity === '3M')?.currentYield || 5.22;

    const spread10y2y = Number((y10 - y2).toFixed(2));
    const spread10y3m = Number((y10 - y3m).toFixed(2));
    const isInverted = spread10y2y < 0 || spread10y3m < 0;

    // Probit model recession probability calculation
    const probitX = -0.65 - 1.25 * spread10y3m;
    const recessionProbPercent = Math.min(95, Math.max(5, Math.round(100 / (1 + Math.exp(-probitX)))));

    const historicalSpreads = [
      { date: 'Jan 01', spread10y2y: -0.45, spread10y3m: -1.20 },
      { date: 'Feb 01', spread10y2y: -0.38, spread10y3m: -1.15 },
      { date: 'Mar 01', spread10y2y: -0.32, spread10y3m: -1.05 },
      { date: 'Apr 01', spread10y2y: -0.28, spread10y3m: -0.98 },
      { date: 'May 01', spread10y2y: -0.25, spread10y3m: -0.92 },
      { date: 'Jun 01', spread10y2y: -0.23, spread10y3m: -1.00 },
    ];

    return {
      currentCurve,
      spread10y2y,
      spread10y3m,
      isInverted,
      recessionProbPercent,
      fedFundsRate: 5.25,
      regime: isInverted ? 'SLOWDOWN' : 'EXPANSION',
      historicalSpreads,
    };
  }

  /**
   * Get 7x7 Rolling Cross-Asset Correlation Heatmap Matrix
   */
  public static getCorrelationMatrix(windowDays: number = 90): CorrelationMatrixData {
    const assetNames = ['SPY', 'NVDA', 'BTC', 'GOLD', 'OIL', 'US10Y', 'DXY'];

    // 7x7 correlation matrix values
    const matrix: number[][] = [
      [ 1.00,  0.88,  0.42, -0.15,  0.22, -0.35, -0.65], // SPY
      [ 0.88,  1.00,  0.58, -0.22,  0.18, -0.28, -0.58], // NVDA
      [ 0.42,  0.58,  1.00,  0.12,  0.08, -0.18, -0.48], // BTC
      [-0.15, -0.22,  0.12,  1.00,  0.14, -0.68, -0.72], // GOLD
      [ 0.22,  0.18,  0.08,  0.14,  1.00,  0.35,  0.15], // OIL
      [-0.35, -0.28, -0.18, -0.68,  0.35,  1.00,  0.42], // US10Y
      [-0.65, -0.58, -0.48, -0.72,  0.15,  0.42,  1.00], // DXY
    ];

    const historicalRolling = [
      { date: 'Jan 01', btcVsSpy: 0.32, goldVsYields: -0.74, oilVsEnergy: 0.82, dxyVsEmerging: -0.62 },
      { date: 'Feb 01', btcVsSpy: 0.38, goldVsYields: -0.71, oilVsEnergy: 0.84, dxyVsEmerging: -0.64 },
      { date: 'Mar 01', btcVsSpy: 0.45, goldVsYields: -0.68, oilVsEnergy: 0.79, dxyVsEmerging: -0.66 },
      { date: 'Apr 01', btcVsSpy: 0.42, goldVsYields: -0.65, oilVsEnergy: 0.81, dxyVsEmerging: -0.65 },
      { date: 'May 01', btcVsSpy: 0.48, goldVsYields: -0.68, oilVsEnergy: 0.85, dxyVsEmerging: -0.63 },
      { date: 'Jun 01', btcVsSpy: 0.42, goldVsYields: -0.68, oilVsEnergy: 0.83, dxyVsEmerging: -0.65 },
    ];

    return {
      assetNames,
      rollingWindowDays: windowDays,
      matrix,
      historicalRolling,
    };
  }

  /**
   * Get Fed Net Liquidity Index vs S&P 500 Data
   */
  public static getFedLiquidityMetrics(): FedLiquidityMetric[] {
    return [
      { date: 'Jan 01', fedBalanceSheetUsdTrillion: 7.65, reverseRepoUsdTrillion: 0.68, treasuryGeneralAccountUsdTrillion: 0.72, netLiquidityUsdTrillion: 6.25, spyPrice: 475.2 },
      { date: 'Feb 01', fedBalanceSheetUsdTrillion: 7.58, reverseRepoUsdTrillion: 0.58, treasuryGeneralAccountUsdTrillion: 0.75, netLiquidityUsdTrillion: 6.25, spyPrice: 492.4 },
      { date: 'Mar 01', fedBalanceSheetUsdTrillion: 7.52, reverseRepoUsdTrillion: 0.49, treasuryGeneralAccountUsdTrillion: 0.71, netLiquidityUsdTrillion: 6.32, spyPrice: 510.5 },
      { date: 'Apr 01', fedBalanceSheetUsdTrillion: 7.45, reverseRepoUsdTrillion: 0.44, treasuryGeneralAccountUsdTrillion: 0.78, netLiquidityUsdTrillion: 6.23, spyPrice: 502.1 },
      { date: 'May 01', fedBalanceSheetUsdTrillion: 7.38, reverseRepoUsdTrillion: 0.41, treasuryGeneralAccountUsdTrillion: 0.69, netLiquidityUsdTrillion: 6.28, spyPrice: 525.8 },
      { date: 'Jun 01', fedBalanceSheetUsdTrillion: 7.32, reverseRepoUsdTrillion: 0.38, treasuryGeneralAccountUsdTrillion: 0.65, netLiquidityUsdTrillion: 6.29, spyPrice: 545.0 },
    ];
  }

  /**
   * Get Statistical Arbitrage & Cointegration Pairs Signals
   */
  public static getStatArbSignals(): StatArbSignal[] {
    return [
      {
        id: 'arb-01',
        pair: 'BTC vs Tech Equities (NVDA/QQQ)',
        assetA: 'BTC/USD',
        assetB: 'NVDA',
        cointegrationPValue: 0.018,
        currentZScore: 2.34,
        halfLifeDays: 8.5,
        signalType: 'SHORT_SPREAD',
        recommendedAction: 'Short BTC / Long NVDA (Expect Mean Reversion Z -> 0)',
        expectedReturnPct: 4.8,
        historicalSpread: [
          { date: 'Day 1', zScore: 0.2 },
          { date: 'Day 2', zScore: 0.8 },
          { date: 'Day 3', zScore: 1.4 },
          { date: 'Day 4', zScore: 1.9 },
          { date: 'Day 5', zScore: 2.34 },
        ],
      },
      {
        id: 'arb-02',
        pair: 'Gold vs Real Yields (US10Y - Inflation)',
        assetA: 'GOLD',
        assetB: 'US10Y',
        cointegrationPValue: 0.005,
        currentZScore: -2.15,
        halfLifeDays: 12.0,
        signalType: 'LONG_SPREAD',
        recommendedAction: 'Long Gold / Short 10Y Yields (Catch Up Trade)',
        expectedReturnPct: 6.2,
        historicalSpread: [
          { date: 'Day 1', zScore: -0.4 },
          { date: 'Day 2', zScore: -0.9 },
          { date: 'Day 3', zScore: -1.5 },
          { date: 'Day 4', zScore: -1.8 },
          { date: 'Day 5', zScore: -2.15 },
        ],
      },
      {
        id: 'arb-03',
        pair: 'Crude Oil vs Energy Select Sector (XLE)',
        assetA: 'OIL',
        assetB: 'XLE',
        cointegrationPValue: 0.032,
        currentZScore: 0.45,
        halfLifeDays: 5.2,
        signalType: 'NEUTRAL',
        recommendedAction: 'Fair Value Range (No Trade Triggered)',
        expectedReturnPct: 0.8,
        historicalSpread: [
          { date: 'Day 1', zScore: 0.1 },
          { date: 'Day 2', zScore: 0.3 },
          { date: 'Day 3', zScore: 0.6 },
          { date: 'Day 4', zScore: 0.5 },
          { date: 'Day 5', zScore: 0.45 },
        ],
      },
    ];
  }
}
