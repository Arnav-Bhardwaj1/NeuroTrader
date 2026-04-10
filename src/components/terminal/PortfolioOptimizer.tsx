import React, { useState, useEffect } from 'react';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  Label
} from 'recharts';
import { Target, TrendingUp, AlertCircle, Info } from 'lucide-react';
import { OptimalMath, PortfolioStats, AssetData } from '../../lib/OptimalMath';
import { stocks } from '../../lib/mockData';

/**
 * PortfolioOptimizer.tsx
 * UI for calculating and visualizing the Markowitz Efficient Frontier.
 */

export const PortfolioOptimizer: React.FC = () => {
  const [selectedAssets, setSelectedAssets] = useState<string[]>(['AAPL', 'MSFT', 'TSLA', 'NVDA']);
  const [simulations, setSimulations] = useState<PortfolioStats[]>([]);
  const [optimal, setOptimal] = useState<PortfolioStats | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    calculateFrontier();
  }, []);

  const calculateFrontier = () => {
    setIsCalculating(true);
    
    // In a real app, we'd fetch actual historical data. 
    // Here we generate mock returns for the selected assets.
    setTimeout(() => {
      const mockAssets: AssetData[] = selectedAssets.map(symbol => ({
        symbol,
        returns: Array(100).fill(0).map(() => (Math.random() * 0.04 - 0.02) + 0.001)
      }));

      const results = OptimalMath.simulatePortfolios(mockAssets, 1500);
      const opt = OptimalMath.findOptimalPortfolio(results);
      
      setSimulations(results);
      setOptimal(opt);
      setIsCalculating(false);
    }, 600);
  };

  return (
    <div className="optimizer-container">
      <div className="optimizer-header">
        <div className="title-group">
          <h3><Target size={20} className="text-cyan" /> Portfolio Intelligence</h3>
          <p>Mean-Variance Optimization (MVO) & Efficient Frontier</p>
        </div>
        <button 
          className="refresh-btn" 
          onClick={calculateFrontier}
          disabled={isCalculating}
        >
          {isCalculating ? 'Computing Frontier...' : 'Run Optimization'}
        </button>
      </div>

      <div className="optimizer-grid">
        <div className="glass-card chart-pane">
          <div className="chart-header">
            <h4>Efficient Frontier</h4>
            <div className="chart-legend">
              <span className="legend-item"><span className="dot optimal" /> Max Sharpe</span>
              <span className="legend-item"><span className="dot random" /> Simulated Portfolios</span>
            </div>
          </div>
          
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <XAxis 
                  type="number" 
                  dataKey="volatility" 
                  name="Risk" 
                  unit="%" 
                  stroke="#64748b"
                  domain={['auto', 'auto']}
                  tickFormatter={(v) => (v * 100).toFixed(1)}
                >
                  <Label value="Annualized Volatility (Risk)" offset={-10} position="insideBottom" fill="#94a3b8" />
                </XAxis>
                <YAxis 
                  type="number" 
                  dataKey="expectedReturn" 
                  name="Return" 
                  unit="%" 
                  stroke="#64748b"
                  domain={['auto', 'auto']}
                  tickFormatter={(v) => (v * 100).toFixed(1)}
                >
                  <Label value="Expected Return" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} fill="#94a3b8" />
                </YAxis>
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  formatter={(value: any, name: string) => [`${(parseFloat(value) * 100).toFixed(2)}%`, name]}
                />
                <Scatter name="Portfolios" data={simulations} fill="var(--accent-cyan-dim)" opacity={0.3} shape="circle" />
                {optimal && (
                  <Scatter 
                    name="Optimal" 
                    data={[optimal]} 
                    fill="var(--accent-cyan)" 
                    shape="star" 
                    animationDuration={1000}
                  />
                )}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card stats-pane">
          <h4>Optimal Allocation</h4>
          {optimal ? (
            <div className="optimal-details">
              <div className="main-metrics">
                <div className="metric">
                  <span className="label">Expected Return</span>
                  <span className="value">{(optimal.expectedReturn * 100).toFixed(2)}%</span>
                </div>
                <div className="metric">
                  <span className="label">Volatility</span>
                  <span className="value">{(optimal.volatility * 100).toFixed(2)}%</span>
                </div>
                <div className="metric highlighted">
                  <span className="label">Sharpe Ratio</span>
                  <span className="value">{optimal.sharpeRatio.toFixed(3)}</span>
                </div>
              </div>

              <div className="weights-list">
                <p className="section-title">Asset Weights</p>
                {selectedAssets.map((symbol, idx) => (
                  <div key={symbol} className="weight-item">
                    <div className="asset-info">
                      <span className="symbol">{symbol}</span>
                      <div className="bar-bg">
                        <motion.div 
                          className="bar-fill" 
                          initial={{ width: 0 }}
                          animate={{ width: `${optimal.weights[idx] * 100}%` }}
                          style={{ background: `hsl(${idx * 40 + 180}, 70%, 50%)` }}
                        />
                      </div>
                    </div>
                    <span className="percent">{(optimal.weights[idx] * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <TrendingUp size={48} className="muted-icon" />
              <p>Run optimization to see mathematical insights</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PortfolioOptimizer;
