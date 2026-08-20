import { Request, Response } from 'express';

export const getInsiderClusters = async (req: Request, res: Response) => {
  try {
    res.json({
      status: 'SUCCESS',
      totalClusters30d: 14,
      totalNetBuyVolumeUsd: 18500000,
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(500).json({ error: 'Insider cluster calculation error' });
  }
};

export const getEarningsWhispers = async (req: Request, res: Response) => {
  try {
    res.json({
      status: 'SUCCESS',
      topTicker: 'NVDA',
      epsWhisper: 0.71,
      impliedMovePct: 8.5,
    });
  } catch {
    res.status(500).json({ error: 'Earnings whisper service error' });
  }
};
