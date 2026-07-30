import {
  DarkPoolPrint,
  DarkPoolPrintSide,
  OptionGammaProfile,
  OptionGammaStrike,
  Level2Book,
  Level2OrderBookItem,
  ExecutionSimRequest,
  ExecutionSimResult,
  ExecutionSlice,
  MonteCarloRiskAnalysis,
  MonteCarloPathPoint
} from '../types/orderFlow';

/**
 * OrderFlowEngine
 * Advanced Quantitative Order Flow & Risk Analytics Engine.
 */
export class OrderFlowEngine {
  private static MOCK_BASE_PRICES: Record<string, number> = {
    NVDA: 130.50,
    AAPL: 224.80,
    'BTC/USD': 64200.00,
    TSLA: 238.10,
    MSFT: 448.30,
    AMZN: 185.60,
    SPY: 545.20,
    QQQ: 480.90,
  };

  /**
   * Generates real-time Dark Pool Block Prints & Institutional Signatures
   */
  public static getDarkPoolPrints(symbol: string = 'NVDA', count: number = 20): DarkPoolPrint[] {
    const basePrice = this.MOCK_BASE_PRICES[symbol] || 150.00;
    const prints: DarkPoolPrint[] = [];
    const now = Date.now();

    const exchanges = ['FINRA-ADF', 'EDGX-DARK', 'LX-DARK', 'SIGMA-X', 'CROSSFINDER'];
    const signatures: ('BLOCK' | 'SWEEP' | 'ICEBERG_PARTIAL' | 'DARK_POOL_PRINT')[] = [
      'BLOCK',
      'SWEEP',
      'ICEBERG_PARTIAL',
      'DARK_POOL_PRINT'
    ];

    for (let i = 0; i < count; i++) {
      const timeOffset = (count - i) * Math.floor(Math.random() * 45000 + 15000);
      const timestamp = new Date(now - timeOffset).toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      // Price fluctuates around base price
      const priceOffset = (Math.sin(i * 0.7) * 0.008) + ((Math.random() - 0.49) * 0.005);
      const price = Number((basePrice * (1 + priceOffset)).toFixed(2));

      // Size calculation: large institution sizes vs regular block prints
      const isMegaBlock = Math.random() > 0.75;
      const size = isMegaBlock
        ? Math.floor(15000 + Math.random() * 85000)
        : Math.floor(2000 + Math.random() * 12000);

      const notionalValue = Number((price * size).toFixed(2));

      const sides: DarkPoolPrintSide[] = ['BUY_SIDE', 'SELL_SIDE', 'CROSS', 'NEUTRAL'];
      const sideWeights = [0.45, 0.35, 0.12, 0.08];
      const randSide = Math.random();
      let side: DarkPoolPrintSide = 'BUY_SIDE';
      let accum = 0;
      for (let s = 0; s < sides.length; s++) {
        accum += sideWeights[s];
        if (randSide <= accum) {
          side = sides[s];
          break;
        }
      }

      const sigIndex = Math.floor(Math.random() * signatures.length);
      const signature = signatures[sigIndex];
      const isAnomaly = notionalValue > 2500000 || (signature === 'SWEEP' && size > 30000);
      const institutionalConfidence = Math.min(99, Math.floor(70 + (notionalValue / 1000000) * 5 + Math.random() * 15));

      prints.push({
        id: `print-${now}-${i}`,
        symbol,
        timestamp,
        price,
        size,
        notionalValue,
        side,
        signature,
        exchangeCode: exchanges[Math.floor(Math.random() * exchanges.length)],
        isAnomaly,
        institutionalConfidence
      });
    }

    return prints;
  }

