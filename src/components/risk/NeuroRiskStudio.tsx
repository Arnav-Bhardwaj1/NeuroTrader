import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  BarChart2,
  PieChart,
  History,
  ShieldCheck,
  Maximize2,
  Minimize2,
  RefreshCw,
  Cpu
} from 'lucide-react';

import FactorExposurePane from './FactorExposurePane';
import ComponentVarPane from './ComponentVarPane';
import CrisisReplayPane from './CrisisReplayPane';
import CircuitBreakerPane from './CircuitBreakerPane';

import './NeuroRiskStudio.css';

const TABS = [
  { id: 'factor', label: 'Factor Exposure & Style Tilt', icon: BarChart2, component: FactorExposurePane },
  { id: 'cvar', label: 'Component VaR Attribution', icon: PieChart, component: ComponentVarPane },
  { id: 'crisis', label: 'Crisis Stress Replay', icon: History, component: CrisisReplayPane },
  { id: 'circuit', label: 'Risk Shield & Circuit Breakers', icon: ShieldCheck, component: CircuitBreakerPane },
];

export const NeuroRiskStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('factor');
  const [fullscreen, setFullscreen] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const ActiveComponent = TABS.find(t => t.id === activeTab)?.component || FactorExposurePane;

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 600);
  };

  return (
    <div className={`risk-studio-page ${fullscreen ? 'fullscreen' : ''}`}>
      {/* Top Header */}
      <header className="risk-header">
        <div className="title-area">
          <div className="logo-box">
            <ShieldAlert size={26} className="text-amber icon-pulse" />
          </div>
          <div className="text-box">
            <h1>NeuroRisk Intelligence Studio <span className="version-badge">v6.0-SHIELD</span></h1>
            <p>Factor Exposure Loading • Component VaR Attribution • Historical Crisis Stress Sandbox</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="risk-nav">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon size={17} />
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div layoutId="riskActiveUnderline" className="nav-underline" />
              )}
            </button>
          ))}
        </nav>

        {/* System Actions */}
        <div className="risk-actions">
          <button className="icon-btn" onClick={handleSync} title="Recalculate Portfolio VaR">
            <RefreshCw size={17} className={isSyncing ? 'spin' : ''} />
          </button>
          <button className="icon-btn" onClick={() => setFullscreen(!fullscreen)} title="Toggle Fullscreen">
            {fullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
          </button>
          <div className="status-indicator">
            <span className="dot pulse" />
            <span>RISK GUARD: ACTIVE</span>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="risk-main">
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
      <footer className="risk-footer">
        <div className="footer-stat">
          <Cpu size={14} className="text-cyan" />
          <span>Risk Models: Component VaR (95%) &amp; Factor Decompositions Loaded</span>
        </div>
        <div className="footer-stat">
          <ShieldCheck size={14} className="text-green" />
          <span>Circuit Shield: 3 Active Safeguards</span>
        </div>
        <div className="footer-status text-cyan">
          [RISK-NODE OK] :: PORTFOLIO RISK SHIELD OPERATIONAL
        </div>
      </footer>
    </div>
  );
};

export default NeuroRiskStudio;
