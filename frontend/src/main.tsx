import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const isIsolated = window.crossOriginIsolated;

if (isIsolated) {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
} else {
  console.log("Waiting for Cross-Origin Isolation (reloading)...");

  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;">Loading environment...</div>';
  }
}