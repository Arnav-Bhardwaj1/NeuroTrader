import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Search,
  Brain,
  Zap,
  RefreshCcw
} from 'lucide-react';

import { ScannerService } from '../lib/ScannerService';
import type { ScannerData, MarketSector, StockNode } from '../lib/ScannerService';

import './ScannerPage.css';

const ScannerPage: React.FC = () => {
  const [data, setData] = useState<ScannerData | null>(null);
  const [selectedStock, setSelectedStock] = useState<StockNode | null>(null);

  useEffect(() => {
    setData(ScannerService.getScannerData());
  }, []);

  if (!data) return <div className="loading-state">Initializing NeuroScanner...</div>;

  return (
    <motion.div
      className="scanner-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <header className="scanner-header">
        <div className="header-content">
          <h1><Activity size={32} className="icon-blue" /> NeuroScanner</h1>
          <div className="header-meta">
            <div className="meta-item">
              <span className="sentiment-dot" />
              <span>Market Sentiment: {data.marketSentiment}%</span>
            </div>
            <div className="meta-item">
              <RefreshCcw size={14} />
              <span>Last Sync: {data.lastUpdated}</span>
            </div>
          </div>
        </div>
        <div className="header-actions">
          <div className="search-pill">
            <Search size={16} />
            <input type="text" placeholder="Scan symbol..." />
          </div>
        </div>
      </header>

      <div className="heatmap-container">
        <div className="sectors-grid">
          {data.sectors.map((sector) => (
            <SectorBlock key={sector.id} sector={sector} onStockClick={setSelectedStock} />
          ))}
        </div>

        <aside className="scanner-sidebar">
          <div className="sidebar-title">
            <Brain size={20} className="text-accent" /> AI Sector Analysis
          </div>
          <div className="ai-signals-list">
            {data.sectors.slice(0, 5).map((sector) => (
              <AiSignalCard key={sector.id} sector={sector} />
            ))}
          </div>

          <div className="glass-card alpha-card mt-auto">
            <div className="alpha-header">
              <Zap size={18} className="text-yellow" />
              <span>Alpha Opportunity</span>
            </div>
            <p className="alpha-desc">
              Unusual rotation detected from <strong>Financials</strong> into <strong>Tech</strong>. Position for continuation.
            </p>
            <button className="alpha-btn">Execute Strategy</button>
          </div>
        </aside>
      </div>

      <AnimatePresence>
        {selectedStock && (
          <StockDetailOverlay
            stock={selectedStock}
            onClose={() => setSelectedStock(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const SectorBlock: React.FC<{
  sector: MarketSector;
  onStockClick: (stock: StockNode) => void;
}> = ({ sector, onStockClick }) => (
  <div className="sector-block">
    <div className="sector-name">
      <span>{sector.name}</span>
      <span className={sector.performance >= 0 ? 'text-up' : 'text-down'}>
        {sector.performance > 0 ? '+' : ''}{sector.performance}%
      </span>
    </div>
    <div className="stocks-grid">
      {sector.stocks.map((stock) => (
        <StockNodeComponent
          key={stock.symbol}
          stock={stock}
          onClick={() => onStockClick(stock)}
        />
      ))}
    </div>
  </div>
);

const StockNodeComponent: React.FC<{ stock: StockNode; onClick: () => void }> = ({ stock, onClick }) => {
  const getPerfClass = (p: number) => {
    if (p >= 3) return 'perf-pos-3';
    if (p >= 1.5) return 'perf-pos-2';
    if (p >= 0.5) return 'perf-pos-1';
    if (p <= -3) return 'perf-neg-3';
    if (p <= -1.5) return 'perf-neg-2';
    if (p <= -0.5) return 'perf-neg-1';
    return 'perf-neutral';
  };

  return (
    <motion.div
      className={`stock-node ${getPerfClass(stock.changePercent)}`}
      whileHover={{ scale: 1.05 }}
      onClick={onClick}
    >
      <span className="stock-symbol">{stock.symbol}</span>
      <span className="stock-perf">{stock.changePercent}%</span>
    </motion.div>
  );
};

const AiSignalCard: React.FC<{ sector: MarketSector }> = ({ sector }) => {
  const reasons = {
    OVERWEIGHT: 'Heavy institutional accumulation and bullish flow.',
    UNDERWEIGHT: 'Distribution phase with negative momentum.',
    FOCUS: 'Unusual options activity and sentiment spike.',
    NEUTRAL: 'Consolidating with no clear trend bias.'
  };

  return (
    <div className="glass-card ai-signal-card mb-3">
      <div className="signal-header">
        <span className="signal-sector">{sector.name}</span>
        <span className={`signal-badge signal-${sector.aiSignal.toLowerCase()}`}>
          {sector.aiSignal}
        </span>
      </div>
      <p className="signal-reason">{reasons[sector.aiSignal]}</p>
      <div className="momentum-meter">
        <div
          className="momentum-fill"
          style={{ width: `${sector.momentumScore}%` }}
        />
      </div>
    </div>
  );
};

const StockDetailOverlay: React.FC<{ stock: StockNode; onClose: () => void }> = ({ stock, onClose }) => (
  <motion.div
    className="overlay-backdrop"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClose}
  >
    <motion.div
      className="glass-card stock-overlay-card"
      initial={{ scale: 0.9, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.9, y: 20 }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="overlay-header">
        <div className="overlay-title">
          <h2>{stock.symbol}</h2>
          <span>{stock.name}</span>
        </div>
        <button className="close-btn" onClick={onClose}>&times;</button>
      </div>

      <div className="overlay-stats">
        <div className="o-stat">
          <label>Price</label>
          <div className="o-value">${stock.price.toLocaleString()}</div>
        </div>
        <div className="o-stat">
          <label>Market Cap</label>
          <div className="o-value">${stock.marketCap}B</div>
        </div>
        <div className="o-stat">
          <label>Sentiment</label>
          <div className={`o-value ${stock.sentiment.toLowerCase()}`}>
            {stock.sentiment}
          </div>
        </div>
      </div>

      <div className="overlay-ai-breakdown">
        <div className="ai-insight-box">
          <Brain size={16} />
          <span>NeuroAlpha suggests <strong>{stock.changePercent > 0 ? 'Accumulation' : 'Distribution'}</strong> patterns forming on 15m timeframe.</span>
        </div>
      </div>

      <div className="overlay-actions">
        <button className="trade-btn-p primary">Quick Buy</button>
        <button className="trade-btn-p secondary">Add to Watchlist</button>
      </div>
    </motion.div>
  </motion.div>
);

export default ScannerPage;
