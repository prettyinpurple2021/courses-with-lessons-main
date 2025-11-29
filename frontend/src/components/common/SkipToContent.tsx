import React from 'react';

const SkipToContent: React.FC = () => {
  return (
    <a
      href="#main-content"
      className="skip-to-content"
      style={{
        position: 'absolute',
        top: '-40px',
        left: 0,
        background: '#FF1493',
        color: 'white',
        padding: '8px 16px',
        textDecoration: 'none',
        borderRadius: '0 0 4px 0',
        zIndex: 100,
        transition: 'top 0.3s ease',
      }}
      onFocus={(e) => {
        e.currentTarget.style.top = '0';
      }}
      onBlur={(e) => {
        e.currentTarget.style.top = '-40px';
      }}
    >
      Skip to main content
    </a>
  );
};

export default SkipToContent;
