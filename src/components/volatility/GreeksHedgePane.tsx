import React, { useState } from 'react';
import {
  ShieldCheck,
  Sliders,
  Zap
} from 'lucide-react';
import {
  NeuroVolEngine,
  type PortfolioGreeks
} from '../../lib/NeuroVolEngine';

export const GreeksHedgePane: React.FC = () => {
  const [spotPrice, setSpotPrice] = useState<number>(123.0);
  const greeks: PortfolioGreeks = NeuroVolEngine.getPortfolioGreeks(spotPrice);

  return (
    <div className="greeks-pane-container">
      {/* Header Banner */}
      <div className="greeks-header glass-card">
        <div className="title-box">
          <h3>
            <ShieldCheck size={20} className="text-green icon-pulse" /> Dynamic Delta-Neutral &amp; Gamma/Vega Hedging Simulator
          </h3>
          <p className="text-muted">Real-time option portfolio Greeks (Δ, Γ, Θ, ν, ρ) and automated delta rebalancing calculator.</p>
        </div>

        <div className="delta-status-badge">
          <span className="lbl">Net Portfolio Delta:</span>
          <span className="val text-amber">+{greeks.netDeltaShares} Δ Shares</span>
        </div>
      </div>

      {/* Greeks Cards Grid */}
      <div className="greeks-metrics-grid">
        <div className="g-card">
          <span className="card-lbl">Net Delta (Δ)</span>
          <span className="card-val text-amber">+{greeks.netDeltaShares} Shs</span>
          <span className="card-sub">Directional Exposure</span>
        </div>

        <div className="g-card">
          <span className="card-lbl">Net Gamma (Γ)</span>
          <span className="card-val text-cyan">+{greeks.netGamma}</span>
          <span className="card-sub">Delta Curvature Sensitivity</span>
        </div>

        <div className="g-card">
          <span className="card-lbl">Net Theta (Θ / Day)</span>
          <span className="card-val text-red">-${Math.abs(greeks.netThetaPerDayUsd).toFixed(2)}/day</span>
          <span className="card-sub">Daily Time Decay Loss</span>
        </div>

        <div className="g-card">
          <span className="card-lbl">Net Vega (ν / Vol Pt)</span>
          <span className="card-val text-green">+${greeks.netVegaPerPointUsd.toFixed(2)}</span>
          <span className="card-sub">Volatility Expansion Edge</span>
        </div>
      </div>

      {/* Main Grid: Rebalance Action Box & Spot Price Slider */}
      <div className="greeks-main-grid">
        {/* Left: Recommended Delta Neutral Rebalance Action */}
        <div className="action-card glass-card">
          <div className="card-title-row">
            <h4>
              <Zap size={16} className="text-amber" /> Delta-Neutral Rebalance Trigger
            </h4>
            <span className="tag">Target: Δ = 0</span>
          </div>

          <div className="action-body">
            <p className="action-desc">{greeks.recommendedHedgeAction}</p>
            <button className="rebalance-btn">
              Execute Delta Neutral Hedge Order
            </button>
          </div>
        </div>

        {/* Right: Underlying Spot Price Shock Sandbox */}
        <div className="slider-card glass-card">
          <div className="card-title-row">
            <h4>
              <Sliders size={16} className="text-cyan" /> Underlying Spot Price Shock Simulator
            </h4>
            <span className="tag">Interactive Slider</span>
          </div>

          <div className="slider-group">
            <label>NVDA Spot Price: <strong>${spotPrice.toFixed(2)}</strong></label>
            <input
              type="range"
              min="100"
              max="150"
              step="1"
              value={spotPrice}
              onChange={e => setSpotPrice(Number(e.target.value))}
            />
            <div className="slider-labels">
              <span>$100 (-18%)</span>
              <span>$123 (ATM)</span>
              <span>$150 (+22%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GreeksHedgePane;
