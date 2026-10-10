import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Droplet, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { api, getPasswordResetRedirectUrl } from '../utils/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await api.forgotPassword(email.trim(), getPasswordResetRedirectUrl());
      setSent(true);
    } catch (err) {
      setError(err.message || 'Could not send reset email. Please try again.');
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
                If an account exists for <span className="font-semibold text-slate-800">{email.trim()}</span>,
                we sent a password reset link. Open the email and follow the link to choose a new password.
              </p>
              <p className="text-xs text-slate-500">
                Did not receive it? Check spam/junk, wait a minute, then try again.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSent(false);
                  setError('');
                }}
                className="btn-secondary w-full py-3 text-sm mt-2"
              >
                Resend link
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
                  disabled={submitting}
                  className="btn-primary w-full py-3.5 text-base shadow-lg shadow-crimson-700/20"
                >
                  {submitting ? 'Sending reset link...' : 'Send Reset Link'}
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
