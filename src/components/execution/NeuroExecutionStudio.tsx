import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cpu,
  Zap,
  Activity,
  Award,
  Maximize2,
  Minimize2,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';

import SmartRouterPane from './SmartRouterPane';
import AlgoExecutionPane from './AlgoExecutionPane';
import MarketImpactPane from './MarketImpactPane';
import TcaAnalyticsPane from './TcaAnalyticsPane';

import './NeuroExecutionStudio.css';

const TABS = [
  { id: 'router', label: 'Smart Order Router & Venues', icon: Cpu, component: SmartRouterPane },
  { id: 'algo', label: 'TWAP / VWAP Order Slicer', icon: Zap, component: AlgoExecutionPane },
  { id: 'impact', label: 'Almgren-Chriss Market Impact', icon: Activity, component: MarketImpactPane },
  { id: 'tca', label: 'TCA & Implementation Shortfall', icon: Award, component: TcaAnalyticsPane },
];

export const NeuroExecutionStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('router');
  const [fullscreen, setFullscreen] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const ActiveComponent = TABS.find(t => t.id === activeTab)?.component || SmartRouterPane;

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 600);
  };

  return (
    <div className={`exec-studio-page ${fullscreen ? 'fullscreen' : ''}`}>
      {/* Top Header */}
      <header className="exec-header">
        <div className="title-area">
          <div className="logo-box">
            <Cpu size={26} className="text-cyan icon-pulse" />
          </div>
          <div className="text-box">
            <h1>NeuroExecution Smart Router Studio <span className="version-badge">v8.0-EXEC</span></h1>
            <p>Smart Order Routing (SOR) • TWAP/VWAP Slicing • Almgren-Chriss Impact • Post-Trade TCA</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="exec-nav">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon size={17} />
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div layoutId="execActiveUnderline" className="nav-underline" />
              )}
            </button>
          ))}
        </nav>

        {/* System Actions */}
        <div className="exec-actions">
          <button className="icon-btn" onClick={handleSync} title="Refresh Order Book Feeds">
            <RefreshCw size={17} className={isSyncing ? 'spin' : ''} />
          </button>
          <button className="icon-btn" onClick={() => setFullscreen(!fullscreen)} title="Toggle Fullscreen">
            {fullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
          </button>
          <div className="status-indicator">
            <span className="dot pulse" />
            <span>SOR ROUTER: ONLINE</span>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="exec-main">
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
      <footer className="exec-footer">
        <div className="footer-stat">
          <Cpu size={14} className="text-cyan" />
          <span>Execution Engine: SOR Latency 2.4ms • Dark Pool Midpoint Match Enabled</span>
        </div>
        <div className="footer-stat">
          <ShieldCheck size={14} className="text-green" />
          <span>Rebate Optimization: $14.2k Fees Saved</span>
        </div>
        <div className="footer-status text-cyan">
          [EXEC-NODE OK] :: SMART ROUTER PIPELINE ACTIVE
        </div>
      </footer>
    </div>
  );
};

export default NeuroExecutionStudio;
