import 'regenerator-runtime/runtime';
import { createRoot } from 'react-dom/client';
import './locales/i18n';
import App from './App';
import './style.css';
import './mobile.css';
import { ApiErrorBoundaryProvider } from './hooks/ApiErrorBoundaryContext';
import { preloadRHDSElements } from './utils/rhds';
import 'katex/dist/katex.min.css';
import 'katex/dist/contrib/copy-tex.js';

// Preload Red Hat Design System elements
preloadRHDSElements().catch(console.error);

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <ApiErrorBoundaryProvider>
    <App />
  </ApiErrorBoundaryProvider>,
);
