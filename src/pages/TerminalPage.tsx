import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal, 
  Workflow, 
  Target, 
  ShieldAlert, 
  Maximize2, 
  Minimize2,
  Settings2,
  Layers
} from 'lucide-react';
import NeuroLogicEditor from '../components/terminal/NeuroLogicEditor';
import PortfolioOptimizer from '../components/terminal/PortfolioOptimizer';
import StressTester from '../components/terminal/StressTester';
import './TerminalPage.css';

/**
 * TerminalPage.tsx
 * The "NeuroTerminal" Command Center.
 * A tabbed workspace hosting the Strategy Builder, Portfolio Optimizer, and Stress Tester.
 */

const TABS = [
  { id: 'logic', label: 'Logic Builder', icon: Workflow, component: NeuroLogicEditor },
  { id: 'optimizer', label: 'Portfolio Optimizer', icon: Target, component: PortfolioOptimizer },
  { id: 'stress', label: 'Stress Tester', icon: ShieldAlert, component: StressTester },
];

export const TerminalPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('logic');
  const [fullscreen, setFullscreen] = useState(false);

  const ActiveComponent = TABS.find(t => t.id === activeTab)?.component || NeuroLogicEditor;

  return (
    <div className={`terminal-page ${fullscreen ? 'fullscreen' : ''}`}>
      <header className="terminal-header">
        <div className="title-area">
          <div className="logo-box">
            <Terminal size={24} className="icon-pulse" />
          </div>
          <div className="text-box">
            <h1>NeuroTerminal <span className="version-badge">v2.0-ALGO</span></h1>
            <p>Advanced Quantitative Engineering Workspace</p>
          </div>
        </div>

        <nav className="terminal-nav">
          {TABS.map(tab => (
            <button 
              key={tab.id}
              className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon size={18} />
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div layoutId="tabUnderline" className="nav-underline" />
              )}
            </button>
          ))}
        </nav>

        <div className="terminal-actions">
          <button className="icon-btn" onClick={() => setFullscreen(!fullscreen)}>
            {fullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          <button className="icon-btn"><Settings2 size={18} /></button>
          <div className="status-indicator">
            <span className="dot pulse" />
            <span>ALGO-NODE: ACTIVE</span>
          </div>
        </div>
      </header>

      <main className="terminal-main">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="component-workspace"
          >
            <ActiveComponent />
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="terminal-footer">
        <div className="footer-stat">
          <Layers size={14} />
          <span>Nodes: 3 Active</span>
        </div>
        <div className="footer-stat">
          <Target size={14} />
          <span>Efficiency: 94.2%</span>
        </div>
        <div className="footer-status text-cyan">
          [SYSTEM OK] :: NEURO-QUANT ENGINE READY
        </div>
      </footer>
    </div>
  );
};

export default TerminalPage;
