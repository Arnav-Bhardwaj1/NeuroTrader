import React from 'react';
import NeuroMacroStudio from '../components/macro/NeuroMacroStudio';

export const NeuroMacroPage: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <NeuroMacroStudio />
    </div>
  );
};

export default NeuroMacroPage;
