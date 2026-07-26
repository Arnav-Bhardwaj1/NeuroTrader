import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  BrainCircuit,
  Sparkles,
  Activity,
  Layers,
  Zap,
  Target,
  ShieldAlert,
  BarChart3,
  Sliders,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Gauge
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import {
  NeuroPatternEngine,
  type NeuralEngineAnalysis,
  type MarketRegime
} from '../../lib/NeuroPatternEngine';
import './NeuroPatternStudio.css';

/**
 * NeuroPatternStudio.tsx
 * Interactive Neural Pattern Recognition & ML Feature Workbench.
 */

// Sample ticker datasets with realistic historical price/volume series
const SAMPLE_TICKERS = [
  { symbol: 'NVDA', name: 'NVIDIA Corp.', basePrice: 130 },
  { symbol: 'AAPL', name: 'Apple Inc.', basePrice: 220 },
  { symbol: 'BTC/USD', name: 'Bitcoin / USD', basePrice: 65000 },
  { symbol: 'TSLA', name: 'Tesla Inc.', basePrice: 240 },
  { symbol: 'ETH/USD', name: 'Ethereum / USD', basePrice: 3400 },
];

const TIMEFRAMES = ['15M', '1H', '4H', '1D'];

// Helper to generate realistic prices and volumes for simulation
function generateMockSeries(basePrice: number, count: number = 30) {
  const prices: number[] = [];
  const volumes: number[] = [];
  let current = basePrice;

  for (let i = 0; i < count; i++) {
    // Generate double bottom / flag like pattern towards end
    const noise = (Math.sin(i / 2) * 0.02) + (Math.random() * 0.03 - 0.014);
    current = Math.max(1, current * (1 + noise));
    const vol = Math.floor(1000000 + Math.random() * 2500000 + (Math.abs(noise) * 50000000));

    prices.push(Number(current.toFixed(2)));
    volumes.push(vol);
  }

  return { prices, volumes };
}

