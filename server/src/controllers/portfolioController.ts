import { Response } from 'express';
import prisma from '../prisma';
import { AuthRequest } from '../middleware/auth';
import { stocks } from '../mockData';

export const getHoldings = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const userId = req.user.id;
  try {
    const holdings = await prisma.holding.findMany({ where: { userId } });
    res.json(holdings);
  } catch {
    res.status(500).json({ error: 'Failed to fetch holdings' });
  }
};

export const getTransactions = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const userId = req.user.id;
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' }
    });
    res.json(transactions);
  } catch {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

export const executeTrade = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const userId = req.user.id;
  const { symbol, action, shares } = req.body;

  if (!['BUY', 'SELL'].includes(action)) return res.status(400).json({ error: 'Invalid action' });
  if (shares <= 0) return res.status(400).json({ error: 'Invalid shares' });

  const stock = stocks.find(s => s.symbol === symbol);
  if (!stock) return res.status(404).json({ error: 'Stock not found' });

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const totalCost = stock.price * shares;

    if (action === 'BUY') {
      if (user.cashBalance < totalCost) return res.status(400).json({ error: 'Insufficient funds' });

      const existingHolding = await prisma.holding.findFirst({ where: { userId, symbol } });
      const existingShares = existingHolding?.shares ?? 0;
      const existingAvgCost = existingHolding?.avgCost ?? 0;
      const newAvgCost = (existingAvgCost * existingShares + totalCost) / (existingShares + shares);

      await prisma.$transaction([
        prisma.user.update({
          where: { id: userId },
          data: { cashBalance: { decrement: totalCost } }
        }),
        prisma.transaction.create({
          data: { userId, symbol, action, shares, price: stock.price }
        }),
        // Update holding
        prisma.holding.upsert({
          where: { id: `${userId}-${symbol}` }, // We should probably have a unique constraint on userId-symbol
          update: {
            avgCost: newAvgCost,
            shares: { increment: shares }
          },
          create: { id: `${userId}-${symbol}`, userId, symbol, shares, avgCost: stock.price }
        })
      ]);
    } else {
      const holding = await prisma.holding.findFirst({ where: { userId, symbol } });
      if (!holding || holding.shares < shares) return res.status(400).json({ error: 'Insufficient shares' });

      await prisma.$transaction([
        prisma.user.update({
          where: { id: userId },
          data: { cashBalance: { increment: totalCost } }
        }),
        prisma.transaction.create({
          data: { userId, symbol, action, shares, price: stock.price }
        }),
        prisma.holding.update({
          where: { id: holding.id },
          data: { shares: { decrement: shares } }
        })
      ]);
      // Cleanup empty holding
      const updatedHolding = await prisma.holding.findUnique({ where: { id: holding.id } });
      if (updatedHolding && updatedHolding.shares === 0) {
        await prisma.holding.delete({ where: { id: holding.id } });
      }
    }

    const updatedUser = await prisma.user.findUnique({ where: { id: userId } });
    res.json({ message: 'Success', cashBalance: updatedUser?.cashBalance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Trade failed' });
  }
};
