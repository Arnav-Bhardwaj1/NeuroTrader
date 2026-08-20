import React from 'react';
import NeuroAlphaStudio from '../components/alpha/NeuroAlphaStudio';

export const NeuroAlphaPage: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <NeuroAlphaStudio />
    </div>
  );
};

export default NeuroAlphaPage;
