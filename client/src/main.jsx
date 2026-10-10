import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import './index.css'

/**
 * Supabase recovery links land as:
 *   https://site/#access_token=...&type=recovery&refresh_token=...
 * or sometimes with query params. That conflicts with HashRouter (#/reset-password).
 *
 * Capture tokens into sessionStorage, clean the URL to #/reset-password,
 * then always mount the React app (never leave a blank page).
 */
function captureAuthTokensFromUrl() {
  try {
    const hash = window.location.hash || ''
    const search = window.location.search || ''

    const tryParse = (raw) => {
      if (!raw || !raw.includes('access_token=')) return null
      let qs = raw.replace(/^[#?]/, '')
      const idx = qs.indexOf('access_token=')
      if (idx > 0) qs = qs.slice(idx)
      const params = new URLSearchParams(qs)
      const accessToken = params.get('access_token')
      if (!accessToken) return null
      const type = params.get('type')
      // Accept recovery links; also accept if type is missing (some clients omit it)
      if (type && type !== 'recovery' && type !== 'magiclink') return null
      return {
        accessToken,
        refreshToken: params.get('refresh_token') || '',
      }
    }

    const tokens =
      tryParse(hash) ||
      tryParse(search) ||
      tryParse(hash.includes('#') ? hash.split('#').slice(1).join('#') : '')

    if (!tokens) return

    sessionStorage.setItem('lifeflow_recovery_token', tokens.accessToken)
    if (tokens.refreshToken) {
      sessionStorage.setItem('lifeflow_recovery_refresh', tokens.refreshToken)
    }

    // Clean the URL without a full navigation (avoids blank white page)
    const path = window.location.pathname.endsWith('/')
      ? window.location.pathname
      : `${window.location.pathname}/`
    window.history.replaceState(
      null,
      '',
      `${window.location.origin}${path}#/reset-password`
    )
  } catch (err) {
    console.error('Failed to capture recovery tokens', err)
  }
}

captureAuthTokensFromUrl()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </HashRouter>
  </React.StrictMode>
)
