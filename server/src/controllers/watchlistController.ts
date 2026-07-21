import { Response } from 'express';
import prisma from '../prisma';
import { AuthRequest } from '../middleware/auth';

export const getWatchlists = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const userId = req.user.id;
  try {
    const lists = await prisma.watchlist.findMany({ where: { userId } });
    res.json(lists.map(l => ({ ...l, symbols: JSON.parse(l.symbols) })));
  } catch {
    res.status(500).json({ error: 'Failed to fetch watchlists' });
  }
};

export const createWatchlist = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const userId = req.user.id;
  const { name, symbols } = req.body;

  try {
    const list = await prisma.watchlist.create({
      data: { name, userId, symbols: JSON.stringify(symbols || []) }
    });
    res.status(201).json({ ...list, symbols: JSON.parse(list.symbols) });
  } catch {
    res.status(500).json({ error: 'Failed to create watchlist' });
  }
};

export const updateWatchlist = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const userId = req.user.id;
  const { id } = req.params;
  if (!id || typeof id !== 'string') return res.status(400).json({ error: 'ID is required' });
  const { symbols } = req.body;
  try {
    const list = await prisma.watchlist.update({
      where: { id, userId },
      data: { symbols: JSON.stringify(symbols) }
    });
    res.json({ ...list, symbols: JSON.parse(list.symbols) });
  } catch {
    res.status(500).json({ error: 'Update failed' });
  }
}

export const deleteWatchlist = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const userId = req.user.id;
  const { id } = req.params;
  if (!id || typeof id !== 'string') return res.status(400).json({ error: 'ID is required' });

  try {
    await prisma.watchlist.delete({ where: { id, userId } });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete watchlist' });
  }
};
