import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Stock, MarketIndex, Signal, SectorPerformance, PortfolioStats, Holding, Transaction } from '../types';

export interface ActivityItem {
  id: string;
  icon: string;
  text: string;
  detail: string;
  time: string;
  type: 'signal' | 'sentiment' | 'alert' | 'prediction' | 'portfolio';
}

export interface AppDataContextType {
  stocks: Stock[];
  marketIndices: MarketIndex[];
  signals: Signal[];
  sectorPerformance: SectorPerformance[];
  activityFeed: ActivityItem[];
  portfolioStats: PortfolioStats;
  holdings: Holding[];
  transactions: Transaction[];
}

// eslint-disable-next-line react-refresh/only-export-components
export const DataContext = createContext<AppDataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppDataContextType | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:3001/api/market/stocks').then(r => r.json()),
      fetch('http://localhost:3001/api/market/indices').then(r => r.json()),
      fetch('http://localhost:3001/api/market/signals').then(r => r.json()),
      fetch('http://localhost:3001/api/market/sector-performance').then(r => r.json()),
      fetch('http://localhost:3001/api/market/activity').then(r => r.json()),
      fetch('http://localhost:3001/api/portfolio/stats').then(r => r.json()),
      fetch('http://localhost:3001/api/portfolio/holdings').then(r => r.json()),
      fetch('http://localhost:3001/api/portfolio/transactions').then(r => r.json()),
    ]).then(([stocks, marketIndices, signals, sectorPerformance, activityFeed, portfolioStats, holdings, transactions]) => {
      setData({ stocks, marketIndices, signals, sectorPerformance, activityFeed, portfolioStats, holdings, transactions });
    }).catch(e => console.error(e));
  }, []);

  if (!data) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>Connecting to Backend API...</div>;

  return <DataContext.Provider value={data}>{children}</DataContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAppContext = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useAppContext must be used within DataProvider');
  return ctx;
};
