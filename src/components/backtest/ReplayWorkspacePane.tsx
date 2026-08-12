import React, { useState, useMemo, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Activity,
  TrendingUp,
  History
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area
} from 'recharts';
import {
  NeuroBacktestEngine,
  type StrategyConfig,
  type ReplayCandle,
  type TradeRecord
} from '../../lib/NeuroBacktestEngine';

export const ReplayWorkspacePane: React.FC = () => {
  const [symbol, setSymbol] = useState<string>('NVDA');
  const [shortMa, setShortMa] = useState<number>(15);
  const [longMa, setLongMa] = useState<number>(50);
  const [slippage] = useState<number>(0.05);
  const [stopLoss, setStopLoss] = useState<number>(2.5);
  const [takeProfit] = useState<number>(6.0);

  const [currentStep, setCurrentStep] = useState<number>(15);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1); // 1x, 2x, 5x

  const config: StrategyConfig = useMemo(() => ({
    name: 'Dynamic Replay Strategy',
    symbol,
    shortMa,
    longMa,
    rsiPeriod: 14,
    rsiBuyThreshold: 30,
    rsiSellThreshold: 70,
    stopLossPct: stopLoss,
    takeProfitPct: takeProfit,
    slippagePct: slippage,
    commissionUsd: 1.5,
    initialCapital: 100000,
  }), [symbol, shortMa, longMa, stopLoss, takeProfit, slippage]);

  const { candles, trades } = useMemo(() => {
    return NeuroBacktestEngine.generateReplaySeries(config);
  }, [config]);

  // Handle Playback interval
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= candles.length) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000 / speed);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, speed, candles.length]);

  const visibleCandles: ReplayCandle[] = useMemo(() => {
    return candles.slice(0, currentStep);
  }, [candles, currentStep]);

  const latestCandle = visibleCandles[visibleCandles.length - 1] || candles[0];

  const visibleTrades: TradeRecord[] = useMemo(() => {
    return trades.filter(t => t.exitIndex <= currentStep);
  }, [trades, currentStep]);

  const totalReturnPct = Number((((latestCandle.equity - 100000) / 100000) * 100).toFixed(2));
  const winsCount = visibleTrades.filter(t => t.pnl > 0).length;
  const winRate = visibleTrades.length > 0 ? Number(((winsCount / visibleTrades.length) * 100).toFixed(1)) : 0;

  return (
    <div className="replay-workspace-container">
      {/* Top Configuration & Control Bar */}
      <div className="replay-control-bar glass-card">
        <div className="config-inputs">
          <div className="input-group">
            <label>Asset Symbol:</label>
            <select value={symbol} onChange={e => { setSymbol(e.target.value); setCurrentStep(15); }}>
              <option value="NVDA">NVDA (NVIDIA)</option>
              <option value="AAPL">AAPL (Apple)</option>
              <option value="BTC/USD">BTC/USD (Bitcoin)</option>
            </select>
          </div>

          <div className="input-group">
            <label>Short MA ({shortMa}):</label>
            <input
              type="range"
              min="5"
              max="30"
              value={shortMa}
              onChange={e => setShortMa(Number(e.target.value))}
            />
          </div>

          <div className="input-group">
            <label>Long MA ({longMa}):</label>
            <input
              type="range"
              min="35"
              max="90"
              value={longMa}
              onChange={e => setLongMa(Number(e.target.value))}
            />
          </div>

          <div className="input-group">
            <label>Stop Loss (%):</label>
            <input
              type="number"
              step="0.5"
              value={stopLoss}
              onChange={e => setStopLoss(Number(e.target.value))}
              style={{ width: 70 }}
            />
          </div>
        </div>

        {/* Playback Controls */}
        <div className="playback-controls">
          <button className="ctrl-btn" onClick={() => setIsPlaying(!isPlaying)} title={isPlaying ? 'Pause' : 'Play Replay'}>
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <button className="ctrl-btn" onClick={() => setCurrentStep(prev => Math.min(candles.length, prev + 1))} title="Step Forward">
            <SkipForward size={18} />
          </button>
          <button className="ctrl-btn" onClick={() => { setIsPlaying(false); setCurrentStep(15); }} title="Reset Replay">
            <RotateCcw size={18} />
          </button>

          <div className="speed-toggle">
            {[1, 2, 5].map(s => (
              <button
                key={s}
                className={`speed-btn ${speed === s ? 'active' : ''}`}
                onClick={() => setSpeed(s)}
              >
                {s}x
              </button>
            ))}
          </div>

          <span className="step-counter">
            Step: <strong>{currentStep}</strong> / {candles.length}
          </span>
        </div>
      </div>

      {/* Metrics Header */}
      <div className="replay-metrics-row">
        <div className="metric-box">
          <span className="lbl">Simulated Portfolio Equity</span>
          <span className="val text-cyan">${latestCandle.equity.toLocaleString()}</span>
          <span className="sub">Initial: $100,000</span>
        </div>

        <div className="metric-box">
          <span className="lbl">Strategy Return</span>
          <span className={`val ${totalReturnPct >= 0 ? 'text-green' : 'text-red'}`}>
            {totalReturnPct >= 0 ? '+' : ''}{totalReturnPct}%
          </span>
          <span className="sub">P&L Net of Frictions</span>
        </div>

        <div className="metric-box">
          <span className="lbl">Completed Trades</span>
          <span className="val">{visibleTrades.length}</span>
          <span className="sub">Win Rate: <strong>{winRate}%</strong></span>
        </div>

        <div className="metric-box">
          <span className="lbl">Latest Market Price</span>
          <span className="val text-amber">${latestCandle.close.toFixed(2)}</span>
          <span className="sub">Bar: {latestCandle.time}</span>
        </div>
      </div>

      {/* Synchronized Replay Charts Grid */}
      <div className="replay-charts-grid">
        {/* Main Price & Execution Marker Chart */}
        <div className="chart-box glass-card">
          <div className="chart-title">
            <h4>
              <Activity size={16} className="text-cyan" /> Price Action & Signal Execution Markers
            </h4>
            <span className="badge-tag">Tick Replay Stream</span>
          </div>

          <div style={{ height: 320, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={visibleCandles} margin={{ top: 15, right: 15, bottom: 5, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis domain={['auto', 'auto']} stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={v => `$${v}`} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="close" stroke="var(--accent-cyan)" strokeWidth={2} dot={false} name="Spot Price" />
                <Line type="monotone" dataKey="maShort" stroke="var(--accent-green)" strokeWidth={1.5} dot={false} name={`SMA ${shortMa}`} />
                <Line type="monotone" dataKey="maLong" stroke="var(--accent-violet)" strokeWidth={1.5} dot={false} name={`SMA ${longMa}`} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Equity Growth Odometer Chart */}
        <div className="chart-box glass-card">
          <div className="chart-title">
            <h4>
              <TrendingUp size={16} className="text-green" /> Dynamic Portfolio Equity Curve
            </h4>
            <span className="badge-tag">Live Capital Growth</span>
          </div>

          <div style={{ height: 320, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={visibleCandles} margin={{ top: 15, right: 15, bottom: 5, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis domain={['auto', 'auto']} stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="equity" stroke="var(--accent-green)" fill="rgba(0, 255, 136, 0.15)" strokeWidth={2} name="Portfolio Equity ($)" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Trade Fill History Table */}
      <div className="trades-table-card glass-card">
        <div className="table-title">
          <h4>
            <History size={16} className="text-violet" /> Executed Replay Orders Log
          </h4>
          <span className="badge-tag">{visibleTrades.length} Trades Filled</span>
        </div>

        <div className="table-wrapper">
          {visibleTrades.length > 0 ? (
            <table className="trades-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Entry Bar</th>
                  <th>Exit Bar</th>
                  <th>Entry Price</th>
                  <th>Exit Price</th>
                  <th>Shares</th>
                  <th>Net P&amp;L ($)</th>
                  <th>Return (%)</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {visibleTrades.map(trd => (
                  <tr key={trd.id}>
                    <td><code>{trd.id}</code></td>
                    <td>{trd.entryTime}</td>
                    <td>{trd.exitTime}</td>
                    <td>${trd.entryPrice}</td>
                    <td>${trd.exitPrice}</td>
                    <td>{trd.shares}</td>
                    <td className={trd.pnl >= 0 ? 'text-green' : 'text-red'}>
                      {trd.pnl >= 0 ? '+' : ''}${trd.pnl.toLocaleString()}
                    </td>
                    <td className={trd.pnlPercent >= 0 ? 'text-green' : 'text-red'}>
                      {trd.pnlPercent >= 0 ? '+' : ''}{trd.pnlPercent}%
                    </td>
                    <td>
                      <span className={`reason-pill ${trd.reason.toLowerCase()}`}>
                        {trd.reason.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-trades-placeholder">
              Play or step forward the replay stream to observe algorithmic signal executions.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReplayWorkspacePane;
