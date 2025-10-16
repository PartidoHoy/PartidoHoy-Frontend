import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './App.css'
import App from './App.jsx'

// Importar herramientas de diagnóstico
import './utils/authFixer.js'
import './utils/error403Monitor.js'
import './utils/endpointTester.js'
import './utils/routeLoopFixer.js'
import './utils/dashboardDiagnostic.js'
import './utils/userServiceChecker.js'
import './utils/profileValidator.js'
import './utils/profileValidatorImproved.js'
import './utils/newUserFixer.js'
import './utils/backendAuthFixer.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
