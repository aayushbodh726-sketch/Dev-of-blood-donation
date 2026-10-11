import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Droplet, Heart, User, Mail, Lock, Eye, EyeOff, MapPin, Phone, Building } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BLOOD_GROUP_OPTIONS } from '../utils/bloodGroups';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    bloodGroup: 'A_POS',
    role: 'DONOR',
    city: '',
    state: '',
    zipCode: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.city || !formData.state) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-24 px-4">
      <div className="max-w-xl w-full">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-crimson-700 flex items-center justify-center text-white shadow-md">
              <Droplet className="w-6 h-6 fill-current" />
            </div>
            <span className="text-3xl font-black text-slate-900 tracking-tight">
              Life<span className="text-crimson-700">Flow</span>
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-slate-900">Create Your Account</h2>
          <p className="text-slate-600 text-sm mt-1">Join our network to donate or request blood</p>
        </div>

        {/* Card */}
        <div className="card p-8 shadow-xl border border-slate-100">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm font-medium border border-red-200 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Cards */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">I am registering as a *</label>
              <div className="grid grid-cols-2 gap-4">
                <label
                  className={`cursor-pointer border-2 rounded-2xl p-4 flex items-center gap-3 transition-all ${
                    formData.role === 'DONOR'
                      ? 'border-crimson-700 bg-crimson-50 ring-2 ring-crimson-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="DONOR"
                    checked={formData.role === 'DONOR'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className="w-10 h-10 rounded-xl bg-crimson-100 text-crimson-700 flex items-center justify-center shrink-0">
                    <Heart className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">Blood Donor</div>
                    <div className="text-[11px] text-slate-500">I want to donate</div>
                  </div>
                </label>

                <label
                  className={`cursor-pointer border-2 rounded-2xl p-4 flex items-center gap-3 transition-all ${
                    formData.role === 'RECIPIENT'
                      ? 'border-crimson-700 bg-crimson-50 ring-2 ring-crimson-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="RECIPIENT"
                    checked={formData.role === 'RECIPIENT'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">Recipient</div>
                    <div className="text-[11px] text-slate-500">I need blood</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="input-field"
                  required
                />
              </div>
            </div>

            {/* Password & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min 6 characters"
                    className="input-field pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="input-field"
                />
              </div>
            </div>

            {/* Blood Group */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Blood Group *</label>
              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                className="input-field font-semibold text-crimson-800"
              >
                {BLOOD_GROUP_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label} ({opt.value})
                  </option>
                ))}
              </select>
            </div>

            {/* City, State, Zip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g. Mumbai"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">State *</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="e.g. Maharashtra"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Zip Code</label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  placeholder="400001"
                  className="input-field"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full py-4 text-base shadow-lg shadow-crimson-700/20"
            >
              {submitting ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-600 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-crimson-700 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
