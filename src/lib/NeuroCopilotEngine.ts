/**
 * NeuroCopilotEngine.ts
 * Quantitative AI Engine for Monte Carlo Path Simulation, Value-at-Risk (VaR/CVaR),
 * Gamma Exposure (GEX) Profiling, Multi-Asset Trade Signal Synthesis, and Automation.
 */

export type SignalType = 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL';
export type SignalTimeframe = 'SCALP (15M)' | 'SWING (1D-4H)' | 'POSITION (1W)';

export interface CopilotSignal {
  id: string;
  symbol: string;
  name: string;
  assetClass: 'EQUITY' | 'CRYPTO' | 'INDEX' | 'FOREX';
  type: SignalType;
  confidence: number; // 0 - 100%
  timeframe: SignalTimeframe;
  currentPrice: number;
  entryPrice: number;
  stopLoss: number;
  targetPrice1: number;
  targetPrice2: number;
  riskRewardRatio: number;
  kellySizePercent: number; // Recommended allocation % based on Kelly Criterion
  reasoning: {
    technical: string;
    sentiment: string;
    microstructure: string;
    gexBias: string;
  };
  timestamp: string;
}

export interface StochasticPoint {
  day: number;
  p95: number;
  p75: number;
  p50: number;
  p25: number;
  p5: number;
  worstPath: number;
}

export interface MonteCarloSimulation {
  horizonDays: number;
  numSimulations: number;
  initialPortfolioValue: number;
  meanFinalValue: number;
  medianFinalValue: number;
  percentile95: number;
  percentile75: number;
  percentile25: number;
  percentile5: number;
  var95: number;
  var99: number;
  cvar95: number; // Conditional VaR (Expected Shortfall)
  maxDrawdownProbability: number; // % chance drawdown exceeds 10%
  sharpeRatio: number;
  sortinoRatio: number;
  trajectories: StochasticPoint[];
  histogramData: Array<{ range: string; count: number; isLoss: boolean }>;
}

export interface MacroShockScenario {
  id: string;
  label: string;
  description: string;
  equityShockPct: number;
  volatilityMultiplier: number;
  rateShiftBps: number;
  assetClassImpact: {
    tech: number;
    crypto: number;
    energy: number;
    financials: number;
  };
}

export interface GexStrikeLevel {
  strike: number;
  callGex: number;
  putGex: number;
  netGex: number;
  isCallWall?: boolean;
  isPutWall?: boolean;
  isFlipLevel?: boolean;
}

export interface GexProfile {
  symbol: string;
  currentPrice: number;
  callWallStrike: number;
  putWallStrike: number;
  zeroGammaFlip: number;
  totalNetGexNotional: number; // in $ Millions
  regime: 'LONG_GAMMA' | 'SHORT_GAMMA';
  strikeDistribution: GexStrikeLevel[];
}

export interface DarkPoolFlow {
  symbol: string;
  sector: string;
  darkPoolBuyRatio: number; // 0 - 100%
  institutionalDeltaUsd: number; // in $ Millions
  unusualOptionsVolume: boolean;
  spyCorrelation: number; // -1.0 to 1.0
  liquidityScore: number; // 0 - 100
}

export interface AutonomousRule {
  id: string;
  name: string;
  active: boolean;
  asset: string;
  triggerCondition: string;
  action: 'BUY' | 'SELL' | 'HEDGE';
  positionSizeUsd: number;
  stopLossPct: number;
  takeProfitPct: number;
  winRate: number;
  totalTrades: number;
  netProfitUsd: number;
  lastTriggered: string;
}

