import React from 'react';
import NeuroBacktestStudio from '../components/backtest/NeuroBacktestStudio';

export const NeuroBacktestPage: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <NeuroBacktestStudio />
    </div>
  );
};

export default NeuroBacktestPage;
