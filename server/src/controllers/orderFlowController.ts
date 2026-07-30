import { Request, Response } from 'express';
import { OrderFlowEngine } from '../services/orderFlowEngine';
import { ExecutionSimRequest } from '../types/orderFlow';

/**
 * Controller handlers for Order Flow & Risk Radar endpoints
 */

export const getDarkPoolPrints = (req: Request, res: Response): void => {
  try {
    const symbol = (req.params.symbol || 'NVDA').toUpperCase();
    const count = req.query.count ? parseInt(req.query.count as string, 10) : 20;
    const prints = OrderFlowEngine.getDarkPoolPrints(symbol, count);
    res.json({ symbol, count: prints.length, prints });
  } catch (error) {
    console.error('Error fetching dark pool prints:', error);
    res.status(500).json({ error: 'Failed to fetch dark pool prints' });
  }
};

export const getOptionGammaProfile = (req: Request, res: Response): void => {
  try {
    const symbol = (req.params.symbol || 'NVDA').toUpperCase();
    const profile = OrderFlowEngine.getOptionGammaProfile(symbol);
    res.json(profile);
  } catch (error) {
    console.error('Error fetching option gamma profile:', error);
    res.status(500).json({ error: 'Failed to fetch option gamma profile' });
  }
};

export const getLevel2Book = (req: Request, res: Response): void => {
  try {
    const symbol = (req.params.symbol || 'NVDA').toUpperCase();
    const book = OrderFlowEngine.getLevel2Book(symbol);
    res.json(book);
  } catch (error) {
    console.error('Error fetching level 2 book:', error);
    res.status(500).json({ error: 'Failed to fetch level 2 book' });
  }
};

export const simulateExecution = (req: Request, res: Response): void => {
  try {
    const { symbol = 'NVDA', totalShares = 10000, algoType = 'VWAP', durationMinutes = 15, urgencyLevel = 'MEDIUM' } = req.body || {};
    const simReq: ExecutionSimRequest = {
      symbol: symbol.toUpperCase(),
      totalShares: Number(totalShares),
      algoType,
      durationMinutes: Number(durationMinutes),
      urgencyLevel
    };
    const result = OrderFlowEngine.simulateExecution(simReq);
    res.json(result);
  } catch (error) {
    console.error('Error simulating execution:', error);
    res.status(500).json({ error: 'Failed to run execution simulation' });
  }
};

export const getMonteCarloRisk = (req: Request, res: Response): void => {
  try {
    const symbol = (req.params.symbol || req.query.symbol as string || 'NVDA').toUpperCase();
    const portfolioValue = req.query.portfolioValue ? parseFloat(req.query.portfolioValue as string) : 250000;
    const result = OrderFlowEngine.runMonteCarloRisk(symbol, portfolioValue);
    res.json(result);
  } catch (error) {
    console.error('Error running Monte Carlo risk simulation:', error);
    res.status(500).json({ error: 'Failed to run Monte Carlo risk simulation' });
  }
};
