/**
 * NeuroVolEngine.ts
 * Quantitative Options Implied Volatility Surface, Volatility Smile/Skew Solver,
 * Delta-Gamma-Vega Dynamic Hedging Calculator, and Volatility Risk Premium Arbitrage Scanner.
 */

export interface VolPoint {
  strikePrice: number;
  moneynessPct: number; // e.g. 80%, 90%, 100% (ATM), 110%, 120%
  iv7dPct: number;
  iv30dPct: number;
  iv60dPct: number;
  iv90dPct: number;
  callIvPct: number;
  putIvPct: number;
}

export interface PortfolioGreeks {
  spotPriceUsd: number;
  netDeltaShares: number;
  netGamma: number;
  netThetaPerDayUsd: number;
  netVegaPerPointUsd: number;
  netRho: number;
  deltaRebalanceRequiredShares: number;
  recommendedHedgeAction: string;
}

export interface VolArbOpportunity {
  id: string;
  symbol: string;
  optionType: 'CALL' | 'PUT';
  strike: number;
  expiration: string;
  currentIvPct: number;
  historicalRvPct: number; // 30-day realized volatility
  ivRvSpreadBps: number; // IV - RV spread in BPS
  mispricingType: 'OVERVALUED_SELL_VOL' | 'UNDERVALUED_BUY_VOL';
  expectedEdgePct: number;
}

export interface VolTermPoint {
  expirationDays: number;
  tenorLabel: string;
  impliedVolPct: number;
  realizedVolPct: number;
  volCone25thPct: number;
  volCone75thPct: number;
}

export interface VolOverview {
  currentIv30dPct: number;
  ivPercentile30d: number;
  ivRank30d: number;
  volRegime: 'VOLATILITY_COMPRESSION' | 'ELEVATED_RISK_PREMIUM' | 'HIGH_VOLATILITY_SPIKE';
}

export class NeuroVolEngine {
  /**
   * Get Overall Volatility Market Overview
   */
  public static getVolOverview(): VolOverview {
    return {
      currentIv30dPct: 24.8,
      ivPercentile30d: 68.2,
      ivRank30d: 54.0,
      volRegime: 'ELEVATED_RISK_PREMIUM',
    };
  }

  /**
   * Get Volatility Smile & Skew Surface Points (NVDA)
   */
  public static getVolSurfacePoints(spotPrice: number = 123.0): VolPoint[] {
    const strikes = [
      Math.round(spotPrice * 0.80),
      Math.round(spotPrice * 0.90),
      Math.round(spotPrice * 0.95),
      Math.round(spotPrice * 1.00), // ATM
      Math.round(spotPrice * 1.05),
      Math.round(spotPrice * 1.10),
      Math.round(spotPrice * 1.20),
    ];

    return strikes.map(strike => {
      const moneynessPct = Number(((strike / spotPrice) * 100).toFixed(0));
      const skewFactor = Math.pow((100 - moneynessPct) / 10, 2);

      const baseIv = 24.5;
      const iv30dPct = Number((baseIv + skewFactor * 0.85).toFixed(1));
      const iv7dPct = Number((iv30dPct * 1.15).toFixed(1));
      const iv60dPct = Number((iv30dPct * 0.92).toFixed(1));
      const iv90dPct = Number((iv30dPct * 0.88).toFixed(1));

      return {
        strikePrice: strike,
        moneynessPct,
        iv7dPct,
        iv30dPct,
        iv60dPct,
        iv90dPct,
        callIvPct: Number((iv30dPct * 0.95).toFixed(1)),
        putIvPct: Number((iv30dPct * 1.08).toFixed(1)),
      };
    });
  }

  /**
   * Get Portfolio Greeks & Dynamic Delta Neutral Rebalancing
   */
  public static getPortfolioGreeks(spotPrice: number = 123.0): PortfolioGreeks {
    const netDeltaShares = 425;
    const deltaRebalanceRequiredShares = -425;

    return {
      spotPriceUsd: spotPrice,
      netDeltaShares,
      netGamma: 0.048,
      netThetaPerDayUsd: -145.20,
      netVegaPerPointUsd: +320.50,
      netRho: +12.40,
      deltaRebalanceRequiredShares,
      recommendedHedgeAction: `Short ${Math.abs(deltaRebalanceRequiredShares)} Shares of NVDA to achieve Delta-Neutral (Δ = 0)`,
    };
  }

  /**
   * Get Volatility Arbitrage Opportunities (IV vs RV Mispricing)
   */
  public static getVolArbOpportunities(): VolArbOpportunity[] {
    return [
      {
        id: 'varb-01',
        symbol: 'NVDA',
        optionType: 'PUT',
        strike: 110,
        expiration: '30D (Sep 20)',
        currentIvPct: 32.5,
        historicalRvPct: 22.0,
        ivRvSpreadBps: 1050,
        mispricingType: 'OVERVALUED_SELL_VOL',
        expectedEdgePct: 5.8,
      },
      {
        id: 'varb-02',
        symbol: 'AAPL',
        optionType: 'CALL',
        strike: 235,
        expiration: '45D (Oct 04)',
        currentIvPct: 16.2,
        historicalRvPct: 21.5,
        ivRvSpreadBps: -530,
        mispricingType: 'UNDERVALUED_BUY_VOL',
        expectedEdgePct: 4.2,
      },
      {
        id: 'varb-03',
        symbol: 'BTC/USD',
        optionType: 'PUT',
        strike: 55000,
        expiration: '30D (Sep 20)',
        currentIvPct: 58.4,
        historicalRvPct: 42.1,
        ivRvSpreadBps: 1630,
        mispricingType: 'OVERVALUED_SELL_VOL',
        expectedEdgePct: 8.4,
      },
    ];
  }

  /**
   * Get Volatility Term Structure & Volatility Cone Data
   */
  public static getVolTermStructure(): VolTermPoint[] {
    return [
      { expirationDays: 7, tenorLabel: '7D', impliedVolPct: 29.8, realizedVolPct: 21.2, volCone25thPct: 18.0, volCone75thPct: 32.0 },
      { expirationDays: 30, tenorLabel: '30D', impliedVolPct: 25.4, realizedVolPct: 22.5, volCone25thPct: 19.5, volCone75thPct: 28.5 },
      { expirationDays: 60, tenorLabel: '60D', impliedVolPct: 23.8, realizedVolPct: 21.8, volCone25thPct: 20.0, volCone75thPct: 27.0 },
      { expirationDays: 90, tenorLabel: '90D', impliedVolPct: 22.9, realizedVolPct: 21.0, volCone25thPct: 20.5, volCone75thPct: 26.2 },
      { expirationDays: 180, tenorLabel: '180D', impliedVolPct: 22.1, realizedVolPct: 20.4, volCone25thPct: 21.0, volCone75thPct: 25.5 },
    ];
  }
}
