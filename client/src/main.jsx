import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import './index.css'

/**
 * Supabase recovery links land as:
 *   https://site/#access_token=...&type=recovery&refresh_token=...
 * which conflicts with HashRouter paths (#/reset-password).
 * Capture tokens into sessionStorage, then send the user to #/reset-password.
 */
function captureAuthTokensFromHash() {
  const hash = window.location.hash || ''
  if (!hash.includes('access_token=')) return false

  // Strip leading # and any route prefix before the query-like params
  let qs = hash.replace(/^#/, '')
  const idx = qs.indexOf('access_token=')
  if (idx > 0) qs = qs.slice(idx)

  const params = new URLSearchParams(qs)
  const accessToken = params.get('access_token')
  const refreshToken = params.get('refresh_token') || ''
  const type = params.get('type')

  if (!accessToken) return false
  if (type && type !== 'recovery' && type !== 'magiclink') return false

  try {
    sessionStorage.setItem('lifeflow_recovery_token', accessToken)
    if (refreshToken) {
      sessionStorage.setItem('lifeflow_recovery_refresh', refreshToken)
    }
  } catch {
    // sessionStorage may be blocked; still try to route with tokens in a temporary hash
  }

  // Navigate to the reset-password route (HashRouter) without keeping raw tokens in the URL
  const path = window.location.pathname.endsWith('/')
    ? window.location.pathname
    : `${window.location.pathname}/`
  window.location.replace(`${window.location.origin}${path}#/reset-password`)
  return true
}

if (!captureAuthTokensFromHash()) {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <HashRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </HashRouter>
    </React.StrictMode>
  )
}
