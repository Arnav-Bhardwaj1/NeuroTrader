import { Request, Response } from 'express';
import { stocks, marketIndices, signals, sectorPerformance, activityFeed } from '../mockData';

export const getStocks = (req: Request, res: Response) => res.json(stocks);
export const getIndices = (req: Request, res: Response) => res.json(marketIndices);
export const getSignals = (req: Request, res: Response) => res.json(signals);
export const getSectorPerformance = (req: Request, res: Response) => res.json(sectorPerformance);
export const getActivity = (req: Request, res: Response) => res.json(activityFeed);

export const getStockDetail = (req: Request, res: Response) => {
  const { symbol } = req.params;
  const stock = stocks.find(s => s.symbol === symbol);
  if (!stock) return res.status(404).json({ error: 'Stock not found' });
  res.json(stock);
};
