import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const originalFetch = window.fetch;
window.fetch = async (...args) => {
  const res = await originalFetch(...args);
  if (res.status === 402 && window.location.pathname !== '/dashboard/inactive') {
    window.location.href = '/dashboard/inactive';
  }
  return res;
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)