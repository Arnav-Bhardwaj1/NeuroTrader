import { Router } from 'express';
import * as auth from '../controllers/authController';
import * as market from '../controllers/marketController';
import * as portfolio from '../controllers/portfolioController';
import * as ai from '../controllers/aiController';
import * as backtest from '../controllers/backtestController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Auth
router.post('/auth/register', auth.register);
router.post('/auth/login', auth.login);
router.get('/auth/me', authMiddleware, auth.getMe);

// Market
router.get('/market/stocks', market.getStocks);
router.get('/market/stocks/:symbol', market.getStockDetail);
router.get('/market/indices', market.getIndices);
router.get('/market/signals', market.getSignals);
router.get('/market/sector-performance', market.getSectorPerformance);
router.get('/market/activity', market.getActivity);

// AI
router.get('/ai/summary', ai.getMarketSummary);
router.get('/ai/prediction/:symbol', ai.getPrediction);
router.get('/ai/sentiment/:symbol', ai.getSentiment);
router.get('/ai/risk/:symbol', ai.getRisk);
router.post('/ai/chat', ai.getChatResponse);

// Portfolio (Protected)
router.get('/portfolio/holdings', authMiddleware, portfolio.getHoldings);
router.get('/portfolio/transactions', authMiddleware, portfolio.getTransactions);
router.post('/portfolio/trade', authMiddleware, portfolio.executeTrade);

// Watchlists (Protected)
// Note: Watchlist controllers were already mostly implemented, wiring them here
import * as watchlist from '../controllers/watchlistController';
router.get('/watchlists', authMiddleware, watchlist.getWatchlists);
router.post('/watchlists', authMiddleware, watchlist.createWatchlist);
router.put('/watchlists/:id', authMiddleware, watchlist.updateWatchlist);
router.delete('/watchlists/:id', authMiddleware, watchlist.deleteWatchlist);

// Backtesting
router.post('/backtest', authMiddleware, backtest.runBacktest);

export default router;
