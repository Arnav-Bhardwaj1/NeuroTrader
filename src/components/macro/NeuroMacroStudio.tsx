import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  LineChart,
  Grid,
  DollarSign,
  Activity,
  Maximize2,
  Minimize2,
  RefreshCw,
  Cpu,
  ShieldCheck
} from 'lucide-react';

import YieldCurvePane from './YieldCurvePane';
import CorrelationMatrixPane from './CorrelationMatrixPane';
import MacroLiquidityPane from './MacroLiquidityPane';
import StatArbScannerPane from './StatArbScannerPane';

import './NeuroMacroStudio.css';

const TABS = [
  { id: 'yields', label: 'Yield Curve & Inversion', icon: LineChart, component: YieldCurvePane },
  { id: 'correlation', label: 'Cross-Asset Correlation', icon: Grid, component: CorrelationMatrixPane },
  { id: 'liquidity', label: 'Fed Net Liquidity', icon: DollarSign, component: MacroLiquidityPane },
  { id: 'statarb', label: 'Statistical Arbitrage', icon: Activity, component: StatArbScannerPane },
];

export const NeuroMacroStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('yields');
  const [fullscreen, setFullscreen] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const ActiveComponent = TABS.find(t => t.id === activeTab)?.component || YieldCurvePane;

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 600);
  };

  return (
    <div className={`macro-studio-page ${fullscreen ? 'fullscreen' : ''}`}>
      {/* Top Header */}
      <header className="macro-header">
        <div className="title-area">
          <div className="logo-box">
            <Globe size={26} className="text-cyan icon-pulse" />
          </div>
          <div className="text-box">
            <h1>NeuroMacro Intelligence Studio <span className="version-badge">v5.0-GLOBAL</span></h1>
            <p>Cross-Asset Yield Structure • Fed Liquidity Impulse • Cointegrated Statistical Arbitrage</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="macro-nav">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon size={17} />
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div layoutId="macroActiveUnderline" className="nav-underline" />
              )}
            </button>
          ))}
        </nav>

        {/* System Actions */}
        <div className="macro-actions">
          <button className="icon-btn" onClick={handleSync} title="Refresh Macro Feed">
            <RefreshCw size={17} className={isSyncing ? 'spin' : ''} />
          </button>
          <button className="icon-btn" onClick={() => setFullscreen(!fullscreen)} title="Toggle Fullscreen">
            {fullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
          </button>
          <div className="status-indicator">
            <span className="dot pulse" />
            <span>MACRO RADAR: ACTIVE</span>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="macro-main">
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
      <footer className="macro-footer">
        <div className="footer-stat">
          <Cpu size={14} className="text-cyan" />
          <span>Macro Models: Probit Recession &amp; Cointegration Engine Running</span>
        </div>
        <div className="footer-stat">
          <ShieldCheck size={14} className="text-green" />
          <span>Liquidity Radar: Fed Net Impulse Tracked</span>
        </div>
        <div className="footer-status text-cyan">
          [MACRO-NODE OK] :: GLOBAL INTER-MARKET RADAR OPERATIONAL
        </div>
      </footer>
    </div>
  );
};

export default NeuroMacroStudio;
