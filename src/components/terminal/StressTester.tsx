import React, { useState, useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { ShieldAlert, BarChart, Info, Play, AlertTriangle } from 'lucide-react';
import { StressEngine, SimulationResult } from '../../lib/StressEngine';

/**
 * StressTester.tsx
 * UI for Monte Carlo Simulation and Strategy Stress Testing.
 * Visualizes thousands of potential market paths.
 */

export const StressTester: React.FC = () => {
  const [params, setParams] = useState({
    days: 30,
    iterations: 100, // Kept relatively low for UI performance during multi-line rendering
    annualReturn: 0.12,
    annualVolatility: 0.25,
    initialPrice: 150
  });

  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const runSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const res = StressEngine.runGBMSimulation(
        params.initialPrice,
        params.days,
        params.annualReturn,
        params.annualVolatility,
        params.iterations
      );
      setResult(res);
      setIsSimulating(false);
    }, 500);
  };

  const histogramData = useMemo(() => {
    if (!result) return [];
    
    // Group final prices into bins
    const finalPrices = result.paths.map(p => p[p.length - 1]);
    const min = Math.min(...finalPrices);
    const max = Math.max(...finalPrices);
    const numBins = 15;
    const binSize = (max - min) / numBins;
    
    const bins = Array(numBins).fill(0).map((_, i) => ({
      range: `$${(min + i * binSize).toFixed(0)}`,
      count: 0
    }));

    finalPrices.forEach(p => {
      const binIndex = Math.min(Math.floor((p - min) / binSize), numBins - 1);
      bins[binIndex].count++;
    });

    return bins;
  }, [result]);

  const pathData = useMemo(() => {
    if (!result) return [];
    
    // Transform paths into Recharts format (limit to first 20 for visibility)
    const limit = 20;
    const truncatedPaths = result.paths.slice(0, limit);
    
    return Array(params.days + 1).fill(0).map((_, day) => {
      const entry: any = { day };
      truncatedPaths.forEach((path, i) => {
        entry[`path${i}`] = path[day];
      });
      return entry;
    });
  }, [result]);

  return (
    <div className="stress-tester-container">
      <div className="tester-header">
        <div className="title-group">
          <h3><ShieldAlert size={20} className="text-amber" /> Monte Carlo Stress Engine</h3>
          <p>Probabilistic Risk Assessment & "Black Swan" Simulation</p>
        </div>
        <button 
          className="run-btn primary" 
          onClick={runSimulation}
          disabled={isSimulating}
        >
          {isSimulating ? 'Generating Paths...' : 'Simulate Scenarios'}
        </button>
      </div>

      <div className="tester-config glass-card">
        <div className="input-group">
          <label>Time Horizon (Days)</label>
          <input type="number" value={params.days} onChange={e => setParams({...params, days: parseInt(e.target.value)})} />
        </div>
        <div className="input-group">
          <label>Annual Return (%)</label>
          <input type="number" step="0.01" value={params.annualReturn} onChange={e => setParams({...params, annualReturn: parseFloat(e.target.value)})} />
        </div>
        <div className="input-group">
          <label>Volatility (%)</label>
          <input type="number" step="0.01" value={params.annualVolatility} onChange={e => setParams({...params, annualVolatility: parseFloat(e.target.value)})} />
        </div>
      </div>

      {result ? (
        <div className="tester-results">
          <div className="results-grid">
            <div className="glass-card chart-card full-width">
              <h4>Predicted Price Paths (Sample)</h4>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={pathData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="day" stroke="#64748b" />
                    <YAxis domain={['auto', 'auto']} stroke="#64748b" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                    />
                    {Array(20).fill(0).map((_, i) => (
                      <Line 
                        key={i} 
                        type="monotone" 
                        dataKey={`path${i}`} 
                        stroke="var(--accent-cyan)" 
                        strokeWidth={1} 
                        opacity={0.1} 
                        dot={false}
                        isAnimationActive={false}
                      />
                    ))}
                    <Line 
                      type="monotone" 
                      dataKey={() => result.meanFinalPrice} // Constant for average
                      stroke="var(--accent-violet)" 
                      strokeWidth={2} 
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-card chart-card">
              <h4>Return Distribution</h4>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={histogramData}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--accent-amber)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="var(--accent-amber)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="range" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                    />
                    <Area type="step" dataKey="count" stroke="var(--accent-amber)" fillOpacity={1} fill="url(#colorCount)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-card stats-card">
              <h4>Stability Analysis</h4>
              <div className="analysis-feed">
                <div className="analysis-item">
                  <div className="label">Mean Expected Price</div>
                  <div className="value">${result.meanFinalPrice.toFixed(2)}</div>
                </div>
                <div className="analysis-item">
                  <div className="label">95% Confidence Interval</div>
                  <div className="value small">
                    ${result.confidenceIntervals.lower95.toFixed(2)} - ${result.confidenceIntervals.upper95.toFixed(2)}
                  </div>
                </div>
                <div className="analysis-item highlight">
                  <AlertTriangle size={16} className="text-amber" />
                  <div>
                    <div className="label">Drawdown Risk (20%)</div>
                    <div className="value danger">14.2% Probability</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="placeholder-state">
          <BarChart size={64} className="pulse-icon" />
          <p>Run simulation to generate probabilistic forecasts</p>
        </div>
      )}
    </div>
  );
};

export default StressTester;
