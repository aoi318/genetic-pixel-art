import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const isIsolated = window.crossOriginIsolated;

if (isIsolated) {
  // 修正箇所: ReactDOM.createRoot ではなく createRoot を直接使う
  createRoot(document.getElementById('root')!).render(
    // 修正箇所: React.StrictMode ではなく StrictMode を直接使う
    <StrictMode>
      <App />
    </StrictMode>,
  )
} else {
  // ここはそのままでOK
  console.log("Waiting for Cross-Origin Isolation (reloading)...");

  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;">Loading environment...</div>';
  }
}