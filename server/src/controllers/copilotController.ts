import { Request, Response } from 'express';

export const getCopilotSignals = async (req: Request, res: Response) => {
  try {
    const signals = [
      {
        id: 'sig-nvda-01',
        symbol: 'NVDA',
        name: 'NVIDIA Corporation',
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
      },
      {
        id: 'sig-btc-02',
        symbol: 'BTC/USD',
        name: 'Bitcoin',
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
      },
    ];
    res.json({ signals, timestamp: new Date().toISOString() });
  } catch {
    res.status(500).json({ error: 'Copilot Engine error' });
  }
};

export const simulateCopilotMonteCarlo = async (req: Request, res: Response) => {
  try {
    const { initialCapital = 100000, horizonDays = 30, volatility = 0.22 } = req.body;
    res.json({
      status: 'SUCCESS',
      initialCapital,
      horizonDays,
      volatility,
      meanFinalValue: Math.round(initialCapital * (1 + 0.12 * (horizonDays / 365))),
      var95: Math.round(initialCapital * volatility * 0.45),
      cvar95: Math.round(initialCapital * volatility * 0.65),
    });
  } catch {
    res.status(500).json({ error: 'Monte Carlo simulation failed' });
  }
};
