import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight
} from 'lucide-react';
import {
  NeuroVolEngine,
  type VolArbOpportunity
} from '../../lib/NeuroVolEngine';

export const VolArbScannerPane: React.FC = () => {
  const [opportunities] = useState<VolArbOpportunity[]>(() => NeuroVolEngine.getVolArbOpportunities());
  const [selectedOpp, setSelectedOpp] = useState<VolArbOpportunity>(opportunities[0]);

  const getMispricingBadge = (type: string) => {
    return type === 'OVERVALUED_SELL_VOL' ? 'badge-sell' : 'badge-buy';
  };

  return (
    <div className="arb-pane-container">
      {/* Header Banner */}
      <div className="arb-header glass-card">
        <div>
          <h3>
            <Sparkles size={20} className="text-amber icon-pulse" /> Volatility Arbitrage &amp; IV-RV Mispricing Scanner
          </h3>
          <p className="text-muted">Exploit dislocations between Options Implied Volatility (IV) and Historical Realized Volatility (RV).</p>
        </div>
        <div className="active-opps-tag">
          {opportunities.length} Volatility Spreads Found
        </div>
      </div>

      {/* Main Grid: Opportunities List & Detail Card */}
      <div className="arb-main-grid">
        {/* Left: Volatility Arbitrage Opportunities List */}
        <div className="opps-col">
          <div className="col-header">
            <h4>IV vs RV Mispricing Opportunities</h4>
            <span className="tag">Spread &gt; 500 BPS</span>
          </div>

          <div className="opps-feed">
            {opportunities.map(opp => (
              <motion.div
                key={opp.id}
                whileHover={{ scale: 1.01 }}
                className={`opp-card glass-card ${selectedOpp.id === opp.id ? 'active' : ''}`}
                onClick={() => setSelectedOpp(opp)}
              >
                <div className="opp-card-top">
                  <span className="opp-symbol">{opp.symbol} ${opp.strike} {opp.optionType} ({opp.expiration})</span>
                  <span className={`opp-badge ${getMispricingBadge(opp.mispricingType)}`}>
                    {opp.mispricingType.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="opp-card-mid">
                  <div className="spread-box">
                    <span className="lbl">IV vs RV Spread:</span>
                    <span className="val text-amber">+{opp.ivRvSpreadBps} BPS</span>
                  </div>
                  <div className="edge-box">
                    <span className="lbl">Expected Edge:</span>
                    <span className="val text-green">+{opp.expectedEdgePct}%</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right: Selected Volatility Trade Inspector */}
        <div className="inspector-col glass-card">
          <div className="inspector-header">
            <div>
              <h3>{selectedOpp.symbol} ${selectedOpp.strike} {selectedOpp.optionType}</h3>
              <p className="text-muted">Expiration: {selectedOpp.expiration}</p>
            </div>
            <span className={`opp-badge large ${getMispricingBadge(selectedOpp.mispricingType)}`}>
              {selectedOpp.mispricingType.replace(/_/g, ' ')}
            </span>
          </div>

          <div className="metrics-row">
            <div className="m-box">
              <label>Implied Volatility (IV)</label>
              <span className="m-val text-amber">{selectedOpp.currentIvPct}%</span>
            </div>
            <div className="m-box">
              <label>30D Realized Vol (RV)</label>
              <span className="m-val text-cyan">{selectedOpp.historicalRvPct}%</span>
            </div>
            <div className="m-box">
              <label>Expected Vol Edge</label>
              <span className="m-val text-green">+{selectedOpp.expectedEdgePct}%</span>
            </div>
          </div>

          <div className="trade-action-box">
            <h4>Recommended Volatility Trade Execution:</h4>
            <p>
              {selectedOpp.mispricingType === 'OVERVALUED_SELL_VOL'
                ? `Sell ${selectedOpp.symbol} $${selectedOpp.strike} Put to harvest rich +${selectedOpp.ivRvSpreadBps} BPS volatility risk premium.`
                : `Buy ${selectedOpp.symbol} $${selectedOpp.strike} Call to capture underpriced volatility ahead of catalyst.`}
            </p>
          </div>

          <div className="action-footer">
            <button className="execute-vol-btn">
              <span>Execute Volatility Arbitrage Order</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolArbScannerPane;
