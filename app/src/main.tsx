import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Router from './Router.tsx'
import { ToastProvider } from './contexts/ToastContext.tsx'
import { ReaderProvider } from './contexts/ReaderContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <ReaderProvider>
        <Router />
      </ReaderProvider>
    </ToastProvider>
  </StrictMode>,
)
