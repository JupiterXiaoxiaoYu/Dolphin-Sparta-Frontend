import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThirdwebProvider } from "thirdweb/react";
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThirdwebProvider>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
    </ThirdwebProvider>
  </React.StrictMode>
);