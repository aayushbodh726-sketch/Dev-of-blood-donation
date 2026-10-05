import { Droplet, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-crimson-700 flex items-center justify-center text-white">
                <Droplet className="w-5 h-5 fill-current" />
              </div>
              <span className="text-2xl font-black text-white tracking-tight">
                Life<span className="text-crimson-500">Flow</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
              LifeFlow is an open blood donation network designed to bridge emergency requests with nearby willing donors rapidly, securely, and seamlessly.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 tracking-wider uppercase">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/donors" className="hover:text-white transition-colors">
                  Find Donors
                </Link>
              </li>
              <li>
                <Link to="/request-blood" className="hover:text-white transition-colors">
                  Emergency Request
                </Link>
              </li>
              <li>
                <Link to="/active-requests" className="hover:text-white transition-colors">
                  Active Requests
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">
                  Become a Donor
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 tracking-wider uppercase">Emergency Support</h4>
            <p className="text-sm text-slate-400 mb-2">Available 24/7 for urgent assistance.</p>
            <p className="text-white font-bold text-lg">1800-LIFEFLOW</p>
            <p className="text-xs text-slate-500 mt-1">support@lifeflow-donations.org</p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} LifeFlow Platform. All rights reserved.</p>
          <div className="flex items-center gap-1 text-slate-400">
            Created with <Heart className="w-3.5 h-3.5 text-crimson-500 fill-current" /> for saving lives.
          </div>
        </div>
      </div>
    </footer>
  );
}
