import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export const DataContext = createContext<any>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<any>(null);

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

export const useAppContext = () => useContext(DataContext);
