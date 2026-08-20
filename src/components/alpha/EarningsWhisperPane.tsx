import React, { useState } from 'react';
import {
  Sparkles,
  BarChart2,
  Calendar
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
  type EarningsWhisper
} from '../../lib/NeuroAlphaEngine';

export const EarningsWhisperPane: React.FC = () => {
  const [whispers] = useState<EarningsWhisper[]>(() => NeuroAlphaEngine.getEarningsWhispers());
  const [selectedWhisper] = useState<EarningsWhisper>(whispers[0]);

  return (
    <div className="whisper-pane-container">
      {/* Header Banner */}
      <div className="whisper-header glass-card">
        <div className="title-box">
          <h3>
            <Sparkles size={20} className="text-amber icon-pulse" /> Earnings Whisper &amp; Implied Move Volatility Engine
          </h3>
          <p className="text-muted">Pre-earnings IV crush calculator, consensus vs whisper EPS spreads, and option straddle move pricing.</p>
        </div>

        <div className="avg-beat-badge">
          <span className="lbl">Top Ticker Implied Move:</span>
          <span className="val text-cyan">±{selectedWhisper.impliedMovePct}% ({selectedWhisper.symbol})</span>
        </div>
      </div>

      {/* Main Grid: Implied Move Chart & Earnings Table */}
      <div className="whisper-main-grid">
        {/* Left: Implied Move vs Historical Gap Chart */}
        <div className="chart-card glass-card">
          <div className="card-title-row">
            <h4>
              <BarChart2 size={16} className="text-cyan" /> Option Straddle Implied Move vs Historical Gap (%)
            </h4>
            <span className="tag">Pre-Earnings Volatility</span>
          </div>

          <div style={{ height: 320, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={whispers} margin={{ top: 15, right: 15, bottom: 25, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="symbol" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={v => `±${v}%`} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="impliedMovePct" fill="var(--accent-cyan)" name="Option Implied Move (%)" />
                <Bar dataKey="historicalAvgGapPct" fill="var(--accent-amber)" name="Hist. Avg Price Gap (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Earnings Calendar & Whisper Table */}
        <div className="table-card glass-card">
          <div className="card-title-row">
            <h4>
              <Calendar size={16} className="text-violet" /> Upcoming Earnings Whisper Signals
            </h4>
            <span className="tag">{whispers.length} Catalysts</span>
          </div>

          <div className="table-wrapper">
            <table className="whisper-table">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Report Date</th>
                  <th>EPS (Est / Whisper)</th>
                  <th>Straddle Move</th>
                  <th>Beat Prob (%)</th>
                </tr>
              </thead>
              <tbody>
                {whispers.map(w => (
                  <tr key={w.symbol}>
                    <td>
                      <div className="s-info">
                        <strong>{w.symbol}</strong>
                        <span className="s-sub">{w.companyName}</span>
                      </div>
                    </td>
                    <td>{w.reportDate}</td>
                    <td>${w.epsEstimate} / <strong className="text-green">${w.epsWhisper}</strong></td>
                    <td className="text-amber">±{w.impliedMovePct}% (${w.straddleCostUsd.toFixed(2)})</td>
                    <td className="text-cyan"><strong>{w.beatProbabilityPct}%</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarningsWhisperPane;
