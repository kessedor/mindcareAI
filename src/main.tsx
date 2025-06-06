import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import * as Sentry from '@sentry/react';
import './index.css';

Sentry.init({
  dsn: "https://6f571143f13c79fe35868f0aa9b5e58e@o4509443228303360.ingest.de.sentry.io/4509453369737296",
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 1.0,
  sendDefaultPii: true,
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);