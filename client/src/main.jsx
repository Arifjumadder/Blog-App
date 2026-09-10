import React from 'react'
import ReactDOM from 'react-dom/client'
import axios from 'axios'
import App from './App.jsx'
import { AuthContextProvider } from './context/authContext.jsx'
import './index.css'

axios.defaults.withCredentials = true
axios.defaults.baseURL = import.meta.env.VITE_API_URL || ""

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthContextProvider>
      <App />
    </AuthContextProvider>

  </React.StrictMode>,
)
