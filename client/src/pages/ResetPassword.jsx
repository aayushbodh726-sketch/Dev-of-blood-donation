import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Droplet, Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { api, extractRecoveryTokensFromUrl } from '../utils/api';

const RECOVERY_TOKEN_KEY = 'lifeflow_recovery_token';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [linkInvalid, setLinkInvalid] = useState(false);

  useEffect(() => {
    const fromUrl = extractRecoveryTokensFromUrl();
    if (fromUrl?.accessToken) {
      sessionStorage.setItem(RECOVERY_TOKEN_KEY, fromUrl.accessToken);
      setAccessToken(fromUrl.accessToken);
      if (window.location.hash.includes('access_token') || window.location.search.includes('access_token')) {
        window.history.replaceState(
          null,
          '',
          `${window.location.pathname}${window.location.search.split('&access_token')[0]}#/reset-password`
        );
      }
      return;
    }

    const stored = sessionStorage.getItem(RECOVERY_TOKEN_KEY);
    if (stored) {
      setAccessToken(stored);
      return;
    }

    setLinkInvalid(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!accessToken) {
      setError('Invalid or expired reset link. Please request a new one.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await api.resetPassword(password, accessToken);
      sessionStorage.removeItem(RECOVERY_TOKEN_KEY);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.message || 'Could not reset password. The link may have expired.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-20 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-crimson-700 flex items-center justify-center text-white shadow-md">
              <Droplet className="w-6 h-6 fill-current" />
            </div>
            <span className="text-3xl font-black text-slate-900 tracking-tight">
              Life<span className="text-crimson-700">Flow</span>
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-slate-900">Reset Password</h2>
          <p className="text-slate-600 text-sm mt-1">Choose a new password for your account</p>
        </div>

        <div className="card p-8 shadow-xl border border-slate-100">
          {linkInvalid && !success && (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Link invalid or expired</h3>
              <p className="text-sm text-slate-600">
                This password reset link is missing, invalid, or has already been used. Request a new one to continue.
              </p>
              <Link to="/forgot-password" className="btn-primary w-full py-3 text-sm inline-block text-center">
                Request new reset link
              </Link>
              <Link to="/login" className="block text-sm font-semibold text-crimson-700 hover:underline">
                Back to Sign In
              </Link>
            </div>
          )}

          {success && (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Password updated</h3>
              <p className="text-sm text-slate-600">
                Your password has been changed. Redirecting you to sign in…
              </p>
              <Link to="/login" className="btn-primary w-full py-3 text-sm inline-block text-center">
                Sign In now
              </Link>
            </div>
          )}

          {!linkInvalid && !success && (
            <>
              {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm font-medium border border-red-200 mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">New Password</label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="input-field pl-11 pr-11"
                      autoComplete="new-password"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Repeat new password"
                      className="input-field pl-11"
                      autoComplete="new-password"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full py-3.5 text-base shadow-lg shadow-crimson-700/20"
                >
                  {submitting ? 'Updating password...' : 'Update Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
