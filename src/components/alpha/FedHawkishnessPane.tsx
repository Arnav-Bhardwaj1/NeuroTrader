import React, { useState } from 'react';
import {
  MessageSquare,
  Activity,
  Award
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import {
  NeuroAlphaEngine,
  type FedSpeechNLP
} from '../../lib/NeuroAlphaEngine';

export const FedHawkishnessPane: React.FC = () => {
  const [speeches] = useState<FedSpeechNLP[]>(() => NeuroAlphaEngine.getFedSpeechNLPData());
  const [selectedSpeech, setSelectedSpeech] = useState<FedSpeechNLP>(speeches[0]);

  return (
    <div className="fed-pane-container">
      {/* Header Banner */}
      <div className="fed-header glass-card">
        <div className="title-box">
          <h3>
            <MessageSquare size={20} className="text-cyan icon-pulse" /> Federal Reserve Speeches NLP Hawkishness Tracker
          </h3>
          <p className="text-muted">Natural Language Processing (NLP) sentiment scoring of Fed speeches, FOMC statements, and rate expectation shifts.</p>
        </div>

        <div className="net-hawkish-badge">
          <span className="lbl">Powell Keynote NLP Score:</span>
          <span className="val text-amber">+{selectedSpeech.netSentimentScore} (Hawkish)</span>
        </div>
      </div>

      {/* Main Grid: Sentiment Line Chart & Speech Inspector */}
      <div className="fed-main-grid">
        {/* Left: Net Hawkishness Sentiment Timeline */}
        <div className="chart-card glass-card">
          <div className="card-title-row">
            <h4>
              <Activity size={16} className="text-cyan" /> Net Hawkishness NLP Score Timeline
            </h4>
            <span className="tag">Scale: -10 (Dovish) to +10 (Hawkish)</span>
          </div>

          <div style={{ height: 320, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={speeches} margin={{ top: 15, right: 15, bottom: 5, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis domain={[-10, 10]} stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' }} />
                <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" />
                <Line type="monotone" dataKey="netSentimentScore" stroke="var(--accent-amber)" strokeWidth={2.5} name="Net Hawkishness Score" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Key Phrases & Speech Feed */}
        <div className="feed-col glass-card">
          <div className="card-title-row">
            <h4>
              <Award size={16} className="text-violet" /> Transcripts &amp; NLP Phrase Extraction
            </h4>
            <span className="tag">{speeches.length} Speeches Logged</span>
          </div>

          <div className="speeches-list">
            {speeches.map(sp => (
              <div
                key={sp.title}
                className={`speech-card ${selectedSpeech.title === sp.title ? 'active' : ''}`}
                onClick={() => setSelectedSpeech(sp)}
              >
                <div className="sp-header">
                  <span className="sp-speaker">{sp.speaker}</span>
                  <span className={`sp-score ${sp.netSentimentScore >= 0 ? 'text-amber' : 'text-green'}`}>
                    {sp.netSentimentScore >= 0 ? `+${sp.netSentimentScore}` : sp.netSentimentScore}
                  </span>
                </div>
                <div className="sp-title">{sp.title} ({sp.date})</div>
                <div className="phrases-row">
                  {sp.keyPhrases.map(ph => (
                    <span key={ph} className="phrase-pill">{ph}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FedHawkishnessPane;
