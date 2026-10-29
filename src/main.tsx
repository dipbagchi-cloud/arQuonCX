import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { FrontendMetaProvider } from './context/FrontendMetaContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <FrontendMetaProvider>
          <App />
        </FrontendMetaProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
