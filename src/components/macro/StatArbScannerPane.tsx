import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import {
  NeuroMacroEngine,
  type StatArbSignal
} from '../../lib/NeuroMacroEngine';

export const StatArbScannerPane: React.FC = () => {
  const [signals] = useState<StatArbSignal[]>(() => NeuroMacroEngine.getStatArbSignals());
  const [selectedSignal, setSelectedSignal] = useState<StatArbSignal>(signals[0]);

  const getSignalBadge = (type: string) => {
    switch (type) {
      case 'LONG_SPREAD': return 'badge-long';
      case 'SHORT_SPREAD': return 'badge-short';
      default: return 'badge-neutral';
    }
  };

  return (
    <div className="statarb-pane-container">
      {/* Header Banner */}
      <div className="statarb-header glass-card">
        <div>
          <h3>
            <Activity size={20} className="text-violet icon-pulse" /> Statistical Arbitrage &amp; Cointegrated Pairs Scanner
          </h3>
          <p className="text-muted">Detect Z-score spread dislocations across cointegrated asset pairs for mean-reversion quantitative arbitrage.</p>
        </div>
        <div className="active-pairs-tag">
          {signals.length} Cointegrated Pairs Active
        </div>
      </div>

      {/* Main Grid: Signal List & Pair Inspector */}
      <div className="statarb-main-grid">
        {/* Left: Signal Feed List */}
        <div className="signal-list-col">
          <div className="col-header">
            <h4>Cointegrated Pair Signals</h4>
            <span className="tag">p-value &lt; 0.05</span>
          </div>

          <div className="signals-feed">
            {signals.map(sig => (
              <motion.div
                key={sig.id}
                whileHover={{ scale: 1.01 }}
                className={`sig-card glass-card ${selectedSignal.id === sig.id ? 'active' : ''}`}
                onClick={() => setSelectedSignal(sig)}
              >
                <div className="sig-card-top">
                  <span className="pair-title">{sig.pair}</span>
                  <span className={`sig-badge ${getSignalBadge(sig.signalType)}`}>
                    {sig.signalType.replace('_', ' ')}
                  </span>
                </div>

                <div className="sig-card-mid">
                  <div className="z-score-meter">
                    <span className="z-label">Current Z-Score:</span>
                    <span className={`z-val ${Math.abs(sig.currentZScore) > 2 ? 'text-amber' : 'text-cyan'}`}>
                      {sig.currentZScore > 0 ? '+' : ''}{sig.currentZScore}σ
                    </span>
                  </div>
                  <span className="p-val">p: {sig.cointegrationPValue}</span>
                </div>

                <div className="sig-card-bot">
                  <span className="action-txt">{sig.recommendedAction}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right: Selected Pair Analytics & Z-Score Timeline */}
        <div className="inspector-col glass-card">
          <div className="inspector-header">
            <div>
              <h3>{selectedSignal.pair}</h3>
              <p className="text-muted">Cointegration P-Value: {selectedSignal.cointegrationPValue} • Half-Life: {selectedSignal.halfLifeDays} Days</p>
            </div>
            <span className={`sig-badge large ${getSignalBadge(selectedSignal.signalType)}`}>
              {selectedSignal.signalType.replace('_', ' ')}
            </span>
          </div>

          <div className="metrics-row">
            <div className="m-box">
              <label>Current Z-Score Spread</label>
              <span className="m-val text-amber">{selectedSignal.currentZScore > 0 ? '+' : ''}{selectedSignal.currentZScore}σ</span>
            </div>
            <div className="m-box">
              <label>Expected Mean Reversion Return</label>
              <span className="m-val text-green">+{selectedSignal.expectedReturnPct}%</span>
            </div>
            <div className="m-box">
              <label>Asset A / Asset B</label>
              <span className="m-val text-cyan">{selectedSignal.assetA} / {selectedSignal.assetB}</span>
            </div>
          </div>

          {/* Spread Z-Score Timeline Chart */}
          <div className="chart-wrapper-box">
            <div className="chart-header">
              <h4>
                <TrendingUp size={16} className="text-cyan" /> Historical Spread Z-Score Trajectory
              </h4>
              <span className="tag">Threshold: ±2.0σ</span>
            </div>

            <div style={{ height: 260, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={selectedSignal.historicalSpread} margin={{ top: 15, right: 15, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis domain={[-3, 3]} stroke="#64748b" tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' }} />
                  <ReferenceLine y={2.0} stroke="rgba(255, 184, 0, 0.6)" strokeDasharray="3 3" label={{ value: '+2.0σ Upper Threshold', fill: '#ffb800', fontSize: 10 }} />
                  <ReferenceLine y={0} stroke="rgba(255, 255, 255, 0.2)" />
                  <ReferenceLine y={-2.0} stroke="rgba(255, 184, 0, 0.6)" strokeDasharray="3 3" label={{ value: '-2.0σ Lower Threshold', fill: '#ffb800', fontSize: 10 }} />
                  <Line type="monotone" dataKey="zScore" stroke="var(--accent-violet)" strokeWidth={2.5} name="Z-Score Spread" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="action-footer">
            <button className="execute-pair-btn">
              <span>Execute Pairs Trade Order</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatArbScannerPane;