export const NeuroPatternStudio: React.FC = () => {
  const [selectedTicker, setSelectedTicker] = useState('NVDA');
  const [timeframe, setTimeframe] = useState('1D');
  const [sensitivity, setSensitivity] = useState(0.85);
  const [activeTab, setActiveTab] = useState<'patterns' | 'forecast' | 'attention' | 'anomaly'>('patterns');
  const [isCalculating, setIsCalculating] = useState(false);

  // Generate data state
  const [seriesData, setSeriesData] = useState(() => {
    const tickerObj = SAMPLE_TICKERS.find(t => t.symbol === 'NVDA') || SAMPLE_TICKERS[0];
    return generateMockSeries(tickerObj.basePrice, 32);
  });

  // Calculate analysis using NeuroPatternEngine
  const analysis: NeuralEngineAnalysis = useMemo(() => {
    return NeuroPatternEngine.analyze(
      selectedTicker,
      timeframe,
      seriesData.prices,
      seriesData.volumes,
      sensitivity
    );
  }, [selectedTicker, timeframe, seriesData, sensitivity]);

  const handleTickerChange = (symbol: string) => {
    setSelectedTicker(symbol);
    setIsCalculating(true);
    const tickerObj = SAMPLE_TICKERS.find(t => t.symbol === symbol) || SAMPLE_TICKERS[0];
    setTimeout(() => {
      setSeriesData(generateMockSeries(tickerObj.basePrice, 32));
      setIsCalculating(false);
    }, 300);
  };

  const handleRefresh = useCallback(() => {
    setIsCalculating(true);
    const tickerObj = SAMPLE_TICKERS.find(t => t.symbol === selectedTicker) || SAMPLE_TICKERS[0];
    setTimeout(() => {
      setSeriesData(generateMockSeries(tickerObj.basePrice, 32));
      setIsCalculating(false);
    }, 400);
  }, [selectedTicker]);

  // Combine price history and forecast for charting
  const chartData = useMemo(() => {
    const historyPoints = seriesData.prices.map((price, idx) => ({
      bar: `Bar ${idx + 1}`,
      barIndex: idx + 1,
      price,
      volume: seriesData.volumes[idx],
      attention: analysis.featureMatrix[idx]?.attentionWeight || 0,
      anomaly: analysis.featureMatrix[idx]?.anomalyScore || 0,
      type: 'history',
    }));

    const lastPrice = historyPoints[historyPoints.length - 1]?.price || analysis.currentPrice;

    const forecastPoints = analysis.forecast.map((fPoint) => ({
      bar: `+${fPoint.day}D`,
      barIndex: historyPoints.length + fPoint.day,
      forecastPrice: fPoint.predictedPrice,
      lower80: fPoint.lowerBound80,
      upper80: fPoint.upperBound80,
      lower95: fPoint.lowerBound95,
      upper95: fPoint.upperBound95,
      attention: fPoint.attentionWeight,
      type: 'forecast',
    }));

    // Connect history to forecast smoothly
    if (forecastPoints.length > 0 && historyPoints.length > 0) {
      forecastPoints[0].forecastPrice = lastPrice;
    }

    return { historyPoints, forecastPoints, combined: [...historyPoints, ...forecastPoints] };
  }, [seriesData, analysis]);

  const renderRegimeBadge = (regime: MarketRegime) => {
    switch (regime) {
      case 'BULLISH_MOMENTUM':
        return <span className="regime-badge bullish"><TrendingUp size={12} /> Bullish Momentum</span>;
      case 'BEARISH_DIVERGENCE':
        return <span className="regime-badge bearish"><TrendingDown size={12} /> Bearish Divergence</span>;
      case 'VOLATILITY_COMPRESSION':
        return <span className="regime-badge volatility"><Zap size={12} /> Volatility Compression</span>;
      case 'BLACK_SWAN_ANOMALY':
        return <span className="regime-badge anomaly"><AlertTriangle size={12} /> Black Swan Anomaly</span>;
      case 'ACCUMULATION_ZONE':
      default:
        return <span className="regime-badge accumulation"><Layers size={12} /> Accumulation Zone</span>;
    }
  };

  return (
    <div className="pattern-studio-container">
      {/* Studio Header */}
      <div className="studio-header">
        <div className="studio-title-group">
          <h3>
            <BrainCircuit size={22} className="text-violet icon-pulse" />
            NeuroPattern AI Studio & Neural Feature Analytics
          </h3>
          <p>Convolutional DTW Pattern Matcher • Autoencoder Anomaly Score • Multi-Head Attention Forecast</p>
        </div>

        {/* Controls */}
        <div className="studio-controls">
          <div className="control-item">
            <label>Ticker:</label>
            <select value={selectedTicker} onChange={e => handleTickerChange(e.target.value)}>
              {SAMPLE_TICKERS.map(t => (
                <option key={t.symbol} value={t.symbol}>{t.symbol} ({t.name})</option>
              ))}
            </select>
          </div>

          <div className="control-item">
            <label>Timeframe:</label>
            <select value={timeframe} onChange={e => setTimeframe(e.target.value)}>
              {TIMEFRAMES.map(tf => (
                <option key={tf} value={tf}>{tf}</option>
              ))}
            </select>
          </div>

          <div className="control-item">
            <Sliders size={14} className="text-cyan" />
            <label>Sensitivity ({Math.round(sensitivity * 100)}%):</label>
            <input
              type="range"
              min="0.5"
              max="1.0"
              step="0.05"
              value={sensitivity}
              onChange={e => setSensitivity(parseFloat(e.target.value))}
            />
          </div>

          <button className="studio-btn-primary" onClick={handleRefresh} disabled={isCalculating}>
            <RefreshCw size={14} className={isCalculating ? 'spin' : ''} />
            {isCalculating ? 'Processing Neural Model...' : 'Re-Run Neural Scan'}
          </button>
        </div>
      </div>

      {/* Top Banner Cards */}
      <div className="metrics-banner">
        <div className="metric-card regime">
          <span className="card-label">Market State Regime</span>
          <div className="card-value">
            {renderRegimeBadge(analysis.regime)}
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            Regime Confidence: {analysis.regimeConfidence}%
          </span>
        </div>

        <div className="metric-card anomaly">
          <span className="card-label">Anomaly Index Score</span>
          <div className="card-value" style={{ color: analysis.isAnomalyAlert ? 'var(--accent-amber)' : 'var(--accent-cyan)' }}>
            <Gauge size={20} />
            {analysis.anomalyScore}%
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {analysis.isAnomalyAlert ? '⚠️ Statistical Anomaly Detected' : 'Normal Variance Spectrum'}
          </span>
        </div>

        <div className="metric-card patterns">
          <span className="card-label">Detected Patterns</span>
          <div className="card-value text-green">
            <Sparkles size={20} />
            {analysis.detectedPatterns.length} Active
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {analysis.detectedPatterns[0]?.label || 'Scanning Vector Matrix...'}
          </span>
        </div>

        <div className="metric-card accuracy">
          <span className="card-label">Neural Model Accuracy</span>
          <div className="card-value text-cyan">
            <Target size={20} />
            {analysis.modelAccuracy}%
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            Cross-Validated Backtest Score
          </span>
        </div>
      </div>

      {/* Studio Workspace Grid */}
      <div className="studio-grid">
        {/* Left Interactive Chart Pane */}
        <div className="main-chart-pane">
          <div className="pane-header">
            <div className="pane-tabs">
              <button
                className={`pane-tab-btn ${activeTab === 'patterns' ? 'active' : ''}`}
                onClick={() => setActiveTab('patterns')}
              >
                <Sparkles size={14} style={{ display: 'inline', marginRight: 6 }} />
                Pattern Recognition View
              </button>
              <button
                className={`pane-tab-btn ${activeTab === 'forecast' ? 'active' : ''}`}
                onClick={() => setActiveTab('forecast')}
              >
                <Activity size={14} style={{ display: 'inline', marginRight: 6 }} />
                Attention Ensemble Forecast
              </button>
              <button
                className={`pane-tab-btn ${activeTab === 'attention' ? 'active' : ''}`}
                onClick={() => setActiveTab('attention')}
              >
                <Layers size={14} style={{ display: 'inline', marginRight: 6 }} />
                Neural Attention Matrix
              </button>
              <button
                className={`pane-tab-btn ${activeTab === 'anomaly' ? 'active' : ''}`}
                onClick={() => setActiveTab('anomaly')}
              >
                <ShieldAlert size={14} style={{ display: 'inline', marginRight: 6 }} />
                Anomaly Score Flow
              </button>
            </div>

            <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              PRICE: ${analysis.currentPrice.toFixed(2)}
            </span>
          </div>

          <div className="chart-content" style={{ height: 380, position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              {activeTab === 'forecast' ? (
                <ComposedChart data={chartData.combined} margin={{ top: 15, right: 20, bottom: 10, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="bar" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis domain={['auto', 'auto']} stroke="#64748b" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Line type="monotone" dataKey="price" stroke="var(--accent-cyan)" strokeWidth={2} dot={false} name="Historical Price" />
                  <Area type="monotone" dataKey="upper95" stroke="none" fill="rgba(168, 85, 247, 0.15)" name="95% Confidence Envelope" />
                  <Area type="monotone" dataKey="upper80" stroke="none" fill="rgba(0, 243, 255, 0.2)" name="80% Confidence Envelope" />
                  <Line type="monotone" dataKey="forecastPrice" stroke="var(--accent-violet)" strokeWidth={2.5} strokeDasharray="4 4" dot={true} name="Neural Forecast" />
                </ComposedChart>
              ) : activeTab === 'attention' ? (
                <ComposedChart data={chartData.historyPoints} margin={{ top: 15, right: 20, bottom: 10, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="bar" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="left" domain={['auto', 'auto']} stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 0.15]} stroke="#a855f7" tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' }} />
                  <Bar yAxisId="right" dataKey="attention" fill="rgba(168, 85, 247, 0.4)" name="Attention Weight" />
                  <Line yAxisId="left" type="monotone" dataKey="price" stroke="var(--accent-cyan)" strokeWidth={2} dot={false} name="Price" />
                </ComposedChart>
              ) : activeTab === 'anomaly' ? (
                <ComposedChart data={chartData.historyPoints} margin={{ top: 15, right: 20, bottom: 10, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="bar" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="left" domain={['auto', 'auto']} stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 100]} stroke="#f59e0b" tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' }} />
                  <Area yAxisId="right" type="step" dataKey="anomaly" fill="rgba(245, 158, 11, 0.25)" stroke="var(--accent-amber)" name="Anomaly Index Score" />
                  <Line yAxisId="left" type="monotone" dataKey="price" stroke="var(--accent-cyan)" strokeWidth={2} dot={false} name="Price" />
                  <ReferenceLine yAxisId="right" y={70} stroke="red" strokeDasharray="3 3" label={{ value: 'Anomaly Alert Level (70%)', fill: 'red', fontSize: 10 }} />
                </ComposedChart>
              ) : (
                /* Default Patterns View */
                <ComposedChart data={chartData.historyPoints} margin={{ top: 15, right: 20, bottom: 10, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="bar" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis domain={['auto', 'auto']} stroke="#64748b" tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="price" stroke="var(--accent-cyan)" strokeWidth={2} dot={false} name="Price" />
                  {analysis.detectedPatterns.map((pat) => (
                    <ReferenceLine
                      key={pat.id}
                      y={pat.targetPrice}
                      stroke={pat.breakoutDirection === 'BULLISH' ? 'var(--accent-green)' : 'var(--accent-red)'}
                      strokeDasharray="4 4"
                      label={{ value: `${pat.label} Target: $${pat.targetPrice}`, fill: pat.breakoutDirection === 'BULLISH' ? 'var(--accent-green)' : 'var(--accent-red)', fontSize: 11 }}
                    />
                  ))}
                </ComposedChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sidebar Cards */}
        <div className="sidebar-pane">
          {/* Pattern Details Card */}
          <div className="side-card">
            <h4>
              <Sparkles size={16} className="text-cyan" /> Recognized Patterns
            </h4>
            {analysis.detectedPatterns.length > 0 ? (
              <div className="pattern-list">
                {analysis.detectedPatterns.map(pat => (
                  <motion.div
                    key={pat.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="pattern-item"
                  >
                    <div className="pattern-item-top">
                      <span className="pattern-name">{pat.label}</span>
                      <span className={`pattern-conf ${pat.breakoutDirection === 'BULLISH' ? 'text-green' : 'text-red'}`}>
                        {pat.confidence}% Match
                      </span>
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '4px 0' }}>
                      {pat.description}
                    </p>
                    <div className="pattern-item-targets">
                      <span>Target: <strong>${pat.targetPrice}</strong></span>
                      <span>Stop Loss: <strong>${pat.stopLoss}</strong></span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px 0', fontSize: 13 }}>
                <BarChart3 size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                No patterns exceeding {Math.round(sensitivity * 100)}% match threshold.
              </div>
            )}
          </div>

          {/* Attention Weights Grid */}
          <div className="side-card">
            <h4>
              <Layers size={16} className="text-violet" /> Transformer Bar Attention
            </h4>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
              Recent historical bar weights assigned by self-attention matrix
            </p>
            <div className="attention-grid">
              {analysis.featureMatrix.slice(-20).map((fm, idx) => {
                const intensity = Math.min(1, fm.attentionWeight * 15);
                const bg = `rgba(168, 85, 247, ${0.15 + intensity * 0.75})`;
                return (
                  <div key={idx} className="attention-box" style={{ background: bg }} title={`Bar ${fm.barIndex}: ${(fm.attentionWeight * 100).toFixed(1)}%`}>
                    B{idx + 1}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NeuroPatternStudio;
