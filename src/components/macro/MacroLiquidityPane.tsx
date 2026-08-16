import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp
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
  NeuroMacroEngine,
  type FedLiquidityMetric
} from '../../lib/NeuroMacroEngine';

export const MacroLiquidityPane: React.FC = () => {
  const [metrics] = useState<FedLiquidityMetric[]>(() => NeuroMacroEngine.getFedLiquidityMetrics());
  const latest = metrics[metrics.length - 1] || metrics[0];

  return (
    <div className="liquidity-pane-container">
      {/* Header Banner */}
      <div className="liq-header glass-card">
        <div className="title-box">
          <h3>
            <DollarSign size={20} className="text-green icon-pulse" /> Federal Reserve Net Liquidity Barometer &amp; Money Supply
          </h3>
          <p className="text-muted">Net Central Bank Liquidity (Fed Balance Sheet - RRP - TGA) mapped against equity market trajectory.</p>
        </div>

        <div className="net-liq-badge">
          <span className="lbl">Net Dollar Liquidity Index:</span>
          <span className="val text-cyan">${latest.netLiquidityUsdTrillion} Trillion</span>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="liq-metrics-grid">
        <div className="l-card">
          <span className="card-lbl">Fed Total Assets (Balance Sheet)</span>
          <span className="card-val text-cyan">${latest.fedBalanceSheetUsdTrillion}T</span>
          <span className="card-sub">Quantitative Tightening (QT) Track</span>
        </div>

        <div className="l-card">
          <span className="card-lbl">Reverse Repo (RRP) Drain</span>
          <span className="card-val text-amber">${latest.reverseRepoUsdTrillion}T</span>
          <span className="card-sub">Money Market Fund Liquidity</span>
        </div>

        <div className="l-card">
          <span className="card-lbl">Treasury General Account (TGA)</span>
          <span className="card-val text-violet">${latest.treasuryGeneralAccountUsdTrillion}T</span>
          <span className="card-sub">U.S. Govt Cash Buffer</span>
        </div>

        <div className="l-card">
          <span className="card-lbl">Net Fed Liquidity Index</span>
          <span className="card-val text-green">${latest.netLiquidityUsdTrillion}T</span>
          <span className="card-sub">Equity Liquidity Impulse</span>
        </div>
      </div>

      {/* Main Grid: Net Liquidity vs S&P 500 Overlay Chart */}
      <div className="liq-chart-card glass-card">
        <div className="chart-header">
          <h4>
            <TrendingUp size={16} className="text-green" /> Fed Net Liquidity Index vs S&amp;P 500 Trajectory
          </h4>
          <span className="tag">6 Months Trend</span>
        </div>

        <div style={{ height: 350, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={metrics} margin={{ top: 15, right: 20, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" domain={['auto', 'auto']} stroke="#06D6A0" tick={{ fontSize: 11 }} tickFormatter={v => `$${v}T`} />
              <YAxis yAxisId="right" orientation="right" domain={['auto', 'auto']} stroke="#3B82F6" tick={{ fontSize: 11 }} tickFormatter={v => `$${v}`} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' }} />
              <Line yAxisId="left" type="monotone" dataKey="netLiquidityUsdTrillion" stroke="var(--accent-green)" strokeWidth={2.5} name="Net Fed Liquidity ($T)" />
              <Line yAxisId="right" type="monotone" dataKey="spyPrice" stroke="var(--accent-blue)" strokeWidth={2} strokeDasharray="3 3" name="S&P 500 / SPY Price" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default MacroLiquidityPane;
