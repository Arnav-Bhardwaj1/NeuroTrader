import React, { useState } from 'react';
import {
  Activity,
  Sliders,
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
  NeuroExecutionEngine,
  type MarketImpactData
} from '../../lib/NeuroExecutionEngine';

export const MarketImpactPane: React.FC = () => {
  const [tradeShares, setTradeShares] = useState<number>(50000);
  const data: MarketImpactData = NeuroExecutionEngine.getMarketImpactData(tradeShares);

  return (
    <div className="impact-pane-container">
      {/* Header Banner */}
      <div className="impact-header glass-card">
        <div className="title-box">
          <h3>
            <Activity size={20} className="text-red icon-pulse" /> Almgren-Chriss Market Impact &amp; Slippage Model
          </h3>
          <p className="text-muted">Calculate non-linear temporary and permanent price impact for institutional order sizes.</p>
        </div>

        <div className="total-impact-badge">
          <span className="lbl">Estimated Total Market Impact:</span>
          <span className="val text-red">${data.totalImpactUsd.toLocaleString()} ({(data.temporaryImpactBps + data.permanentImpactBps).toFixed(1)} BPS)</span>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="impact-metrics-grid">
        <div className="m-card">
          <span className="card-lbl">Temporary Price Impact</span>
          <span className="card-val text-amber">{data.temporaryImpactBps} BPS</span>
          <span className="card-sub">Order Book Liquidity Drain</span>
        </div>

        <div className="m-card">
          <span className="card-lbl">Permanent Price Impact</span>
          <span className="card-val text-red">{data.permanentImpactBps} BPS</span>
          <span className="card-sub">Information Leakage Cost</span>
        </div>

        <div className="m-card">
          <span className="card-lbl">Order Size Tested</span>
          <span className="card-val text-cyan">{tradeShares.toLocaleString()} Shares</span>
          <span className="card-sub">NVDA Block Trade</span>
        </div>

        <div className="m-card">
          <span className="card-lbl">Estimated Slippage Cost</span>
          <span className="card-val text-violet">${data.totalImpactUsd.toLocaleString()}</span>
          <span className="card-sub">Almgren-Chriss Estimate</span>
        </div>
      </div>

      {/* Main Grid: Almgren-Chriss Curve & Trade Sensitivity Slider */}
      <div className="impact-main-grid">
        {/* Left: Almgren-Chriss Impact Curve Chart */}
        <div className="chart-card glass-card">
          <div className="card-title-row">
            <h4>
              <TrendingUp size={16} className="text-cyan" /> Almgren-Chriss Price Impact Curve (BPS vs Shares)
            </h4>
            <span className="tag">Theoretical Curve</span>
          </div>

          <div style={{ height: 280, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data.almgrenChrissCurve} margin={{ top: 15, right: 15, bottom: 25, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="shares" stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={v => `${v} bps`} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="impactBps" stroke="var(--accent-red)" strokeWidth={2.5} name="Total Impact (BPS)" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Trade Size Sensitivity Control Slider */}
        <div className="sensitivity-card glass-card">
          <div className="card-title-row">
            <h4>
              <Sliders size={16} className="text-amber" /> Order Size Sensitivity Sandbox
            </h4>
            <span className="tag">Interactive Slider</span>
          </div>

          <div className="slider-control-group">
            <label>Adjust Trade Size: <strong>{tradeShares.toLocaleString()} Shares</strong></label>
            <input
              type="range"
              min="5000"
              max="100000"
              step="5000"
              value={tradeShares}
              onChange={e => setTradeShares(Number(e.target.value))}
            />
            <div className="slider-labels">
              <span>5k Shares</span>
              <span>50k Shares</span>
              <span>100k Shares</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketImpactPane;
