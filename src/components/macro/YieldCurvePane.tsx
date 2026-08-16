import React, { useState } from 'react';
import {
  TrendingDown,
  Activity,
  LineChart as LineChartIcon
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
  NeuroMacroEngine,
  type YieldCurveAnalysis
} from '../../lib/NeuroMacroEngine';

export const YieldCurvePane: React.FC = () => {
  const [data] = useState<YieldCurveAnalysis>(() => NeuroMacroEngine.getYieldCurveData());

  return (
    <div className="yield-pane-container">
      {/* Top Header Banner */}
      <div className="yield-header glass-card">
        <div className="title-box">
          <h3>
            <LineChartIcon size={20} className="text-cyan icon-pulse" /> U.S. Treasury Yield Curve &amp; Inversion Radar
          </h3>
          <p className="text-muted">Real-time yield curve structure across maturities, 10Y-2Y spread tracking, and Probit recession model.</p>
        </div>

        <div className="regime-status">
          <span className="lbl">Macro Economic Regime:</span>
          <span className={`regime-badge ${data.isInverted ? 'inverted' : 'normal'}`}>
            {data.regime} {data.isInverted && '(Curve Inverted)'}
          </span>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="yield-metrics-grid">
        <div className="y-card">
          <span className="card-lbl">10Y - 2Y Yield Spread</span>
          <span className={`card-val ${data.spread10y2y < 0 ? 'text-red' : 'text-green'}`}>
            {data.spread10y2y > 0 ? '+' : ''}{data.spread10y2y}%
          </span>
          <span className="card-sub">{data.spread10y2y < 0 ? '⚠️ Inverted (Recession Warning)' : 'Normal Positive Slope'}</span>
        </div>

        <div className="y-card">
          <span className="card-lbl">10Y - 3M Yield Spread</span>
          <span className={`card-val ${data.spread10y3m < 0 ? 'text-red' : 'text-green'}`}>
            {data.spread10y3m > 0 ? '+' : ''}{data.spread10y3m}%
          </span>
          <span className="card-sub">Fed Benchmark Indicator</span>
        </div>

        <div className="y-card">
          <span className="card-lbl">12M Recession Probability</span>
          <span className={`card-val ${data.recessionProbPercent > 40 ? 'text-amber' : 'text-cyan'}`}>
            {data.recessionProbPercent}%
          </span>
          <span className="card-sub">Probit Econometric Model</span>
        </div>

        <div className="y-card">
          <span className="card-lbl">Effective Fed Funds Rate</span>
          <span className="card-val text-violet">{data.fedFundsRate}%</span>
          <span className="card-sub">FOMC Target Band</span>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="yield-charts-grid">
        {/* Left: Treasury Yield Curve Comparison */}
        <div className="chart-card glass-card">
          <div className="card-title-row">
            <h4>
              <Activity size={16} className="text-cyan" /> U.S. Sovereign Yield Curve Term Structure
            </h4>
            <span className="tag">Current vs 1 Yr Ago</span>
          </div>

          <div style={{ height: 330, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data.currentCurve} margin={{ top: 15, right: 15, bottom: 5, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="maturity" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis domain={['auto', 'auto']} stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="currentYield" stroke="var(--accent-cyan)" strokeWidth={2.5} name="Current Yield (%)" />
                <Line type="monotone" dataKey="prevYearYield" stroke="var(--accent-violet)" strokeWidth={2} strokeDasharray="4 4" name="1 Year Ago Yield (%)" />
                <Line type="monotone" dataKey="historicalAvg" stroke="#64748b" strokeWidth={1.5} strokeDasharray="2 2" name="10-Yr Historical Avg" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: 10Y-2Y Historical Spread Timeline */}
        <div className="chart-card glass-card">
          <div className="card-title-row">
            <h4>
              <TrendingDown size={16} className="text-amber" /> 10Y-2Y Spread Trend Line &amp; Inversion Depth
            </h4>
            <span className="tag">6 Months History</span>
          </div>

          <div style={{ height: 330, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data.historicalSpreads} margin={{ top: 15, right: 15, bottom: 5, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' }} />
                <ReferenceLine y={0} stroke="red" strokeDasharray="3 3" label={{ value: 'Inversion Baseline (0%)', fill: 'red', fontSize: 10 }} />
                <Line type="monotone" dataKey="spread10y2y" stroke="var(--accent-amber)" strokeWidth={2.5} name="10Y-2Y Spread (%)" />
                <Line type="monotone" dataKey="spread10y3m" stroke="var(--accent-red)" strokeWidth={2} strokeDasharray="3 3" name="10Y-3M Spread (%)" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YieldCurvePane;
