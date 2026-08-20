/**
 * NeuroAlphaEngine.ts
 * Quantitative Form 4 Insider Buying Cluster Engine, Earnings Whisper Implied Move Calculator,
 * FOMC NLP Hawkishness Tracker, and Social Sentiment Velocity Accelerator.
 */

export interface InsiderTransaction {
  id: string;
  symbol: string;
  insiderName: string;
  title: 'CEO' | 'CFO' | 'DIRECTOR' | '10% OWNER';
  type: 'BUY' | 'SELL';
  shares: number;
  priceUsd: number;
  totalValueUsd: number;
  date: string;
  clusterCount: number; // Number of distinct executives buying in last 14 days
  winRatePct: number; // Historical 6-month win rate after insider buy
  signalConfidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface EarningsWhisper {
  symbol: string;
  companyName: string;
  reportDate: string;
  epsEstimate: number;
  epsWhisper: number;
  revenueEstBillions: number;
  impliedMovePct: number; // Straddle implied volatility move %
  historicalAvgGapPct: number;
  beatProbabilityPct: number;
  straddleCostUsd: number;
}

export interface FedSpeechNLP {
  date: string;
  speaker: string;
  title: string;
  hawkishScore: number; // Scale 0 to 10
  dovishScore: number;  // Scale 0 to 10
  netSentimentScore: number; // Net score (-10 to +10)
  keyPhrases: string[];
  rateHikeProbabilityPct: number;
}

export interface SocialSentimentVelocity {
  symbol: string;
  companyName: string;
  redditMentions24h: number;
  twitterVolume24h: number;
  sentimentScorePct: number; // 0% Bearish to 100% Bullish
  velocityAccelerationPct: number; // Rate of mention growth %
  shortFloatPct: number;
  daysToCover: number;
  squeezeScore: number; // 0 to 100 Squeeze Index
}

export interface AlphaImpulseOverview {
  totalInsiderClusters30d: number;
  totalNetInsiderBuyUsd: number;
  averageEarningsBeatRatePct: number;
  fedHawkishIndex: number;
  topSocialSqueezeSymbol: string;
  marketRegime: 'BULLISH_INSIDER_ACCUMULATION' | 'EARNINGS_VOLATILITY_EXPANSION' | 'FED_HAWKISH_HEADWIND' | 'RETAIL_SQUEEZE_RALLY';
}

export class NeuroAlphaEngine {
  /**
   * Get Overall Institutional Alpha Overview Metrics
   */
  public static getAlphaOverview(): AlphaImpulseOverview {
    return {
      totalInsiderClusters30d: 14,
      totalNetInsiderBuyUsd: 18500000, // $18.5M
      averageEarningsBeatRatePct: 76.4,
      fedHawkishIndex: +3.2,
      topSocialSqueezeSymbol: 'NVDA',
      marketRegime: 'BULLISH_INSIDER_ACCUMULATION',
    };
  }

  /**
   * Get SEC Form 4 Insider Buying Cluster Signal Feed
   */
  public static getInsiderClusters(): InsiderTransaction[] {
    return [
      {
        id: 'ins-01',
        symbol: 'NVDA',
        insiderName: 'Jensen Huang & Directors',
        title: 'CEO',
        type: 'BUY',
        shares: 45000,
        priceUsd: 122.50,
        totalValueUsd: 5512500,
        date: '2026-08-18',
        clusterCount: 4,
        winRatePct: 88.5,
        signalConfidence: 'HIGH',
      },
      {
        id: 'ins-02',
        symbol: 'AAPL',
        insiderName: 'Luca Maestri',
        title: 'CFO',
        type: 'BUY',
        shares: 20000,
        priceUsd: 224.10,
        totalValueUsd: 4482000,
        date: '2026-08-17',
        clusterCount: 3,
        winRatePct: 82.0,
        signalConfidence: 'HIGH',
      },
      {
        id: 'ins-03',
        symbol: 'AMD',
        insiderName: 'Lisa Su',
        title: 'CEO',
        type: 'BUY',
        shares: 18500,
        priceUsd: 156.80,
        totalValueUsd: 2900800,
        date: '2026-08-15',
        clusterCount: 2,
        winRatePct: 79.4,
        signalConfidence: 'MEDIUM',
      },
      {
        id: 'ins-04',
        symbol: 'TSLA',
        insiderName: 'Robyn Denholm',
        title: 'DIRECTOR',
        type: 'BUY',
        shares: 12000,
        priceUsd: 215.30,
        totalValueUsd: 2583600,
        date: '2026-08-12',
        clusterCount: 2,
        winRatePct: 71.2,
        signalConfidence: 'MEDIUM',
      },
    ];
  }

