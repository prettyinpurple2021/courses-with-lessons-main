import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';
import { initAllPerformanceMonitoring } from './utils/performanceMonitoring';

// Initialize performance monitoring
if (process.env.NODE_ENV === 'production') {
  initAllPerformanceMonitoring();
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
