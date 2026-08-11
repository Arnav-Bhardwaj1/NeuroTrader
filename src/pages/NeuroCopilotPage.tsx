import React from 'react';
import NeuroCopilotStudio from '../components/copilot/NeuroCopilotStudio';

export const NeuroCopilotPage: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <NeuroCopilotStudio />
    </div>
  );
};

export default NeuroCopilotPage;
