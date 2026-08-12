import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import {
  NeuroBacktestEngine,
  type WalkForwardAnalysis
} from '../../lib/NeuroBacktestEngine';

export const WalkForwardOverfitPane: React.FC = () => {
  const [symbol, setSymbol] = useState<string>('NVDA');
  const analysis: WalkForwardAnalysis = useMemo(() => {
    return NeuroBacktestEngine.runWalkForwardDiagnostic(symbol);
  }, [symbol]);

  // Combine In-Sample and Out-of-Sample equity curves for chart rendering
  const combinedEquityData = useMemo(() => {
    const isData = analysis.inSampleEquity.map(d => ({
      time: d.time,
      inSampleValue: d.value,
      outOfSampleValue: undefined as number | undefined,
    }));

    const oosData = analysis.outOfSampleEquity.map(d => ({
      time: d.time,
      inSampleValue: undefined as number | undefined,
      outOfSampleValue: d.value,
    }));

    return [...isData, ...oosData];
  }, [analysis]);

  return (
    <div className="walkforward-pane-container">
      {/* Header Banner */}
      <div className="wf-header glass-card">
        <div className="title-box">
          <h3>
            <ShieldAlert size={20} className="text-violet icon-pulse" /> Walk-Forward Diagnostics & Overfitting Risk Engine
          </h3>
          <p className="text-muted">Validate strategy stability against out-of-sample unseen data and measure Probability of Backtest Overfitting (PBO).</p>
        </div>

        <div className="symbol-selector">
          <label>Symbol:</label>
          <select value={symbol} onChange={e => setSymbol(e.target.value)}>
            <option value="NVDA">NVDA</option>
            <option value="AAPL">AAPL</option>
            <option value="BTC/USD">BTC/USD</option>
          </select>
        </div>
      </div>

      {/* Metric Cards Banner */}
      <div className="wf-metrics-grid">
        <div className="wf-card">
          <span className="card-lbl">Robustness Grade</span>
          <span className="card-val text-green">{analysis.robustnessGrade}</span>
          <span className="card-sub">Cross-Validated Out-of-Sample</span>
        </div>

        <div className="wf-card">
          <span className="card-lbl">Performance Degradation Ratio</span>
          <span className="card-val text-cyan">{analysis.degradationIndex}x</span>
          <span className="card-sub">OOS Return / IS Return</span>
        </div>

        <div className="wf-card">
          <span className="card-lbl">PBO Overfitting Probability</span>
          <span className="card-val text-amber">{analysis.pboScore}%</span>
          <span className="card-sub">Low Risk of Overfitting (&lt;25%)</span>
        </div>

        <div className="wf-card">
          <span className="card-lbl">In-Sample vs Out-of-Sample</span>
          <span className="card-val text-violet">+{analysis.inSampleReturnPct}% / +{analysis.outOfSampleReturnPct}%</span>
          <span className="card-sub">IS: 70% | OOS: 30%</span>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="wf-charts-grid">
        {/* Left: In-Sample vs Out-of-Sample Equity Curve Chart */}
        <div className="wf-chart-card glass-card">
          <div className="chart-header">
            <h4>
              <TrendingUp size={16} className="text-cyan" /> In-Sample vs Out-of-Sample Equity Curves
            </h4>
            <span className="tag">Walk-Forward Window</span>
          </div>

          <div style={{ height: 320, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={combinedEquityData} margin={{ top: 15, right: 15, bottom: 5, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis domain={['auto', 'auto']} stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="inSampleValue" stroke="var(--accent-cyan)" strokeWidth={2.5} dot={false} name="In-Sample Training (70%)" />
                <Line type="monotone" dataKey="outOfSampleValue" stroke="var(--accent-violet)" strokeWidth={2.5} strokeDasharray="4 4" dot={false} name="Out-of-Sample Test (30%)" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Monte Carlo Permutation Overfitting Distribution */}
        <div className="wf-chart-card glass-card">
          <div className="chart-header">
            <h4>
              <BarChart3 size={16} className="text-amber" /> Monte Carlo Trade Sequence Permutations (PBO)
            </h4>
            <span className="tag">500 Random Samples</span>
          </div>

          <div style={{ height: 320, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analysis.permutationDistribution} margin={{ top: 15, right: 15, bottom: 25, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="range" stroke="#64748b" tick={{ fontSize: 9 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="count" fill="var(--accent-violet)" name="Permutations Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalkForwardOverfitPane;
