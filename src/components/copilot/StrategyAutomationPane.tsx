import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Plus,
  Play,
  Pause,
  Trash2,
  Clock
} from 'lucide-react';
import { NeuroCopilotEngine, type AutonomousRule } from '../../lib/NeuroCopilotEngine';

export const StrategyAutomationPane: React.FC = () => {
  const [rules, setRules] = useState<AutonomousRule[]>(() => NeuroCopilotEngine.getAutonomousRules());
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newRuleName, setNewRuleName] = useState<string>('New Breakout Bot');
  const [newRuleAsset, setNewRuleAsset] = useState<string>('NVDA');
  const [newRuleCondition, setNewRuleCondition] = useState<string>('RSI < 30 AND GEX > 0');
  const [newRuleCapital, setNewRuleCapital] = useState<number>(12000);

  const toggleRuleActive = (id: string) => {
    setRules(rules.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  const deleteRule = (id: string) => {
    setRules(rules.filter(r => r.id !== id));
  };

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    const created: AutonomousRule = {
      id: `rule-${Date.now()}`,
      name: newRuleName,
      active: true,
      asset: newRuleAsset,
      triggerCondition: newRuleCondition,
      action: 'BUY',
      positionSizeUsd: newRuleCapital,
      stopLossPct: 2.0,
      takeProfitPct: 5.0,
      winRate: 71.0,
      totalTrades: 1,
      netProfitUsd: 450,
      lastTriggered: 'Just now',
    };
    setRules([...rules, created]);
    setShowAddModal(false);
  };

  return (
    <div className="automation-pane-container">
      {/* Header Banner */}
      <div className="automation-header glass-card">
        <div>
          <h3>
            <Brain size={20} className="text-violet icon-pulse" /> Autonomous AI Execution Rules Engine
          </h3>
          <p className="text-muted">Configure algorithmic trigger bots that synthesize microstructural liquidity, GEX boundaries, and AI sentiment signals.</p>
        </div>
        <button className="add-rule-btn" onClick={() => setShowAddModal(true)}>
          <Plus size={16} />
          <span>Create Autonomous Bot Rule</span>
        </button>
      </div>

      {/* Rules List */}
      <div className="rules-grid">
        {rules.map(rule => (
          <motion.div
            key={rule.id}
            layout
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rule-card glass-card ${rule.active ? 'active' : 'disabled'}`}
          >
            <div className="rule-card-header">
              <div className="rule-title-group">
                <span className={`status-dot ${rule.active ? 'online' : 'offline'}`} />
                <h4>{rule.name}</h4>
                <span className="asset-pill">{rule.asset}</span>
              </div>
              <div className="rule-actions">
                <button
                  className={`toggle-btn ${rule.active ? 'active' : ''}`}
                  onClick={() => toggleRuleActive(rule.id)}
                  title={rule.active ? 'Pause Bot' : 'Activate Bot'}
                >
                  {rule.active ? <Pause size={14} /> : <Play size={14} />}
                </button>
                <button className="delete-btn" onClick={() => deleteRule(rule.id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="rule-condition-box">
              <label>IF-THEN Trigger Condition:</label>
              <code>{rule.triggerCondition}</code>
            </div>

            <div className="rule-stats-row">
              <div className="stat">
                <span className="lbl">Position Capital</span>
                <span className="val">${rule.positionSizeUsd.toLocaleString()}</span>
              </div>
              <div className="stat">
                <span className="lbl">Win Rate</span>
                <span className="val text-cyan">{rule.winRate}%</span>
              </div>
              <div className="stat">
                <span className="lbl">Total Trades</span>
                <span className="val">{rule.totalTrades}</span>
              </div>
              <div className="stat">
                <span className="lbl">Net Profit</span>
                <span className="val text-green">+${rule.netProfitUsd.toLocaleString()}</span>
              </div>
            </div>

            <div className="rule-card-footer">
              <span className="last-sync"><Clock size={12} /> Triggered: {rule.lastTriggered}</span>
              <span className="sl-tp">SL: -{rule.stopLossPct}% | TP: +{rule.takeProfitPct}%</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create Rule Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-backdrop"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="modal-card glass-card"
              onClick={e => e.stopPropagation()}
            >
              <h3>Create Autonomous AI Trigger Bot</h3>
              <form onSubmit={handleCreateRule} className="modal-form">
                <div className="form-group">
                  <label>Rule Name:</label>
                  <input
                    type="text"
                    value={newRuleName}
                    onChange={e => setNewRuleName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Target Asset Symbol:</label>
                  <select value={newRuleAsset} onChange={e => setNewRuleAsset(e.target.value)}>
                    <option value="NVDA">NVDA</option>
                    <option value="AAPL">AAPL</option>
                    <option value="BTC/USD">BTC/USD</option>
                    <option value="TSLA">TSLA</option>
                    <option value="SPY">SPY</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Trigger Logical Condition:</label>
                  <input
                    type="text"
                    value={newRuleCondition}
                    onChange={e => setNewRuleCondition(e.target.value)}
                    placeholder="e.g. RSI < 30 AND GEX > 0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Allocated Position Capital ($):</label>
                  <input
                    type="number"
                    value={newRuleCapital}
                    onChange={e => setNewRuleCapital(Number(e.target.value))}
                    step={1000}
                    required
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="submit-btn">Deploy Bot Rule</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StrategyAutomationPane;
