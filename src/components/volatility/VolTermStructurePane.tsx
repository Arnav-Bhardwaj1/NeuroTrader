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
  CartesianGrid
} from 'recharts';
import {
  NeuroVolEngine,
  type VolTermPoint
} from '../../lib/NeuroVolEngine';

export const VolTermStructurePane: React.FC = () => {
  const [terms] = useState<VolTermPoint[]>(() => NeuroVolEngine.getVolTermStructure());

  return (
    <div className="term-pane-container">
      {/* Header Banner */}
      <div className="term-header glass-card">
        <div className="title-box">
          <h3>
            <TrendingUp size={20} className="text-cyan icon-pulse" /> Volatility Term Structure &amp; Volatility Cone
          </h3>
          <p className="text-muted">Implied volatility across expiration tenors vs 25th-75th historical volatility percentile cones.</p>
        </div>

        <div className="term-shape-badge">
          <span className="lbl">Term Structure Slope:</span>
          <span className="val text-amber">Backwardation (Front-Month Inverted)</span>
        </div>
      </div>

      {/* Main Grid: Term Structure Chart & Vol Cone Table */}
      <div className="term-main-grid">
        {/* Left: Volatility Term Structure Curve Chart */}
        <div className="chart-card glass-card">
          <div className="card-title-row">
            <h4>
              <Activity size={16} className="text-cyan" /> Implied Volatility vs Realized Volatility Cone (%)
            </h4>
            <span className="tag">7D to 180D Expirations</span>
          </div>

          <div style={{ height: 320, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={terms} margin={{ top: 15, right: 15, bottom: 25, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="tenorLabel" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis domain={['auto', 'auto']} stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="impliedVolPct" stroke="var(--accent-cyan)" strokeWidth={2.5} name="Implied Volatility (%)" />
                <Line type="monotone" dataKey="realizedVolPct" stroke="var(--accent-amber)" strokeWidth={2} name="Realized Volatility (%)" />
                <Line type="monotone" dataKey="volCone75thPct" stroke="#64748b" strokeWidth={1.5} strokeDasharray="3 3" name="75th Percentile Cone" />
                <Line type="monotone" dataKey="volCone25thPct" stroke="#64748b" strokeWidth={1.5} strokeDasharray="3 3" name="25th Percentile Cone" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Vol Cone Tenor Table */}
        <div className="table-card glass-card">
          <div className="card-title-row">
            <h4>
              <Layers size={16} className="text-violet" /> Volatility Cone Percentiles
            </h4>
            <span className="tag">{terms.length} Expirations</span>
          </div>

          <div className="table-wrapper">
            <table className="term-table">
              <thead>
                <tr>
                  <th>Tenor</th>
                  <th>Implied IV</th>
                  <th>Realized RV</th>
                  <th>25th Cone</th>
                  <th>75th Cone</th>
                </tr>
              </thead>
              <tbody>
                {terms.map(t => (
                  <tr key={t.tenorLabel}>
                    <td><strong>{t.tenorLabel}</strong> ({t.expirationDays}d)</td>
                    <td className="text-cyan">{t.impliedVolPct}%</td>
                    <td className="text-amber">{t.realizedVolPct}%</td>
                    <td>{t.volCone25thPct}%</td>
                    <td>{t.volCone75thPct}%</td>
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

export default VolTermStructurePane;
