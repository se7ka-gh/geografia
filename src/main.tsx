import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom' // <-- Заменили здесь
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter> {/* <-- И здесь */}
      <App />
    </HashRouter>
  </React.StrictMode>,
)
