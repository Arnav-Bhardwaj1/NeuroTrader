import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Zap,
  Play,
  Maximize2,
  Minimize2,
  RefreshCw,
  Cpu,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

import SignalSynthesizerPane from './SignalSynthesizerPane';
import MonteCarloSimulatorPane from './MonteCarloSimulatorPane';
import CrossAssetLiquidityPane from './CrossAssetLiquidityPane';
import StrategyAutomationPane from './StrategyAutomationPane';

import './NeuroCopilotStudio.css';

const TABS = [
  { id: 'signals', label: 'AI Signal Synthesizer', icon: Sparkles, component: SignalSynthesizerPane },
  { id: 'montecarlo', label: 'Monte Carlo & Risk Matrix', icon: Play, component: MonteCarloSimulatorPane },
  { id: 'gex', label: 'GEX & Dark Pool Radar', icon: Zap, component: CrossAssetLiquidityPane },
  { id: 'automation', label: 'Autonomous AI Bots', icon: Cpu, component: StrategyAutomationPane },
];

export const NeuroCopilotStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('signals');
  const [fullscreen, setFullscreen] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const ActiveComponent = TABS.find(t => t.id === activeTab)?.component || SignalSynthesizerPane;

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 600);
  };

  return (
    <div className={`copilot-studio-page ${fullscreen ? 'fullscreen' : ''}`}>
      {/* Top Header */}
      <header className="copilot-header">
        <div className="title-area">
          <div className="logo-box">
            <Bot size={26} className="text-cyan icon-pulse" />
          </div>
          <div className="text-box">
            <h1>NeuroCopilot <span className="version-badge">v3.5-QUANT</span></h1>
            <p>AI Strategy Orchestrator • Stochastic Risk Matrix • Multi-Asset Signal Synthesizer</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="copilot-nav">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon size={17} />
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div layoutId="copilotActiveUnderline" className="nav-underline" />
              )}
            </button>
          ))}
        </nav>

        {/* System Actions */}
        <div className="copilot-actions">
          <button className="icon-btn" onClick={handleSync} title="Sync AI Neural Network">
            <RefreshCw size={17} className={isSyncing ? 'spin' : ''} />
          </button>
          <button className="icon-btn" onClick={() => setFullscreen(!fullscreen)} title="Toggle Fullscreen">
            {fullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
          </button>
          <div className="status-indicator">
            <span className="dot pulse" />
            <span>AI AGENT: ONLINE</span>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="copilot-main">
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
      <footer className="copilot-footer">
        <div className="footer-stat">
          <Cpu size={14} className="text-cyan" />
          <span>GPU Acceleration: CUDA ACTIVE (1,000 Paths / 18ms)</span>
        </div>
        <div className="footer-stat">
          <ShieldCheck size={14} className="text-green" />
          <span>Risk Shield: VaR Guard Enabled</span>
        </div>
        <div className="footer-status text-cyan">
          [NEURO-AGENT OK] :: NEURAL STRATEGY ORCHESTRATOR OPERATIONAL
        </div>
      </footer>
    </div>
  );
};

export default NeuroCopilotStudio;
