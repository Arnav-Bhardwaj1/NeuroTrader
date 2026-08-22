import React, { useState } from 'react';
import {
  Cpu,
  Activity,
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
  type ExecutionVenue
} from '../../lib/NeuroExecutionEngine';

export const SmartRouterPane: React.FC = () => {
  const [venues] = useState<ExecutionVenue[]>(() => NeuroExecutionEngine.getExecutionVenues());

  return (
    <div className="sor-pane-container">
      {/* Header Banner */}
      <div className="sor-header glass-card">
        <div className="title-box">
          <h3>
            <Cpu size={20} className="text-cyan icon-pulse" /> Smart Order Router (SOR) &amp; Dark Pool Liquidity Map
          </h3>
          <p className="text-muted">Dynamic order routing across Lit Exchanges, Midpoint Dark Pools, and Internalizers for minimal market footprint.</p>
        </div>

        <div className="saved-rebate-badge">
          <span className="lbl">Total Fee Rebates Earned:</span>
          <span className="val text-green">+$14,250</span>
        </div>
      </div>

      {/* Main Grid: Venue Liquidity Chart & Venue Table */}
      <div className="sor-main-grid">
        {/* Left: Venue Liquidity Share Chart */}
        <div className="chart-card glass-card">
          <div className="card-title-row">
            <h4>
              <Activity size={16} className="text-cyan" /> Venue Liquidity Allocation Share (%)
            </h4>
            <span className="tag">SOR Routing Weight</span>
          </div>

          <div style={{ height: 320, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={venues} margin={{ top: 15, right: 15, bottom: 25, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={v => `${v}%`} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="liquiditySharePct" fill="var(--accent-cyan)" name="Liquidity Share (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Venue Fee & Latency Matrix Table */}
        <div className="table-card glass-card">
          <div className="card-title-row">
            <h4>
              <Layers size={16} className="text-violet" /> Execution Venue Fee &amp; Latency Matrix
            </h4>
            <span className="tag">{venues.length} Venues Connected</span>
          </div>

          <div className="table-wrapper">
            <table className="venue-table">
              <thead>
                <tr>
                  <th>Venue</th>
                  <th>Type</th>
                  <th>Latency</th>
                  <th>Rebate / Fee</th>
                  <th>Fill Prob.</th>
                </tr>
              </thead>
              <tbody>
                {venues.map(v => (
                  <tr key={v.venueId}>
                    <td>
                      <div className="v-info">
                        <strong>{v.name}</strong>
                        <span className="v-sub">{v.venueId}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`v-type ${v.type.toLowerCase()}`}>
                        {v.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="text-cyan">{v.avgLatencyMs} ms</td>
                    <td className="text-green">+${v.rebatePerShareUsd}/sh</td>
                    <td><strong>{v.fillProbabilityPct}%</strong></td>
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

export default SmartRouterPane;
