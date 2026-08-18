/**
 * NeuroRiskEngine.ts
 * Quantitative Factor Decomposition, Component VaR (CVaR) Attribution,
 * Historical Crisis Replay Stress Engine, and Circuit Breaker Shield.
 */

export interface FactorExposure {
  factor: 'Market Beta' | 'Momentum' | 'Growth' | 'Quality' | 'Size' | 'Volatility';
  portfolioLoading: number; // Factor loading (-2.0 to +2.0)
  benchmarkLoading: number;
  tilt: 'OVERWEIGHT' | 'UNDERWEIGHT' | 'NEUTRAL';
  description: string;
}

export interface ComponentVaR {
  symbol: string;
  name: string;
  weightPercent: number;
  positionValueUsd: number;
  standaloneVar95Usd: number;
  componentVarUsd: number; // Marginal VaR contribution to total portfolio
  riskContributionPercent: number; // % of total portfolio VaR
  diversificationBenefitUsd: number;
}

export interface CrisisScenario {
  id: string;
  label: string;
  period: string;
  description: string;
  historicalMarketDropPct: number;
  estimatedPortfolioDrawdownPct: number;
  estimatedPortfolioLossUsd: number;
  recoveryDays: number;
  drawdownTrajectory: Array<{ day: number; portfolioValue: number; benchmarkValue: number }>;
  assetDrawdowns: Array<{ symbol: string; drawdownPct: number; lossUsd: number }>;
}

export interface CircuitBreaker {
  id: string;
  name: string;
  type: 'DRAWDOWN_LIMIT' | 'VOLATILITY_CAP' | 'CONCENTRATION_CEILING' | 'VAR_SHIELD';
  thresholdValue: number;
  currentValue: number;
  unit: '%' | '$' | 'σ';
  status: 'SAFE' | 'WARNING' | 'BREACHED';
  autoHedgeAction: string;
  active: boolean;
}

export interface PortfolioRiskOverview {
  totalPortfolioValue: number;
  var95Usd: number;
  var99Usd: number;
  cvar95Usd: number; // Conditional VaR / Expected Tail Loss
  portfolioBeta: number;
  annualizedVolPercent: number;
  diversificationRatio: number;
  riskRating: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
}

export class NeuroRiskEngine {
  /**
   * Get Overall Portfolio Risk Summary Metrics
   */
  public static getPortfolioRiskOverview(portfolioValue: number = 100000): PortfolioRiskOverview {
    const var95Usd = Math.round(portfolioValue * 0.082); // $8,200 (8.2%)
    const var99Usd = Math.round(portfolioValue * 0.124); // $12,400 (12.4%)
    const cvar95Usd = Math.round(portfolioValue * 0.145); // $14,500 (14.5%)

    return {
      totalPortfolioValue: portfolioValue,
      var95Usd,
      var99Usd,
      cvar95Usd,
      portfolioBeta: 1.18,
      annualizedVolPercent: 18.5,
      diversificationRatio: 1.42,
      riskRating: 'MODERATE',
    };
  }

  /**
   * Get Factor Decomposition & Style Loading
   */
  public static getFactorExposures(): FactorExposure[] {
    return [
      {
        factor: 'Market Beta',
        portfolioLoading: 1.18,
        benchmarkLoading: 1.00,
        tilt: 'OVERWEIGHT',
        description: 'Higher market sensitivity than SPY benchmark due to heavy Tech weight.',
      },
      {
        factor: 'Momentum',
        portfolioLoading: 0.85,
        benchmarkLoading: 0.30,
        tilt: 'OVERWEIGHT',
        description: 'Strong positive exposure to recent 12-month top-performing trend leaders.',
      },
      {
        factor: 'Growth',
        portfolioLoading: 1.35,
        benchmarkLoading: 0.80,
        tilt: 'OVERWEIGHT',
        description: 'High P/E and revenue expansion tilt (NVDA, AAPL, BTC momentum).',
      },
      {
        factor: 'Quality',
        portfolioLoading: 0.62,
        benchmarkLoading: 0.75,
        tilt: 'UNDERWEIGHT',
        description: 'Moderate profitability and cash flow coverage exposure.',
      },
      {
        factor: 'Size',
        portfolioLoading: 0.45,
        benchmarkLoading: 0.90,
        tilt: 'UNDERWEIGHT',
        description: 'Large-cap bias with selective high-beta crypto satellite allocation.',
      },
      {
        factor: 'Volatility',
        portfolioLoading: 0.92,
        benchmarkLoading: 0.40,
        tilt: 'OVERWEIGHT',
        description: 'Elevated tail variance sensitivity to macro interest rate shifts.',
      },
    ];
  }

