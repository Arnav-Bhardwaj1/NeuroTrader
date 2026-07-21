import { Request, Response } from 'express';
import * as mockAI from '../mockAI';

export const getMarketSummary = async (req: Request, res: Response) => {
  try {
    const summary = await mockAI.getAIMarketSummary();
    res.json({ summary });
  } catch {
    res.status(500).json({ error: 'AI Error' });
  }
};

export const getPrediction = async (req: Request, res: Response) => {
  const { symbol } = req.params;
  if (!symbol || typeof symbol !== 'string') return res.status(400).json({ error: 'Symbol is required' });
  try {
    const data = await mockAI.getAIPrediction(symbol);
    res.json(data);
  } catch {
    res.status(404).json({ error: 'Not found' });
  }
};

export const getSentiment = async (req: Request, res: Response) => {
  const { symbol } = req.params;
  if (!symbol || typeof symbol !== 'string') return res.status(400).json({ error: 'Symbol is required' });
  try {
    const data = await mockAI.getAISentiment(symbol);
    res.json(data);
  } catch {
    res.status(404).json({ error: 'Not found' });
  }
};

export const getRisk = async (req: Request, res: Response) => {
  const { symbol } = req.params;
  if (!symbol || typeof symbol !== 'string') return res.status(400).json({ error: 'Symbol is required' });
  try {
    const data = await mockAI.getAIRisk(symbol);
    res.json(data);
  } catch {
    res.status(404).json({ error: 'Not found' });
  }
};

export const getChatResponse = async (req: Request, res: Response) => {
  try {
    const response = await mockAI.getAIChatResponse(req.body.message);
    res.json({ response });
  } catch {
    res.status(500).json({ error: 'Chat failed' });
  }
};
