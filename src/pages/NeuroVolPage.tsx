import React from 'react';
import NeuroVolStudio from '../components/volatility/NeuroVolStudio';

export const NeuroVolPage: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <NeuroVolStudio />
    </div>
  );
};

export default NeuroVolPage;
