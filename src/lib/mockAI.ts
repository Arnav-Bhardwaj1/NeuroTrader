import type { PredictionData, SentimentData, RiskData, ChatMessage } from '../types';
import { stockCandlestickData, stocks } from './mockData';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ---- Price Prediction ----
export async function getAIPrediction(symbol: string): Promise<PredictionData> {
  await delay(800 + Math.random() * 600);
  const candles = stockCandlestickData[symbol];
  if (!candles || candles.length === 0) throw new Error('No data');
  const lastPrice = candles[candles.length - 1].close;
  const direction = Math.random() > 0.35 ? 'bullish' : Math.random() > 0.5 ? 'bearish' : 'neutral';
  const multiplier = direction === 'bullish' ? 1 + Math.random() * 0.15 : direction === 'bearish' ? 1 - Math.random() * 0.1 : 1 + (Math.random() - 0.5) * 0.04;
  const targetPrice = +(lastPrice * multiplier).toFixed(2);
  const confidence = Math.floor(60 + Math.random() * 35);

  const predictionLine: { time: string; value: number }[] = [];
  const upperBand: { time: string; value: number }[] = [];
  const lowerBand: { time: string; value: number }[] = [];
  let price = lastPrice;
  const step = (targetPrice - lastPrice) / 30;
  const now = new Date();

  for (let i = 1; i <= 30; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    price += step + (Math.random() - 0.5) * Math.abs(step) * 0.5;
    const t = d.toISOString().split('T')[0];
    predictionLine.push({ time: t, value: +price.toFixed(2) });
    upperBand.push({ time: t, value: +(price * (1 + 0.03 + (i / 30) * 0.04)).toFixed(2) });
    lowerBand.push({ time: t, value: +(price * (1 - 0.03 - (i / 30) * 0.04)).toFixed(2) });
  }

  const reasons: Record<string, string[]> = {
    bullish: [
      'Strong upward momentum with volume confirmation. RSI indicates buildup without overbought conditions. Institutional flows turning positive.',
      'Earnings beat expectations with forward guidance raise. Technical breakout above key resistance with expanding breadth.',
      'Sector rotation favoring this name. AI model detects accumulation pattern similar to prior 15%+ rallies.',
    ],
    bearish: [
      'Weakening demand indicators with revenue deceleration. Distribution pattern detected with declining volume on rallies.',
      'Breaking below 50-day MA with negative MACD crossover. Sector headwinds intensifying with macro deterioration.',
    ],
    neutral: [
      'Consolidating in a tight range. Mixed signals from technical and fundamental indicators. Wait for breakout confirmation.',
    ],
  };
  const arr = reasons[direction];
  const reasoning = arr[Math.floor(Math.random() * arr.length)];

  return { targetPrice, confidence, direction, timeframe: '30 days', reasoning, predictionLine, upperBand, lowerBand };
}

// ---- Sentiment Analysis ----
const newsPool: { title: string; source: string }[] = [
  { title: 'Earnings smash Wall Street estimates, stock surges in after-hours', source: 'Bloomberg' },
  { title: 'Analyst upgrades to Outperform with raised price target', source: 'Reuters' },
  { title: 'New AI product launch draws positive early reviews', source: 'TechCrunch' },
  { title: 'Revenue growth slows amid competitive pressures', source: 'CNBC' },
  { title: 'Insider selling activity raises concerns among investors', source: 'MarketWatch' },
  { title: 'Regulatory probe announced, shares dip on the news', source: 'WSJ' },
  { title: 'Record quarterly buyback program announced', source: 'Financial Times' },
  { title: 'Supply chain improvements boost margin outlook', source: 'Barrons' },
  { title: 'New partnership deal could unlock $2B revenue opportunity', source: 'Bloomberg' },
  { title: 'Market share gains accelerating in key segments', source: 'Reuters' },
  { title: 'Cost-cutting measures expected to improve profitability', source: 'CNBC' },
  { title: 'Downgrade from major bank cites valuation concerns', source: 'WSJ' },
];

export async function getAISentiment(symbol: string): Promise<SentimentData> {
  await delay(600 + Math.random() * 500);
  const overall = +(Math.random() * 2 - 1).toFixed(2);
  const label = overall > 0.2 ? 'Bullish' : overall < -0.2 ? 'Bearish' : 'Neutral';
  const stock = stocks.find((s) => s.symbol === symbol);
  const headlines = newsPool
    .sort(() => Math.random() - 0.5)
    .slice(0, 6)
    .map((n, i) => ({
      title: `${stock?.name || symbol}: ${n.title}`,
      source: n.source,
      sentiment: +(Math.random() * 2 - 1).toFixed(2),
      time: `${i + 1}h ago`,
    }));

  return {
    overall,
    label,
    headlines,
    breakdown: [
      { category: 'News Sentiment', score: +(Math.random() * 2 - 1).toFixed(2) },
      { category: 'Social Media', score: +(Math.random() * 2 - 1).toFixed(2) },
      { category: 'Analyst Ratings', score: +(Math.random() * 2 - 1).toFixed(2) },
      { category: 'Insider Activity', score: +(Math.random() * 2 - 1).toFixed(2) },
      { category: 'Options Flow', score: +(Math.random() * 2 - 1).toFixed(2) },
    ],
  };
}

