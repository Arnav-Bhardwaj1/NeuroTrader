import { Request, Response } from 'express';

export const getReplaySeries = async (req: Request, res: Response) => {
  try {
    const { symbol = 'NVDA' } = req.query;
    res.json({
      status: 'SUCCESS',
      symbol,
      seriesLength: 60,
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(500).json({ error: 'Replay engine error' });
  }
};

export const getOptimizationGrid = async (req: Request, res: Response) => {
  try {
    const { symbol = 'NVDA' } = req.query;
    res.json({
      status: 'SUCCESS',
      symbol,
      gridSize: '5x5',
      optimalCell: { shortMa: 15, longMa: 50, sharpe: 2.15, returnPct: 24.5 },
    });
  } catch {
    res.status(500).json({ error: 'Optimization grid failed' });
  }
};
