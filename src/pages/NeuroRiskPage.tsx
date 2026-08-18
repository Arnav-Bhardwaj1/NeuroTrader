import React from 'react';
import NeuroRiskStudio from '../components/risk/NeuroRiskStudio';

export const NeuroRiskPage: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <NeuroRiskStudio />
    </div>
  );
};

export default NeuroRiskPage;
