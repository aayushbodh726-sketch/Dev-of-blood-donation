import React, { useState, useEffect, useRef } from 'react';
import {
  Droplet,
  Heart,
  Users,
  Flame,
  Zap,
  Activity,
  Sparkles,
  MapPin,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Radio,
  Share2,
  Award,
  ChevronRight,
  Plus,
  Compass,
  AlertCircle
} from 'lucide-react';

export default function GenZHome({
  donors = [],
  requests = [],
  livesSaved = 142,
  activeRequestsCount = 3,
  onNavigateToTab,
  onOpenRequestModal,
  onOpenDonorModal,
  onFulfillRequest,
  onOpenQuizModal,
}) {
  const [selectedType, setSelectedType] = useState('O-');
  const [pledged, setPledged] = useState(false);
  const [floatingEmojis, setFloatingEmojis] = useState([]);
  const canvasRef = useRef(null);

  const bloodGroupPowers = {
    'O-': {
      title: 'Universal Superhero',
      aura: '2,500 Aura Points',
      givesTo: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
      vibe: 'Main character energy. Emergency rooms rely on you when seconds count.',
      rarity: '7% of population • Ultra High Demand',
      badge: 'UNIVERSAL GOD TIER'
    },
    'O+': {
      title: 'The Backbone Lifesaver',
      aura: '1,800 Aura Points',
      givesTo: ['O+', 'A+', 'B+', 'AB+'],
      vibe: 'Most needed blood in hospitals. 80% of trauma patients can receive your cells.',
      rarity: '37% of population • Top Requested',
      badge: 'COMMUNITY MVP'
    },
    'A+': {
      title: 'The Surge Defender',
      aura: '1,600 Aura Points',
      givesTo: ['A+', 'AB+'],
      vibe: 'Constantly required for complex heart surgeries and oncology patients.',
      rarity: '34% of population • Essential Force',
      badge: 'SURGICAL HERO'
    },
    'A-': {
      title: 'Rare Vanguard',
      aura: '2,100 Aura Points',
      givesTo: ['A-', 'A+', 'AB-', 'AB+'],
      vibe: 'Rare and precious. Critical for infant transfusions and immune support.',
      rarity: '6% of population • High Priority',
      badge: 'ELITE RESCUE'
    },
    'B+': {
      title: 'Resilience Titan',
      aura: '1,750 Aura Points',
      givesTo: ['B+', 'AB+'],
      vibe: 'Crucial for thalassemia and chronic blood condition care.',
      rarity: '9% of population • Crucial Lifeline',
      badge: 'GUARDIAN DROP'
    },
    'B-': {
      title: 'The Rare Sentinel',
      aura: '2,300 Aura Points',
      givesTo: ['B-', 'B+', 'AB-', 'AB+'],
      vibe: 'Fewer than 1 in 50 people have this. When emergencies hit, you are the answer.',
      rarity: '2% of population • Critical Rarity',
      badge: 'MYTHIC TIER'
    },
    'AB+': {
      title: 'Universal Plasma Royalty',
      aura: '2,200 Aura Points',
      givesTo: ['AB+'],
      vibe: 'Universal plasma donor! Your platelets and plasma heal burn and trauma victims of any type.',
      rarity: '3% of population • Plasma Royalty',
      badge: 'PLASMA VIP'
    },
    'AB-': {
      title: 'The rarest of all',
      aura: '3,000 Aura Points',
      givesTo: ['AB-', 'AB+'],
      vibe: 'The rarest blood type on Earth. You literally hold the rarest gift in your veins.',
      rarity: '1% of population • Pure Gold',
      badge: 'ONE IN A MILLION'
    },
  };

  const handleFireConfetti = (e) => {
    const id = Date.now() + Math.random();
    const newItems = ['🩸', '❤️', '🔥', '✨', '⚡'].map((emoji, idx) => ({
      id: id + idx,
      emoji,
      x: (e?.clientX || window.innerWidth / 2) + (Math.random() * 80 - 40),
      y: (e?.clientY || window.innerHeight / 2) + (Math.random() * 40 - 20),
    }));
    setFloatingEmojis((prev) => [...prev, ...newItems]);
    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((item) => !newItems.some((n) => n.id === item.id)));
    }, 1800);
  };

  // Canvas interactive floating blood cells
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext ? canvas.getContext('2d') : null;
    if (!ctx) return;
    let animationFrameId;

    let width = (canvas.width = canvas.offsetWidth || (typeof window !== 'undefined' ? window.innerWidth : 800));
    let height = (canvas.height = canvas.offsetHeight || 600);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth || (typeof window !== 'undefined' ? window.innerWidth : 800);
      height = canvas.height = canvas.offsetHeight || 600;
    };
    window.addEventListener('resize', handleResize);

    const particles = Array.from({ length: 32 }, () => ({
      x: Math.random() * (width || 800),
      y: Math.random() * (height || 600),
      radius: Math.random() * 12 + 4,
      vx: (Math.random() - 0.5) * 0.7,
      vy: (Math.random() - 0.5) * 0.7,
      color: `rgba(220, 38, 38, ${Math.random() * 0.35 + 0.15})`,
      pulse: Math.random() * Math.PI,
    }));

    const render = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.03;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const dynamicRadius = p.radius + Math.sin(p.pulse) * 2;

        const grad = ctx.createRadialGradient(p.x, p.y, dynamicRadius * 0.2, p.x, p.y, dynamicRadius);
        grad.addColorStop(0, 'rgba(239, 68, 68, 0.45)');
        grad.addColorStop(1, 'rgba(153, 27, 27, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, dynamicRadius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const openAppeals = requests.filter((r) => r.status === 'OPEN').slice(0, 3);

  return (
    <div className="space-y-12 pb-16 text-slate-100">
      {/* FLOATING CONFETTI PARTICLES */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {floatingEmojis.map((item) => (
          <span
            key={item.id}
            style={{
              left: `${item.x}px`,
              top: `${item.y}px`,
              transform: 'translate(-50%, -50%)',
              animation: 'floatSlow 1.8s ease-out forwards',
            }}
            className="absolute text-2xl select-none"
          >
            {item.emoji}
          </span>
        ))}
      </div>

      {/* 1. TICKER STREAM / MARQUEE RIBBON (Thrine / OriginKit Style) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-950 via-crimson-900 to-black border border-crimson-500/30 py-2.5 shadow-2xl backdrop-blur-xl">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-8 text-xs font-black uppercase tracking-widest text-red-200">
          <span className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" /> LIVE PULSE NETWORK ACTIVE
          </span>
          <span className="text-red-500">•</span>
          <span className="flex items-center gap-2 text-white">
            <Flame className="w-3.5 h-3.5 text-amber-400" /> 1 DROP = 3 LIVES SAVED (NO CAP)
          </span>
          <span className="text-red-500">•</span>
          <span className="text-rose-300">
            🩸 {livesSaved}+ LIVES IMPACTED
          </span>
          <span className="text-red-500">•</span>
          <span className="text-amber-300">
            ⚡ 15 MINUTES TRANSFORMS AN EMERGENCY WARD
          </span>
          <span className="text-red-500">•</span>
          <span className="text-white">
            🏥 ZERO GATEKEEPING • 100% LIFEFLOW
          </span>
          <span className="text-red-500">•</span>
          <span className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" /> LIVE PULSE NETWORK ACTIVE
          </span>
          <span className="text-red-500">•</span>
          <span className="flex items-center gap-2 text-white">
            <Flame className="w-3.5 h-3.5 text-amber-400" /> 1 DROP = 3 LIVES SAVED (NO CAP)
          </span>
        </div>
      </div>

      {/* 2. MAIN GEN-Z HERO SECTION (OriginKit + Thrine Aesthetic) */}
      <div className="relative rounded-3xl overflow-hidden border border-red-500/30 bg-gradient-to-b from-[#18090c] via-[#0f0406] to-[#080203] p-6 sm:p-12 shadow-[0_0_60px_rgba(220,38,38,0.2)]">
        {/* Animated Background Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none opacity-60 z-0"
        />

        {/* Ambient Gradient Glows */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-red-600/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          {/* Badge Sticker */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-600/20 border border-red-500/40 text-red-300 text-xs font-black uppercase tracking-wider mb-6 backdrop-blur-md animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>ORIGIN OF LIFE • GEN-Z BLOOD REVOLUTION</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.05] mb-6">
            DONATE BLOOD. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-300 to-amber-300">
              SAVE REAL LIVES.
            </span> <br />
            <span className="text-white/90">MAIN CHARACTER ENERGY.</span>
          </h1>

          <p className="text-base sm:text-xl text-zinc-300 font-medium leading-relaxed mb-8 max-w-2xl">
            Doomscrolling TikTok won't replenish emergency ICUs. 15 minutes of donating your blood directly preserves 3 lives in your local city hospitals. Zero red tape, real-time alerts, pure impact.
          </p>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={(e) => {
                handleFireConfetti(e);
                onOpenDonorModal();
              }}
              className="px-7 py-4 rounded-2xl font-black text-base bg-gradient-to-r from-red-600 to-crimson-600 hover:from-red-500 hover:to-crimson-500 text-white shadow-[0_0_25px_rgba(220,38,38,0.6)] hover:shadow-[0_0_35px_rgba(239,68,68,0.9)] transform hover:-translate-y-0.5 active:translate-y-0 transition cursor-pointer flex items-center gap-3 border border-red-400/40"
            >
              <Droplet className="w-5 h-5 fill-current" />
              <span>Donate Now & Earn Aura</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenRequestModal}
              className="px-6 py-4 rounded-2xl font-black text-base bg-white/10 hover:bg-white/15 text-white border border-white/20 backdrop-blur-md hover:border-white/40 transition cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-5 h-5 text-red-400" />
              <span>Broadcast Emergency Request</span>
            </button>

            <button
              onClick={onOpenQuizModal}
              className="px-5 py-4 rounded-2xl font-bold text-sm text-zinc-400 hover:text-white bg-transparent hover:bg-white/5 transition flex items-center gap-2 cursor-pointer"
            >
              <Compass className="w-4 h-4 text-amber-400" />
              <span>30-Sec Eligibility Vibe Check</span>
            </button>
          </div>

          {/* Social Proof Badges */}
          <div className="mt-10 pt-6 border-t border-white/10 flex flex-wrap items-center gap-6 text-xs text-zinc-400 font-semibold">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-white font-bold">{donors.length} Verified Donors Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Medical Confidentiality</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Avg Alert Response Time: 4 mins</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. INTERACTIVE MATCH-MY-TYPE BLOOD RADAR (OriginKit Component) */}
      <div className="rounded-3xl border border-red-500/20 bg-gradient-to-br from-[#12070a] to-[#0c0507] p-6 sm:p-8 backdrop-blur-2xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-700/40 text-red-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Zap className="w-3 h-3" /> RADAR VISUALIZER
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              What’s Your Blood Superpower?
            </h2>
            <p className="text-sm text-zinc-400">
              Select your blood group to see your medical superpower, aura points, and compatibility reach.
            </p>
          </div>

          <div className="text-xs font-bold text-red-400 bg-red-950/60 border border-red-500/30 px-3.5 py-1.5 rounded-xl self-start md:self-auto flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>{bloodGroupPowers[selectedType]?.aura || '2,000 Aura'}</span>
          </div>
        </div>

        {/* Blood Group Selectors */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5 mb-8">
          {Object.keys(bloodGroupPowers).map((bg) => {
            const isSelected = selectedType === bg;
            return (
              <button
                key={bg}
                onClick={() => setSelectedType(bg)}
                className={`py-3 px-2 rounded-2xl font-black text-sm sm:text-base transition cursor-pointer relative overflow-hidden flex flex-col items-center justify-center gap-1 ${
                  isSelected
                    ? 'bg-gradient-to-b from-red-600 to-crimson-700 text-white shadow-[0_0_20px_rgba(220,38,38,0.6)] scale-105 border border-red-400'
                    : 'bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 hover:border-white/20'
                }`}
              >
                <span>{bg}</span>
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Power Spotlight Box */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-black/40 border border-white/10 rounded-2xl p-6">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-red-600/30 border border-red-500/50 text-red-300 text-xs font-extrabold uppercase">
                {bloodGroupPowers[selectedType]?.badge}
              </span>
              <span className="text-xs font-semibold text-zinc-400">
                {bloodGroupPowers[selectedType]?.rarity}
              </span>
            </div>

            <h3 className="text-2xl font-black text-white">
              {bloodGroupPowers[selectedType]?.title}
            </h3>

            <p className="text-sm text-zinc-300 leading-relaxed">
              {bloodGroupPowers[selectedType]?.vibe}
            </p>

            <div className="pt-2">
              <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Compatible with Patients Of:
              </div>
              <div className="flex flex-wrap gap-2">
                {bloodGroupPowers[selectedType]?.givesTo.map((target) => (
                  <span
                    key={target}
                    className="px-3 py-1 rounded-xl bg-red-600/20 text-red-200 border border-red-500/40 text-xs font-black animate-pulse"
                  >
                    {target}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between p-5 rounded-xl bg-gradient-to-b from-red-950/40 to-black/60 border border-red-500/20">
            <div>
              <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Aura Rating
              </div>
              <div className="text-2xl font-black text-amber-300">
                {bloodGroupPowers[selectedType]?.aura}
              </div>
              <p className="text-xs text-zinc-400 mt-2">
                Every verified donation rewards digital lifesaver badges, prioritized emergency matching, and leaderboard status.
              </p>
            </div>

            <button
              onClick={() => onNavigateToTab('compatibility')}
              className="mt-6 w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-2 border border-white/10 transition cursor-pointer"
            >
              <span>Explore Interactive Match Matrix</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. ORIGINKIT BENTO GRID: LIVE EMERGENCY APPEALS & REAL-TIME STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* BENTO CARD 1: URGENT ACTIVE APPEALS */}
        <div className="md:col-span-2 rounded-3xl border border-red-500/20 bg-gradient-to-b from-[#140609] to-[#0a0204] p-6 sm:p-8 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                <h3 className="text-xl font-black text-white tracking-tight">
                  Critical Emergency Radar
                </h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-red-600/30 text-red-300 border border-red-500/30 uppercase">
                  Live Dispatch
                </span>
              </div>

              <button
                onClick={() => onNavigateToTab('requests')}
                className="text-xs font-bold text-red-400 hover:text-red-300 transition flex items-center gap-1 cursor-pointer"
              >
                <span>All Requests ({requests.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Appeal Cards List */}
            <div className="space-y-3.5">
              {openAppeals.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-crimson-800 text-white font-black text-lg flex items-center justify-center shadow-lg shrink-0">
                      {req.bloodGroup}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-white text-sm">{req.patientName}</h4>
                        <span className={`text-[10px] font-extrabold px-2 py-0.2 rounded ${
                          req.urgency === 'CRITICAL' ? 'bg-red-950 text-red-300 border border-red-500/40' : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                        }`}>
                          {req.urgency}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-red-400" />
                        <span>{req.hospital}, {req.city}</span>
                        <span>•</span>
                        <span className="text-zinc-300 font-semibold">{req.unitsRequired} unit(s) needed</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => onFulfillRequest(req.id)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-crimson-600 hover:from-red-500 hover:to-crimson-500 text-white font-black text-xs shadow-md transition cursor-pointer"
                    >
                      I Can Donate 🩸
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400">
            <span>Hospital requests verified by medical staff</span>
            <button
              onClick={onOpenRequestModal}
              className="text-red-400 font-bold hover:underline"
            >
              + Submit New Patient Appeal
            </button>
          </div>
        </div>

        {/* BENTO CARD 2: REAL IMPACT NUMBERS */}
        <div className="rounded-3xl border border-red-500/20 bg-gradient-to-b from-[#18090c] to-[#0c0406] p-6 sm:p-8 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-700/40 text-red-400 text-xs font-bold uppercase tracking-wider mb-4">
              <Award className="w-3 h-3 text-amber-300" /> COMMUNITY SCORECARD
            </div>

            <h3 className="text-xl font-black text-white mb-6">
              Measurable Human Impact
            </h3>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center font-bold">
                  <Heart className="w-6 h-6 fill-current" />
                </div>
                <div>
                  <div className="text-2xl font-black text-white">{livesSaved}</div>
                  <div className="text-xs text-zinc-400 font-medium">Lives Saved to Date</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center font-bold">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-black text-white">{donors.length}</div>
                  <div className="text-xs text-zinc-400 font-medium">Ready Donors Online</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-rose-600/20 text-rose-400 flex items-center justify-center font-bold">
                  <Droplet className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-black text-white">298 L</div>
                  <div className="text-xs text-zinc-400 font-medium">Whole Blood & Platelets</div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateToTab('map')}
            className="mt-6 w-full py-3 rounded-2xl bg-red-600/20 hover:bg-red-600/30 text-red-300 font-black text-xs border border-red-500/30 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <MapPin className="w-4 h-4 text-red-400" />
            <span>Find Nearest Donation Centers</span>
          </button>
        </div>
      </div>

      {/* 5. VIBE CHECK & GEN-Z MYTH BUSTER STRIP */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-[#12070a] via-[#1a080c] to-[#12070a] p-6 sm:p-10">
        <div className="max-w-2xl mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black uppercase tracking-wider mb-2">
            ✨ ZERO MYTHS • PURE FACTS
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Common Excuses Debunked (No Lies Detected)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
            <div className="text-2xl font-black text-red-400">“I have tattoos / piercings.”</div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              If your ink or piercing was done in a licensed studio over 3 months ago, you are 100% good to donate. Come on through!
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
            <div className="text-2xl font-black text-amber-400">“Does it hurt?”</div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              It feels like a tiny pinch for 2 seconds. Afterward, you chill for 10 minutes, get free apple juice and snacks, and walk out knowing you saved a life.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
            <div className="text-2xl font-black text-rose-400">“How often can I donate?”</div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Whole blood can be donated every 56 days (about 8 weeks). Your body naturally regenerates your red blood cells within weeks!
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <span className="text-xs text-zinc-400 font-medium">
            Take our interactive 6-question screening quiz to verify your status in 30 seconds.
          </span>
          <button
            onClick={onOpenQuizModal}
            className="px-5 py-2.5 rounded-xl bg-white text-zinc-900 font-extrabold text-xs hover:bg-zinc-200 transition cursor-pointer"
          >
            Launch Eligibility Quiz →
          </button>
        </div>
      </div>
    </div>
  );
}
