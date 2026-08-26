import React, { useState } from 'react';
import {
  TrendingUp,
  Activity,
  Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import {
  NeuroVolEngine,
  type VolPoint
} from '../../lib/NeuroVolEngine';

export const VolSurfacePane: React.FC = () => {
  const [points] = useState<VolPoint[]>(() => NeuroVolEngine.getVolSurfacePoints());
  const atmPoint = points.find(p => p.moneynessPct === 100) || points[0];

  return (
    <div className="surface-pane-container">
      {/* Header Banner */}
      <div className="surface-header glass-card">
        <div className="title-box">
          <h3>
            <Activity size={20} className="text-cyan icon-pulse" /> Options Implied Volatility Surface &amp; Volatility Smile
          </h3>
          <p className="text-muted">Multi-tenor volatility term structure &amp; put/call volatility skew across moneyness strikes.</p>
        </div>

        <div className="atm-iv-badge">
          <span className="lbl">ATM 30-Day Implied Volatility:</span>
          <span className="val text-amber">{atmPoint.iv30dPct}%</span>
        </div>
      </div>

      {/* Main Grid: Volatility Surface Chart & Skew Metrics */}
      <div className="surface-main-grid">
        {/* Left: Volatility Smile & Skew Chart */}
        <div className="chart-card glass-card">
          <div className="card-title-row">
            <h4>
              <TrendingUp size={16} className="text-cyan" /> Volatility Smile Curves Across Expiration Tenors
            </h4>
            <span className="tag">Strike vs IV (%)</span>
          </div>

          <div style={{ height: 320, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={points} margin={{ top: 15, right: 15, bottom: 25, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="strikePrice" stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={v => `$${v}`} />
                <YAxis domain={['auto', 'auto']} stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={v => `${v}%`} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' }} />
                <ReferenceLine x={123} stroke="rgba(255,255,255,0.2)" strokeDasharray="3 3" label={{ value: 'ATM ($123)', fill: '#64748b', fontSize: 10 }} />
                <Line type="monotone" dataKey="iv7dPct" stroke="var(--accent-red)" strokeWidth={2} name="7D Expiration IV (%)" />
                <Line type="monotone" dataKey="iv30dPct" stroke="var(--accent-cyan)" strokeWidth={2.5} name="30D Expiration IV (%)" />
                <Line type="monotone" dataKey="iv60dPct" stroke="var(--accent-amber)" strokeWidth={2} strokeDasharray="3 3" name="60D Expiration IV (%)" />
                <Line type="monotone" dataKey="iv90dPct" stroke="var(--accent-violet)" strokeWidth={2} strokeDasharray="2 2" name="90D Expiration IV (%)" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Skew & Moneyness Table */}
        <div className="table-card glass-card">
          <div className="card-title-row">
            <h4>
              <Layers size={16} className="text-violet" /> Put / Call Volatility Skew Breakdown
            </h4>
            <span className="tag">{points.length} Strikes</span>
          </div>

          <div className="table-wrapper">
            <table className="skew-table">
              <thead>
                <tr>
                  <th>Strike</th>
                  <th>Moneyness</th>
                  <th>30D IV</th>
                  <th>Put IV</th>
                  <th>Call IV</th>
                </tr>
              </thead>
              <tbody>
                {points.map(p => (
                  <tr key={p.strikePrice} className={p.moneynessPct === 100 ? 'atm-row' : ''}>
                    <td><strong>${p.strikePrice}</strong></td>
                    <td>{p.moneynessPct}%</td>
                    <td className="text-amber">{p.iv30dPct}%</td>
                    <td className="text-red">{p.putIvPct}%</td>
                    <td className="text-green">{p.callIvPct}%</td>
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

export default VolSurfacePane;
