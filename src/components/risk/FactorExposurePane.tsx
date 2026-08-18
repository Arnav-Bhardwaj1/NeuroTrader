import React, { useState } from 'react';
import {
  Sliders,
  BarChart2,
  Activity
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import {
  NeuroRiskEngine,
  type FactorExposure
} from '../../lib/NeuroRiskEngine';

export const FactorExposurePane: React.FC = () => {
  const [factors] = useState<FactorExposure[]>(() => NeuroRiskEngine.getFactorExposures());
  const [selectedFactor, setSelectedFactor] = useState<FactorExposure>(factors[0]);

  const getTiltBadge = (tilt: string) => {
    switch (tilt) {
      case 'OVERWEIGHT': return 'tilt-overweight';
      case 'UNDERWEIGHT': return 'tilt-underweight';
      default: return 'tilt-neutral';
    }
  };

  return (
    <div className="factor-pane-container">
      {/* Header Banner */}
      <div className="factor-header glass-card">
        <div className="title-box">
          <h3>
            <BarChart2 size={20} className="text-cyan icon-pulse" /> Portfolio Factor Exposure &amp; Style Tilt Matrix
          </h3>
          <p className="text-muted">Factor decomposition relative to SPY benchmark (Market Beta, Momentum, Growth, Quality, Size, Volatility).</p>
        </div>

        <div className="portfolio-beta-badge">
          <span className="lbl">Portfolio Beta to SPY:</span>
          <span className="val text-amber">1.18x</span>
        </div>
      </div>

      {/* Main Grid: Factor Loading Bar Chart & Factor Inspector */}
      <div className="factor-main-grid">
        {/* Left: Factor Loading Bar Chart */}
        <div className="chart-card glass-card">
          <div className="card-title-row">
            <h4>
              <Activity size={16} className="text-cyan" /> Multi-Factor Risk Loadings
            </h4>
            <span className="tag">Portfolio vs Benchmark (1.0)</span>
          </div>

          <div style={{ height: 340, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={factors} margin={{ top: 15, right: 15, bottom: 25, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="factor" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 2]} stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' }} />
                <ReferenceLine y={1.0} stroke="rgba(255,255,255,0.2)" strokeDasharray="3 3" label={{ value: 'Benchmark (1.0)', fill: '#64748b', fontSize: 10 }} />
                <Bar dataKey="portfolioLoading" fill="var(--accent-cyan)" name="Portfolio Factor Loading" onClick={(entry) => setSelectedFactor(entry as any)} />
                <Bar dataKey="benchmarkLoading" fill="#64748b" name="SPY Benchmark Loading" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Factor List & Inspector Pane */}
        <div className="factor-inspector-pane">
          <div className="inspector-card glass-card">
            <div className="card-header">
              <h4>Factor Details</h4>
              <span className={`tilt-badge ${getTiltBadge(selectedFactor.tilt)}`}>
                {selectedFactor.tilt}
              </span>
            </div>

            <div className="factor-title">
              <h3>{selectedFactor.factor}</h3>
              <p>{selectedFactor.description}</p>
            </div>

            <div className="loadings-row">
              <div className="l-box">
                <span className="lbl">Portfolio Loading</span>
                <span className="val text-cyan">{selectedFactor.portfolioLoading}x</span>
              </div>
              <div className="l-box">
                <span className="lbl">Benchmark Loading</span>
                <span className="val">{selectedFactor.benchmarkLoading}x</span>
              </div>
            </div>

            {/* Tilt Control Slider Simulation */}
            <div className="tilt-control-box">
              <label><Sliders size={14} /> Adjust Factor Tilt Exposure Target:</label>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.05"
                value={selectedFactor.portfolioLoading}
                readOnly
              />
              <span className="slider-hint">Simulate rebalancing to neutralize factor risks</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FactorExposurePane;
