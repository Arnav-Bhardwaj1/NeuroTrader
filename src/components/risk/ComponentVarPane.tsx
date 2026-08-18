import React, { useState } from 'react';
import {
  PieChart,
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
  NeuroRiskEngine,
  type ComponentVaR
} from '../../lib/NeuroRiskEngine';

export const ComponentVarPane: React.FC = () => {
  const [components] = useState<ComponentVaR[]>(() => NeuroRiskEngine.getComponentVaRBreakdown());

  const totalComponentVar = components.reduce((sum, c) => sum + c.componentVarUsd, 0);

  return (
    <div className="cvar-pane-container">
      {/* Header Banner */}
      <div className="cvar-header glass-card">
        <div className="title-box">
          <h3>
            <PieChart size={20} className="text-violet icon-pulse" /> Component VaR (CVaR) Risk Attribution &amp; Tail Contribution
          </h3>
          <p className="text-muted">Decompose 95% Value-at-Risk across individual holdings to identify top tail risk drivers.</p>
        </div>

        <div className="total-cvar-badge">
          <span className="lbl">Total Component VaR (95%):</span>
          <span className="val text-amber">${totalComponentVar.toLocaleString()}</span>
        </div>
      </div>

      {/* Main Grid: Component VaR Chart & Risk Table */}
      <div className="cvar-main-grid">
        {/* Left: Component VaR Risk Contribution Bar Chart */}
        <div className="chart-card glass-card">
          <div className="card-title-row">
            <h4>
              <Activity size={16} className="text-cyan" /> Risk Contribution by Asset (% of Total VaR)
            </h4>
            <span className="tag">95% Confidence</span>
          </div>

          <div style={{ height: 320, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={components} margin={{ top: 15, right: 15, bottom: 25, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="symbol" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="riskContributionPercent" fill="var(--accent-amber)" name="Risk Contribution (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Detailed Risk Attribution Table */}
        <div className="table-card glass-card">
          <div className="card-title-row">
            <h4>
              <Layers size={16} className="text-violet" /> Asset Risk Decomposition Matrix
            </h4>
            <span className="tag">{components.length} Holdings</span>
          </div>

          <div className="table-wrapper">
            <table className="risk-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Weight</th>
                  <th>Position Value</th>
                  <th>Component VaR ($)</th>
                  <th>Risk Contrib (%)</th>
                  <th>Diversification Benefit</th>
                </tr>
              </thead>
              <tbody>
                {components.map(comp => (
                  <tr key={comp.symbol}>
                    <td>
                      <div className="a-info">
                        <strong>{comp.symbol}</strong>
                        <span className="a-sub">{comp.name}</span>
                      </div>
                    </td>
                    <td>{comp.weightPercent}%</td>
                    <td>${comp.positionValueUsd.toLocaleString()}</td>
                    <td className="text-amber">${comp.componentVarUsd.toLocaleString()}</td>
                    <td className="text-cyan"><strong>{comp.riskContributionPercent}%</strong></td>
                    <td className="text-green">+${comp.diversificationBenefitUsd.toLocaleString()}</td>
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

export default ComponentVarPane;
