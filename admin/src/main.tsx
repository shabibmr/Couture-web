import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import LogRocket from 'logrocket'
import App from './App.tsx'
import './index.css'

// Initialize LogRocket for admin portal
LogRocket.init('ruvera/couture-admin');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
