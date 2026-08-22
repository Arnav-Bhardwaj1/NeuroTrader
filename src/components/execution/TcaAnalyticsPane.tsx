import React, { useState } from 'react';
import {
  Award,
  BarChart2,
  Layers
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
  type TcaReport
} from '../../lib/NeuroExecutionEngine';

export const TcaAnalyticsPane: React.FC = () => {
  const [reports] = useState<TcaReport[]>(() => NeuroExecutionEngine.getTcaReports());

  const getRatingBadge = (rating: string) => {
    switch (rating) {
      case 'EXCELLENT': return 'rating-excellent';
      case 'GOOD': return 'rating-good';
      default: return 'rating-fair';
    }
  };

  return (
    <div className="tca-pane-container">
      {/* Header Banner */}
      <div className="tca-header glass-card">
        <div className="title-box">
          <h3>
            <Award size={20} className="text-green icon-pulse" /> Transaction Cost Analysis (TCA) &amp; Implementation Shortfall
          </h3>
          <p className="text-muted">Post-trade benchmark audit evaluating Arrival Price, Interval VWAP, and Implementation Shortfall BPS.</p>
        </div>

        <div className="overall-tca-badge">
          <span className="lbl">Overall TCA Rating:</span>
          <span className="val text-green">EXCELLENT (3.9 BPS Shortfall)</span>
        </div>
      </div>

      {/* Main Grid: Shortfall Chart & TCA Reports Table */}
      <div className="tca-main-grid">
        {/* Left: Implementation Shortfall BPS Chart */}
        <div className="chart-card glass-card">
          <div className="card-title-row">
            <h4>
              <BarChart2 size={16} className="text-cyan" /> Implementation Shortfall (BPS) by Order
            </h4>
            <span className="tag">Benchmarked to Arrival Price</span>
          </div>

          <div style={{ height: 320, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reports} margin={{ top: 15, right: 15, bottom: 25, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="symbol" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={v => `${v} bps`} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="implementationShortfallBps" fill="var(--accent-green)" name="Shortfall (BPS)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Detailed TCA Reports Table */}
        <div className="table-card glass-card">
          <div className="card-title-row">
            <h4>
              <Layers size={16} className="text-violet" /> Post-Trade Execution Scorecards
            </h4>
            <span className="tag">{reports.length} Executed Orders</span>
          </div>

          <div className="table-wrapper">
            <table className="tca-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Algo</th>
                  <th>Arrival / Fill Price</th>
                  <th>Shortfall (BPS)</th>
                  <th>Rating</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(r => (
                  <tr key={r.orderId}>
                    <td>
                      <div className="o-info">
                        <strong>{r.symbol}</strong>
                        <span className="o-sub">{r.totalShares.toLocaleString()} Shs</span>
                      </div>
                    </td>
                    <td>{r.algoType}</td>
                    <td>${r.arrivalPrice.toFixed(2)} / <strong className="text-green">${r.finalAvgFillPrice.toFixed(2)}</strong></td>
                    <td className="text-cyan"><strong>{r.implementationShortfallBps} BPS</strong></td>
                    <td>
                      <span className={`rating-badge ${getRatingBadge(r.efficiencyRating)}`}>
                        {r.efficiencyRating}
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

export default TcaAnalyticsPane;