export class NeuroCopilotEngine {
  /**
   * Run a path-dependent Monte Carlo simulation using Geometric Brownian Motion + Jump Diffusion
   */
  public static runMonteCarlo(
    initialValue: number = 100000,
    horizonDays: number = 30,
    numSims: number = 1000,
    annualVol: number = 0.22,
    annualDrift: number = 0.12,
    shock?: MacroShockScenario
  ): MonteCarloSimulation {
    let effectiveDrift = annualDrift;
    let effectiveVol = annualVol;

    if (shock) {
      effectiveDrift += (shock.equityShockPct / 100);
      effectiveVol *= shock.volatilityMultiplier;
    }

    const dt = 1 / 252; // daily time step
    const dailyDrift = (effectiveDrift - 0.5 * Math.pow(effectiveVol, 2)) * dt;
    const dailyVol = effectiveVol * Math.sqrt(dt);

    const trajectoriesMatrix: number[][] = [];
    const finalValues: number[] = [];
    let severeDrawdownCount = 0;

    for (let sim = 0; sim < numSims; sim++) {
      const path: number[] = [initialValue];
      let currentVal = initialValue;
      let peakVal = initialValue;
      let maxPathDrawdown = 0;

      for (let day = 1; day <= horizonDays; day++) {
        // Box-Muller transformation for normal random variable
        const u1 = Math.random() || 1e-10;
        const u2 = Math.random() || 1e-10;
        const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);

        // Jump diffusion event simulation (2% daily chance of micro shock)
        let jump = 0;
        if (Math.random() < 0.02) {
          jump = (Math.random() - 0.55) * 0.05;
        }

        const returnDaily = Math.exp(dailyDrift + dailyVol * z + jump);
        currentVal = currentVal * returnDaily;
        path.push(currentVal);

        if (currentVal > peakVal) peakVal = currentVal;
        const dd = (peakVal - currentVal) / peakVal;
        if (dd > maxPathDrawdown) maxPathDrawdown = dd;
      }

      if (maxPathDrawdown > 0.12) severeDrawdownCount++;
      trajectoriesMatrix.push(path);
      finalValues.push(currentVal);
    }

    finalValues.sort((a, b) => a - b);

    const getPercentile = (p: number) => {
      const index = Math.floor((p / 100) * finalValues.length);
      return finalValues[Math.min(index, finalValues.length - 1)];
    };

    const p5 = getPercentile(5);
    const p25 = getPercentile(25);
    const p50 = getPercentile(50);
    const p75 = getPercentile(75);
    const p95 = getPercentile(95);

    const sumFinal = finalValues.reduce((acc, v) => acc + v, 0);
    const meanFinalValue = sumFinal / numSims;

    // Value at Risk (VaR) calculation
    const var95 = Math.max(0, initialValue - p5);
    const var99 = Math.max(0, initialValue - getPercentile(1));

    // Conditional VaR (CVaR) - average of losses worse than 95th percentile
    const tailCutoffIndex = Math.floor(0.05 * finalValues.length);
    const tailValues = finalValues.slice(0, Math.max(1, tailCutoffIndex));
    const tailMean = tailValues.reduce((acc, v) => acc + v, 0) / tailValues.length;
    const cvar95 = Math.max(0, initialValue - tailMean);

    // Build stochastic trajectory breakdown by day
    const trajectories: StochasticPoint[] = [];
    for (let day = 0; day <= horizonDays; day += Math.max(1, Math.floor(horizonDays / 15))) {
      const dayVals = trajectoriesMatrix.map(p => p[day]).sort((a, b) => a - b);
      const getDayP = (pct: number) => dayVals[Math.floor((pct / 100) * dayVals.length)];

      trajectories.push({
        day,
        p95: Math.round(getDayP(95)),
        p75: Math.round(getDayP(75)),
        p50: Math.round(getDayP(50)),
        p25: Math.round(getDayP(25)),
        p5: Math.round(getDayP(5)),
        worstPath: Math.round(dayVals[0]),
      });
    }

    // Build Histogram Bins
    const minVal = finalValues[0];
    const maxVal = finalValues[finalValues.length - 1];
    const binSize = (maxVal - minVal) / 10;
    const histogramData: Array<{ range: string; count: number; isLoss: boolean }> = [];

    for (let i = 0; i < 10; i++) {
      const binStart = minVal + i * binSize;
      const binEnd = binStart + binSize;
      const count = finalValues.filter(v => v >= binStart && v < binEnd).length;
      const isLoss = binEnd < initialValue;

      histogramData.push({
        range: `$${(binStart / 1000).toFixed(0)}k-$${(binEnd / 1000).toFixed(0)}k`,
        count,
        isLoss,
      });
    }

