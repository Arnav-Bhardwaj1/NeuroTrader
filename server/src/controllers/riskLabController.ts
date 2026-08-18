import { Request, Response } from 'express';

export const getFactorExposures = async (req: Request, res: Response) => {
  try {
    res.json({
      status: 'SUCCESS',
      portfolioBeta: 1.18,
      factors: [
        { factor: 'Market Beta', loading: 1.18, tilt: 'OVERWEIGHT' },
        { factor: 'Momentum', loading: 0.85, tilt: 'OVERWEIGHT' },
        { factor: 'Growth', loading: 1.35, tilt: 'OVERWEIGHT' },
      ],
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(500).json({ error: 'Factor exposure calculation error' });
  }
};

export const getStressTestResults = async (req: Request, res: Response) => {
  try {
    res.json({
      status: 'SUCCESS',
      gfc2008DrawdownPct: -48.2,
      covid2020DrawdownPct: -31.5,
      rateHike2022DrawdownPct: -34.8,
    });
  } catch {
    res.status(500).json({ error: 'Stress test service error' });
  }
};
