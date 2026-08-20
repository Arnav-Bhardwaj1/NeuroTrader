import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  TrendingUp,
  Award
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import {
  NeuroAlphaEngine,
  type InsiderTransaction
} from '../../lib/NeuroAlphaEngine';

export const InsiderClusterPane: React.FC = () => {
  const [insiders] = useState<InsiderTransaction[]>(() => NeuroAlphaEngine.getInsiderClusters());
  const [selectedInsider, setSelectedInsider] = useState<InsiderTransaction>(insiders[0]);

  const totalBuyVolumeUsd = insiders.reduce((sum, i) => sum + i.totalValueUsd, 0);

  return (
    <div className="insider-pane-container">
      {/* Header Banner */}
      <div className="insider-header glass-card">
        <div className="title-box">
          <h3>
            <Users size={20} className="text-cyan icon-pulse" /> SEC Form 4 Insider Cluster Buying Signals
          </h3>
          <p className="text-muted">Detect open-market C-suite executive cluster buys with high historical 6-month win-rates.</p>
        </div>

        <div className="total-volume-badge">
          <span className="lbl">30-Day Cluster Net Buy Volume:</span>
          <span className="val text-green">${(totalBuyVolumeUsd / 1000000).toFixed(1)}M</span>
        </div>
      </div>

      {/* Main Grid: Insider Trade Feed & Executive Inspector */}
      <div className="insider-main-grid">
        {/* Left: Insider Transactions Feed List */}
        <div className="feed-col">
          <div className="col-header">
            <h4>Form 4 Cluster Transactions Feed</h4>
            <span className="tag">{insiders.length} Active Clusters</span>
          </div>

          <div className="insider-feed">
            {insiders.map(item => (
              <motion.div
                key={item.id}
                whileHover={{ scale: 1.01 }}
                className={`insider-card glass-card ${selectedInsider.id === item.id ? 'active' : ''}`}
                onClick={() => setSelectedInsider(item)}
              >
                <div className="card-top">
                  <div className="symbol-box">
                    <span className="sym">{item.symbol}</span>
                    <span className="name">{item.insiderName} ({item.title})</span>
                  </div>

                  <span className={`conf-badge ${item.signalConfidence.toLowerCase()}`}>
                    {item.signalConfidence} CONFIDENCE
                  </span>
                </div>

                <div className="card-mid">
                  <div className="val-box">
                    <span className="lbl">Total Value</span>
                    <span className="val text-green">${(item.totalValueUsd / 1000000).toFixed(2)}M</span>
                  </div>
                  <div className="val-box">
                    <span className="lbl">Cluster Size</span>
                    <span className="val text-cyan">{item.clusterCount} Execs</span>
                  </div>
                  <div className="val-box">
                    <span className="lbl">6M Win-Rate</span>
                    <span className="val text-amber">{item.winRatePct}%</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right: Executive Purchase Volume & Win-Rate Inspector */}
        <div className="inspector-col glass-card">
          <div className="card-header">
            <h4>
              <Award size={16} className="text-amber" /> Executive Cluster Inspector
            </h4>
            <span className="tag">Form 4 Verified</span>
          </div>

          <div className="exec-detail-header">
            <div>
              <h3>{selectedInsider.symbol} — {selectedInsider.insiderName}</h3>
              <p className="text-muted">{selectedInsider.title} • Purchased {selectedInsider.shares.toLocaleString()} Shares @ ${selectedInsider.priceUsd}</p>
            </div>
            <span className="text-green val-huge">${(selectedInsider.totalValueUsd / 1000000).toFixed(2)}M</span>
          </div>

          {/* Volume Bar Chart */}
          <div className="chart-box">
            <div className="chart-header">
              <h4>
                <TrendingUp size={16} className="text-cyan" /> Net Insider Purchase Volume ($ M)
              </h4>
            </div>

            <div style={{ height: 230, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={insiders} margin={{ top: 15, right: 15, bottom: 25, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="symbol" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={v => `$${(v/1000000).toFixed(1)}M`} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="totalValueUsd" fill="var(--accent-green)" name="Net Buy Volume ($)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsiderClusterPane;
