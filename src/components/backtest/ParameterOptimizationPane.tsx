import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Grid,
  Sparkles,
  CheckCircle2,
  BarChart2
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import {
  NeuroBacktestEngine,
  type OptimizationCell
} from '../../lib/NeuroBacktestEngine';

export const ParameterOptimizationPane: React.FC = () => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>('NVDA');
  const [metricFilter, setMetricFilter] = useState<'sharpeRatio' | 'totalReturnPercent' | 'winRate'>('sharpeRatio');

  const gridData = useMemo(() => {
    return NeuroBacktestEngine.runOptimizationGrid(selectedSymbol);
  }, [selectedSymbol]);

  const optimalCell = useMemo(() => {
    return gridData.find(c => c.isOptimal) || gridData[0];
  }, [gridData]);

  const [selectedCell, setSelectedCell] = useState<OptimizationCell>(optimalCell);

  const getHeatmapBg = (val: number, min: number, max: number) => {
    const ratio = Math.max(0, Math.min(1, (val - min) / (max - min || 1)));
    const greenAlpha = 0.15 + ratio * 0.75;
    return `rgba(6, 214, 160, ${greenAlpha})`;
  };

  const minVal = Math.min(...gridData.map(c => c[metricFilter]));
  const maxVal = Math.max(...gridData.map(c => c[metricFilter]));

  // Build Short Period sensitivity curve
  const sensitivityData = useMemo(() => {
    const shorts = [5, 10, 15, 20, 25];
    return shorts.map(s => {
      const cells = gridData.filter(c => c.paramShort === s);
      const avgReturn = cells.reduce((acc, c) => acc + c.totalReturnPercent, 0) / cells.length;
      const avgSharpe = cells.reduce((acc, c) => acc + c.sharpeRatio, 0) / cells.length;
      return {
        shortPeriod: `Short MA (${s})`,
        avgReturn: Number(avgReturn.toFixed(2)),
        avgSharpe: Number(avgSharpe.toFixed(2)),
      };
    });
  }, [gridData]);

  return (
    <div className="optimization-pane-container">
      {/* Header Banner */}
      <div className="opt-header glass-card">
        <div className="title-box">
          <h3>
            <Grid size={20} className="text-cyan icon-pulse" /> 2D Multi-Factor Parameter Grid Optimization
          </h3>
          <p className="text-muted">Explore strategy parameter surfaces to discover optimal Sharpe ratios, maximum returns, and stability zones.</p>
        </div>

        <div className="controls-group">
          <div className="ctrl-item">
            <label>Symbol:</label>
            <select value={selectedSymbol} onChange={e => setSelectedSymbol(e.target.value)}>
              <option value="NVDA">NVDA</option>
              <option value="AAPL">AAPL</option>
              <option value="BTC/USD">BTC/USD</option>
            </select>
          </div>

          <div className="ctrl-item">
            <label>Color Heatmap Metric:</label>
            <select value={metricFilter} onChange={e => setMetricFilter(e.target.value as any)}>
              <option value="sharpeRatio">Sharpe Ratio</option>
              <option value="totalReturnPercent">Total Return (%)</option>
              <option value="winRate">Win Rate (%)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: 2D Heatmap & Parameter Sensitivity Chart */}
      <div className="opt-main-grid">
        {/* Left: 2D Parameter Heatmap Grid */}
        <div className="heatmap-card glass-card">
          <div className="card-header">
            <h4>
              <Sparkles size={16} className="text-amber" /> 5x5 Parameter Optimization Surface Matrix
            </h4>
            <span className="tag">Short MA vs Long MA</span>
          </div>

          <div className="heatmap-table-wrapper">
            <div className="heatmap-grid">
              <div className="grid-header-corner">Short \ Long</div>
              {[30, 40, 50, 65, 80].map(l => (
                <div key={l} className="grid-header-col">Long {l}</div>
              ))}

              {[5, 10, 15, 20, 25].map(shortMa => (
                <React.Fragment key={shortMa}>
                  <div className="grid-header-row">Short {shortMa}</div>
                  {[30, 40, 50, 65, 80].map(longMa => {
                    const cell = gridData.find(c => c.paramShort === shortMa && c.paramLong === longMa);
                    if (!cell) return <div key={longMa} className="grid-cell" />;
                    const val = cell[metricFilter];
                    const bg = getHeatmapBg(val, minVal, maxVal);

                    return (
                      <motion.div
                        key={longMa}
                        whileHover={{ scale: 1.05 }}
                        className={`grid-cell ${selectedCell.paramShort === shortMa && selectedCell.paramLong === longMa ? 'selected' : ''}`}
                        style={{ background: bg }}
                        onClick={() => setSelectedCell(cell)}
                      >
                        <span className="cell-val">
                          {metricFilter === 'sharpeRatio' ? val.toFixed(2) : `${val}%`}
                        </span>
                        {cell.isOptimal && <span className="optimal-star">★ OPTIMAL</span>}
                      </motion.div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Selected Combination Inspector Card */}
        <div className="inspector-side-pane">
          <div className="cell-inspector-card glass-card">
            <div className="card-header">
              <h4>Selected Parameter Set</h4>
              {selectedCell.isOptimal && (
                <span className="optimal-badge">
                  <CheckCircle2 size={12} /> Peak Surface
                </span>
              )}
            </div>

            <div className="param-summary">
              <div className="p-box">
                <span className="lbl">Short MA Period</span>
                <span className="val text-cyan">{selectedCell.paramShort}</span>
              </div>
              <div className="p-box">
                <span className="lbl">Long MA Period</span>
                <span className="val text-violet">{selectedCell.paramLong}</span>
              </div>
            </div>

            <div className="metrics-grid">
              <div className="m-item">
                <label>Sharpe Ratio</label>
                <span className="m-val text-green">{selectedCell.sharpeRatio}</span>
              </div>
              <div className="m-item">
                <label>Total Return</label>
                <span className="m-val text-cyan">+{selectedCell.totalReturnPercent}%</span>
              </div>
              <div className="m-item">
                <label>Win Rate</label>
                <span className="m-val">{selectedCell.winRate}%</span>
              </div>
              <div className="m-item">
                <label>Profit Factor</label>
                <span className="m-val text-amber">{selectedCell.profitFactor}</span>
              </div>
            </div>

            <button className="apply-param-btn">
              Apply Parameter Pair to Active Strategy
            </button>
          </div>

          {/* Sensitivity Curve Chart */}
          <div className="sensitivity-card glass-card">
            <div className="card-header">
              <h4>
                <BarChart2 size={16} className="text-violet" /> Short MA Sensitivity Curve
              </h4>
            </div>

            <div style={{ height: 200, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sensitivityData} margin={{ top: 10, right: 10, bottom: 5, left: -15 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="shortPeriod" stroke="#64748b" tick={{ fontSize: 9 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 9 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '11px' }} />
                  <Line type="monotone" dataKey="avgSharpe" stroke="var(--accent-cyan)" strokeWidth={2} name="Avg Sharpe" />
                  <Line type="monotone" dataKey="avgReturn" stroke="var(--accent-green)" strokeWidth={2} strokeDasharray="3 3" name="Avg Return %" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParameterOptimizationPane;
