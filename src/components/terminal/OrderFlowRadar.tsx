import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  Zap,
  Activity,
  Layers,
  BarChart2,
  RefreshCw,
  Play
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { ClientOrderFlowEngine } from '../../lib/orderFlowEngine';
import type {
  DarkPoolPrint,
  OptionGammaProfile,
  Level2Book,
  ExecutionSimResult,
  MonteCarloRiskAnalysis,
  OrderExecutionType
} from '../../types/orderFlow';
import './OrderFlowRadar.css';

const MOCK_SYMBOLS = [
  { symbol: 'NVDA', name: 'NVIDIA Corporation' },
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'BTC/USD', name: 'Bitcoin / USD' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corp.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF' },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust' }
];

export const OrderFlowRadar: React.FC = () => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>('NVDA');
  const [activeSubTab, setActiveSubTab] = useState<'tape' | 'gex' | 'execution' | 'risk'>('tape');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Filter state for Dark Pool Tape
  const [tapeFilterSide, setTapeFilterSide] = useState<string>('ALL');
  const [anomalyOnly, setAnomalyOnly] = useState<boolean>(false);

  // Execution Simulator Form State
  const [algoType, setAlgoType] = useState<OrderExecutionType>('VWAP');
  const [orderShares, setOrderShares] = useState<number>(25000);
  const [durationMins, setDurationMins] = useState<number>(15);
  const [urgency, setUrgency] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [execSimResult, setExecSimResult] = useState<ExecutionSimResult | null>(null);

  // Monte Carlo Stress Slider States
  const [portfolioSize, setPortfolioSize] = useState<number>(500000);
  const [ivShift, setIvShift] = useState<number>(0); // -50% to +100%
  const [spotShift, setSpotShift] = useState<number>(0); // -30% to +30%

  // Live Simulated Datasets
  const [printsData, setPrintsData] = useState<DarkPoolPrint[]>(() =>
    ClientOrderFlowEngine.generateDarkPoolPrints('NVDA', 25)
  );

  const [gammaProfile, setGammaProfile] = useState<OptionGammaProfile>(() =>
    ClientOrderFlowEngine.generateOptionGammaProfile('NVDA')
  );

  const [l2Book, setL2Book] = useState<Level2Book>(() =>
    ClientOrderFlowEngine.generateLevel2Book('NVDA')
  );

  const mcRiskAnalysis: MonteCarloRiskAnalysis = useMemo(() => {
    return ClientOrderFlowEngine.generateMonteCarloRisk(selectedSymbol, portfolioSize, ivShift, spotShift);
  }, [selectedSymbol, portfolioSize, ivShift, spotShift]);

  // Refresh datasets when ticker changes
  const handleSymbolChange = (newSymbol: string) => {
    setSelectedSymbol(newSymbol);
    setIsRefreshing(true);
    setTimeout(() => {
      setPrintsData(ClientOrderFlowEngine.generateDarkPoolPrints(newSymbol, 25));
      setGammaProfile(ClientOrderFlowEngine.generateOptionGammaProfile(newSymbol));
      setL2Book(ClientOrderFlowEngine.generateLevel2Book(newSymbol));
      setExecSimResult(null);
      setIsRefreshing(false);
    }, 300);
  };

  const handleManualRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setPrintsData(ClientOrderFlowEngine.generateDarkPoolPrints(selectedSymbol, 25));
      setGammaProfile(ClientOrderFlowEngine.generateOptionGammaProfile(selectedSymbol));
      setL2Book(ClientOrderFlowEngine.generateLevel2Book(selectedSymbol));
      setIsRefreshing(false);
    }, 350);
  }, [selectedSymbol]);

  // Run Order Execution Simulation
  const handleRunExecutionSim = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const res = ClientOrderFlowEngine.simulateOrderExecution({
        symbol: selectedSymbol,
        totalShares: orderShares,
        algoType,
        durationMinutes: durationMins,
        urgencyLevel: urgency
      });
      setExecSimResult(res);
      setIsRefreshing(false);
    }, 400);
  };

  // Filtered Tape List
  const filteredPrints = useMemo(() => {
    return printsData.filter(p => {
      if (anomalyOnly && !p.isAnomaly) return false;
      if (tapeFilterSide === 'BUY' && p.side !== 'BUY_SIDE') return false;
      if (tapeFilterSide === 'SELL' && p.side !== 'SELL_SIDE') return false;
      if (tapeFilterSide === 'CROSS' && p.side !== 'CROSS') return false;
      return true;
    });
  }, [printsData, tapeFilterSide, anomalyOnly]);

  // Notional metrics summary
  const tapeNotionalTotal = useMemo(() => {
    return filteredPrints.reduce((sum, p) => sum + p.notionalValue, 0);
  }, [filteredPrints]);

  return (
    <div className="order-flow-radar">
      {/* Header Bar */}
      <div className="radar-header">
        <div className="radar-title-group">
          <h3>
            <Zap size={22} style={{ color: '#00f3ff' }} />
            Order Flow & Institutional Risk Radar
          </h3>
          <p>
            Real-time Institutional Dark Pool Stream • Option Gamma (GEX) Spectrum • L2 Algorithmic Execution • Monte Carlo VaR
          </p>
        </div>

        <div className="radar-controls">
          <div className="radar-control-item">
            <label>Ticker:</label>
            <select value={selectedSymbol} onChange={e => handleSymbolChange(e.target.value)}>
              {MOCK_SYMBOLS.map(s => (
                <option key={s.symbol} value={s.symbol}>
                  {s.symbol} - {s.name}
                </option>
              ))}
            </select>
          </div>

          <button className="radar-btn-primary" onClick={handleManualRefresh} disabled={isRefreshing}>
            <RefreshCw size={14} className={isRefreshing ? 'spin-icon' : ''} />
            {isRefreshing ? 'Scanning Flow...' : 'Live Rescan'}
          </button>
        </div>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="radar-nav-tabs">
        <button
          className={`radar-tab-btn ${activeSubTab === 'tape' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('tape')}
        >
          <Activity size={15} />
          Dark Pool Prints & Block Tape
        </button>
        <button
          className={`radar-tab-btn ${activeSubTab === 'gex' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('gex')}
        >
          <BarChart2 size={15} />
          Options Gamma (GEX) & Walls
        </button>
        <button
          className={`radar-tab-btn ${activeSubTab === 'execution' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('execution')}
        >
          <Layers size={15} />
          L2 Book & Algo Router Sim
        </button>
        <button
          className={`radar-tab-btn ${activeSubTab === 'risk' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('risk')}
        >
          <ShieldAlert size={15} />
          Monte Carlo VaR & Stress Test
        </button>
      </div>

      {/* Metrics Banner */}
      <div className="radar-metrics-grid">
        <div className="radar-metric-card cyan">
          <span className="radar-metric-label">Spot Price ({selectedSymbol})</span>
          <div className="radar-metric-val" style={{ color: '#00f3ff' }}>
            ${gammaProfile.spotPrice.toFixed(2)}
          </div>
          <span className="radar-metric-sub">Net GEX Regime: {gammaProfile.gexRegime}</span>
        </div>

        <div className="radar-metric-card pink">
          <span className="radar-metric-label">Dark Pool Volume Tracked</span>
          <div className="radar-metric-val" style={{ color: '#ec4899' }}>
            ${(tapeNotionalTotal / 1000000).toFixed(1)}M
          </div>
          <span className="radar-metric-sub">{filteredPrints.length} Prints in Active Stream</span>
        </div>

        <div className="radar-metric-card amber">
          <span className="radar-metric-label">Zero-Gamma Flip Strike</span>
          <div className="radar-metric-val" style={{ color: '#f59e0b' }}>
            ${gammaProfile.zeroGammaStrike.toFixed(2)}
          </div>
          <span className="radar-metric-sub">Call Wall: ${gammaProfile.callWall} | Put Wall: ${gammaProfile.putWall}</span>
        </div>

        <div className="radar-metric-card violet">
          <span className="radar-metric-label">Portfolio 95% VaR (20D)</span>
          <div className="radar-metric-val" style={{ color: '#a855f7' }}>
            -${(mcRiskAnalysis.confidenceLevels.var95).toLocaleString()}
          </div>
          <span className="radar-metric-sub">
            CVaR (Expected Shortfall): -${(mcRiskAnalysis.confidenceLevels.cvar95).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Main Active Workspace Pane */}
      <div className="radar-pane">
        <AnimatePresence mode="wait">
          {/* TAB 1: Dark Pool Block Tape */}
          {activeSubTab === 'tape' && (
            <motion.div
              key="tape"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="dark-pool-tape-container"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <h4 style={{ margin: 0, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Activity size={16} style={{ color: '#00f3ff' }} /> Institutional Block Trade Stream
                </h4>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={anomalyOnly}
                      onChange={e => setAnomalyOnly(e.target.checked)}
                    />
                    <span style={{ color: anomalyOnly ? '#f59e0b' : 'inherit', fontWeight: anomalyOnly ? 600 : 400 }}>
                      ⚠️ Anomalies Only
                    </span>
                  </label>

                  <select
                    value={tapeFilterSide}
                    onChange={e => setTapeFilterSide(e.target.value)}
                    style={{ background: '#090d16', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', padding: '4px 8px', borderRadius: 6 }}
                  >
                    <option value="ALL">All Sides</option>
                    <option value="BUY">Buy Side</option>
                    <option value="SELL">Sell Side</option>
                    <option value="CROSS">Cross Prints</option>
                  </select>
                </div>
              </div>

              <div className="tape-table-wrapper">
                <table className="tape-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Symbol</th>
                      <th>Price</th>
                      <th>Block Size</th>
                      <th>Notional Value</th>
                      <th>Side</th>
                      <th>Signature Type</th>
                      <th>Venue</th>
                      <th>Confidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPrints.map(p => (
                      <tr key={p.id} className={p.isAnomaly ? 'anomaly-row' : ''}>
                        <td>{p.timestamp}</td>
                        <td style={{ fontWeight: 700, color: '#f8fafc' }}>{p.symbol}</td>
                        <td>${p.price.toFixed(2)}</td>
                        <td>{p.size.toLocaleString()} shs</td>
                        <td style={{ fontWeight: 600, color: p.notionalValue > 2500000 ? '#00f3ff' : 'inherit' }}>
                          ${p.notionalValue.toLocaleString()}
                        </td>
                        <td>
                          <span className={`badge-side ${p.side === 'BUY_SIDE' ? 'buy' : p.side === 'SELL_SIDE' ? 'sell' : 'cross'}`}>
                            {p.side.replace('_SIDE', '')}
                          </span>
                        </td>
                        <td>
                          <span className="badge-signature">
                            {p.signature} {p.isAnomaly && '⚡'}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-muted)' }}>{p.exchangeCode}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden', minWidth: 40 }}>
                              <div style={{ width: `${p.institutionalConfidence}%`, height: '100%', background: '#00f3ff' }} />
                            </div>
                            <span>{p.institutionalConfidence}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* TAB 2: Options Gamma (GEX) Spectrum */}
          {activeSubTab === 'gex' && (
            <motion.div
              key="gex"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="gex-view-container"
            >
              <div className="gex-summary-bar">
                <div>Total Call GEX: <strong style={{ color: '#10b981' }}>+${(gammaProfile.totalCallGamma / 1000000).toFixed(1)}M</strong></div>
                <div>Total Put GEX: <strong style={{ color: '#ef4444' }}>-${(gammaProfile.totalPutGamma / 1000000).toFixed(1)}M</strong></div>
                <div>Net GEX: <strong style={{ color: gammaProfile.totalNetGamma >= 0 ? '#00f3ff' : '#f59e0b' }}>${(gammaProfile.totalNetGamma / 1000000).toFixed(1)}M</strong></div>
                <div>Zero Flip Strike: <strong style={{ color: '#f59e0b' }}>${gammaProfile.zeroGammaStrike}</strong></div>
              </div>

              <div style={{ height: 380, width: '100%', marginTop: 10 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={gammaProfile.strikes} margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="strike" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="left" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="right" orientation="right" stroke="#a855f7" tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' }} />
                    <Bar yAxisId="left" dataKey="callGamma" fill="rgba(16, 185, 129, 0.6)" name="Call Gamma ($)" />
                    <Bar yAxisId="left" dataKey="putGamma" fill="rgba(239, 68, 68, 0.6)" name="Put Gamma ($)" />
                    <Line yAxisId="right" type="monotone" dataKey="netGamma" stroke="#00f3ff" strokeWidth={2.5} name="Net GEX Curve" dot={true} />
                    <ReferenceLine yAxisId="left" x={gammaProfile.spotPrice} stroke="#ffffff" strokeDasharray="3 3" label={{ value: `Spot: $${gammaProfile.spotPrice}`, fill: '#fff', fontSize: 11 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {/* TAB 3: L2 Book & Algo Router Simulator */}
          {activeSubTab === 'execution' && (
            <motion.div
              key="execution"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="l2-router-grid"
            >
              {/* L2 DOM Depth Book */}
              <div className="dom-book-card">
                <h4 style={{ margin: 0, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Layers size={16} style={{ color: '#00f3ff' }} /> Level 2 Depth of Market (DOM)
                </h4>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Spread: ${l2Book.spread.toFixed(2)} | Imbalance: {(l2Book.imbalanceRatio * 100).toFixed(1)}% ({l2Book.imbalanceRatio >= 0 ? 'Bid Heavy' : 'Ask Heavy'})
                </div>

                <table className="dom-rows-table">
                  <tbody>
                    {/* ASKS (top) */}
                    {l2Book.asks.slice().reverse().map(ask => (
                      <tr key={`ask-${ask.price}`}>
                        <td style={{ color: '#ef4444', width: '25%' }}>${ask.price.toFixed(2)}</td>
                        <td style={{ width: '25%' }}>{ask.size.toLocaleString()}</td>
                        <td style={{ width: '50%' }}>
                          <div className="dom-bar-fill ask" style={{ width: `${Math.min(100, (ask.size / 30000) * 100)}%` }} />
                        </td>
                      </tr>
                    ))}
                    {/* BIDS (bottom) */}
                    {l2Book.bids.map(bid => (
                      <tr key={`bid-${bid.price}`}>
                        <td style={{ color: '#10b981', width: '25%' }}>${bid.price.toFixed(2)}</td>
                        <td style={{ width: '25%' }}>{bid.size.toLocaleString()}</td>
                        <td style={{ width: '50%' }}>
                          <div className="dom-bar-fill bid" style={{ width: `${Math.min(100, (bid.size / 30000) * 100)}%` }} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Execution Router Form & Slice Results */}
              <div className="router-config-card">
                <h4 style={{ margin: 0, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Zap size={16} style={{ color: '#00f3ff' }} /> Algorithmic Execution Simulator
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="algo-form-group">
                    <label>Algorithm Strategy:</label>
                    <select value={algoType} onChange={e => setAlgoType(e.target.value as OrderExecutionType)}>
                      <option value="VWAP">VWAP (Volume Weighted)</option>
                      <option value="TWAP">TWAP (Time Weighted)</option>
                      <option value="POV">POV (Percentage of Vol)</option>
                      <option value="IMPLEMENTATION_SHORTFALL">Implementation Shortfall</option>
                    </select>
                  </div>

                  <div className="algo-form-group">
                    <label>Total Shares:</label>
                    <input
                      type="number"
                      value={orderShares}
                      onChange={e => setOrderShares(parseInt(e.target.value, 10) || 1000)}
                    />
                  </div>

                  <div className="algo-form-group">
                    <label>Duration (Minutes):</label>
                    <input
                      type="number"
                      value={durationMins}
                      onChange={e => setDurationMins(parseInt(e.target.value, 10) || 5)}
                    />
                  </div>

                  <div className="algo-form-group">
                    <label>Urgency Profile:</label>
                    <select value={urgency} onChange={e => setUrgency(e.target.value as any)}>
                      <option value="LOW">Low (Minimize Impact)</option>
                      <option value="MEDIUM">Medium (Balanced)</option>
                      <option value="HIGH">High (Fast Fill)</option>
                    </select>
                  </div>
                </div>

                <button className="radar-btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleRunExecutionSim}>
                  <Play size={14} /> Run Execution Simulation
                </button>

                {execSimResult && (
                  <div style={{ background: '#0f172a', padding: 12, borderRadius: 6, fontSize: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Avg Exec Price: <strong>${execSimResult.averageExecutionPrice}</strong></span>
                      <span>VWAP Bench: <strong>${execSimResult.benchmarkVwap}</strong></span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Total Slippage: <strong style={{ color: '#00f3ff' }}>{execSimResult.totalSlippageBps} bps</strong></span>
                      <span>Market Impact: <strong>${execSimResult.totalMarketImpactUsd.toLocaleString()}</strong></span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 4: Monte Carlo Risk & Macro Stress Test */}
          {activeSubTab === 'risk' && (
            <motion.div
              key="risk"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mc-risk-container"
            >
              <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                <div className="algo-form-group" style={{ flex: 1, minWidth: 200 }}>
                  <label>Portfolio Base Capital ($):</label>
                  <input
                    type="number"
                    value={portfolioSize}
                    onChange={e => setPortfolioSize(parseInt(e.target.value, 10) || 100000)}
                  />
                </div>

                <div className="algo-form-group" style={{ flex: 1, minWidth: 200 }}>
                  <label>Volatility Shock Shift ({ivShift > 0 ? `+${ivShift}%` : `${ivShift}%`}):</label>
                  <input
                    type="range"
                    min="-40"
                    max="100"
                    step="5"
                    value={ivShift}
                    onChange={e => setIvShift(parseInt(e.target.value, 10))}
                  />
                </div>

                <div className="algo-form-group" style={{ flex: 1, minWidth: 200 }}>
                  <label>Spot Price Stress Shift ({spotShift > 0 ? `+${spotShift}%` : `${spotShift}%`}):</label>
                  <input
                    type="range"
                    min="-30"
                    max="30"
                    step="5"
                    value={spotShift}
                    onChange={e => setSpotShift(parseInt(e.target.value, 10))}
                  />
                </div>
              </div>

              {/* Monte Carlo Fan Chart */}
              <div style={{ height: 340, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={mcRiskAnalysis.paths} margin={{ top: 15, right: 30, bottom: 15, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis domain={['auto', 'auto']} stroke="#64748b" tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' }} />
                    <Area type="monotone" dataKey="percentile95" stroke="none" fill="rgba(0, 243, 255, 0.12)" name="95th Percentile Envelope" />
                    <Area type="monotone" dataKey="percentile75" stroke="none" fill="rgba(168, 85, 247, 0.2)" name="75th Percentile Envelope" />
                    <Line type="monotone" dataKey="medianPrice" stroke="#00f3ff" strokeWidth={2.5} name="Median Simulation Path" dot={false} />
                    <Line type="monotone" dataKey="percentile5" stroke="#ef4444" strokeWidth={2} strokeDasharray="4 4" name="5th Percentile Tail Risk" dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* Stress Scenarios Cards */}
              <div className="stress-scenarios-grid">
                {mcRiskAnalysis.stressScenarios.map((sc, idx) => (
                  <div key={idx} className="stress-card">
                    <span className="stress-card-title">{sc.name}</span>
                    <span className="stress-card-pnl" style={{ color: sc.pnlImpact < 0 ? '#ef4444' : '#10b981' }}>
                      {sc.pnlImpact < 0 ? '-' : '+'}${Math.abs(sc.pnlImpact).toLocaleString()} ({sc.pnlPercent}%)
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sc.description}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OrderFlowRadar;