// ---- Risk Assessment ----
export async function getAIRisk(symbol: string): Promise<RiskData> {
  await delay(500 + Math.random() * 400);
  const volatility = +(10 + Math.random() * 40).toFixed(1);
  const beta = +(0.5 + Math.random() * 1.5).toFixed(2);
  const sharpe = +(0.5 + Math.random() * 2).toFixed(2);
  const maxDrawdown = +(5 + Math.random() * 25).toFixed(1);
  const compositeScore = Math.floor(20 + Math.random() * 70);
  const riskLevel = compositeScore < 35 ? 'Low' : compositeScore < 55 ? 'Medium' : compositeScore < 75 ? 'High' : 'Very High';
  return { volatility, beta, sharpe, maxDrawdown, compositeScore, riskLevel };
}

// ---- AI Chat ----
const chatResponses: Record<string, string[]> = {
  bullish: [
    "Based on my analysis, the market is showing bullish momentum. The S&P 500 has broken above its 20-day moving average with expanding breadth. Key sectors like Technology (+1.85%) and Automotive (+2.10%) are leading gains. I'd watch for continuation above 5,250 as confirmation.",
    "Several strong signals today: NVDA showing exceptional strength with AI chip demand, TSLA breaking above resistance. The put/call ratio is declining which supports further upside. Key risk: upcoming FOMC minutes could introduce volatility.",
    "My models suggest a 68% probability of continued upside over the next 2 weeks. The earnings season has been better than expected with 72% of companies beating estimates. Sector rotation from defensive to growth names is a positive signal.",
  ],
  bearish: [
    "I'm seeing some warning signs. Energy sector weakness (-1.45%) and declining breadth in small caps suggest caution. The VIX is starting to creep up from recent lows. Consider tightening stops on high-beta positions.",
    "My risk models are flagging elevated correlations across asset classes, which typically precedes volatility spikes. The yield curve dynamics are shifting unfavorably. I'd recommend reducing position sizes temporarily.",
  ],
  stock: [
    "Looking at the technicals: the stock is trading above its key moving averages with healthy volume. RSI is at 58, suggesting room for further upside without being overbought. The MACD recently had a bullish crossover. Support sits at the 50-day MA.",
    "From a fundamental perspective, the company shows strong revenue growth, expanding margins, and solid free cash flow generation. The valuation is reasonable relative to its growth rate. Institutional ownership has been increasing over the past quarter.",
  ],
  default: [
    "That's a great question. Based on current market conditions, I'd suggest focusing on quality names with strong earnings growth and manageable valuations. The AI/semiconductor space continues to show strength, while energy is facing headwinds from demand concerns.",
    "I'd recommend a balanced approach right now. Markets are near all-time highs but breadth remains healthy. Keep 70-80% in core positions, maintain 10-15% cash for opportunities, and use the rest for tactical trades based on my signals.",
    "My analysis covers price prediction, sentiment analysis, risk assessment, and trading signals. I analyze technical patterns, fundamental data, news sentiment, and institutional flows to generate actionable insights. What specific stock or sector would you like me to analyze?",
  ],
};

export async function getAIChatResponse(message: string): Promise<string> {
  await delay(1000 + Math.random() * 1500);
  const lower = message.toLowerCase();
  let pool = chatResponses.default;
  if (lower.includes('bullish') || lower.includes('buy') || lower.includes('upside') || lower.includes('optimistic')) {
    pool = chatResponses.bullish;
  } else if (lower.includes('bearish') || lower.includes('sell') || lower.includes('risk') || lower.includes('crash') || lower.includes('downside')) {
    pool = chatResponses.bearish;
  } else if (stocks.some((s) => lower.includes(s.symbol.toLowerCase()) || lower.includes(s.name.toLowerCase()))) {
    pool = chatResponses.stock;
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

// ---- Market Summary ----
export async function getAIMarketSummary(): Promise<string> {
  await delay(1200);
  return `**Market Overview — March 23, 2026**

Markets closed mixed today with a **cautiously optimistic** tone. The S&P 500 gained 0.55% to close at 5,234.18, while the NASDAQ outperformed with a 0.69% advance driven by strength in mega-cap tech names.

**Key Themes:**
- **AI/Semiconductor Rally**: NVIDIA (+2.63%) continued its uptrend on datacenter demand optimism. The AI trade broadened with META (+1.22%) also participating.
- **Tesla Surge**: TSLA (+3.72%) rallied on robotaxi progress updates and a bullish analyst note from Morgan Stanley.
- **Energy Weakness**: XOM (-1.98%) led declines in the energy sector as China demand data disappointed.

**AI Signal Summary**: 4 BUY signals, 1 SELL signal, 1 HOLD. Highest conviction: NVDA (92% confidence BUY). Average signal accuracy this month: 73.2%.

**Risk Assessment**: VIX at 14.2 (low), market breadth healthy with 62% of S&P constituents above 50-day MA. No major macro events until next week's FOMC minutes.`;
}
