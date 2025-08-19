import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import { AuthProvider } from './contexts/AuthContext'; // 추가

// ResizeObserver 경고 무시
const originalError = console.error;
console.error = (...args) => {
  if (
    args[0] &&
    typeof args[0] === 'string' &&
    (args[0].includes('ResizeObserver loop completed with undelivered notifications') ||
      args[0].includes('ResizeObserver loop limit exceeded'))
  ) {
    return;
  }
  originalError.call(console, ...args);
};

const originalWarn = console.warn;
console.warn = (...args) => {
  if (args[0] && typeof args[0] === 'string' && args[0].includes('ResizeObserver')) {
    return;
  }
  originalWarn.call(console, ...args);
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);

reportWebVitals();
