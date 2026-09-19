import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom' // <-- ВАЖНО: HashRouter вместо BrowserRouter
import App from './App.tsx'
import './index.css' // Убедись, что этот файл существует, иначе удали эту строку

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
)
