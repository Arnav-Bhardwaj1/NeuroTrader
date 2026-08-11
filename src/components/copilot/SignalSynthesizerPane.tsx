import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  TrendingUp,
  Percent,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  ArrowRight
} from 'lucide-react';
import { NeuroCopilotEngine, type CopilotSignal } from '../../lib/NeuroCopilotEngine';

export const SignalSynthesizerPane: React.FC = () => {
  const [signals] = useState<CopilotSignal[]>(() => NeuroCopilotEngine.getCopilotSignals());
  const [selectedSignal, setSelectedSignal] = useState<CopilotSignal>(signals[0]);
  const [filterAsset, setFilterAsset] = useState<string>('ALL');
  const [orderAmount, setOrderAmount] = useState<number>(5000);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  const filteredSignals = signals.filter(sig => {
    if (filterAsset === 'ALL') return true;
    return sig.assetClass === filterAsset;
  });

  const handleExecuteOrder = (sig: CopilotSignal) => {
    setOrderSuccess(`Simulated order executed for ${sig.symbol}! ${sig.type} ${orderAmount} USD at $${sig.currentPrice}.`);
    setTimeout(() => setOrderSuccess(null), 4000);
  };

  const getBadgeClass = (type: string) => {
    switch (type) {
      case 'STRONG_BUY':
      case 'BUY':
        return 'signal-badge-buy';
      case 'STRONG_SELL':
      case 'SELL':
        return 'signal-badge-sell';
      default:
        return 'signal-badge-neutral';
    }
  };

  return (
    <div className="signal-pane-container">
      {/* Notifications */}
      <AnimatePresence>
        {orderSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="copilot-alert alert-success"
          >
            <CheckCircle2 size={18} />
            <span>{orderSuccess}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="signal-grid">
        {/* Left Side: Signal Feed List */}
        <div className="signal-list-section">
          <div className="section-header">
            <h4>
              <Brain size={18} className="text-cyan" /> Multi-Asset Neural Signal Feed
            </h4>
            <div className="filter-group">
              {['ALL', 'EQUITY', 'CRYPTO'].map(ac => (
                <button
                  key={ac}
                  className={`filter-btn ${filterAsset === ac ? 'active' : ''}`}
                  onClick={() => setFilterAsset(ac)}
                >
                  {ac}
                </button>
              ))}
            </div>
          </div>

          <div className="signals-feed">
            {filteredSignals.map(sig => (
              <motion.div
                key={sig.id}
                whileHover={{ scale: 1.01 }}
                className={`signal-card ${selectedSignal.id === sig.id ? 'active' : ''}`}
                onClick={() => setSelectedSignal(sig)}
              >
                <div className="signal-card-top">
                  <div className="symbol-info">
                    <span className="symbol-ticker">{sig.symbol}</span>
                    <span className="symbol-name">{sig.name}</span>
                  </div>
                  <span className={`signal-badge ${getBadgeClass(sig.type)}`}>
                    {sig.type.replace('_', ' ')}
                  </span>
                </div>

                <div className="signal-card-middle">
                  <div className="price-tag">
                    ${sig.currentPrice.toLocaleString()}
                  </div>
                  <div className="confidence-meter">
                    <div className="conf-label">
                      <span>Neural Confidence</span>
                      <strong>{sig.confidence}%</strong>
                    </div>
                    <div className="conf-bar">
                      <div className="conf-fill" style={{ width: `${sig.confidence}%` }} />
                    </div>
                  </div>
                </div>

                <div className="signal-card-bottom">
                  <span className="tf-badge">
                    <Clock size={12} /> {sig.timeframe}
                  </span>
                  <span className="rr-ratio">
                    R:R <strong>1:{sig.riskRewardRatio}</strong>
                  </span>
                  <span className="kelly-size">
                    Kelly Rec: <strong>{sig.kellySizePercent}%</strong>
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Side: Detailed Signal Inspector & Order Simulation */}
        <div className="signal-inspector-section">
          <div className="inspector-card glass-card">
            <div className="inspector-header">
              <div>
                <h3>{selectedSignal.symbol} — Signal Analytics</h3>
                <p className="text-muted">{selectedSignal.name} • Timeframe: {selectedSignal.timeframe}</p>
              </div>
              <span className={`signal-badge large ${getBadgeClass(selectedSignal.type)}`}>
                {selectedSignal.type.replace('_', ' ')}
              </span>
            </div>

            {/* Target Price Matrix */}
            <div className="targets-grid">
              <div className="target-box entry">
                <label>Target Entry</label>
                <span className="target-val">${selectedSignal.entryPrice.toLocaleString()}</span>
              </div>
              <div className="target-box stop">
                <label>Stop Loss</label>
                <span className="target-val text-red">${selectedSignal.stopLoss.toLocaleString()}</span>
              </div>
              <div className="target-box tp1">
                <label>Take Profit 1</label>
                <span className="target-val text-green">${selectedSignal.targetPrice1.toLocaleString()}</span>
              </div>
              <div className="target-box tp2">
                <label>Take Profit 2</label>
                <span className="target-val text-cyan">${selectedSignal.targetPrice2.toLocaleString()}</span>
              </div>
            </div>

            {/* Reasoning Vector */}
            <div className="reasoning-box">
              <h4>
                <Layers size={16} className="text-violet" /> Neural Model Factor Breakdown
              </h4>
              <div className="factor-list">
                <div className="factor-item">
                  <span className="factor-title"><TrendingUp size={14} className="text-cyan" /> Technical Pattern:</span>
                  <p>{selectedSignal.reasoning.technical}</p>
                </div>
                <div className="factor-item">
                  <span className="factor-title"><Brain size={14} className="text-violet" /> AI Sentiment:</span>
                  <p>{selectedSignal.reasoning.sentiment}</p>
                </div>
                <div className="factor-item">
                  <span className="factor-title"><Percent size={14} className="text-green" /> Microstructure Flow:</span>
                  <p>{selectedSignal.reasoning.microstructure}</p>
                </div>
                <div className="factor-item">
                  <span className="factor-title"><AlertCircle size={14} className="text-amber" /> Options GEX Bias:</span>
                  <p>{selectedSignal.reasoning.gexBias}</p>
                </div>
              </div>
            </div>

            {/* Order Execution Ticket Simulator */}
            <div className="order-ticket">
              <h4>Simulated Order Ticket</h4>
              <div className="ticket-inputs">
                <div className="ticket-field">
                  <label>Order Capital ($):</label>
                  <input
                    type="number"
                    value={orderAmount}
                    onChange={e => setOrderAmount(Number(e.target.value))}
                    step={500}
                    min={100}
                  />
                </div>
                <div className="ticket-field">
                  <label>Est. Slippage:</label>
                  <span className="slippage-text">0.02% (2ms latency)</span>
                </div>
              </div>

              <button
                className={`execute-order-btn ${selectedSignal.type.includes('BUY') ? 'buy' : 'sell'}`}
                onClick={() => handleExecuteOrder(selectedSignal)}
              >
                <span>Execute Simulated {selectedSignal.type.includes('BUY') ? 'BUY' : 'SELL'} Order</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignalSynthesizerPane;
