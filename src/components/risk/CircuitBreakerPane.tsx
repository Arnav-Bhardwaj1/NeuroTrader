import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Play,
  Pause,
  Zap
} from 'lucide-react';
import {
  NeuroRiskEngine,
  type CircuitBreaker
} from '../../lib/NeuroRiskEngine';

export const CircuitBreakerPane: React.FC = () => {
  const [breakers, setBreakers] = useState<CircuitBreaker[]>(() => NeuroRiskEngine.getCircuitBreakers());

  const toggleBreaker = (id: string) => {
    setBreakers(breakers.map(b => b.id === id ? { ...b, active: !b.active } : b));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SAFE': return 'status-safe';
      case 'WARNING': return 'status-warning';
      case 'BREACHED': return 'status-breached';
      default: return 'status-safe';
    }
  };

  return (
    <div className="circuit-pane-container">
      {/* Header Banner */}
      <div className="circuit-header glass-card">
        <div>
          <h3>
            <ShieldCheck size={20} className="text-green icon-pulse" /> Automated Portfolio Circuit Breakers &amp; Risk Shield
          </h3>
          <p className="text-muted">Real-time risk monitoring thresholds with automated position hedging and drawdown protection.</p>
        </div>
        <div className="active-breakers-tag">
          {breakers.filter(b => b.active).length} Active Risk Shields
        </div>
      </div>

      {/* Circuit Breakers Cards Grid */}
      <div className="breakers-grid">
        {breakers.map(b => (
          <motion.div
            key={b.id}
            layout
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`breaker-card glass-card ${b.active ? 'active' : 'disabled'}`}
          >
            <div className="breaker-card-header">
              <div className="title-group">
                <span className={`status-dot ${b.status.toLowerCase()}`} />
                <h4>{b.name}</h4>
              </div>

              <div className="breaker-actions">
                <span className={`status-badge ${getStatusBadge(b.status)}`}>
                  {b.status}
                </span>
                <button
                  className={`toggle-btn ${b.active ? 'active' : ''}`}
                  onClick={() => toggleBreaker(b.id)}
                  title={b.active ? 'Disable Shield' : 'Enable Shield'}
                >
                  {b.active ? <Pause size={14} /> : <Play size={14} />}
                </button>
              </div>
            </div>

            {/* Meter Bar */}
            <div className="breaker-meter-box">
              <div className="meter-labels">
                <span>Current: <strong>{b.unit === '$' ? `$${b.currentValue.toLocaleString()}` : `${b.currentValue}${b.unit}`}</strong></span>
                <span>Limit: <strong>{b.unit === '$' ? `$${b.thresholdValue.toLocaleString()}` : `${b.thresholdValue}${b.unit}`}</strong></span>
              </div>
              <div className="meter-bar">
                <div
                  className={`meter-fill ${b.status.toLowerCase()}`}
                  style={{ width: `${Math.min(100, (b.currentValue / b.thresholdValue) * 100)}%` }}
                />
              </div>
            </div>

            {/* Auto-Hedge Action Rule */}
            <div className="hedge-action-box">
              <label><Zap size={13} className="text-amber" /> Automated Circuit Breaker Action:</label>
              <p>{b.autoHedgeAction}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CircuitBreakerPane;
