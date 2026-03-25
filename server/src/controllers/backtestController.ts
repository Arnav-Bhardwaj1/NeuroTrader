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
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