    return {
      horizonDays,
      numSimulations: numSims,
      initialPortfolioValue: initialValue,
      meanFinalValue: Math.round(meanFinalValue),
      medianFinalValue: Math.round(p50),
      percentile95: Math.round(p95),
      percentile75: Math.round(p75),
      percentile25: Math.round(p25),
      percentile5: Math.round(p5),
      var95: Math.round(var95),
      var99: Math.round(var99),
      cvar95: Math.round(cvar95),
      maxDrawdownProbability: Number(((severeDrawdownCount / numSims) * 100).toFixed(1)),
      sharpeRatio: Number((((meanFinalValue - initialValue) / initialValue) / (annualVol * Math.sqrt(horizonDays / 252))).toFixed(2)),
      sortinoRatio: Number((((meanFinalValue - initialValue) / initialValue) / ((var95 / initialValue) * 0.7)).toFixed(2)),
      trajectories,
      histogramData,
    };
  }

  /**
   * Get Active AI Trade Signals
   */
  public static getCopilotSignals(): CopilotSignal[] {
    return [
      {
        id: 'sig-nvda-01',
        symbol: 'NVDA',
        name: 'NVIDIA Corporation',
        assetClass: 'EQUITY',
        type: 'STRONG_BUY',
        confidence: 94,
        timeframe: 'SWING (1D-4H)',
        currentPrice: 132.50,
        entryPrice: 131.80,
        stopLoss: 126.50,
        targetPrice1: 142.00,
        targetPrice2: 155.00,
        riskRewardRatio: 2.92,
        kellySizePercent: 8.4,
        reasoning: {
          technical: 'Inverse Head & Shoulders breakout on 4H chart with surging volume above 50 EMA.',
          sentiment: 'Bullish chip demand sentiment score (88/100) driven by server cluster expansion news.',
          microstructure: 'Dark pool buying delta +$420M with 72% institutional buy ratio.',
          gexBias: 'Price crossed above Zero Gamma Flip ($129.50) into positive acceleration delta zone.',
        },
        timestamp: 'Just now',
      },
      {
        id: 'sig-btc-02',
        symbol: 'BTC/USD',
        name: 'Bitcoin',
        assetClass: 'CRYPTO',
        type: 'BUY',
        confidence: 86,
        timeframe: 'SCALP (15M)',
        currentPrice: 66450,
        entryPrice: 66200,
        stopLoss: 64800,
        targetPrice1: 68900,
        targetPrice2: 71500,
        riskRewardRatio: 2.45,
        kellySizePercent: 6.2,
        reasoning: {
          technical: 'Bullish flag consolidation breakout above VWAP with rising momentum RSI (62).',
          sentiment: 'Institutional ETF inflow momentum delta +$340M net daily.',
          microstructure: 'Short squeeze liquidations triggered above $66,000 resistance level.',
          gexBias: 'Options gamma pin at $65,000 resolved to upside momentum sweep.',
        },
        timestamp: '4m ago',
      },
      {
        id: 'sig-aapl-03',
        symbol: 'AAPL',
        name: 'Apple Inc.',
        assetClass: 'EQUITY',
        type: 'NEUTRAL',
        confidence: 68,
        timeframe: 'POSITION (1W)',
        currentPrice: 224.30,
        entryPrice: 222.00,
        stopLoss: 215.00,
        targetPrice1: 235.00,
        targetPrice2: 242.00,
        riskRewardRatio: 1.85,
        kellySizePercent: 3.5,
        reasoning: {
          technical: 'RSI divergence near historical resistance zone; rangebound 20-day SMA.',
          sentiment: 'Neutral product supply chain updates with steady consumer sentiment.',
          microstructure: 'Balanced institutional buy/sell delta; dark pool flow flat.',
          gexBias: 'Heavy Call Wall pin at $225 acting as magnetic resistance ceiling.',
        },
        timestamp: '12m ago',
      },
      {
        id: 'sig-tsla-04',
        symbol: 'TSLA',
        name: 'Tesla Inc.',
        assetClass: 'EQUITY',
        type: 'SELL',
        confidence: 82,
        timeframe: 'SWING (1D-4H)',
        currentPrice: 242.10,
        entryPrice: 243.50,
        stopLoss: 252.00,
        targetPrice1: 225.00,
        targetPrice2: 210.00,
        riskRewardRatio: 2.18,
        kellySizePercent: 5.1,
        reasoning: {
          technical: 'Bearish engulfing candle breaking below key trendline support with volume expansion.',
          sentiment: 'Negative delivery estimate revisions pushing sentiment index down to 34/100.',
          microstructure: 'Aggressive institutional selling delta -$210M over last 3 sessions.',
          gexBias: 'Price dipping below Zero Gamma Flip ($245.00), triggering negative gamma volatility.',
        },
        timestamp: '18m ago',
      },
    ];
  }

  /**
   * Get Macro Shock Scenarios
   */
  public static getMacroScenarios(): MacroShockScenario[] {
    return [
      {
        id: 'shock-fed-hike',
        label: 'Fed Hawkish Surprise (+50bps)',
        description: 'Unexpected rate hike driving Treasury yields up and equity multiples down.',
        equityShockPct: -7.5,
        volatilityMultiplier: 1.65,
        rateShiftBps: 50,
        assetClassImpact: { tech: -10.2, crypto: -14.5, energy: -2.1, financials: 1.8 },
      },
      {
        id: 'shock-tech-crash',
        label: 'Tech Sector Flash De-leveraging',
        description: 'Rapid systematic unwind of high-beta AI stocks and chipmakers.',
        equityShockPct: -12.0,
        volatilityMultiplier: 2.10,
        rateShiftBps: -15,
        assetClassImpact: { tech: -18.4, crypto: -16.2, energy: -4.0, financials: -5.5 },
      },
      {
        id: 'shock-oil-spike',
        label: 'Geopolitical Energy Supply Shock',
        description: 'Crude oil surges +25%, raising inflation fears and consumer margin pressure.',
        equityShockPct: -5.2,
        volatilityMultiplier: 1.40,
        rateShiftBps: 25,
        assetClassImpact: { tech: -6.8, crypto: -8.0, energy: 16.4, financials: -3.2 },
      },
      {
        id: 'shock-soft-landing',
        label: 'Soft Landing Goldilocks Rally',
        description: 'Disinflation trajectory holds while productivity expands across major indices.',
        equityShockPct: 8.5,
        volatilityMultiplier: 0.80,
        rateShiftBps: -25,
        assetClassImpact: { tech: 12.4, crypto: 19.5, energy: 4.2, financials: 7.1 },
      },
    ];
  }

  /**
   * Get Options Gamma Exposure (GEX) Profile
   */
  public static getGexProfile(symbol: string = 'NVDA'): GexProfile {
    const basePrice = symbol === 'NVDA' ? 132.5 : symbol === 'BTC/USD' ? 66450 : 224.3;
    const isCrypto = symbol.includes('BTC');
    const step = isCrypto ? 1000 : 2.5;

    const strikes: GexStrikeLevel[] = [];
    const callWallStrike = Math.round((basePrice * 1.06) / step) * step;
    const putWallStrike = Math.round((basePrice * 0.94) / step) * step;
    const zeroGammaFlip = Math.round((basePrice * 0.98) / step) * step;

    for (let i = -6; i <= 6; i++) {
      const strike = Math.round((basePrice + i * step) / step) * step;
      const distFromPrice = Math.abs(strike - basePrice);
      const callGex = Math.max(1, Math.round((45 - distFromPrice * (isCrypto ? 0.005 : 1.2)) * (strike >= basePrice ? 1.5 : 0.6)));
      const putGex = Math.max(1, Math.round((40 - distFromPrice * (isCrypto ? 0.005 : 1.2)) * (strike <= basePrice ? 1.5 : 0.6)));
      const netGex = callGex - putGex;

      strikes.push({
        strike,
        callGex,
        putGex,
        netGex,
        isCallWall: strike === callWallStrike,
        isPutWall: strike === putWallStrike,
        isFlipLevel: strike === zeroGammaFlip,
      });
    }

    return {
      symbol,
      currentPrice: basePrice,
      callWallStrike,
      putWallStrike,
      zeroGammaFlip,
      totalNetGexNotional: 1420.5,
      regime: basePrice >= zeroGammaFlip ? 'LONG_GAMMA' : 'SHORT_GAMMA',
      strikeDistribution: strikes,
    };
  }

  /**
   * Get Dark Pool & Liquidity Flows
   */
  public static getDarkPoolFlows(): DarkPoolFlow[] {
    return [
      { symbol: 'NVDA', sector: 'Semiconductors', darkPoolBuyRatio: 72.4, institutionalDeltaUsd: 420.8, unusualOptionsVolume: true, spyCorrelation: 0.88, liquidityScore: 96 },
      { symbol: 'AAPL', sector: 'Consumer Electronics', darkPoolBuyRatio: 51.2, institutionalDeltaUsd: 12.4, unusualOptionsVolume: false, spyCorrelation: 0.92, liquidityScore: 98 },
      { symbol: 'BTC/USD', sector: 'Digital Assets', darkPoolBuyRatio: 68.9, institutionalDeltaUsd: 340.0, unusualOptionsVolume: true, spyCorrelation: 0.42, liquidityScore: 89 },
      { symbol: 'MSFT', sector: 'Software & Cloud', darkPoolBuyRatio: 64.1, institutionalDeltaUsd: 195.6, unusualOptionsVolume: true, spyCorrelation: 0.85, liquidityScore: 95 },
      { symbol: 'TSLA', sector: 'EV & Automotive', darkPoolBuyRatio: 38.5, institutionalDeltaUsd: -210.5, unusualOptionsVolume: true, spyCorrelation: 0.74, liquidityScore: 92 },
      { symbol: 'AMD', sector: 'Semiconductors', darkPoolBuyRatio: 69.8, institutionalDeltaUsd: 148.2, unusualOptionsVolume: false, spyCorrelation: 0.81, liquidityScore: 90 },
    ];
  }

  /**
   * Get Automation Rules
   */
  public static getAutonomousRules(): AutonomousRule[] {
    return [
      {
        id: 'rule-01',
        name: 'Gamma Flip Breakout Scalper',
        active: true,
        asset: 'NVDA',
        triggerCondition: 'Price > ZeroGammaFlip AND DarkPoolBuyRatio > 65%',
        action: 'BUY',
        positionSizeUsd: 10000,
        stopLossPct: 1.8,
        takeProfitPct: 4.5,
        winRate: 74.2,
        totalTrades: 62,
        netProfitUsd: 14850,
        lastTriggered: '12m ago',
      },
      {
        id: 'rule-02',
        name: 'Bitcoin Volatility Compression Sweep',
        active: true,
        asset: 'BTC/USD',
        triggerCondition: 'RSI(14) < 32 AND NetGexNotional > $300M',
        action: 'BUY',
        positionSizeUsd: 15000,
        stopLossPct: 2.2,
        takeProfitPct: 6.0,
        winRate: 68.5,
        totalTrades: 41,
        netProfitUsd: 19200,
        lastTriggered: '3h ago',
      },
      {
        id: 'rule-03',
        name: 'Macro Tail Risk Auto-Hedge',
        active: false,
        asset: 'SPY',
        triggerCondition: 'VaR(95%) > $15,000 OR VolatilityMultiplier > 1.8',
        action: 'HEDGE',
        positionSizeUsd: 25000,
        stopLossPct: 1.5,
        takeProfitPct: 5.0,
        winRate: 81.0,
        totalTrades: 16,
        netProfitUsd: 8400,
        lastTriggered: '2 days ago',
      },
    ];
  }
}
