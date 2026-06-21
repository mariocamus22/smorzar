import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from './contexts/ThemeProvider'
import { initSentry } from './lib/sentry'
import { initAmplitude } from './lib/amplitude'
import './index.css'
import App from './App.tsx'

initSentry()
initAmplitude()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
