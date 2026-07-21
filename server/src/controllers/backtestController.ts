import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { BacktestEngine } from '../backtestService';

export const runBacktest = async (req: AuthRequest, res: Response) => {
  const { symbol, strategy, parameters, initialCapital } = req.body;

  try {
    const result = BacktestEngine.run({
      symbol,
      strategy,
      parameters,
      initialCapital: initialCapital || 10000
    });
    res.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ error: errorMessage });
  }
};
