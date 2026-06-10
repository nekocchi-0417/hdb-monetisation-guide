import React from 'react'
import ReactDOM from 'react-dom/client'
import { LangProvider } from './i18n/index.js'
import App from './App.jsx'
import './styles/tokens.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LangProvider initial="en">
      <App />
    </LangProvider>
  </React.StrictMode>,
)