  /**
   * Get Component VaR (CVaR) Risk Attribution per Holding
   */
  public static getComponentVaRBreakdown(portfolioValue: number = 100000): ComponentVaR[] {
    return [
      {
        symbol: 'NVDA',
        name: 'NVIDIA Corporation',
        weightPercent: 35,
        positionValueUsd: Math.round(portfolioValue * 0.35),
        standaloneVar95Usd: Math.round(portfolioValue * 0.35 * 0.12),
        componentVarUsd: Math.round(portfolioValue * 0.038),
        riskContributionPercent: 46.3,
        diversificationBenefitUsd: 400,
      },
      {
        symbol: 'BTC/USD',
        name: 'Bitcoin',
        weightPercent: 25,
        positionValueUsd: Math.round(portfolioValue * 0.25),
        standaloneVar95Usd: Math.round(portfolioValue * 0.25 * 0.15),
        componentVarUsd: Math.round(portfolioValue * 0.026),
        riskContributionPercent: 31.7,
        diversificationBenefitUsd: 1150,
      },
      {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        weightPercent: 25,
        positionValueUsd: Math.round(portfolioValue * 0.25),
        standaloneVar95Usd: Math.round(portfolioValue * 0.25 * 0.06),
        componentVarUsd: Math.round(portfolioValue * 0.012),
        riskContributionPercent: 14.6,
        diversificationBenefitUsd: 300,
      },
      {
        symbol: 'SPY',
        name: 'S&P 500 ETF',
        weightPercent: 15,
        positionValueUsd: Math.round(portfolioValue * 0.15),
        standaloneVar95Usd: Math.round(portfolioValue * 0.15 * 0.04),
        componentVarUsd: Math.round(portfolioValue * 0.006),
        riskContributionPercent: 7.4,
        diversificationBenefitUsd: 200,
      },
    ];
  }

