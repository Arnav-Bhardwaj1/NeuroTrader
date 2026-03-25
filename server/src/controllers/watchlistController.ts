import { Response } from 'express';
import prisma from '../prisma';
import { AuthRequest } from '../middleware/auth';

export const getWatchlists = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id!;
    const lists = await prisma.watchlist.findMany({ where: { userId } });
    res.json(lists.map(l => ({ ...l, symbols: JSON.parse(l.symbols) })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch watchlists' });
  }
};

export const createWatchlist = async (req: AuthRequest, res: Response) => {
  const { name, symbols } = req.body;
  const userId = req.user?.id!;

  try {
    const list = await prisma.watchlist.create({
      data: { name, userId, symbols: JSON.stringify(symbols || []) }
    });
    res.status(201).json({ ...list, symbols: JSON.parse(list.symbols) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create watchlist' });
  }
};

export const updateWatchlist = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { symbols } = req.body;
  try {
    const list = await prisma.watchlist.update({
      where: { id, userId: req.user?.id },
      data: { symbols: JSON.stringify(symbols) }
    });
    res.json({ ...list, symbols: JSON.parse(list.symbols) });
  } catch (e) {
    res.status(500).json({ error: 'Update failed' });
  }
}

export const deleteWatchlist = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.watchlist.delete({ where: { id, userId: req.user?.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete watchlist' });
  }
};
