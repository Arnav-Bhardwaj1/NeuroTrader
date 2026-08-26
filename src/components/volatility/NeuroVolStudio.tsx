import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Maximize2,
  Minimize2,
  RefreshCw,
  Cpu
} from 'lucide-react';

import VolSurfacePane from './VolSurfacePane';
import GreeksHedgePane from './GreeksHedgePane';
import VolArbScannerPane from './VolArbScannerPane';
import VolTermStructurePane from './VolTermStructurePane';

import './NeuroVolStudio.css';

const TABS = [
  { id: 'surface', label: 'Volatility Smile & Skew', icon: Activity, component: VolSurfacePane },
  { id: 'greeks', label: 'Delta-Gamma Greeks Hedging', icon: ShieldCheck, component: GreeksHedgePane },
  { id: 'arb', label: 'Volatility Arbitrage Scanner', icon: Sparkles, component: VolArbScannerPane },
  { id: 'term', label: 'Term Structure & Vol Cone', icon: TrendingUp, component: VolTermStructurePane },
];

export const NeuroVolStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('surface');
  const [fullscreen, setFullscreen] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const ActiveComponent = TABS.find(t => t.id === activeTab)?.component || VolSurfacePane;

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 600);
  };

  return (
    <div className={`vol-studio-page ${fullscreen ? 'fullscreen' : ''}`}>
      {/* Top Header */}
      <header className="vol-header">
        <div className="title-area">
          <div className="logo-box">
            <Activity size={26} className="text-cyan icon-pulse" />
          </div>
          <div className="text-box">
            <h1>NeuroDerivatives &amp; Volatility Studio <span className="version-badge">v9.0-VOL</span></h1>
            <p>Black-Scholes IV Surface • Delta Neutral Hedging • Volatility Risk Premium Arbitrage</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="vol-nav">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon size={17} />
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div layoutId="volActiveUnderline" className="nav-underline" />
              )}
            </button>
          ))}
        </nav>

        {/* System Actions */}
        <div className="vol-actions">
          <button className="icon-btn" onClick={handleSync} title="Recalculate Vol Surface">
            <RefreshCw size={17} className={isSyncing ? 'spin' : ''} />
          </button>
          <button className="icon-btn" onClick={() => setFullscreen(!fullscreen)} title="Toggle Fullscreen">
            {fullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
          </button>
          <div className="status-indicator">
            <span className="dot pulse" />
            <span>VOL SURFACE: ACTIVE</span>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="vol-main">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.985, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.985, y: -8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="component-workspace"
          >
            <ActiveComponent />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Workspace Footer */}
      <footer className="vol-footer">
        <div className="footer-stat">
          <Cpu size={14} className="text-cyan" />
          <span>Derivatives Engine: Black-Scholes IV Solver &amp; Greeks Rebalancer Running</span>
        </div>
        <div className="footer-stat">
          <ShieldCheck size={14} className="text-green" />
          <span>Delta Hedge Status: Neutrality Tracked</span>
        </div>
        <div className="footer-status text-cyan">
          [VOL-NODE OK] :: DERIVATIVES SURFACE PIPELINE OPERATIONAL
        </div>
      </footer>
    </div>
  );
};

export default NeuroVolStudio;
