import React, { useState, useEffect } from 'react';
import {
  Heart,
  Calendar,
  Clock,
  MapPin,
  Award,
  CheckCircle,
  Plus,
  Droplet,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  User,
  AlertCircle,
  X,
  Sparkles,
  Phone,
  FileText,
  Star,
  Crown,
  Trophy,
  Shield,
  Lock,
  Download,
  Share2,
  Bell,
  BellRing,
  Building,
  PhoneCall,
  MessageSquare,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  KeyRound
} from 'lucide-react';
import CalendarScheduler from './CalendarScheduler';

export const DONOR_RANKS = [
  {
    level: 1,
    id: 'rookie',
    name: 'First Drop Lifesaver',
    tier: 'Rookie',
    minDonations: 1,
    icon: Droplet,
    color: 'text-red-500',
    accentColor: '#EF4444',
    bgGradient: 'from-rose-50 to-red-100',
    border: 'border-red-200',
    badgeBg: 'bg-red-500',
    perk: 'Digital LifeFlow Donor Card & ID Number',
    livesSaved: 3,
    description: 'Began your journey to save lives with your first whole blood donation.',
  },
  {
    level: 2,
    id: 'bronze',
    name: 'Bronze Lifesaver',
    tier: 'Bronze',
    minDonations: 3,
    icon: Award,
    color: 'text-amber-800',
    accentColor: '#92400E',
    bgGradient: 'from-amber-50 to-amber-100',
    border: 'border-amber-300',
    badgeBg: 'bg-amber-800',
    perk: 'Community Hero Badge & Emergency SMS Dispatch',
    livesSaved: 9,
    description: 'Demonstrated steadfast commitment with at least 3 verified blood donations.',
  },
  {
    level: 3,
    id: 'silver',
    name: 'Silver Lifesaver',
    tier: 'Silver',
    minDonations: 5,
    icon: Shield,
    color: 'text-slate-600',
    accentColor: '#475569',
    bgGradient: 'from-slate-100 to-gray-200',
    border: 'border-slate-300',
    badgeBg: 'bg-slate-600',
    perk: 'Silver Priority Queue & Verified Donor Credential',
    livesSaved: 15,
    description: 'Reached 5 donations, bringing renewed health to over 15 hospital patients.',
  },
  {
    level: 4,
    id: 'gold',
    name: 'Gold Lifesaver',
    tier: 'Gold',
    minDonations: 10,
    icon: Star,
    color: 'text-amber-500',
    accentColor: '#F59E0B',
    bgGradient: 'from-amber-100 to-yellow-200',
    border: 'border-yellow-400',
    badgeBg: 'bg-amber-500',
    perk: 'Hospital Honor Roll, VIP Donor Desk & Gold Lapel Pin',
    livesSaved: 30,
    description: 'An outstanding milestone: 10 donations! You have sustained dozens of trauma surgeries.',
  },
  {
    level: 5,
    id: 'platinum',
    name: 'Platinum Hero',
    tier: 'Platinum',
    minDonations: 15,
    icon: Crown,
    color: 'text-purple-600',
    accentColor: '#9333EA',
    bgGradient: 'from-purple-50 to-indigo-100',
    border: 'border-purple-300',
    badgeBg: 'bg-purple-600',
    perk: 'Regional Blood Center Wall of Fame & Annual Hero Gala Invitation',
    livesSaved: 45,
    description: 'An elite humanitarian answering urgent emergency calls 15 times.',
  },
  {
    level: 6,
    id: 'legendary',
    name: 'Legendary Guardian',
    tier: 'Legendary',
    minDonations: 25,
    icon: Trophy,
    color: 'text-emerald-600',
    accentColor: '#059669',
    bgGradient: 'from-emerald-50 to-teal-100',
    border: 'border-emerald-300',
    badgeBg: 'bg-emerald-600',
    perk: 'Lifetime Guardian Medallion & Honorary Blood Bank Ambassador',
    livesSaved: 75,
    description: 'The pinnacle of community service: over 25 donations and a lifetime of saved lives.',
  },
];

