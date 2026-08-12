import React, { useState } from 'react';
import {
  Layers,
  TrendingUp,
  PieChart
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
  NeuroBacktestEngine,
  type BasketResult
} from '../../lib/NeuroBacktestEngine';

export const MultiAssetBasketPane: React.FC = () => {
  const [basketResult] = useState<BasketResult>(() => NeuroBacktestEngine.runBasketBacktest());
  const [rebalanceFreq, setRebalanceFreq] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('MONTHLY');

  return (
    <div className="basket-pane-container">
      {/* Header Banner */}
      <div className="basket-header glass-card">
        <div className="title-box">
          <h3>
            <Layers size={20} className="text-cyan icon-pulse" /> Multi-Asset Basket Backtester & Benchmark Comparison
          </h3>
          <p className="text-muted">Simulate portfolio strategies across multi-asset allocation baskets with automated rebalancing logic.</p>
        </div>

        <div className="rebalance-controls">
          <label>Rebalance Schedule:</label>
          <select value={rebalanceFreq} onChange={e => setRebalanceFreq(e.target.value as any)}>
            <option value="DAILY">Daily Dynamic Shift</option>
            <option value="WEEKLY">Weekly Reset</option>
            <option value="MONTHLY">Monthly Rebalance</option>
          </select>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="basket-metrics-grid">
        <div className="b-card">
          <span className="lbl">Combined Basket Return</span>
          <span className="val text-green">+{basketResult.basketReturnPercent}%</span>
          <span className="sub">P&amp;L: +${(basketResult.totalFinalValue - basketResult.totalInitialCapital).toLocaleString()}</span>
        </div>

        <div className="b-card">
          <span className="lbl">SPY Benchmark Return</span>
          <span className="val text-cyan">+{basketResult.benchmarkReturnPercent}%</span>
          <span className="sub">Alpha Outperformance: <strong>+{(basketResult.basketReturnPercent - basketResult.benchmarkReturnPercent).toFixed(2)}%</strong></span>
        </div>

        <div className="b-card">
          <span className="lbl">Basket Sharpe Ratio</span>
          <span className="val text-violet">{basketResult.sharpeRatio}</span>
          <span className="sub">Risk-Adjusted Efficiency</span>
        </div>

        <div className="b-card">
          <span className="lbl">Basket Max Drawdown</span>
          <span className="val text-amber">{basketResult.maxDrawdown}%</span>
          <span className="sub">Diversified Risk Ceiling</span>
        </div>
      </div>

      {/* Main Grid: Basket Equity Chart & Asset Breakdown Table */}
      <div className="basket-main-grid">
        {/* Left: Basket Equity Curve vs Benchmark */}
        <div className="basket-chart-card glass-card">
          <div className="chart-header">
            <h4>
              <TrendingUp size={16} className="text-green" /> Portfolio Basket Equity vs SPY Benchmark
            </h4>
            <span className="tag">Rebalance: {rebalanceFreq}</span>
          </div>

          <div style={{ height: 320, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={basketResult.combinedEquityCurve} margin={{ top: 15, right: 15, bottom: 5, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis domain={['auto', 'auto']} stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="portfolioValue" stroke="var(--accent-green)" strokeWidth={2.5} dot={false} name="Combined Basket Equity" />
                <Line type="monotone" dataKey="benchmarkValue" stroke="var(--accent-blue)" strokeWidth={2} strokeDasharray="3 3" dot={false} name="SPY Benchmark" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Asset Allocation & Contribution Breakdown Table */}
        <div className="asset-table-card glass-card">
          <div className="table-header">
            <h4>
              <PieChart size={16} className="text-cyan" /> Basket Asset Weight Allocation
            </h4>
            <span className="tag">4 Assets</span>
          </div>

          <div className="assets-list">
            {basketResult.assets.map(asset => (
              <div key={asset.symbol} className="asset-row">
                <div className="asset-info">
                  <span className="a-symbol">{asset.symbol}</span>
                  <span className="a-name">{asset.name}</span>
                </div>

                <div className="asset-weight">
                  <div className="w-bar">
                    <div className="w-fill" style={{ width: `${asset.weightPercent * 2}%` }} />
                  </div>
                  <span className="w-val">{asset.weightPercent}% Weight</span>
                </div>

                <div className="asset-pnl">
                  <span className={`a-ret ${asset.returnPercent >= 0 ? 'text-green' : 'text-red'}`}>
                    {asset.returnPercent >= 0 ? '+' : ''}{asset.returnPercent}%
                  </span>
                  <span className="a-contrib">+${asset.contributionPnl.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiAssetBasketPane;
