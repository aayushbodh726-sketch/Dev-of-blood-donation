import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Droplet, Menu, X, User, LogOut, CheckCircle, Power } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { displayBloodGroup } from '../utils/bloodGroups';
import { api } from '../utils/api';

export default function Header() {
  const { user, isAuthenticated, logout, updateUser } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [toggling, setToggling] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleToggleAvailability = async () => {
    if (toggling) return;
    setToggling(true);
    try {
      const res = await api.toggleAvailability();
      if (res.success) {
        updateUser({ isAvailable: res.data.isAvailable });
      }
    } catch (err) {
      console.error('Failed to toggle availability:', err);
    } finally {
      setToggling(false);
    }
  };

  const navLinkClass = ({ isActive }) =>
    `font-medium transition-colors duration-200 relative py-1 ${
      isActive
        ? 'text-crimson-700 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-crimson-700 after:rounded-full'
        : 'text-slate-600 hover:text-crimson-700'
    }`;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-100 py-3'
          : 'bg-white/70 backdrop-blur-sm py-4 border-b border-slate-100/50'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-crimson-700 flex items-center justify-center text-white shadow-md shadow-crimson-700/20 group-hover:scale-105 transition-transform duration-200">
            <Droplet className="w-6 h-6 fill-current" />
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900">
            Life<span className="text-crimson-700">Flow</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <NavLink to="/donors" className={navLinkClass}>
            Find Donors
          </NavLink>
          <NavLink to="/request-blood" className={navLinkClass}>
            Request Blood
          </NavLink>
          <NavLink to="/active-requests" className={navLinkClass}>
            Active Requests
          </NavLink>
        </nav>

        {/* Auth / User Actions */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              {user?.role === 'DONOR' && (
                <button
                  onClick={handleToggleAvailability}
                  disabled={toggling}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
                    user?.isAvailable
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                  }`}
                  title="Toggle your availability for blood requests"
                >
                  <Power className={`w-3.5 h-3.5 ${user?.isAvailable ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>{user?.isAvailable ? 'Available to Donate' : 'Unavailable'}</span>
                </button>
              )}

              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-10 h-10 rounded-full bg-crimson-700 text-white font-bold flex items-center justify-center shadow-md hover:ring-4 hover:ring-crimson-100 transition-all duration-200 focus:outline-none"
                >
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 animate-scale-in z-50">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="badge-blood text-xs">
                          {displayBloodGroup(user?.bloodGroup)}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {user?.role}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                        navigate('/');
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-medium flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="btn-secondary py-2.5 px-4 text-sm">
                Login
              </Link>
              <Link to="/register" className="btn-primary py-2.5 px-4 text-sm">
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-100 px-4 pt-2 pb-6 space-y-4 animate-slide-down">
          <nav className="flex flex-col space-y-3">
            <Link
              to="/donors"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
            >
              Find Donors
            </Link>
            <Link
              to="/request-blood"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
            >
              Request Blood
            </Link>
            <Link
              to="/active-requests"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
            >
              Active Requests
            </Link>
          </nav>

          <div className="pt-4 border-t border-slate-100">
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-crimson-700 text-white font-bold flex items-center justify-center">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{user?.name}</p>
                    <p className="text-xs text-slate-500">{displayBloodGroup(user?.bloodGroup)} • {user?.role}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                    navigate('/');
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 font-semibold flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-secondary text-center py-2 text-sm"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary text-center py-2 text-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