export default function DonorDashboard({
  currentDonor,
  allDonors = [],
  onSwitchDonor,
  donationHistory = [],
  appointments = [],
  notifications = [],
  initialSubTab = null,
  onAcceptRequest,
  onDeclineRequest,
  onMarkNotificationRead,
  preselectedCenter = null,
  onNavigateToMap,
  onOpenQuiz,
  onScheduleAppointment,
  onCancelAppointment,
  onLogDonation,
  onToggleAvailability,
  onOpenAuthModal = null,
}) {
  const [activeSubTab, setActiveSubTab] = useState(
    initialSubTab || (preselectedCenter ? 'schedule' : 'overview')
  ); // 'overview' | 'requests' | 'schedule' | 'ranks' | 'appointments' | 'history'
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedBadgeDetail, setSelectedBadgeDetail] = useState(null);

  // Filter donor-specific notifications
  const donorNotifications = notifications.filter((n) => n.donorId === currentDonor?.id);
  const pendingRequests = donorNotifications.filter((n) => n.status === 'PENDING');
  const unreadCount = donorNotifications.filter((n) => !n.read).length;

  // React to initialSubTab changes from parent
  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Auto switch to schedule tab if a center was selected from the map
  useEffect(() => {
    if (preselectedCenter) {
      setActiveSubTab('schedule');
    }
  }, [preselectedCenter]);

  // New appointment form state
  const [newAppointment, setNewAppointment] = useState({
    date: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0],
    time: '10:00 AM',
    center: 'Metropolitan Blood Services - Main Center',
    address: '420 Lexington Ave, Suite 300, New York, NY 10017',
    type: 'Whole Blood',
    notes: '',
  });

  // Log new donation form state
  const [newDonationLog, setNewDonationLog] = useState({
    date: new Date().toISOString().split('T')[0],
    center: 'Community Blood Drive',
    city: currentDonor ? `${currentDonor.city}, ${currentDonor.state}` : 'New York, NY',
    type: 'Whole Blood',
    units: 1,
    volumeMl: 450,
    impact: 'Transfused to surgical trauma patient',
  });

  if (!currentDonor) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-gray-200 shadow-sm">
        <p className="text-gray-500">Please select or register a donor profile to view the personal dashboard.</p>
      </div>
    );
  }

  // Filter history and appointments for current donor
  const donorHistory = donationHistory.filter((h) => h.donorId === currentDonor.id);
  const donorAppointments = appointments.filter((a) => a.donorId === currentDonor.id);

  // Stats calculations
  const totalDonations = Math.max(currentDonor.totalDonations || 0, donorHistory.length);
  const estimatedLivesSaved = totalDonations * 3;
  const totalVolumeLiters = ((totalDonations * 450) / 1000).toFixed(1);

  // Calculate current rank & next tier progress
  const getCurrentRank = (donations) => {
    let current = DONOR_RANKS[0];
    let next = DONOR_RANKS[1];

    for (let i = 0; i < DONOR_RANKS.length; i++) {
      if (donations >= DONOR_RANKS[i].minDonations) {
        current = DONOR_RANKS[i];
        next = DONOR_RANKS[i + 1] || null;
      }
    }

    if (!next) {
      return {
        current,
        next: null,
        progress: 100,
        donationsLeft: 0,
        isMaxTier: true,
      };
    }

    const prevThreshold = current.minDonations;
    const nextThreshold = next.minDonations;
    const progress = Math.min(
      100,
      Math.max(
        0,
        Math.round(((donations - prevThreshold) / (nextThreshold - prevThreshold)) * 100)
      )
    );
    const donationsLeft = Math.max(0, nextThreshold - donations);

    return {
      current,
      next,
      progress,
      donationsLeft,
      isMaxTier: false,
    };
  };

  const rankInfo = getCurrentRank(totalDonations);
  const CurrentIcon = rankInfo.current.icon;

  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    if (!newAppointment.date || !newAppointment.time || !newAppointment.center) return;

    if (onScheduleAppointment) {
      onScheduleAppointment({
        id: 'apt_' + Date.now(),
        donorId: currentDonor.id,
        ...newAppointment,
        status: 'CONFIRMED',
      });
    }
    setShowScheduleModal(false);
  };

  const handleLogSubmit = (e) => {
    e.preventDefault();
    if (!newDonationLog.date || !newDonationLog.center) return;

    if (onLogDonation) {
      onLogDonation({
        id: 'hist_' + Date.now(),
        donorId: currentDonor.id,
        ...newDonationLog,
        verified: true,
      });
    }
    setShowLogModal(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* DONOR HERO PROFILE CARD */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-3xl text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-crimson-600/10 -skew-x-12 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-crimson-600 text-white font-black text-2xl sm:text-3xl flex items-center justify-center shadow-lg border-2 border-white/20">
                {currentDonor.bloodGroup}
              </div>
              <span
                className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-gray-900 flex items-center justify-center ${
                  currentDonor.isAvailable ? 'bg-green-500' : 'bg-gray-400'
                }`}
                title={currentDonor.isAvailable ? 'Available for emergency requests' : 'Currently busy'}
              />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {currentDonor.name}
                </h1>

                {/* Current Rank Pill Badge */}
                <button
                  onClick={() => setActiveSubTab('ranks')}
                  className={`text-xs font-black px-3 py-1 rounded-full border flex items-center gap-1.5 transition hover:scale-105 shadow-sm ${
                    rankInfo.current.tier === 'Gold'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-400/50'
                      : rankInfo.current.tier === 'Silver'
                      ? 'bg-slate-300/20 text-slate-200 border-slate-300/50'
                      : rankInfo.current.tier === 'Bronze'
                      ? 'bg-amber-800/30 text-amber-300 border-amber-700/50'
                      : rankInfo.current.tier === 'Platinum'
                      ? 'bg-purple-500/20 text-purple-300 border-purple-400/50'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50'
                  }`}
                  title="Click to view Donor Ranks & Badges"
                >
                  <CurrentIcon className="w-3.5 h-3.5" />
                  {rankInfo.current.name}
                </button>
              </div>

              <div className="text-xs text-gray-300 flex flex-wrap items-center gap-3 mt-1.5">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-crimson-400" /> {currentDonor.city}, {currentDonor.state}
                </span>
                <span>•</span>
                <span>Donor ID: #LF-{currentDonor.id.toUpperCase()}</span>
                <span>•</span>
                <span className="text-crimson-300 font-semibold">{currentDonor.phone}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions & Donor Switcher */}
          <div className="flex flex-wrap items-center gap-2.5">
            {allDonors.length > 1 && (
              <select
                value={currentDonor.id}
                onChange={(e) => onSwitchDonor && onSwitchDonor(e.target.value)}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-xs font-semibold text-white focus:outline-none hover:bg-white/20 transition cursor-pointer"
                title="Switch donor profile"
              >
                {allDonors.map((d) => (
                  <option key={d.id} value={d.id} className="text-gray-900">
                    Logged in as {d.name} ({d.bloodGroup})
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={() => onToggleAvailability && onToggleAvailability(currentDonor.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                currentDonor.isAvailable
                  ? 'bg-green-500/20 text-green-300 border border-green-500/40 hover:bg-green-500/30'
                  : 'bg-white/10 text-gray-300 border border-white/20 hover:bg-white/20'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${currentDonor.isAvailable ? 'bg-green-400 animate-ping' : 'bg-gray-400'}`} />
              {currentDonor.isAvailable ? 'Status: Available' : 'Status: Busy'}
            </button>

            <button
              onClick={() => setActiveSubTab('schedule')}
              className="px-4 py-2 rounded-xl bg-crimson-600 text-white font-bold text-xs hover:bg-crimson-700 shadow-md flex items-center gap-1.5 transition"
            >
              <Calendar className="w-3.5 h-3.5" /> Book by Calendar
            </button>

            {onOpenAuthModal && (
              <button
                onClick={() => onOpenAuthModal('forgot')}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition"
                title="Forgot or reset password via email verification"
              >
                <KeyRound className="w-3.5 h-3.5 text-crimson-400" /> Reset Password
              </button>
            )}
          </div>
        </div>

        {/* METRICS & RANK PROGRESS STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
            <div className="text-[11px] font-semibold text-gray-400 flex items-center gap-1.5">
              <Droplet className="w-3.5 h-3.5 text-crimson-400" /> Lifetime Donations
            </div>
            <div className="text-2xl font-black text-white mt-1">
              {totalDonations} <span className="text-xs font-medium text-gray-400">times</span>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
            <div className="text-[11px] font-semibold text-gray-400 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-crimson-400" /> Lives Impacted
            </div>
            <div className="text-2xl font-black text-crimson-400 mt-1">
              ~{estimatedLivesSaved} <span className="text-xs font-medium text-gray-400">patients</span>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
            <div className="text-[11px] font-semibold text-gray-400 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" /> Current Rank Tier
            </div>
            <div className="text-sm font-black text-amber-300 mt-2 truncate">
              {rankInfo.current.tier} Lifesaver
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
            <div className="text-[11px] font-semibold text-gray-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-green-400" /> Next Milestone
            </div>
            <div className="text-xs font-bold text-gray-200 mt-2">
              {rankInfo.isMaxTier
                ? '⭐ Highest Rank Achieved'
                : `${rankInfo.donationsLeft} to ${rankInfo.next?.tier}`}
            </div>
          </div>
        </div>
      </div>

      {/* DASHBOARD SUB-TABS (CYBER HUD NAV) */}
      <div className="flex items-center justify-between border-b border-red-500/20 overflow-x-auto py-1 scrollbar-none">
        <div className="flex space-x-2">
          {[
            { id: 'overview', label: 'Dashboard Overview' },
            {
              id: 'requests',
              label: pendingRequests.length > 0
                ? `🚨 Direct Inquiries (${pendingRequests.length})`
                : `📬 Direct Inquiries (${donorNotifications.length})`,
            },
            { id: 'schedule', label: '📅 Book by Calendar' },
            { id: 'appointments', label: `Appointments (${donorAppointments.length})` },
            { id: 'ranks', label: `Ranks & Badges (${rankInfo.current.tier})` },
            { id: 'history', label: `Donation History (${donorHistory.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`py-2.5 px-4 text-xs sm:text-sm font-black rounded-2xl transition whitespace-nowrap cursor-pointer ${
                activeSubTab === tab.id
                  ? 'bg-gradient-to-r from-red-600 to-crimson-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.5)] border border-red-400/40'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => setShowLogModal(true)}
            className="text-xs font-bold text-zinc-300 bg-white/10 border border-white/20 hover:bg-white/20 px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer backdrop-blur-md"
          >
            <Plus className="w-3.5 h-3.5 text-red-400" /> Log Past Donation
          </button>
        </div>
      </div>

      {/* TAB: DIRECT INQUIRIES & BLOOD REQUEST NOTIFICATIONS */}
      {activeSubTab === 'requests' && (
        <div className="bg-[#12070a]/90 rounded-3xl border border-red-500/20 p-6 sm:p-8 shadow-2xl space-y-6 animate-fade-in backdrop-blur-xl text-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-red-500/20">
            <div>
              <div className="flex items-center gap-2">
                <BellRing className="w-5 h-5 text-red-400" />
                <h2 className="text-xl font-black text-white">Direct Blood Inquiries & Alerts</h2>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Patients, emergency coordinators and hospitals requesting your specific blood type
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-3 py-1 rounded-full bg-red-950/60 text-red-300 font-extrabold border border-red-500/40 shadow-[0_0_15px_rgba(220,38,38,0.3)]">
                {pendingRequests.length} Pending Urgent Response
              </span>
            </div>
          </div>

          {donorNotifications.length === 0 ? (
            <div className="p-12 text-center text-zinc-400 space-y-2">
              <Bell className="w-12 h-12 text-zinc-600 mx-auto" />
              <p className="text-sm font-bold text-zinc-200">No Direct Requests Yet</p>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Whenever a patient or hospital requests blood directly from you or nearby emergencies match your {currentDonor?.bloodGroup} blood group, real-time alerts will appear right here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {donorNotifications.map((notif) => {
                const isPending = notif.status === 'PENDING';
                const isAccepted = notif.status === 'ACCEPTED';
                const isDeclined = notif.status === 'DECLINED';

                return (
                  <div
                    key={notif.id}
                    className={`p-5 rounded-2xl border transition space-y-4 ${
                      isPending
                        ? 'border-red-500/50 bg-gradient-to-br from-red-950/40 to-black shadow-[0_0_25px_rgba(220,38,38,0.25)] ring-1 ring-red-500/40'
                        : 'border-white/10 bg-black/40 hover:border-red-500/30'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            notif.urgency === 'CRITICAL'
                              ? 'bg-red-600 text-white shadow-[0_0_10px_rgba(220,38,38,0.5)]'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {notif.urgency || 'URGENT'}
                        </span>

                        <span className="text-xs font-bold text-zinc-600">•</span>

                        <span className="text-xs font-semibold text-zinc-400">
                          {notif.timestamp || 'Recent alert'}
                        </span>

                        {notif.type === 'CITY_BLOOD_MATCH' && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-gradient-to-r from-red-600 to-crimson-600 text-white flex items-center gap-1 animate-pulse border border-red-400/30">
                            📍 City & Blood Match
                          </span>
                        )}

                        {notif.type === 'DIRECT_REQUEST' && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-red-950/60 text-red-300 border border-red-500/30">
                            Direct Request for You
                          </span>
                        )}
                      </div>

                      {/* Status Tag */}
                      <div>
                        {isAccepted && (
                          <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-500/20 text-green-300 border border-green-500/40 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> Donation Pledged
                          </span>
                        )}
                        {isDeclined && (
                          <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/10 text-zinc-400 border border-white/10">
                            Declined / Unavailable
                          </span>
                        )}
                        {isPending && (
                          <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                            <Clock className="w-3.5 h-3.5 text-amber-400" /> Awaiting Your Decision
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-base font-black text-white">
                        {notif.patientName} needs {notif.units || 1} unit(s) of {notif.bloodGroup || currentDonor?.bloodGroup} Blood
                      </h3>
                      <p className="text-xs text-zinc-300 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>

                    {/* Hospital & Contact Details Strip */}
                    <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 text-xs grid grid-cols-1 sm:grid-cols-2 gap-2 text-zinc-300">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-red-400 shrink-0" />
                        <div>
                          <strong className="text-white">Hospital:</strong> {notif.hospital}
                          {notif.hospitalAddress && <span className="text-zinc-400"> ({notif.hospitalAddress})</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-red-400 shrink-0" />
                        <div>
                          <strong className="text-white">Contact:</strong> {notif.contactName} ({notif.contactPhone})
                        </div>
                      </div>
                    </div>

                    {/* Actions Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${notif.contactPhone}`}
                          className="px-3.5 py-1.5 rounded-xl border border-white/15 bg-white/5 text-zinc-200 font-bold text-xs hover:bg-white/10 flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <PhoneCall className="w-3.5 h-3.5 text-red-400" /> Call Coordinator
                        </a>
                        <a
                          href={`sms:${notif.contactPhone}?body=Hello, I am ${encodeURIComponent(currentDonor?.name || 'a LifeFlow donor')}, responding to your blood request for ${encodeURIComponent(notif.patientName)}.`}
                          className="px-3.5 py-1.5 rounded-xl border border-white/15 bg-white/5 text-zinc-200 font-bold text-xs hover:bg-white/10 flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-cyan-400" /> SMS Message
                        </a>
                      </div>

                      {isPending && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onDeclineRequest && onDeclineRequest(notif.id)}
                            className="px-4 py-2 rounded-xl border border-white/20 text-zinc-300 font-bold text-xs hover:bg-white/10 transition cursor-pointer"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => onAcceptRequest && onAcceptRequest(notif.id)}
                            className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-crimson-600 hover:from-red-500 hover:to-crimson-500 text-white font-extrabold text-xs shadow-[0_0_20px_rgba(220,38,38,0.5)] border border-red-400/30 flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" /> Accept & Pledge Donation 🔥
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB: CALENDAR APPOINTMENT SCHEDULER */}
      {activeSubTab === 'schedule' && (
        <CalendarScheduler
          currentDonor={currentDonor}
          initialCenterId={preselectedCenter?.id}
          onAppointmentConfirmed={(newApt) => {
            if (onScheduleAppointment) {
              onScheduleAppointment(newApt);
            }
            setActiveSubTab('appointments');
          }}
          onCancel={() => setActiveSubTab('appointments')}
          onOpenQuiz={onOpenQuiz}
        />
      )}

      {/* TAB: DONOR RANKS & BADGES */}
      {activeSubTab === 'ranks' && (
        <div className="space-y-6 text-slate-100">
          {/* Rank Hero Progress Card */}
          <div className="bg-[#12070a]/90 rounded-3xl border border-red-500/20 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-red-500/20">
              <div className="flex items-center gap-5">
                <div
                  className={`w-20 h-20 rounded-3xl ${rankInfo.current.badgeBg} text-white flex items-center justify-center shadow-[0_0_25px_rgba(220,38,38,0.5)] border-2 border-white/20`}
                >
                  <CurrentIcon className="w-10 h-10" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-red-400">
                      Current Rank Level {rankInfo.current.level} of {DONOR_RANKS.length}
                    </span>
                    <span className="text-xs font-semibold text-zinc-500">•</span>
                    <span className="text-xs font-semibold text-zinc-400">{totalDonations} Donations Logged</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                    {rankInfo.current.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-300 mt-1 max-w-xl">
                    {rankInfo.current.description}
                  </p>
                </div>
              </div>

              {/* Verified Badge Stamp */}
              <div className="p-4 rounded-2xl bg-black/50 border border-white/10 text-center shrink-0">
                <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  Lifesaver Status
                </div>
                <div className="text-base font-black text-green-400 mt-0.5 flex items-center justify-center gap-1">
                  <CheckCircle className="w-4 h-4" /> Active {rankInfo.current.tier}
                </div>
                <div className="text-[11px] text-zinc-400 mt-1">
                  Impact: ~{estimatedLivesSaved} Lives Saved
                </div>
              </div>
            </div>

            {/* Next Rank Progress Bar */}
            <div className="pt-6 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                <span className="font-bold text-zinc-300">
                  {rankInfo.isMaxTier
                    ? '🎉 You have unlocked the highest LifeFlow Guardian honor!'
                    : `Next Rank: ${rankInfo.next?.name} (${rankInfo.next?.minDonations} donations required)`}
                </span>
                <span className="font-extrabold text-red-400">
                  {rankInfo.isMaxTier
                    ? '100% Completed'
                    : `${rankInfo.donationsLeft} more donation(s) needed`}
                </span>
              </div>

              <div className="w-full h-3.5 bg-black/60 rounded-full overflow-hidden p-0.5 border border-white/15">
                <div
                  className="h-full bg-gradient-to-r from-red-600 via-crimson-500 to-amber-500 rounded-full transition-all duration-700 shadow-[0_0_15px_rgba(220,38,38,0.7)]"
                  style={{ width: `${Math.min(100, rankInfo.progress)}%` }}
                />
              </div>

              <div className="flex justify-between text-[11px] text-zinc-500 font-medium font-mono">
                <span>{rankInfo.current.minDonations} donations</span>
                <span>{rankInfo.next?.minDonations || 25} donations</span>
              </div>
            </div>
          </div>

          {/* BADGES GALLERY / MILESTONES GRID */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Lifesaver Badges Roadmap</h3>
                <p className="text-xs text-zinc-400">
                  Earn prestigious badges and unlock exclusive donor recognition as you donate
                </p>
              </div>
              <span className="text-xs font-bold text-zinc-300 bg-white/10 border border-white/15 px-3 py-1 rounded-xl">
                {DONOR_RANKS.filter((r) => totalDonations >= r.minDonations).length} / {DONOR_RANKS.length} Unlocked
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {DONOR_RANKS.map((rank) => {
                const isUnlocked = totalDonations >= rank.minDonations;
                const isCurrent = rank.id === rankInfo.current.id;
                const RankIcon = rank.icon;

                return (
                  <div
                    key={rank.id}
                    onClick={() => setSelectedBadgeDetail(rank)}
                    className={`rounded-2xl p-5 border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                      isCurrent
                        ? 'border-red-500/60 bg-gradient-to-br from-red-950/40 to-black ring-2 ring-red-500/30 shadow-[0_0_25px_rgba(220,38,38,0.3)]'
                        : isUnlocked
                        ? 'border-white/10 bg-black/40 hover:border-red-500/30 shadow-md text-white'
                        : 'border-white/5 bg-black/20 opacity-50 hover:opacity-80'
                    }`}
                  >
                    {isCurrent && (
                      <div className="absolute top-0 right-0 bg-gradient-to-r from-red-600 to-crimson-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-bl-xl shadow-xs border-b border-l border-red-400/40">
                        CURRENT RANK
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shadow-sm ${
                            isUnlocked
                              ? `${rank.badgeBg} text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]`
                              : 'bg-zinc-800 text-zinc-500'
                          }`}
                        >
                          <RankIcon className="w-6 h-6" />
                        </div>

                        <div>
                          {isUnlocked ? (
                            <span className="text-[11px] font-bold text-green-300 bg-green-500/20 px-2 py-0.5 rounded-full border border-green-500/30 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-green-400" /> Unlocked
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded-full flex items-center gap-1 border border-white/10">
                              <Lock className="w-3 h-3 text-zinc-500" /> {rank.minDonations} Donations
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                          Tier {rank.level} • {rank.tier}
                        </div>
                        <h4 className="text-base font-extrabold text-white mt-0.5">
                          {rank.name}
                        </h4>
                        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                          {rank.description}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10 text-xs">
                      <div className="text-[11px] font-semibold text-zinc-400">Perk Unlocked:</div>
                      <div className="text-xs font-bold text-zinc-200 mt-0.5 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                        {rank.perk}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* DIGITAL LIFESAVER CREDENTIAL CERTIFICATE CARD */}
          <div className="bg-gradient-to-br from-amber-950/40 via-black to-red-950/40 rounded-3xl border border-amber-500/30 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-md border border-amber-500/30">
                  Official LifeFlow Credential
                </span>
                <h3 className="text-xl font-black text-white">
                  {currentDonor.name} • {rankInfo.current.name}
                </h3>
                <p className="text-xs text-zinc-300 max-w-xl">
                  Authorized recognition certificate for blood donor service in {currentDonor.city}, {currentDonor.state}.
                  Total {totalDonations} donations confirmed, protecting an estimated {estimatedLivesSaved} community members.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => alert(`Certificate for ${currentDonor.name} (${rankInfo.current.name}) verified and ready for download.`)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-white font-bold text-xs hover:from-amber-500 hover:to-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center gap-1.5 cursor-pointer transition"
                >
                  <Download className="w-3.5 h-3.5" /> Download Credential
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: OVERVIEW */}
      {activeSubTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Next Appointment & Recent Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* URGENT DIRECT BLOOD REQUESTS ALERT BANNER */}
            {pendingRequests.length > 0 && (
              <div className="p-5 rounded-3xl bg-gradient-to-r from-red-600 to-crimson-700 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-scale-in border border-red-500">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                    <BellRing className="w-6 h-6 text-white animate-bounce" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-wider mb-1">
                      ⚡ Action Required • Direct Request Received
                    </div>
                    <h3 className="text-base font-extrabold leading-snug">
                      {pendingRequests[0].patientName} needs {pendingRequests[0].units} unit(s) of {pendingRequests[0].bloodGroup} Blood
                    </h3>
                    <p className="text-xs text-white/90 mt-0.5 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5" /> {pendingRequests[0].hospital} • Urgency: {pendingRequests[0].urgency}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setActiveSubTab('requests')}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white text-red-900 font-black text-xs hover:bg-zinc-100 shadow-[0_0_20px_rgba(255,255,255,0.4)] transition cursor-pointer"
                  >
                    View & Respond Now ({pendingRequests.length}) →
                  </button>
                </div>
              </div>
            )}

            {/* Next Scheduled Appointment Spotlight */}
            <div className="bg-[#12070a]/90 rounded-3xl border border-red-500/20 p-6 shadow-2xl backdrop-blur-xl text-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Next Scheduled Appointment</h3>
                    <p className="text-[11px] text-zinc-400">Confirmed donation center booking</p>
                  </div>
                </div>

                {donorAppointments.length > 0 && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-300 border border-green-500/40 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-400" /> Confirmed
                  </span>
                )}
              </div>

              {donorAppointments.length === 0 ? (
                <div className="p-6 rounded-2xl bg-black/40 border border-dashed border-white/15 text-center space-y-2">
                  <Calendar className="w-8 h-8 text-zinc-600 mx-auto" />
                  <p className="text-xs font-semibold text-zinc-300">No appointments scheduled</p>
                  <p className="text-[11px] text-zinc-500">
                    Schedule an appointment at your nearest hospital or mobile blood drive.
                  </p>
                  <button
                    onClick={() => setActiveSubTab('schedule')}
                    className="mt-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-crimson-600 hover:from-red-500 hover:to-crimson-500 text-white font-bold text-xs shadow-[0_0_15px_rgba(220,38,38,0.5)] border border-red-400/30 cursor-pointer"
                  >
                    Schedule Donation
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="text-xs font-bold text-red-300 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-red-400" />
                      {donorAppointments[0].date} at {donorAppointments[0].time}
                    </div>
                    <div className="text-sm font-bold text-white">
                      {donorAppointments[0].donationCenter}
                    </div>
                    <div className="text-xs text-zinc-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      {donorAppointments[0].address}
                    </div>
                    {donorAppointments[0].notes && (
                      <div className="text-[11px] text-zinc-400 italic mt-1">
                        "{donorAppointments[0].notes}"
                      </div>
                    )}
                  </div>

                  <div className="flex sm:flex-col gap-2 shrink-0">
                    <button
                      onClick={() => onCancelAppointment && onCancelAppointment(donorAppointments[0].id)}
                      className="px-3 py-1.5 rounded-xl border border-white/15 text-zinc-300 text-xs font-bold hover:bg-white/10 cursor-pointer transition"
                    >
                      Cancel / Reschedule
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Donations Summary */}
            <div className="bg-[#12070a]/90 rounded-3xl border border-red-500/20 p-6 shadow-2xl backdrop-blur-xl text-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white text-sm">Recent Donations Record</h3>
                <button
                  onClick={() => setActiveSubTab('history')}
                  className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer transition"
                >
                  View All ({donorHistory.length}) <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {donorHistory.length === 0 ? (
                <div className="p-6 text-center text-xs text-zinc-500">
                  No verified donation history on file yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {donorHistory.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl border border-white/10 hover:border-red-500/30 transition flex items-center justify-between gap-3 bg-black/40"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 font-bold flex items-center justify-center shrink-0 border border-red-500/30">
                          <Droplet className="w-5 h-5 fill-current" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">
                            {item.donationCenter}
                          </div>
                          <div className="text-[11px] text-zinc-400">
                            {item.date} • {item.type} ({item.units} unit, {item.volumeMl}ml)
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] font-bold text-green-300 bg-green-500/20 px-2 py-0.5 rounded-full border border-green-500/30 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-green-400" /> Verified
                        </span>
                        <div className="text-[10px] text-zinc-500 mt-1 max-w-[160px] truncate">
                          {item.impact}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Col: Donor Rank Card & Preparation Tips */}
          <div className="space-y-6">
            {/* Donor Rank Summary Card with link to Ranks tab */}
            <div className="bg-[#12070a]/90 rounded-3xl border border-red-500/20 p-6 shadow-2xl backdrop-blur-xl text-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <h3 className="font-bold text-white text-sm">Donor Rank & Badges</h3>
                </div>
                <button
                  onClick={() => setActiveSubTab('ranks')}
                  className="text-xs font-bold text-red-400 hover:text-red-300 hover:underline cursor-pointer"
                >
                  View All Badges →
                </button>
              </div>

              <div className={`p-4 rounded-2xl bg-gradient-to-br from-black/60 to-red-950/40 border border-white/10 text-center space-y-2`}>
                <div className={`w-14 h-14 rounded-full ${rankInfo.current.badgeBg} text-white flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(220,38,38,0.5)] border-2 border-white/20`}>
                  <CurrentIcon className="w-7 h-7" />
                </div>
                <h4 className="font-black text-white text-base">{rankInfo.current.name}</h4>
                <p className="text-xs text-zinc-400">
                  {totalDonations} donations recorded (~{estimatedLivesSaved} lives saved)
                </p>

                {/* Progress bar to next level */}
                <div className="pt-2 text-left">
                  <div className="flex justify-between text-[11px] font-semibold text-zinc-400 mb-1">
                    <span>Rank Progress</span>
                    <span className="text-red-400 font-bold">
                      {rankInfo.isMaxTier
                        ? 'Max Rank!'
                        : `${rankInfo.donationsLeft} to ${rankInfo.next?.tier}`}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-white/15">
                    <div
                      className="h-full bg-gradient-to-r from-red-600 to-crimson-500 transition-all duration-500 shadow-[0_0_10px_rgba(220,38,38,0.7)]"
                      style={{ width: `${Math.min(100, rankInfo.progress)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="text-xs text-zinc-400 space-y-2 pt-2 border-t border-white/10">
                <p className="flex items-center gap-1.5 text-zinc-300 font-semibold">
                  <CheckCircle className="w-3.5 h-3.5 text-green-400" /> {rankInfo.current.perk}
                </p>
                <p className="flex items-center gap-1.5 text-zinc-300 font-semibold">
                  <CheckCircle className="w-3.5 h-3.5 text-green-400" /> Priority Emergency Notification
                </p>
              </div>
            </div>

            {/* Health & Preparation Checklist */}
            <div className="bg-[#12070a]/90 rounded-3xl border border-red-500/20 p-6 shadow-2xl backdrop-blur-xl text-slate-100 space-y-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-red-400" /> Pre-Donation Checklist
              </h3>
              <ul className="text-xs text-zinc-300 space-y-2.5">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 font-bold">✓</span>
                  <span>Hydrate with 500ml water or fruit juice 2-3 hours before appointment.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 font-bold">✓</span>
                  <span>Eat a wholesome iron-rich meal (avoid greasy fast food).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 font-bold">✓</span>
                  <span>Ensure you get at least 7 hours of rest the night before.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 font-bold">✓</span>
                  <span>Bring a valid government or student photo ID to the donation desk.</span>
                </li>
              </ul>
            </div>

            {/* Map & Quiz Quick Links */}
            <div className="bg-[#12070a]/90 rounded-3xl border border-red-500/20 p-5 shadow-2xl backdrop-blur-xl text-slate-100 space-y-2.5">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 font-mono">
                Donor Resources & Safety
              </h4>
              {onNavigateToMap && (
                <button
                  type="button"
                  onClick={onNavigateToMap}
                  className="w-full p-3 rounded-2xl border border-white/15 bg-black/40 hover:border-red-500/40 hover:bg-white/5 text-left transition flex items-center justify-between text-xs cursor-pointer"
                >
                  <span className="flex items-center gap-2 font-bold text-white">
                    <MapPin className="w-4 h-4 text-red-400" /> Nearby Blood Banks Radar
                  </span>
                  <span className="text-[10px] text-red-400 font-black">Open Radar →</span>
                </button>
              )}
              {onOpenQuiz && (
                <button
                  type="button"
                  onClick={onOpenQuiz}
                  className="w-full p-3 rounded-2xl border border-white/15 bg-black/40 hover:border-green-500/40 hover:bg-white/5 text-left transition flex items-center justify-between text-xs cursor-pointer"
                >
                  <span className="flex items-center gap-2 font-bold text-white">
                    <ShieldCheck className="w-4 h-4 text-green-400" /> Vibe Check & Safety Quiz
                  </span>
                  <span className="text-[10px] text-green-400 font-black">Verify →</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB: APPOINTMENTS */}
      {activeSubTab === 'appointments' && (
        <div className="bg-[#12070a]/90 rounded-3xl border border-red-500/20 p-6 sm:p-8 shadow-2xl backdrop-blur-xl text-slate-100 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Your Scheduled Appointments</h2>
              <p className="text-xs text-zinc-400">Upcoming hospital blood center visits and mobile drives</p>
            </div>
            <button
              onClick={() => setActiveSubTab('schedule')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-crimson-600 hover:from-red-500 hover:to-crimson-500 text-white font-bold text-xs shadow-[0_0_15px_rgba(220,38,38,0.5)] border border-red-400/30 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Book by Calendar
            </button>
          </div>

          {donorAppointments.length === 0 ? (
            <div className="p-12 text-center text-zinc-500 space-y-2">
              <Calendar className="w-10 h-10 text-zinc-600 mx-auto" />
              <p className="text-sm font-semibold text-zinc-300">No appointments scheduled currently.</p>
              <p className="text-xs text-zinc-500">Book your next visit to help hospital patients in need.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {donorAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-5 rounded-2xl border border-white/10 hover:border-red-500/30 transition space-y-3 bg-black/40"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-green-500/20 text-green-300 border border-green-500/30">
                      {apt.status}
                    </span>
                    <span className="text-xs font-semibold text-zinc-400">
                      {apt.type}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-white text-base">
                      {apt.donationCenter}
                    </h3>
                    <p className="text-xs text-zinc-400 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      {apt.address}
                    </p>
                  </div>

                  <div className="p-3 bg-red-950/20 border border-red-500/20 rounded-xl text-xs space-y-1 text-zinc-300">
                    <p className="font-bold flex items-center gap-1.5 text-red-400">
                      <Clock className="w-3.5 h-3.5" /> Date & Time: {apt.date} at {apt.time}
                    </p>
                    {apt.notes && <p className="text-zinc-400 italic">"{apt.notes}"</p>}
                  </div>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[11px] text-zinc-500 font-mono">ID: #{apt.id}</span>
                    <button
                      onClick={() => onCancelAppointment && onCancelAppointment(apt.id)}
                      className="text-xs font-bold text-red-400 hover:text-red-300 cursor-pointer"
                    >
                      Cancel Appointment
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: DONATION HISTORY */}
      {activeSubTab === 'history' && (
        <div className="bg-[#12070a]/90 rounded-3xl border border-red-500/20 p-6 sm:p-8 shadow-2xl backdrop-blur-xl text-slate-100 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Personal Donation History</h2>
              <p className="text-xs text-zinc-400">Every donation helps save up to 3 patient lives</p>
            </div>
            <button
              onClick={() => setShowLogModal(true)}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4 text-red-400" /> Log Past Donation
            </button>
          </div>

          {donorHistory.length === 0 ? (
            <div className="p-12 text-center text-zinc-500 space-y-2">
              <Droplet className="w-10 h-10 text-zinc-600 mx-auto" />
              <p className="text-sm font-semibold text-zinc-300">No recorded donation history yet.</p>
              <p className="text-xs text-zinc-500">Donations made at authorized centers will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {donorHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 rounded-2xl border border-white/10 bg-black/40 hover:border-red-500/30 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 mt-0.5 border border-red-500/30">
                      <Droplet className="w-6 h-6 fill-current" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-white text-sm sm:text-base">
                          {item.donationCenter}
                        </h3>
                        <span className="text-[11px] font-bold text-green-300 bg-green-500/20 px-2 py-0.5 rounded-full border border-green-500/30 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-green-400" /> Verified
                        </span>
                      </div>
                      <div className="text-xs text-zinc-400 mt-0.5">
                        {item.date} • {item.city} • <strong className="text-zinc-200">{item.type}</strong>
                      </div>
                      <div className="text-xs text-red-400 mt-1 font-medium">
                        ❤️ Impact: {item.impact}
                      </div>
                    </div>
                  </div>

                  <div className="sm:text-right shrink-0 bg-white/5 sm:bg-transparent p-2.5 sm:p-0 rounded-xl">
                    <div className="text-sm font-black text-white">
                      {item.units} unit ({item.volumeMl} ml)
                    </div>
                    <div className="text-[11px] text-zinc-500">
                      ~3 lives impacted
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* BADGE DETAIL POPUP MODAL */}
      {selectedBadgeDetail && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#12070a]/95 rounded-3xl max-w-md w-full p-6 shadow-[0_0_50px_rgba(220,38,38,0.35)] border border-red-500/30 space-y-4 text-white backdrop-blur-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-red-400">
                Badge Milestone Details
              </span>
              <button
                onClick={() => setSelectedBadgeDetail(null)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center space-y-2 pt-2">
              <div
                className={`w-16 h-16 rounded-3xl ${selectedBadgeDetail.badgeBg} text-white flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(220,38,38,0.5)] border-2 border-white/20`}
              >
                {React.createElement(selectedBadgeDetail.icon, { className: 'w-8 h-8' })}
              </div>
              <h3 className="text-xl font-black text-white">{selectedBadgeDetail.name}</h3>
              <p className="text-xs text-zinc-400">{selectedBadgeDetail.description}</p>
            </div>

            <div className="bg-black/50 rounded-2xl p-4 space-y-2 text-xs text-zinc-300 border border-white/10">
              <div className="flex justify-between">
                <span className="text-zinc-400">Required Donations:</span>
                <strong className="text-white">{selectedBadgeDetail.minDonations} donations</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Lives Saved Target:</span>
                <strong className="text-white">~{selectedBadgeDetail.livesSaved} patients</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Your Current Donations:</span>
                <strong className="text-red-400">{totalDonations} donations</strong>
              </div>
              <div className="flex justify-between pt-1 border-t border-white/10">
                <span className="text-zinc-400">Badge Status:</span>
                <strong className={totalDonations >= selectedBadgeDetail.minDonations ? 'text-green-400' : 'text-amber-400'}>
                  {totalDonations >= selectedBadgeDetail.minDonations ? '✓ Unlocked' : `Locked (${selectedBadgeDetail.minDonations - totalDonations} more needed)`}
                </strong>
              </div>
            </div>

            <div className="p-3 bg-amber-950/40 rounded-xl border border-amber-500/30 text-xs text-amber-200 space-y-1">
              <span className="font-bold flex items-center gap-1 text-amber-300">
                <Sparkles className="w-3.5 h-3.5" /> Milestone Perk:
              </span>
              <p>{selectedBadgeDetail.perk}</p>
            </div>

            <button
              onClick={() => setSelectedBadgeDetail(null)}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* SCHEDULE APPOINTMENT MODAL */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#12070a]/95 rounded-3xl max-w-lg w-full p-6 shadow-[0_0_50px_rgba(220,38,38,0.35)] border border-red-500/30 space-y-4 text-white backdrop-blur-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Schedule Donation Appointment</h2>
              <button onClick={() => setShowScheduleModal(false)} className="text-zinc-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">Blood Donation Center *</label>
                <select
                  value={newAppointment.center}
                  onChange={(e) => setNewAppointment({ ...newAppointment, center: e.target.value })}
                  className="w-full px-3 py-2 bg-black/50 border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:border-red-500"
                >
                  <option value="Metropolitan Blood Services - Main Center" className="bg-zinc-900 text-white">Metropolitan Blood Services - Main Center (420 Lexington Ave)</option>
                  <option value="Midtown Mobile Donation Bus" className="bg-zinc-900 text-white">Midtown Mobile Donation Bus (Rockefeller Center)</option>
                  <option value="St. Jude Regional Blood Bank" className="bg-zinc-900 text-white">St. Jude Regional Blood Bank (East 71st St)</option>
                  <option value="Downtown Community Blood Pavilion" className="bg-zinc-900 text-white">Downtown Community Blood Pavilion (Wall St)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={newAppointment.date}
                    onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
                    className="w-full px-3 py-2 bg-black/50 border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">Time Slot *</label>
                  <select
                    value={newAppointment.time}
                    onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
                    className="w-full px-3 py-2 bg-black/50 border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="09:00 AM" className="bg-zinc-900 text-white">09:00 AM</option>
                    <option value="10:00 AM" className="bg-zinc-900 text-white">10:00 AM</option>
                    <option value="11:30 AM" className="bg-zinc-900 text-white">11:30 AM</option>
                    <option value="01:15 PM" className="bg-zinc-900 text-white">01:15 PM</option>
                    <option value="02:30 PM" className="bg-zinc-900 text-white">02:30 PM</option>
                    <option value="04:00 PM" className="bg-zinc-900 text-white">04:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">Donation Type</label>
                <select
                  value={newAppointment.type}
                  onChange={(e) => setNewAppointment({ ...newAppointment, type: e.target.value })}
                  className="w-full px-3 py-2 bg-black/50 border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:border-red-500"
                >
                  <option value="Whole Blood" className="bg-zinc-900 text-white">Whole Blood (~450ml)</option>
                  <option value="Double Red Cells" className="bg-zinc-900 text-white">Double Red Cells</option>
                  <option value="Platelets" className="bg-zinc-900 text-white">Platelets</option>
                  <option value="Plasma" className="bg-zinc-900 text-white">Plasma</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">Special Notes / Dietary Requirements</label>
                <input
                  type="text"
                  placeholder="e.g. First time donating this year, require morning slot"
                  value={newAppointment.notes}
                  onChange={(e) => setNewAppointment({ ...newAppointment, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-black/50 border border-white/15 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-crimson-600 hover:from-red-500 hover:to-crimson-500 text-white font-extrabold text-sm shadow-[0_0_20px_rgba(220,38,38,0.5)] border border-red-400/30 transition cursor-pointer"
                >
                  Confirm Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LOG PAST DONATION MODAL */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#12070a]/95 rounded-3xl max-w-lg w-full p-6 shadow-[0_0_50px_rgba(220,38,38,0.35)] border border-red-500/30 space-y-4 text-white backdrop-blur-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Record a Past Donation</h2>
              <button onClick={() => setShowLogModal(false)} className="text-zinc-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLogSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">Donation Center or Hospital Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. City General Blood Bank"
                  value={newDonationLog.center}
                  onChange={(e) => setNewDonationLog({ ...newDonationLog, center: e.target.value })}
                  className="w-full px-3 py-2 bg-black/50 border border-white/15 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">Donation Date *</label>
                  <input
                    type="date"
                    required
                    value={newDonationLog.date}
                    onChange={(e) => setNewDonationLog({ ...newDonationLog, date: e.target.value })}
                    className="w-full px-3 py-2 bg-black/50 border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">Donation Type</label>
                  <select
                    value={newDonationLog.type}
                    onChange={(e) => setNewDonationLog({ ...newDonationLog, type: e.target.value })}
                    className="w-full px-3 py-2 bg-black/50 border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Whole Blood" className="bg-zinc-900 text-white">Whole Blood (450ml)</option>
                    <option value="Double Red Cells" className="bg-zinc-900 text-white">Double Red Cells</option>
                    <option value="Platelets" className="bg-zinc-900 text-white">Platelets</option>
                    <option value="Plasma" className="bg-zinc-900 text-white">Plasma</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">Impact / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Responded to emergency surgical call"
                  value={newDonationLog.impact}
                  onChange={(e) => setNewDonationLog({ ...newDonationLog, impact: e.target.value })}
                  className="w-full px-3 py-2 bg-black/50 border border-white/15 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-crimson-600 hover:from-red-500 hover:to-crimson-500 text-white font-extrabold text-sm shadow-[0_0_20px_rgba(220,38,38,0.5)] border border-red-400/30 transition cursor-pointer"
                >
                  Save to History 🔥
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