  /**
   * Generates Option Gamma Exposure (GEX) Spectrum & Pinning Analysis
   */
  public static getOptionGammaProfile(symbol: string = 'NVDA'): OptionGammaProfile {
    const spotPrice = this.MOCK_BASE_PRICES[symbol] || 150.00;
    const strikeInterval = spotPrice > 1000 ? 50 : spotPrice > 300 ? 5 : spotPrice > 50 ? 2.5 : 1;

    // Create 15 strike steps centered on spot price
    const minStrike = Math.floor((spotPrice * 0.85) / strikeInterval) * strikeInterval;
    const strikesCount = 17;
    const strikes: OptionGammaStrike[] = [];

    let totalCallGamma = 0;
    let totalPutGamma = 0;
    let maxGammaVal = 0;
    let pinStrike = spotPrice;

    for (let i = 0; i < strikesCount; i++) {
      const strike = Number((minStrike + i * strikeInterval).toFixed(2));
      const distFromSpot = (strike - spotPrice) / spotPrice;

      // Gamma peaks near spot and decays outward
      const gammaMultiplier = Math.exp(-Math.pow(distFromSpot * 8, 2));

      // Calls dominate above spot, puts dominate below spot
      const callGamma = Number((Math.max(0.1, (1.2 + distFromSpot * 3) * gammaMultiplier * (Math.random() * 0.4 + 0.8)) * 1000000).toFixed(0));
      const putGamma = Number((Math.max(0.1, (1.2 - distFromSpot * 3) * gammaMultiplier * (Math.random() * 0.4 + 0.8)) * 1000000).toFixed(0));
      const netGamma = callGamma - putGamma;

      const callOpenInterest = Math.floor(callGamma / 120 + Math.random() * 2000);
      const putOpenInterest = Math.floor(putGamma / 120 + Math.random() * 2000);
      const callVolume = Math.floor(callOpenInterest * (0.15 + Math.random() * 0.25));
      const putVolume = Math.floor(putOpenInterest * (0.15 + Math.random() * 0.25));

      totalCallGamma += callGamma;
      totalPutGamma += putGamma;

      const combinedGamma = callGamma + putGamma;
      if (combinedGamma > maxGammaVal) {
        maxGammaVal = combinedGamma;
        pinStrike = strike;
      }

      strikes.push({
        strike,
        callGamma,
        putGamma,
        netGamma,
        callOpenInterest,
        putOpenInterest,
        callVolume,
        putVolume,
        isPinStrike: false,
        isZeroGammaFlip: false
      });
    }

    // Find Zero Gamma Flip strike (where Net Gamma transitions from negative to positive)
    let zeroGammaStrike = spotPrice;
    for (let i = 0; i < strikes.length - 1; i++) {
      if (strikes[i].netGamma <= 0 && strikes[i + 1].netGamma > 0) {
        zeroGammaStrike = strikes[i + 1].strike;
        strikes[i + 1].isZeroGammaFlip = true;
        break;
      }
    }

    // Tag Pin strike
    const pinIndex = strikes.findIndex(s => s.strike === pinStrike);
    if (pinIndex >= 0) {
      strikes[pinIndex].isPinStrike = true;
    }

    // Call Wall (highest call OI) & Put Wall (highest put OI)
    const callWall = [...strikes].sort((a, b) => b.callOpenInterest - a.callOpenInterest)[0]?.strike || spotPrice;
    const putWall = [...strikes].sort((a, b) => b.putOpenInterest - a.putOpenInterest)[0]?.strike || spotPrice;

    const totalNetGamma = totalCallGamma - totalPutGamma;
    const gexRegime = totalNetGamma >= 0 ? 'LONG_GAMMA_STABILIZING' : 'SHORT_GAMMA_VOLATILE';

    return {
      symbol,
      spotPrice,
      totalCallGamma: Math.round(totalCallGamma),
      totalPutGamma: Math.round(totalPutGamma),
      totalNetGamma: Math.round(totalNetGamma),
      zeroGammaStrike,
      maxPainStrike: pinStrike,
      callWall,
      putWall,
      gexRegime,
      strikes
    };
  }

  /**
   * Generates Real-Time Level 2 Order Book Depth (DOM)
   */
  public static getLevel2Book(symbol: string = 'NVDA'): Level2Book {
    const spotPrice = this.MOCK_BASE_PRICES[symbol] || 150.00;
    const tick = spotPrice > 500 ? 0.50 : 0.05;

    const bids: Level2OrderBookItem[] = [];
    const asks: Level2OrderBookItem[] = [];

    let cumBidSize = 0;
    let cumAskSize = 0;

    const levels = 10;
    for (let i = 0; i < levels; i++) {
      const bidPrice = Number((spotPrice - (i + 1) * tick).toFixed(2));
      const askPrice = Number((spotPrice + (i + 1) * tick).toFixed(2));

      // Size decays slightly as distance grows, with random institutional walls
      const isWallBid = i === 4 || i === 7;
      const isWallAsk = i === 3 || i === 8;

      const bidSize = isWallBid ? Math.floor(12000 + Math.random() * 25000) : Math.floor(1500 + Math.random() * 4500);
      const askSize = isWallAsk ? Math.floor(12000 + Math.random() * 25000) : Math.floor(1500 + Math.random() * 4500);

      cumBidSize += bidSize;
      cumAskSize += askSize;

      bids.push({
        price: bidPrice,
        size: bidSize,
        ordersCount: Math.floor(bidSize / 250) + 1,
        cumulativeSize: cumBidSize
      });

      asks.push({
        price: askPrice,
        size: askSize,
        ordersCount: Math.floor(askSize / 250) + 1,
        cumulativeSize: cumAskSize
      });
    }

    const spread = Number((asks[0].price - bids[0].price).toFixed(2));
    const imbalanceRatio = Number(((cumBidSize - cumAskSize) / (cumBidSize + cumAskSize)).toFixed(3));

    return {
      symbol,
      timestamp: new Date().toLocaleTimeString(),
      bids,
      asks,
      spread,
      bidLiquidity: cumBidSize,
      askLiquidity: cumAskSize,
      imbalanceRatio
    };
  }