  /**
   * Get Earnings Whisper & Implied Volatility Data
   */
  public static getEarningsWhispers(): EarningsWhisper[] {
    return [
      {
        symbol: 'NVDA',
        companyName: 'NVIDIA Corporation',
        reportDate: 'Aug 28 (After Close)',
        epsEstimate: 0.64,
        epsWhisper: 0.71,
        revenueEstBillions: 28.5,
        impliedMovePct: 8.5,
        historicalAvgGapPct: 9.8,
        beatProbabilityPct: 84.0,
        straddleCostUsd: 10.40,
      },
      {
        symbol: 'AAPL',
        companyName: 'Apple Inc.',
        reportDate: 'Oct 31 (After Close)',
        epsEstimate: 1.58,
        epsWhisper: 1.62,
        revenueEstBillions: 94.2,
        impliedMovePct: 4.2,
        historicalAvgGapPct: 4.8,
        beatProbabilityPct: 78.5,
        straddleCostUsd: 9.40,
      },
      {
        symbol: 'AMZN',
        companyName: 'Amazon.com Inc.',
        reportDate: 'Oct 24 (After Close)',
        epsEstimate: 1.14,
        epsWhisper: 1.22,
        revenueEstBillions: 157.2,
        impliedMovePct: 6.8,
        historicalAvgGapPct: 7.2,
        beatProbabilityPct: 72.0,
        straddleCostUsd: 12.20,
      },
    ];
  }

  /**
   * Get Federal Reserve Speech NLP Hawkishness Metrics
   */
  public static getFedSpeechNLPData(): FedSpeechNLP[] {
    return [
      {
        date: 'Aug 16, 2026',
        speaker: 'Jerome Powell',
        title: 'Jackson Hole Macro Symposium Keynote',
        hawkishScore: 7.8,
        dovishScore: 3.2,
        netSentimentScore: +4.6,
        keyPhrases: ['Data Dependent', 'Inflation Persistence', 'Restrictive Stance'],
        rateHikeProbabilityPct: 18.5,
      },
      {
        date: 'Aug 10, 2026',
        speaker: 'Christopher Waller',
        title: 'Economic Outlook Address',
        hawkishScore: 8.2,
        dovishScore: 2.1,
        netSentimentScore: +6.1,
        keyPhrases: ['Labor Tightness', 'Delay Rate Cuts', 'Balance Sheet Reduction'],
        rateHikeProbabilityPct: 24.0,
      },
      {
        date: 'Aug 04, 2026',
        speaker: 'Austan Goolsbee',
        title: 'Midwest Business Forum',
        hawkishScore: 4.1,
        dovishScore: 7.5,
        netSentimentScore: -3.4,
        keyPhrases: ['Soft Landing', 'Cooling Rental CPI', 'Balanced Risks'],
        rateHikeProbabilityPct: 8.0,
      },
    ];
  }

  /**
   * Get Social & Retail Sentiment Acceleration Data
   */
  public static getSocialVelocityData(): SocialSentimentVelocity[] {
    return [
      {
        symbol: 'NVDA',
        companyName: 'NVIDIA Corporation',
        redditMentions24h: 3420,
        twitterVolume24h: 18400,
        sentimentScorePct: 86.5,
        velocityAccelerationPct: +42.8,
        shortFloatPct: 1.4,
        daysToCover: 0.8,
        squeezeScore: 48,
      },
      {
        symbol: 'GME',
        companyName: 'GameStop Corp.',
        redditMentions24h: 2850,
        twitterVolume24h: 12100,
        sentimentScorePct: 91.0,
        velocityAccelerationPct: +128.4,
        shortFloatPct: 22.4,
        daysToCover: 4.8,
        squeezeScore: 92,
      },
      {
        symbol: 'TSLA',
        companyName: 'Tesla Inc.',
        redditMentions24h: 1980,
        twitterVolume24h: 9400,
        sentimentScorePct: 62.0,
        velocityAccelerationPct: +18.2,
        shortFloatPct: 3.2,
        daysToCover: 1.2,
        squeezeScore: 55,
      },
    ];
  }
}
