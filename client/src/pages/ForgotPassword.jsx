import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Droplet, Mail, ArrowLeft, CheckCircle2, Clock } from 'lucide-react';
import { api, getPasswordResetRedirectUrl } from '../utils/api';

const COOLDOWN_KEY = 'lifeflow_reset_cooldown_until';
const COOLDOWN_MS = 60 * 1000; // 60s client-side pause after each send

function getRemainingSeconds() {
  try {
    const until = Number(localStorage.getItem(COOLDOWN_KEY) || 0);
    return Math.max(0, Math.ceil((until - Date.now()) / 1000));
  } catch {
    return 0;
  }
}

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(getRemainingSeconds);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const id = setInterval(() => {
      const left = getRemainingSeconds();
      setCooldown(left);
      if (left <= 0) clearInterval(id);
    }, 500);
    return () => clearInterval(id);
  }, [cooldown]);

  const startCooldown = () => {
    const until = Date.now() + COOLDOWN_MS;
    try {
      localStorage.setItem(COOLDOWN_KEY, String(until));
    } catch {
      /* ignore */
    }
    setCooldown(Math.ceil(COOLDOWN_MS / 1000));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (cooldown > 0) {
      setError(`Please wait ${cooldown}s before requesting another reset email.`);
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await api.forgotPassword(email.trim(), getPasswordResetRedirectUrl());
      startCooldown();
      setSent(true);
    } catch (err) {
      const msg = err.message || 'Could not send reset email. Please try again.';
      // Supabase rate limit — ask user to wait longer
      if (/rate|limit|too many/i.test(msg)) {
        startCooldown();
        setError(
          'Too many reset emails were requested. Please wait about 15 minutes, check your inbox/spam for an earlier email, then try again.'
        );
      } else {
        setError(msg);
      }
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
          <h2 className="text-2xl font-bold text-slate-900">Forgot Password</h2>
          <p className="text-slate-600 text-sm mt-1">
            We will email you a secure link to reset your password
          </p>
        </div>

        <div className="card p-8 shadow-xl border border-slate-100">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Check your email</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                If an account exists for{' '}
                <span className="font-semibold text-slate-800">{email.trim()}</span>, we sent a
                password reset link. Open the email and follow the link to choose a new password.
              </p>
              <p className="text-xs text-slate-500">
                Did not receive it? Check spam/junk. Avoid clicking Send repeatedly — that triggers a
                temporary block.
              </p>
              <button
                type="button"
                disabled={cooldown > 0}
                onClick={() => {
                  setSent(false);
                  setError('');
                }}
                className="btn-secondary w-full py-3 text-sm mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cooldown > 0 ? (
                  <span className="inline-flex items-center gap-2 justify-center">
                    <Clock className="w-4 h-4" />
                    Resend available in {cooldown}s
                  </span>
                ) : (
                  'Resend link'
                )}
              </button>
              <Link to="/login" className="block text-sm font-semibold text-crimson-700 hover:underline pt-2">
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm font-medium border border-red-200 mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="input-field pl-11"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || cooldown > 0}
                  className="btn-primary w-full py-3.5 text-base shadow-lg shadow-crimson-700/20 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting
                    ? 'Sending reset link...'
                    : cooldown > 0
                      ? `Wait ${cooldown}s to try again`
                      : 'Send Reset Link'}
                </button>
              </form>

              <Link
                to="/login"
                className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-slate-600 hover:text-crimson-700"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
