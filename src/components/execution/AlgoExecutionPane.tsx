import React, { useState } from 'react';
import {
  Zap,
  TrendingUp,
  Clock
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
  NeuroExecutionEngine,
  type AlgoSlice
} from '../../lib/NeuroExecutionEngine';

export const AlgoExecutionPane: React.FC = () => {
  const [slices] = useState<AlgoSlice[]>(() => NeuroExecutionEngine.getAlgoExecutionSlices());

  const totalTargetShares = slices.reduce((sum, s) => sum + s.targetShares, 0);
  const totalExecutedShares = slices.reduce((sum, s) => sum + s.executedShares, 0);
  const progressPct = Number(((totalExecutedShares / totalTargetShares) * 100).toFixed(1));

  return (
    <div className="algo-pane-container">
      {/* Header Banner */}
      <div className="algo-header glass-card">
        <div className="title-box">
          <h3>
            <Zap size={20} className="text-amber icon-pulse" /> TWAP / VWAP Algorithmic Slice Execution Tracker
          </h3>
          <p className="text-muted">Real-time order slicer breaking large block orders into optimal volume-weighted intervals.</p>
        </div>

        <div className="algo-type-badge">
          <span className="lbl">Active Algo Strategy:</span>
          <span className="val text-cyan">VWAP Volume-Weighted Slicer</span>
        </div>
      </div>

      {/* Progress Banner */}
      <div className="algo-progress-card glass-card">
        <div className="progress-info">
          <span>Order Progress (NVDA 50k Shares): <strong>{totalExecutedShares.toLocaleString()} / {totalTargetShares.toLocaleString()} Shares ({progressPct}%)</strong></span>
          <span className="text-green">Estimated Time Remaining: 35 Mins</span>
        </div>

        <div className="progress-bar-bg">
          <div className="progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* Main Grid: Slice Execution Chart & Slices Log */}
      <div className="algo-main-grid">
        {/* Left: Slice Execution Chart */}
        <div className="chart-card glass-card">
          <div className="card-title-row">
            <h4>
              <TrendingUp size={16} className="text-cyan" /> Slice Volume Schedule (Target vs Executed)
            </h4>
            <span className="tag">5 Time Windows</span>
          </div>

          <div style={{ height: 280, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={slices} margin={{ top: 15, right: 15, bottom: 25, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="timeLabel" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="targetShares" fill="#64748b" name="Target Shares" />
                <Bar dataKey="executedShares" fill="var(--accent-cyan)" name="Executed Shares" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Slices Log Table */}
        <div className="table-card glass-card">
          <div className="card-title-row">
            <h4>
              <Clock size={16} className="text-violet" /> Slice Execution Status Log
            </h4>
            <span className="tag">{slices.length} Slices Total</span>
          </div>

          <div className="table-wrapper">
            <table className="slice-table">
              <thead>
                <tr>
                  <th>Slice #</th>
                  <th>Interval</th>
                  <th>Filled / Target</th>
                  <th>Fill Price</th>
                  <th>Venue</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {slices.map(s => (
                  <tr key={s.sliceNumber}>
                    <td>#{s.sliceNumber}</td>
                    <td>{s.timeLabel}</td>
                    <td>{s.executedShares.toLocaleString()} / {s.targetShares.toLocaleString()}</td>
                    <td>{s.avgFillPrice > 0 ? `$${s.avgFillPrice.toFixed(2)}` : '—'}</td>
                    <td>{s.venue}</td>
                    <td>
                      <span className={`status-pill ${s.status.toLowerCase()}`}>
                        {s.status}
                      </span>
                    </td>
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

export default AlgoExecutionPane;
