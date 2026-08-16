import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Grid,
  Sparkles,
  BarChart2
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import {
  NeuroMacroEngine,
  type CorrelationMatrixData
} from '../../lib/NeuroMacroEngine';

export const CorrelationMatrixPane: React.FC = () => {
  const [windowDays, setWindowDays] = useState<number>(90);
  const data: CorrelationMatrixData = useMemo(() => {
    return NeuroMacroEngine.getCorrelationMatrix(windowDays);
  }, [windowDays]);

  const [selectedPair, setSelectedPair] = useState<{ a: string; b: string; val: number }>({
    a: 'SPY',
    b: 'NVDA',
    val: 0.88,
  });

  const getCorrColor = (val: number) => {
    if (val >= 0.5) return `rgba(6, 214, 160, ${0.2 + val * 0.75})`;
    if (val > 0) return `rgba(6, 214, 160, 0.2)`;
    if (val <= -0.5) return `rgba(255, 59, 92, ${0.2 + Math.abs(val) * 0.75})`;
    return `rgba(255, 59, 92, 0.2)`;
  };

  return (
    <div className="corr-pane-container">
      {/* Header Banner */}
      <div className="corr-header glass-card">
        <div className="title-box">
          <h3>
            <Grid size={20} className="text-cyan icon-pulse" /> 7x7 Cross-Asset Rolling Correlation Matrix
          </h3>
          <p className="text-muted">Inter-market rolling Pearson correlations across Equities, Crypto, Commodities, Treasury Yields, and Dollar Index.</p>
        </div>

        <div className="window-selector">
          <label>Rolling Window:</label>
          {[30, 90, 180].map(w => (
            <button
              key={w}
              className={`win-btn ${windowDays === w ? 'active' : ''}`}
              onClick={() => setWindowDays(w)}
            >
              {w}D
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: 7x7 Heatmap & Rolling History Chart */}
      <div className="corr-main-grid">
        {/* Left: 7x7 Heatmap Matrix */}
        <div className="heatmap-card glass-card">
          <div className="card-title-row">
            <h4>
              <Sparkles size={16} className="text-amber" /> 7x7 Pairwise Correlation Matrix
            </h4>
            <span className="tag">{data.rollingWindowDays}-Day Window</span>
          </div>

          <div className="matrix-wrapper">
            <div className="corr-matrix-grid">
              <div className="hdr-corner">Assets</div>
              {data.assetNames.map(name => (
                <div key={name} className="hdr-col">{name}</div>
              ))}

              {data.assetNames.map((rowName, rIdx) => (
                <React.Fragment key={rowName}>
                  <div className="hdr-row">{rowName}</div>
                  {data.assetNames.map((colName, cIdx) => {
                    const corrVal = data.matrix[rIdx][cIdx];
                    const bg = getCorrColor(corrVal);

                    return (
                      <motion.div
                        key={colName}
                        whileHover={{ scale: 1.05 }}
                        className={`corr-cell ${selectedPair.a === rowName && selectedPair.b === colName ? 'selected' : ''}`}
                        style={{ background: bg }}
                        onClick={() => setSelectedPair({ a: rowName, b: colName, val: corrVal })}
                      >
                        <span className="corr-val">{corrVal > 0 ? `+${corrVal.toFixed(2)}` : corrVal.toFixed(2)}</span>
                      </motion.div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Selected Pair Inspector & Rolling Correlation Timeline */}
        <div className="corr-inspector-pane">
          <div className="pair-inspector-card glass-card">
            <div className="card-header">
              <h4>Pairwise Inspector</h4>
              <span className="tag">Pearson Coefficient</span>
            </div>

            <div className="pair-display">
              <span className="pair-names">{selectedPair.a} / {selectedPair.b}</span>
              <span className={`pair-val ${selectedPair.val >= 0 ? 'text-green' : 'text-red'}`}>
                {selectedPair.val > 0 ? '+' : ''}{selectedPair.val}
              </span>
            </div>
            <p className="pair-desc">
              {selectedPair.val > 0.7
                ? 'Strong Positive Coupling: Asset prices move together tightly.'
                : selectedPair.val < -0.6
                ? 'Strong Negative Coupling: Inverse hedging relationship.'
                : 'Decoupled / Low Correlation: High diversification benefit.'}
            </p>
          </div>

          {/* Historical Rolling Correlation Timeline */}
          <div className="timeline-card glass-card">
            <div className="card-header">
              <h4>
                <BarChart2 size={16} className="text-violet" /> Key Inter-Market Rolling Trends
              </h4>
              <span className="tag">History</span>
            </div>

            <div style={{ height: 210, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.historicalRolling} margin={{ top: 10, right: 10, bottom: 5, left: -15 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 9 }} />
                  <YAxis domain={[-1, 1]} stroke="#64748b" tick={{ fontSize: 9 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '11px' }} />
                  <Line type="monotone" dataKey="btcVsSpy" stroke="var(--accent-cyan)" strokeWidth={2} name="BTC vs SPY" />
                  <Line type="monotone" dataKey="goldVsYields" stroke="var(--accent-amber)" strokeWidth={2} name="Gold vs Yields" />
                  <Line type="monotone" dataKey="oilVsEnergy" stroke="var(--accent-green)" strokeWidth={2} strokeDasharray="3 3" name="Oil vs Energy" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorrelationMatrixPane;
