import React from 'react';

export const LandingPage = ({ onNavigateToAuth }) => {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'fixed', inset: 0, background: '#030712', zIndex: 1 }}>
      <iframe
        src="/landing/index.html"
        title="EventFlow Landing Page"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block'
        }}
      />
    </div>
  );
};
