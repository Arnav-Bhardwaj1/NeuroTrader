import { Request, Response } from 'express';
import * as mockAI from '../mockAI';

export const getMarketSummary = async (req: Request, res: Response) => {
  try {
    const summary = await mockAI.getAIMarketSummary();
    res.json({ summary });
  } catch (error) {
    res.status(500).json({ error: 'AI Error' });
  }
};

export const getPrediction = async (req: Request, res: Response) => {
  try {
    const data = await mockAI.getAIPrediction(req.params.symbol);
    res.json(data);
  } catch (error) {
    res.status(404).json({ error: 'Not found' });
  }
};

export const getSentiment = async (req: Request, res: Response) => {
  try {
    const data = await mockAI.getAISentiment(req.params.symbol);
    res.json(data);
  } catch (error) {
    res.status(404).json({ error: 'Not found' });
  }
};

export const getRisk = async (req: Request, res: Response) => {
  try {
    const data = await mockAI.getAIRisk(req.params.symbol);
    res.json(data);
  } catch (error) {
    res.status(404).json({ error: 'Not found' });
  }
};

export const getChatResponse = async (req: Request, res: Response) => {
  try {
    const response = await mockAI.getAIChatResponse(req.body.message);
    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: 'Chat failed' });
  }
};