  /**
   * Algorithmic Order Router & Execution Simulator (TWAP, VWAP, POV, Implementation Shortfall)
   */
  public static simulateExecution(req: ExecutionSimRequest): ExecutionSimResult {
    const { symbol, totalShares, algoType, durationMinutes, urgencyLevel } = req;
    const spotPrice = this.MOCK_BASE_PRICES[symbol] || 150.00;

    const sliceCount = Math.min(20, Math.max(5, durationMinutes));
    const sharesPerSlice = totalShares / sliceCount;
    const slices: ExecutionSlice[] = [];

    let accumShares = 0;
    let accumCost = 0;
    let accumVwapNumerator = 0;
    let accumVolume = 0;

    // Urgency parameter affects aggression and market impact
    const urgencyImpactMultiplier = urgencyLevel === 'HIGH' ? 1.8 : urgencyLevel === 'MEDIUM' ? 1.0 : 0.6;

    for (let i = 0; i < sliceCount; i++) {
      const minute = i + 1;
      const timeLabel = `T+${minute}m`;

      // Profile weight calculation based on Algo Type
      let sliceWeight = 1.0;
      if (algoType === 'VWAP') {
        // U-shaped intraday volume profile curve (higher at open/close)
        const normalizedTime = i / (sliceCount - 1 || 1);
        sliceWeight = 0.7 + 0.8 * Math.pow(normalizedTime - 0.5, 2) * 4;
      } else if (algoType === 'POV') {
        // Market volume spikes randomly
        sliceWeight = 0.8 + Math.random() * 0.6;
      } else if (algoType === 'IMPLEMENTATION_SHORTFALL') {
        // Front-loaded execution to capture arrival price
        sliceWeight = 1.5 - (i / sliceCount) * 0.9;
      }

      const executedInSlice = Math.round(sharesPerSlice * sliceWeight);
      accumShares += executedInSlice;

      // Simulating price drift & market impact (square-root law of market impact)
      const marketImpactBps = (Math.sqrt(executedInSlice / 100000) * 4.5 * urgencyImpactMultiplier);
      const randomWalkBps = (Math.random() - 0.48) * 6;
      const totalImpactBps = marketImpactBps + randomWalkBps;

      const executionPrice = Number((spotPrice * (1 + totalImpactBps / 10000)).toFixed(2));
      const marketBarVolume = Math.floor(executedInSlice * (3 + Math.random() * 4));
      const barVwapPrice = Number((executionPrice * (1 + (Math.random() - 0.5) * 0.0008)).toFixed(2));

      accumCost += executedInSlice * executionPrice;
      accumVwapNumerator += marketBarVolume * barVwapPrice;
      accumVolume += marketBarVolume;

      const currentVwap = Number((accumVwapNumerator / accumVolume).toFixed(2));
      const slippageBps = Number((((executionPrice - spotPrice) / spotPrice) * 10000).toFixed(1));

      slices.push({
        minute,
        timeLabel,
        sharesExecuted: executedInSlice,
        cumulativeShares: accumShares,
        executionPrice,
        benchmarkVwap: currentVwap,
        slippageBps,
        marketImpact: Number(marketImpactBps.toFixed(2))
      });
    }

    const averageExecutionPrice = Number((accumCost / (accumShares || 1)).toFixed(2));
    const benchmarkVwap = Number((accumVwapNumerator / (accumVolume || 1)).toFixed(2));
    const totalSlippageBps = Number((((averageExecutionPrice - spotPrice) / spotPrice) * 10000).toFixed(1));
    const totalMarketImpactUsd = Number(((averageExecutionPrice - spotPrice) * totalShares).toFixed(2));

    return {
      symbol,
      algoType,
      totalSharesRequested: totalShares,
      totalSharesExecuted: accumShares,
      averageExecutionPrice,
      benchmarkVwap,
      benchmarkArrivalPrice: spotPrice,
      totalSlippageBps,
      totalMarketImpactUsd,
      executionTimeMinutes: durationMinutes,
      slices
    };
  }

