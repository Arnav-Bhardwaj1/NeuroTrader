import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Users,
  MessageSquare,
  Flame,
  Maximize2,
  Minimize2,
  RefreshCw,
  Cpu,
  ShieldCheck
} from 'lucide-react';

import InsiderClusterPane from './InsiderClusterPane';
import EarningsWhisperPane from './EarningsWhisperPane';
import FedHawkishnessPane from './FedHawkishnessPane';
import SocialVelocityPane from './SocialVelocityPane';

import './NeuroAlphaStudio.css';

const TABS = [
  { id: 'insider', label: 'Form 4 Insider Clusters', icon: Users, component: InsiderClusterPane },
  { id: 'whisper', label: 'Earnings Whisper & Implied Move', icon: Sparkles, component: EarningsWhisperPane },
  { id: 'fed', label: 'FOMC NLP Hawkishness', icon: MessageSquare, component: FedHawkishnessPane },
  { id: 'social', label: 'Social Sentiment & Squeeze', icon: Flame, component: SocialVelocityPane },
];

export const NeuroAlphaStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('insider');
  const [fullscreen, setFullscreen] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const ActiveComponent = TABS.find(t => t.id === activeTab)?.component || InsiderClusterPane;

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 600);
  };

  return (
    <div className={`alpha-studio-page ${fullscreen ? 'fullscreen' : ''}`}>
      {/* Top Header */}
      <header className="alpha-header">
        <div className="title-area">
          <div className="logo-box">
            <Sparkles size={26} className="text-cyan icon-pulse" />
          </div>
          <div className="text-box">
            <h1>NeuroAlpha Event Intelligence Studio <span className="version-badge">v7.0-ALPHA</span></h1>
            <p>Form 4 Insider Buying Clusters • Earnings Implied Volatility • FOMC Speech NLP • Retail Velocity</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="alpha-nav">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon size={17} />
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div layoutId="alphaActiveUnderline" className="nav-underline" />
              )}
            </button>
          ))}
        </nav>

        {/* System Actions */}
        <div className="alpha-actions">
          <button className="icon-btn" onClick={handleSync} title="Sync Event Feed">
            <RefreshCw size={17} className={isSyncing ? 'spin' : ''} />
          </button>
          <button className="icon-btn" onClick={() => setFullscreen(!fullscreen)} title="Toggle Fullscreen">
            {fullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
          </button>
          <div className="status-indicator">
            <span className="dot pulse" />
            <span>ALPHA FEED: ACTIVE</span>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="alpha-main">
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
      <footer className="alpha-footer">
        <div className="footer-stat">
          <Cpu size={14} className="text-cyan" />
          <span>Event Engines: Form 4 Cluster &amp; FOMC NLP Parser Active</span>
        </div>
        <div className="footer-stat">
          <ShieldCheck size={14} className="text-green" />
          <span>Institutional Impulse: Accumulation Regime Active</span>
        </div>
        <div className="footer-status text-cyan">
          [ALPHA-NODE OK] :: EVENT INTELLIGENCE STREAM OPERATIONAL
        </div>
      </footer>
    </div>
  );
};

export default NeuroAlphaStudio;
