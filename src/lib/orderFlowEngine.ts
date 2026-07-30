import type {
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
 * Client-Side Quantitative Order Flow & Risk Computation Engine
 */
export class ClientOrderFlowEngine {
  public static BASE_PRICES: Record<string, number> = {
    NVDA: 130.50,
    AAPL: 224.80,
    'BTC/USD': 64200.00,
    TSLA: 238.10,
    MSFT: 448.30,
    AMZN: 185.60,
    SPY: 545.20,
    QQQ: 480.90,
  };

  public static generateDarkPoolPrints(symbol: string = 'NVDA', count: number = 25): DarkPoolPrint[] {
    const basePrice = this.BASE_PRICES[symbol] || 150.00;
    const prints: DarkPoolPrint[] = [];
    const now = Date.now();

    const exchanges = ['FINRA-ADF', 'EDGX-DARK', 'LX-DARK', 'SIGMA-X', 'CROSSFINDER', 'INTERACTIVE-ICE'];
    const signatures: ('BLOCK' | 'SWEEP' | 'ICEBERG_PARTIAL' | 'DARK_POOL_PRINT')[] = [
      'BLOCK',
      'SWEEP',
      'ICEBERG_PARTIAL',
      'DARK_POOL_PRINT'
    ];

    for (let i = 0; i < count; i++) {
      const timeOffset = (count - i) * Math.floor(Math.random() * 30000 + 10000);
      const timestamp = new Date(now - timeOffset).toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      const priceOffset = (Math.sin(i * 0.5) * 0.006) + ((Math.random() - 0.48) * 0.004);
      const price = Number((basePrice * (1 + priceOffset)).toFixed(2));

      const isLargeBlock = Math.random() > 0.65;
      const size = isLargeBlock
        ? Math.floor(18000 + Math.random() * 95000)
        : Math.floor(1500 + Math.random() * 12000);

      const notionalValue = Number((price * size).toFixed(2));

      const sides: DarkPoolPrintSide[] = ['BUY_SIDE', 'SELL_SIDE', 'CROSS', 'NEUTRAL'];
      const sideWeights = [0.44, 0.38, 0.10, 0.08];
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
      const isAnomaly = notionalValue > 3000000 || (signature === 'SWEEP' && size > 35000);
      const institutionalConfidence = Math.min(99, Math.floor(72 + (notionalValue / 1200000) * 5 + Math.random() * 12));

      prints.push({
        id: `client-print-${now}-${i}`,
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

  public static generateOptionGammaProfile(symbol: string = 'NVDA'): OptionGammaProfile {
    const spotPrice = this.BASE_PRICES[symbol] || 150.00;
    const strikeInterval = spotPrice > 1000 ? 50 : spotPrice > 300 ? 5 : spotPrice > 50 ? 2.5 : 1;

    const minStrike = Math.floor((spotPrice * 0.86) / strikeInterval) * strikeInterval;
    const strikesCount = 17;
    const strikes: OptionGammaStrike[] = [];

    let totalCallGamma = 0;
    let totalPutGamma = 0;
    let maxGammaVal = 0;
    let pinStrike = spotPrice;

    for (let i = 0; i < strikesCount; i++) {
      const strike = Number((minStrike + i * strikeInterval).toFixed(2));
      const distFromSpot = (strike - spotPrice) / spotPrice;

      const gammaMultiplier = Math.exp(-Math.pow(distFromSpot * 7.5, 2));

      const callGamma = Number((Math.max(0.1, (1.25 + distFromSpot * 3.2) * gammaMultiplier * (Math.random() * 0.35 + 0.85)) * 1200000).toFixed(0));
      const putGamma = Number((Math.max(0.1, (1.25 - distFromSpot * 3.2) * gammaMultiplier * (Math.random() * 0.35 + 0.85)) * 1200000).toFixed(0));
      const netGamma = callGamma - putGamma;

      const callOpenInterest = Math.floor(callGamma / 110 + Math.random() * 2200);
      const putOpenInterest = Math.floor(putGamma / 110 + Math.random() * 2200);
      const callVolume = Math.floor(callOpenInterest * (0.18 + Math.random() * 0.22));
      const putVolume = Math.floor(putOpenInterest * (0.18 + Math.random() * 0.22));

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

    let zeroGammaStrike = spotPrice;
    for (let i = 0; i < strikes.length - 1; i++) {
      if (strikes[i].netGamma <= 0 && strikes[i + 1].netGamma > 0) {
        zeroGammaStrike = strikes[i + 1].strike;
        strikes[i + 1].isZeroGammaFlip = true;
        break;
      }
    }

    const pinIndex = strikes.findIndex(s => s.strike === pinStrike);
    if (pinIndex >= 0) {
      strikes[pinIndex].isPinStrike = true;
    }

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

  public static generateLevel2Book(symbol: string = 'NVDA'): Level2Book {
    const spotPrice = this.BASE_PRICES[symbol] || 150.00;
    const tick = spotPrice > 500 ? 0.50 : 0.05;

    const bids: Level2OrderBookItem[] = [];
    const asks: Level2OrderBookItem[] = [];

    let cumBidSize = 0;
    let cumAskSize = 0;

    const levels = 10;
    for (let i = 0; i < levels; i++) {
      const bidPrice = Number((spotPrice - (i + 1) * tick).toFixed(2));
      const askPrice = Number((spotPrice + (i + 1) * tick).toFixed(2));

      const isWallBid = i === 3 || i === 7;
      const isWallAsk = i === 2 || i === 8;

      const bidSize = isWallBid ? Math.floor(15000 + Math.random() * 28000) : Math.floor(1800 + Math.random() * 5200);
      const askSize = isWallAsk ? Math.floor(15000 + Math.random() * 28000) : Math.floor(1800 + Math.random() * 5200);

      cumBidSize += bidSize;
      cumAskSize += askSize;

      bids.push({
        price: bidPrice,
        size: bidSize,
        ordersCount: Math.floor(bidSize / 220) + 1,
        cumulativeSize: cumBidSize
      });

      asks.push({
        price: askPrice,
        size: askSize,
        ordersCount: Math.floor(askSize / 220) + 1,
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

  public static simulateOrderExecution(req: ExecutionSimRequest): ExecutionSimResult {
    const { symbol, totalShares, algoType, durationMinutes, urgencyLevel } = req;
    const spotPrice = this.BASE_PRICES[symbol] || 150.00;

    const sliceCount = Math.min(20, Math.max(5, durationMinutes));
    const sharesPerSlice = totalShares / sliceCount;
    const slices: ExecutionSlice[] = [];

    let accumShares = 0;
    let accumCost = 0;
    let accumVwapNumerator = 0;
    let accumVolume = 0;

    const urgencyImpactMultiplier = urgencyLevel === 'HIGH' ? 1.85 : urgencyLevel === 'MEDIUM' ? 1.0 : 0.55;

    for (let i = 0; i < sliceCount; i++) {
      const minute = i + 1;
      const timeLabel = `T+${minute}m`;

      let sliceWeight = 1.0;
      if (algoType === 'VWAP') {
        const normalizedTime = i / (sliceCount - 1 || 1);
        sliceWeight = 0.65 + 0.9 * Math.pow(normalizedTime - 0.5, 2) * 4;
      } else if (algoType === 'POV') {
        sliceWeight = 0.75 + Math.random() * 0.7;
      } else if (algoType === 'IMPLEMENTATION_SHORTFALL') {
        sliceWeight = 1.55 - (i / sliceCount) * 0.95;
      }

      const executedInSlice = Math.round(sharesPerSlice * sliceWeight);
      accumShares += executedInSlice;

      const marketImpactBps = (Math.sqrt(executedInSlice / 100000) * 4.8 * urgencyImpactMultiplier);
      const randomWalkBps = (Math.random() - 0.48) * 5.5;
      const totalImpactBps = marketImpactBps + randomWalkBps;

      const executionPrice = Number((spotPrice * (1 + totalImpactBps / 10000)).toFixed(2));
      const marketBarVolume = Math.floor(executedInSlice * (3.2 + Math.random() * 3.8));
      const barVwapPrice = Number((executionPrice * (1 + (Math.random() - 0.5) * 0.0007)).toFixed(2));

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

  public static generateMonteCarloRisk(symbol: string = 'NVDA', portfolioValue: number = 250000, ivShiftPercent: number = 0, spotShiftPercent: number = 0): MonteCarloRiskAnalysis {
    const rawSpot = this.BASE_PRICES[symbol] || 150.00;
    const spotPrice = Number((rawSpot * (1 + spotShiftPercent / 100)).toFixed(2));
    const dailyVolatility = 0.022 * (1 + ivShiftPercent / 100);
    const daysForecast = 20;

    const pathCount = 400;
    const simulatedPaths: number[][] = [];

    for (let p = 0; p < pathCount; p++) {
      const path: number[] = [spotPrice];
      let currentPrice = spotPrice;

      for (let d = 1; d <= daysForecast; d++) {
        const drift = 0.0003;
        const shock = (Math.random() + Math.random() + Math.random() + Math.random() - 2.0) * 1.732;
        const priceReturn = drift + dailyVolatility * shock;
        currentPrice = currentPrice * Math.exp(priceReturn);
        path.push(currentPrice);
      }
      simulatedPaths.push(path);
    }

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
        label: d === 0 ? 'Today' : `D+${d}`,
        medianPrice: Number(p50.toFixed(2)),
        percentile5: Number(p5.toFixed(2)),
        percentile25: Number(p25.toFixed(2)),
        percentile75: Number(p75.toFixed(2)),
        percentile95: Number(p95.toFixed(2))
      });
    }

    const terminalPrices = simulatedPaths.map(p => p[daysForecast]).sort((a, b) => a - b);
    const var95Price = terminalPrices[Math.floor(pathCount * 0.05)];
    const var99Price = terminalPrices[Math.floor(pathCount * 0.01)];

    const var95LossPercent = (spotPrice - var95Price) / spotPrice;
    const var99LossPercent = (spotPrice - var99Price) / spotPrice;

    const var95 = Number((portfolioValue * var95LossPercent).toFixed(2));
    const var99 = Number((portfolioValue * var99LossPercent).toFixed(2));

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
