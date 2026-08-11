import React, { useState } from 'react';
import {
  Zap,
  Layers,
  BarChart2
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
  NeuroCopilotEngine,
  type GexProfile,
  type DarkPoolFlow
} from '../../lib/NeuroCopilotEngine';

export const CrossAssetLiquidityPane: React.FC = () => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>('NVDA');
  const [gexProfile] = useState<GexProfile>(() => NeuroCopilotEngine.getGexProfile(selectedSymbol));
  const [darkPoolFlows] = useState<DarkPoolFlow[]>(() => NeuroCopilotEngine.getDarkPoolFlows());

  return (
    <div className="liquidity-pane-container">
      {/* Top Header Banner */}
      <div className="liquidity-header glass-card">
        <div className="title-box">
          <h3>
            <Zap size={20} className="text-amber icon-pulse" /> Options Gamma (GEX) & Dark Pool Liquidity Radar
          </h3>
          <p className="text-muted">Real-time dealer delta positioning, call/put wall pins, and dark pool volume imbalances.</p>
        </div>

        <div className="symbol-selector">
          <label>Selected Asset:</label>
          <select value={selectedSymbol} onChange={e => setSelectedSymbol(e.target.value)}>
            <option value="NVDA">NVDA (NVIDIA)</option>
            <option value="AAPL">AAPL (Apple)</option>
            <option value="BTC/USD">BTC/USD (Bitcoin)</option>
          </select>
        </div>
      </div>

      {/* GEX Metrics Cards */}
      <div className="gex-metrics-grid">
        <div className="gex-card">
          <span className="card-label">Current Spot Price</span>
          <span className="card-val text-cyan">${gexProfile.currentPrice.toLocaleString()}</span>
          <span className="card-sub">Underlying Market Spot</span>
        </div>

        <div className="gex-card">
          <span className="card-label">Call Wall Ceiling</span>
          <span className="card-val text-green">${gexProfile.callWallStrike.toLocaleString()}</span>
          <span className="card-sub">Heavy Call Resistance Pin</span>
        </div>

        <div className="gex-card">
          <span className="card-label">Put Wall Floor</span>
          <span className="card-val text-red">${gexProfile.putWallStrike.toLocaleString()}</span>
          <span className="card-sub">Dealer Gamma Cushion</span>
        </div>

        <div className="gex-card">
          <span className="card-label">Zero Gamma Flip Level</span>
          <span className="card-val text-amber">${gexProfile.zeroGammaFlip.toLocaleString()}</span>
          <span className="card-sub">Regime: <strong>{gexProfile.regime}</strong></span>
        </div>
      </div>

      {/* Main Grid: GEX Strike Chart & Dark Pool Flow Feed */}
      <div className="liquidity-main-grid">
        {/* Left: Net GEX by Strike Chart */}
        <div className="gex-chart-card glass-card">
          <div className="card-header">
            <h4>
              <BarChart2 size={16} className="text-cyan" /> Strike Level Gamma Exposure ($ Millions Net GEX)
            </h4>
            <span className="tag">Net Gamma Delta</span>
          </div>

          <div style={{ height: 340, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gexProfile.strikeDistribution} margin={{ top: 15, right: 15, bottom: 25, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="strike" stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={s => `$${s}`} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' }} />
                <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" />
                <Bar dataKey="callGex" fill="rgba(6, 214, 160, 0.7)" name="Call GEX (Sticky Upward)" />
                <Bar dataKey="putGex" fill="rgba(255, 59, 92, 0.7)" name="Put GEX (Vol Acceleration)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Dark Pool Institutional Delta List */}
        <div className="dark-pool-card glass-card">
          <div className="card-header">
            <h4>
              <Layers size={16} className="text-violet" /> Dark Pool Institutional Delta Feed
            </h4>
            <span className="tag">Volume Imbalance</span>
          </div>

          <div className="dark-pool-list">
            {darkPoolFlows.map(flow => (
              <div key={flow.symbol} className="dp-item">
                <div className="dp-item-left">
                  <span className="dp-symbol">{flow.symbol}</span>
                  <span className="dp-sector">{flow.sector}</span>
                </div>

                <div className="dp-item-center">
                  <div className="dp-ratio-bar">
                    <div
                      className="dp-ratio-fill"
                      style={{
                        width: `${flow.darkPoolBuyRatio}%`,
                        backgroundColor: flow.darkPoolBuyRatio > 55 ? 'var(--accent-green)' : flow.darkPoolBuyRatio < 45 ? 'var(--accent-red)' : 'var(--accent-amber)'
                      }}
                    />
                  </div>
                  <span className="dp-ratio-val">{flow.darkPoolBuyRatio}% Buy Delta</span>
                </div>

                <div className="dp-item-right">
                  <span className={`dp-usd ${flow.institutionalDeltaUsd >= 0 ? 'text-green' : 'text-red'}`}>
                    {flow.institutionalDeltaUsd >= 0 ? '+' : ''}${flow.institutionalDeltaUsd}M
                  </span>
                  {flow.unusualOptionsVolume && (
                    <span className="unusual-tag">⚡ Unusual Vol</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrossAssetLiquidityPane;
