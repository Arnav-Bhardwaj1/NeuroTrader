import React, { useState } from 'react';
import {
  Flame,
  TrendingUp,
  Zap
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
  NeuroAlphaEngine,
  type SocialSentimentVelocity
} from '../../lib/NeuroAlphaEngine';

export const SocialVelocityPane: React.FC = () => {
  const [socials] = useState<SocialSentimentVelocity[]>(() => NeuroAlphaEngine.getSocialVelocityData());

  return (
    <div className="social-pane-container">
      {/* Header Banner */}
      <div className="social-header glass-card">
        <div className="title-box">
          <h3>
            <Flame size={20} className="text-red icon-pulse" /> Retail Social Velocity &amp; Short Squeeze Accelerator
          </h3>
          <p className="text-muted">Track mention volume acceleration across Reddit, X, and StockTwits matched against short float metrics.</p>
        </div>

        <div className="top-squeeze-badge">
          <span className="lbl">Top Squeeze Candidate:</span>
          <span className="val text-amber">GME (Squeeze Score: 92/100)</span>
        </div>
      </div>

      {/* Main Grid: Velocity Chart & Leaderboard */}
      <div className="social-main-grid">
        {/* Left: Mention Velocity Acceleration Bar Chart */}
        <div className="chart-card glass-card">
          <div className="card-title-row">
            <h4>
              <TrendingUp size={16} className="text-cyan" /> 24h Social Mention Acceleration (%)
            </h4>
            <span className="tag">Volume Growth Rate</span>
          </div>

          <div style={{ height: 320, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={socials} margin={{ top: 15, right: 15, bottom: 25, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="symbol" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={v => `+${v}%`} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="velocityAccelerationPct" fill="var(--accent-red)" name="Mention Acceleration (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Short Squeeze Leaderboard */}
        <div className="leaderboard-card glass-card">
          <div className="card-title-row">
            <h4>
              <Zap size={16} className="text-amber" /> Short Squeeze Score Leaderboard
            </h4>
            <span className="tag">{socials.length} Tracked Tickers</span>
          </div>

          <div className="squeeze-list">
            {socials.map(soc => (
              <div key={soc.symbol} className="sq-row">
                <div className="sq-left">
                  <span className="sq-sym">{soc.symbol}</span>
                  <span className="sq-name">{soc.companyName}</span>
                </div>

                <div className="sq-mid">
                  <span className="lbl">Short Float: <strong>{soc.shortFloatPct}%</strong></span>
                  <span className="lbl">Days to Cover: <strong>{soc.daysToCover}d</strong></span>
                </div>

                <div className="sq-right">
                  <span className="sq-score text-amber">{soc.squeezeScore}/100</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialVelocityPane;
