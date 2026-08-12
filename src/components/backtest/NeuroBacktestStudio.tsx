import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FlaskConical,
  Play,
  Grid,
  ShieldAlert,
  Layers,
  Maximize2,
  Minimize2,
  RefreshCw,
  Cpu,
  ShieldCheck
} from 'lucide-react';

import ReplayWorkspacePane from './ReplayWorkspacePane';
import ParameterOptimizationPane from './ParameterOptimizationPane';
import WalkForwardOverfitPane from './WalkForwardOverfitPane';
import MultiAssetBasketPane from './MultiAssetBasketPane';

import './NeuroBacktestStudio.css';

const TABS = [
  { id: 'replay', label: 'Strategy Tick Replay', icon: Play, component: ReplayWorkspacePane },
  { id: 'optimization', label: '2D Parameter Grid', icon: Grid, component: ParameterOptimizationPane },
  { id: 'walkforward', label: 'Walk-Forward & Overfitting', icon: ShieldAlert, component: WalkForwardOverfitPane },
  { id: 'basket', label: 'Multi-Asset Basket', icon: Layers, component: MultiAssetBasketPane },
];

export const NeuroBacktestStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('replay');
  const [fullscreen, setFullscreen] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const ActiveComponent = TABS.find(t => t.id === activeTab)?.component || ReplayWorkspacePane;

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 600);
  };

  return (
    <div className={`backtest-studio-page ${fullscreen ? 'fullscreen' : ''}`}>
      {/* Top Header */}
      <header className="backtest-header">
        <div className="title-area">
          <div className="logo-box">
            <FlaskConical size={26} className="text-cyan icon-pulse" />
          </div>
          <div className="text-box">
            <h1>NeuroQuant Backtest Lab <span className="version-badge">v4.0-EVENT</span></h1>
            <p>Event-Driven Replay Studio • 2D Surface Optimizer • Walk-Forward PBO Diagnostic</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="backtest-nav">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon size={17} />
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div layoutId="backtestActiveUnderline" className="nav-underline" />
              )}
            </button>
          ))}
        </nav>

        {/* System Actions */}
        <div className="backtest-actions">
          <button className="icon-btn" onClick={handleSync} title="Refresh Simulation Models">
            <RefreshCw size={17} className={isSyncing ? 'spin' : ''} />
          </button>
          <button className="icon-btn" onClick={() => setFullscreen(!fullscreen)} title="Toggle Fullscreen">
            {fullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
          </button>
          <div className="status-indicator">
            <span className="dot pulse" />
            <span>REPLAY ENGINE: READY</span>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="backtest-main">
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
      <footer className="backtest-footer">
        <div className="footer-stat">
          <Cpu size={14} className="text-cyan" />
          <span>High-Precision Friction Engine: Slippage (0.05%) &amp; Latency Active</span>
        </div>
        <div className="footer-stat">
          <ShieldCheck size={14} className="text-green" />
          <span>Overfitting Guard: PBO Monte Carlo Evaluated</span>
        </div>
        <div className="footer-status text-cyan">
          [QUANT-ENGINE OK] :: TICK REPLAY LABORATORY OPERATIONAL
        </div>
      </footer>
    </div>
  );
};

export default NeuroBacktestStudio;