  /**
   * Monte Carlo VaR (Value-at-Risk) Engine & Macro Stress Tester
   */
  public static runMonteCarloRisk(symbol: string = 'NVDA', portfolioValue: number = 250000): MonteCarloRiskAnalysis {
    const spotPrice = this.MOCK_BASE_PRICES[symbol] || 150.00;
    const dailyVolatility = 0.022; // 2.2% daily vol
    const daysForecast = 20;

    // Simulate 500 price trajectories
    const pathCount = 500;
    const simulatedPaths: number[][] = [];

    for (let p = 0; p < pathCount; p++) {
      const path: number[] = [spotPrice];
      let currentPrice = spotPrice;

      for (let d = 1; d <= daysForecast; d++) {
        // Geometric Brownian Motion (GBM) step
        const drift = 0.0003; // small positive drift
        const shock = (Math.random() + Math.random() + Math.random() + Math.random() - 2.0) * 1.732; // Standard normal approx
        const priceReturn = drift + dailyVolatility * shock;
        currentPrice = currentPrice * Math.exp(priceReturn);
        path.push(currentPrice);
      }
      simulatedPaths.push(path);
    }

    // Extract percentiles across steps
    const pathPoints: MonteCarloPathPoint[] = [];
    for (let d = 0; d <= daysForecast; d++) {
      const stepPrices = simulatedPaths.map(p => p[d]).sort((a, b) => a - b);
      const p5 = stepPrices[Math.floor(pathCount * 0.05)];
      const p25 = stepPrices[Math.floor(pathCount * 0.25)];
      const p50 = stepPrices[Math.floor(pathCount * 0.50)];
      const p75 = stepPrices[Math.floor(pathCount * 0.75)];
      const p95 = stepPrices[Math.floor(pathCount * 0.95)];

      pathPoints.push({
        step: d,
        label: d === 0 ? 'Today' : `Day ${d}`,
        medianPrice: Number(p50.toFixed(2)),
        percentile5: Number(p5.toFixed(2)),
        percentile25: Number(p25.toFixed(2)),
        percentile75: Number(p75.toFixed(2)),
        percentile95: Number(p95.toFixed(2))
      });
    }

    // Calculate 20-day horizon terminal returns for VaR
    const terminalPrices = simulatedPaths.map(p => p[daysForecast]).sort((a, b) => a - b);
    const var95Price = terminalPrices[Math.floor(pathCount * 0.05)];
    const var99Price = terminalPrices[Math.floor(pathCount * 0.01)];

    const var95LossPercent = (spotPrice - var95Price) / spotPrice;
    const var99LossPercent = (spotPrice - var99Price) / spotPrice;

    const var95 = Number((portfolioValue * var95LossPercent).toFixed(2));
    const var99 = Number((portfolioValue * var99LossPercent).toFixed(2));

    // Expected Shortfall (CVaR): average loss beyond VaR threshold
    const tail95Prices = terminalPrices.slice(0, Math.floor(pathCount * 0.05));
    const avgTail95Price = tail95Prices.reduce((a, b) => a + b, 0) / (tail95Prices.length || 1);
    const cvar95 = Number((portfolioValue * ((spotPrice - avgTail95Price) / spotPrice)).toFixed(2));

    const tail99Prices = terminalPrices.slice(0, Math.floor(pathCount * 0.01));
    const avgTail99Price = tail99Prices.reduce((a, b) => a + b, 0) / (tail99Prices.length || 1);
    const cvar99 = Number((portfolioValue * ((spotPrice - avgTail99Price) / spotPrice)).toFixed(2));

    return {
      symbol,
      portfolioValue,
      confidenceLevels: {
        var95,
        var99,
        cvar95,
        cvar99,
        var95Percent: Number((var95LossPercent * 100).toFixed(2)),
        var99Percent: Number((var99LossPercent * 100).toFixed(2))
      },
      stressScenarios: [
        {
          name: '2008 Liquidity Shock (-18%)',
          description: 'Systemic banking panic and sharp systemic margin calls.',
          pnlImpact: -Number((portfolioValue * 0.18).toFixed(2)),
          pnlPercent: -18.00
        },
        {
          name: 'Flash Volatility Surge (+40% IV)',
          description: 'Rapid expansion in options implied volatility and GEX squeeze.',
          pnlImpact: -Number((portfolioValue * 0.115).toFixed(2)),
          pnlPercent: -11.50
        },
        {
          name: 'Fed Surprise Rate Hike (+50bps)',
          description: 'Discount rate adjustment re-pricing growth asset valuations.',
          pnlImpact: -Number((portfolioValue * 0.074).toFixed(2)),
          pnlPercent: -7.40
        },
        {
          name: 'Tech Earnings Breakout (+12%)',
          description: 'Upside demand surge causing aggressive short gamma squeeze.',
          pnlImpact: Number((portfolioValue * 0.12).toFixed(2)),
          pnlPercent: 12.00
        }
      ],
      paths: pathPoints
    };
  }
}
