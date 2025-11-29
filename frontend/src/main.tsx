import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';
import { initAllPerformanceMonitoring } from './utils/performanceMonitoring';
import { client } from './lib/appwrite';

// Initialize performance monitoring
if (process.env.NODE_ENV === 'production') {
  initAllPerformanceMonitoring();
}

// Ping Appwrite backend to verify setup
client.ping().catch((error) => {
  console.warn('Appwrite ping failed:', error);
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