  /**
   * Get Historical Crisis Stress Test Scenarios
   */
  public static getCrisisScenarios(portfolioValue: number = 100000): CrisisScenario[] {
    return [
      {
        id: 'crisis-2008-gfc',
        label: '2008 Great Financial Crisis',
        period: 'Sept 2008 - March 2009',
        description: 'Systemic banking collapse & credit freeze leading to peak drawdown.',
        historicalMarketDropPct: -56.8,
        estimatedPortfolioDrawdownPct: -48.2,
        estimatedPortfolioLossUsd: Math.round(portfolioValue * 0.482),
        recoveryDays: 420,
        drawdownTrajectory: [
          { day: 0, portfolioValue: portfolioValue, benchmarkValue: portfolioValue },
          { day: 30, portfolioValue: Math.round(portfolioValue * 0.88), benchmarkValue: Math.round(portfolioValue * 0.90) },
          { day: 60, portfolioValue: Math.round(portfolioValue * 0.74), benchmarkValue: Math.round(portfolioValue * 0.78) },
          { day: 90, portfolioValue: Math.round(portfolioValue * 0.62), benchmarkValue: Math.round(portfolioValue * 0.65) },
          { day: 120, portfolioValue: Math.round(portfolioValue * 0.518), benchmarkValue: Math.round(portfolioValue * 0.532) },
          { day: 180, portfolioValue: Math.round(portfolioValue * 0.68), benchmarkValue: Math.round(portfolioValue * 0.66) },
        ],
        assetDrawdowns: [
          { symbol: 'NVDA', drawdownPct: -62.4, lossUsd: Math.round(portfolioValue * 0.35 * 0.624) },
          { symbol: 'BTC/USD', drawdownPct: -55.0, lossUsd: Math.round(portfolioValue * 0.25 * 0.55) },
          { symbol: 'AAPL', drawdownPct: -42.1, lossUsd: Math.round(portfolioValue * 0.25 * 0.421) },
          { symbol: 'SPY', drawdownPct: -56.8, lossUsd: Math.round(portfolioValue * 0.15 * 0.568) },
        ],
      },
      {
        id: 'crisis-2020-covid',
        label: '2020 COVID Flash Shock',
        period: 'Feb 2020 - March 2020',
        description: 'Rapid pandemic market liquidation followed by monetary stimulus expansion.',
        historicalMarketDropPct: -33.9,
        estimatedPortfolioDrawdownPct: -31.5,
        estimatedPortfolioLossUsd: Math.round(portfolioValue * 0.315),
        recoveryDays: 140,
        drawdownTrajectory: [
          { day: 0, portfolioValue: portfolioValue, benchmarkValue: portfolioValue },
          { day: 10, portfolioValue: Math.round(portfolioValue * 0.92), benchmarkValue: Math.round(portfolioValue * 0.93) },
          { day: 20, portfolioValue: Math.round(portfolioValue * 0.78), benchmarkValue: Math.round(portfolioValue * 0.81) },
          { day: 30, portfolioValue: Math.round(portfolioValue * 0.685), benchmarkValue: Math.round(portfolioValue * 0.661) },
          { day: 60, portfolioValue: Math.round(portfolioValue * 0.85), benchmarkValue: Math.round(portfolioValue * 0.82) },
          { day: 90, portfolioValue: Math.round(portfolioValue * 1.05), benchmarkValue: Math.round(portfolioValue * 0.98) },
        ],
        assetDrawdowns: [
          { symbol: 'NVDA', drawdownPct: -32.0, lossUsd: Math.round(portfolioValue * 0.35 * 0.32) },
          { symbol: 'BTC/USD', drawdownPct: -48.5, lossUsd: Math.round(portfolioValue * 0.25 * 0.485) },
          { symbol: 'AAPL', drawdownPct: -25.2, lossUsd: Math.round(portfolioValue * 0.25 * 0.252) },
          { symbol: 'SPY', drawdownPct: -33.9, lossUsd: Math.round(portfolioValue * 0.15 * 0.339) },
        ],
      },
      {
        id: 'crisis-2022-rate-hike',
        label: '2022 Fed Rate Hike Tightening',
        period: 'Jan 2022 - Oct 2022',
        description: 'High inflation & aggressive rate hikes causing long-duration tech selloff.',
        historicalMarketDropPct: -25.4,
        estimatedPortfolioDrawdownPct: -34.8,
        estimatedPortfolioLossUsd: Math.round(portfolioValue * 0.348),
        recoveryDays: 310,
        drawdownTrajectory: [
          { day: 0, portfolioValue: portfolioValue, benchmarkValue: portfolioValue },
          { day: 30, portfolioValue: Math.round(portfolioValue * 0.91), benchmarkValue: Math.round(portfolioValue * 0.94) },
          { day: 60, portfolioValue: Math.round(portfolioValue * 0.82), benchmarkValue: Math.round(portfolioValue * 0.88) },
          { day: 90, portfolioValue: Math.round(portfolioValue * 0.74), benchmarkValue: Math.round(portfolioValue * 0.81) },
          { day: 120, portfolioValue: Math.round(portfolioValue * 0.652), benchmarkValue: Math.round(portfolioValue * 0.746) },
          { day: 180, portfolioValue: Math.round(portfolioValue * 0.82), benchmarkValue: Math.round(portfolioValue * 0.85) },
        ],
        assetDrawdowns: [
          { symbol: 'NVDA', drawdownPct: -50.2, lossUsd: Math.round(portfolioValue * 0.35 * 0.502) },
          { symbol: 'BTC/USD', drawdownPct: -64.0, lossUsd: Math.round(portfolioValue * 0.25 * 0.64) },
          { symbol: 'AAPL', drawdownPct: -22.5, lossUsd: Math.round(portfolioValue * 0.25 * 0.225) },
          { symbol: 'SPY', drawdownPct: -25.4, lossUsd: Math.round(portfolioValue * 0.15 * 0.254) },
        ],
      },
    ];
  }

  /**
   * Get Automated Risk Circuit Breakers
   */
  public static getCircuitBreakers(): CircuitBreaker[] {
    return [
      {
        id: 'cb-01',
        name: 'Max Drawdown Hard Limit',
        type: 'DRAWDOWN_LIMIT',
        thresholdValue: 15.0,
        currentValue: 6.4,
        unit: '%',
        status: 'SAFE',
        autoHedgeAction: 'Liquidate 50% High-Beta positions & buy SPY puts',
        active: true,
      },
      {
        id: 'cb-02',
        name: 'Single Asset Concentration Ceiling',
        type: 'CONCENTRATION_CEILING',
        thresholdValue: 30.0,
        currentValue: 35.0,
        unit: '%',
        status: 'WARNING',
        autoHedgeAction: 'Trim NVDA position down to 30% allocation',
        active: true,
      },
      {
        id: 'cb-03',
        name: 'Portfolio Volatility Ceiling',
        type: 'VOLATILITY_CAP',
        thresholdValue: 22.0,
        currentValue: 18.5,
        unit: '%',
        status: 'SAFE',
        autoHedgeAction: 'Rebalance portfolio into Treasury Yield ETF',
        active: true,
      },
      {
        id: 'cb-04',
        name: 'Daily VaR Risk Shield',
        type: 'VAR_SHIELD',
        thresholdValue: 10000,
        currentValue: 8200,
        unit: '$',
        status: 'SAFE',
        autoHedgeAction: 'Trigger automated tail risk option hedge',
        active: true,
      },
    ];
  }
}
