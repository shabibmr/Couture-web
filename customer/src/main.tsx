import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import LogRocket from 'logrocket'
import './index.css'
import './firebase'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'

// Initialize LogRocket
LogRocket.init('ruvera/couture');

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

createRoot(rootElement).render(
  <StrictMode>
    <AuthProvider>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </AuthProvider>
  </StrictMode>,
)
