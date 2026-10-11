import { Link } from 'react-router-dom';
import { Heart, AlertCircle, Sparkles, ShieldCheck } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-[85vh] pt-28 pb-16 flex items-center justify-center overflow-hidden bg-gradient-to-b from-crimson-50/60 via-white to-slate-50">
      {/* Background Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-crimson-200/30 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
      <div className="absolute top-1/3 right-10 w-72 h-72 bg-rose-300/20 rounded-full blur-2xl pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fade-in">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-crimson-100/80 border border-crimson-200/60 text-crimson-800 text-xs sm:text-sm font-semibold mb-8 shadow-sm backdrop-blur-sm animate-slide-up">
          <Sparkles className="w-4 h-4 text-crimson-600" />
          <span>Connecting Donors & Saving Lives 24/7</span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] animate-slide-up">
          Every Drop Counts, <br className="hidden sm:inline" />
          <span className="text-gradient">Save Lives Today</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed animate-slide-up">
          LifeFlow bridges the gap between generous blood donors and patient emergency needs in real time across your city.
        </p>

        {/* Call to actions */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
          <Link to="/register" className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 text-base px-8 py-4 shadow-xl shadow-crimson-700/20">
            <Heart className="w-5 h-5 fill-current" />
            Become a Donor
          </Link>
          <Link to="/request-blood" className="btn-secondary w-full sm:w-auto flex items-center justify-center gap-2 text-base px-8 py-4">
            <AlertCircle className="w-5 h-5 text-crimson-600" />
            Request Blood Urgently
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="mt-14 pt-8 border-t border-slate-200/60 max-w-xl mx-auto flex items-center justify-around text-slate-500 text-xs sm:text-sm font-medium">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Verified Donors
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Instant Alerts
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            100% Free Service
          </div>
        </div>
      </div>
    </section>
  );
}
