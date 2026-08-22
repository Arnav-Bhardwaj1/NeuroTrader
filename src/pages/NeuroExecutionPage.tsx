import React from 'react';
import NeuroExecutionStudio from '../components/execution/NeuroExecutionStudio';

export const NeuroExecutionPage: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <NeuroExecutionStudio />
    </div>
  );
};

export default NeuroExecutionPage;
