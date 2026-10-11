import React, { useState } from 'react';
import {
  Droplet,
  Heart,
  Users,
  User,
  AlertTriangle,
  Search,
  Plus,
  Phone,
  MessageSquare,
  CheckCircle,
  Activity,
  Shield,
  Clock,
  MapPin,
  X,
  Send,
  Calendar,
  Bell,
  BellRing,
} from 'lucide-react';
import {
  initialDonors,
  initialRequests,
  compatibilityData,
  initialDonationHistory,
  initialAppointments,
  initialDonorNotifications,
} from './data/mockData';
import CreateRequest from './components/CreateRequest';
import SearchRequests from './components/SearchRequests';
import ToastContainer from './components/Toast';
import DonorDashboard from './components/DonorDashboard';
import BloodBankMap from './components/BloodBankMap';
import DonorEligibilityQuiz from './components/DonorEligibilityQuiz';
import AuthModal from './components/AuthModal';
import GenZHome from './components/GenZHome';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [donors, setDonors] = useState(initialDonors);
  const [requests, setRequests] = useState(initialRequests);
  const [currentDonorId, setCurrentDonorId] = useState('d1');
  const [donationHistory, setDonationHistory] = useState(initialDonationHistory);
  const [appointments, setAppointments] = useState(initialAppointments);
  const [donorNotifications, setDonorNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('lifeflow_notifications_table');
      return saved ? JSON.parse(saved) : initialDonorNotifications;
    } catch (e) {
      return initialDonorNotifications;
    }
  });
  const [showNotificationsDrawer, setShowNotificationsDrawer] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState('ALL'); // 'ALL' | 'CITY_MATCH' | 'UNREAD'
  const [targetDonorForRequest, setTargetDonorForRequest] = useState(null);
  const [preselectedCenterForBooking, setPreselectedCenterForBooking] = useState(null);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [donorDashboardSubTab, setDonorDashboardSubTab] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [authenticatedUser, setAuthenticatedUser] = useState(null);
  const [toasts, setToasts] = useState([]);

  const currentDonor = donors.find((d) => d.id === currentDonorId) || donors[0];
  const currentDonorPendingCount = donorNotifications.filter(
    (n) => n.donorId === currentDonorId && n.status === 'PENDING'
  ).length;

  // Web Audio chime synthesizer for real-time notification alerts
  const playNotificationChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now); // E5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.16); // A5
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    } catch (e) {
      // Audio autoplay policy catch
    }
  };

  // Browser desktop notification dispatcher
  const sendBrowserNotification = (title, body) => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, { body, icon: '🩸' });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            new Notification(title, { body, icon: '🩸' });
          }
        });
      }
    }
  };

  const addToast = (toast) => {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    setToasts((prev) => [...prev, { id, ...toast }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleScheduleAppointment = (newApt) => {
    setAppointments([newApt, ...appointments]);
    addToast({
      type: 'success',
      title: 'Appointment Confirmed!',
      message: `Your donation appointment at ${newApt.donationCenter} is scheduled for ${newApt.date} at ${newApt.time}.`,
      duration: 5000,
    });
  };

  const handleCancelAppointment = (aptId) => {
    setAppointments(appointments.filter((a) => a.id !== aptId));
    addToast({
      type: 'info',
      title: 'Appointment Cancelled',
      message: 'Your donation appointment has been cancelled. You can reschedule whenever you are ready.',
      duration: 4000,
    });
  };

  const handleLogDonation = (newLog) => {
    setDonationHistory([newLog, ...donationHistory]);
    // update current donor's donation stats
    setDonors(
      donors.map((d) =>
        d.id === currentDonorId
          ? {
              ...d,
              totalDonations: (d.totalDonations || 0) + 1,
              lastDonationDate: newLog.date,
            }
          : d
      )
    );
    addToast({
      type: 'donate',
      title: 'Donation Recorded!',
      message: `Thank you for your generous gift of life! Your donation has been recorded into your official history.`,
      duration: 5000,
    });
  };

  const handleSwitchDonor = (donorId) => {
    setCurrentDonorId(donorId);
    const donorObj = donors.find((d) => d.id === donorId);
    if (donorObj) {
      addToast({
        type: 'info',
        title: 'Switched Donor Profile',
        message: `Now viewing ${donorObj.name}'s donor dashboard (${donorObj.bloodGroup}).`,
        duration: 3500,
      });
    }
  };

  const handleLoginSuccess = (user) => {
    setAuthenticatedUser(user);
    if (user.id && donors.some((d) => d.id === user.id)) {
      setCurrentDonorId(user.id);
    }
  };

  // Stats
  const livesSaved = 142 + requests.filter((r) => r.status === 'FULFILLED').length;
  const activeRequestsCount = requests.filter((r) => r.status === 'OPEN').length;

  // Search & Filter state for Donors
  const [searchDonor, setSearchDonor] = useState('');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('ALL');
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  // Compatibility selector
  const [selectedCompatGroup, setSelectedCompatGroup] = useState('O-');

  // Modals
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showDonorModal, setShowDonorModal] = useState(false);

  const [newDonor, setNewDonor] = useState({
    name: '',
    bloodGroup: 'O+',
    phone: '',
    email: '',
    city: '',
    state: '',
  });

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const filteredDonors = donors.filter((donor) => {
    const matchesSearch =
      donor.name.toLowerCase().includes(searchDonor.toLowerCase()) ||
      donor.city.toLowerCase().includes(searchDonor.toLowerCase()) ||
      donor.state.toLowerCase().includes(searchDonor.toLowerCase());
    const matchesGroup = selectedBloodGroup === 'ALL' || donor.bloodGroup === selectedBloodGroup;
    const matchesAvail = !onlyAvailable || donor.isAvailable;
    return matchesSearch && matchesGroup && matchesAvail;
  });

  const handleRequestCreated = (newReq) => {
    setRequests([newReq, ...requests]);
    setShowRequestModal(false);
    setActiveTab('requests');

    // Create donor notification(s)
    if (newReq.requestType === 'direct_donor' && newReq.targetDonorId) {
      const targetDonorObj = donors.find((d) => d.id === newReq.targetDonorId);
      const newNotif = {
        id: 'notif_' + Date.now(),
        donorId: newReq.targetDonorId,
        requestId: newReq.id,
        type: 'DIRECT_REQUEST',
        title: '🚨 Urgent Direct Blood Request for You!',
        message: `${newReq.contactName} directly requested ${newReq.unitsRequired} unit(s) of ${newReq.bloodGroup} blood for ${newReq.patientName} at ${newReq.hospital}.`,
        patientName: newReq.patientName,
        bloodGroup: newReq.bloodGroup,
        units: newReq.unitsRequired,
        hospital: newReq.hospital,
        hospitalAddress: newReq.hospitalAddress,
        city: newReq.city,
        state: newReq.state,
        urgency: newReq.urgency,
        contactName: newReq.contactName,
        contactPhone: newReq.contactPhone,
        timestamp: 'Just now',
        read: false,
        status: 'PENDING',
      };

      setDonorNotifications((prev) => [newNotif, ...prev]);

      // If the currently active logged-in donor is targeted, trigger sound chime and alert
      if (newReq.targetDonorId === currentDonorId) {
        playNotificationChime();
        sendBrowserNotification(
          '🚨 Urgent Direct Blood Request for You!',
          `${newReq.patientName} needs your ${newReq.bloodGroup} blood at ${newReq.hospital}.`
        );
        addToast({
          type: 'emergency',
          title: '🚨 Direct Request for You Received!',
          message: `${newReq.patientName} urgently needs ${newReq.unitsRequired} unit(s) of your ${newReq.bloodGroup} blood at ${newReq.hospital}. Check your dashboard inquiries!`,
          duration: 9000,
        });
      } else {
        addToast({
          type: 'success',
          title: `Direct Request Sent to ${targetDonorObj?.name || 'Donor'}!`,
          message: `The donor has been notified in their dashboard and alerted to respond immediately.`,
          duration: 6000,
        });
      }
    } else {
      // 1. Alert donors with the EXACT matching blood group in the SAME city
      const exactCityMatches = donors.filter(
        (d) =>
          d.bloodGroup === newReq.bloodGroup &&
          (d.city.trim().toLowerCase() === newReq.city.trim().toLowerCase() ||
            (d.state && newReq.state && d.state.trim().toLowerCase() === newReq.state.trim().toLowerCase()))
      );

      // 2. Alert compatible donors in the wider area
      const compatibleGroups = compatibilityData[newReq.bloodGroup]?.receive || [newReq.bloodGroup];
      const otherCompatibleDonors = donors.filter(
        (d) =>
          compatibleGroups.includes(d.bloodGroup) &&
          !exactCityMatches.some((em) => em.id === d.id)
      );

      const cityMatchNotifs = exactCityMatches.map((d) => ({
        id: 'notif_' + Date.now() + '_city_' + d.id,
        donorId: d.id,
        requestId: newReq.id,
        type: 'CITY_BLOOD_MATCH',
        title: `🚨 Emergency ${newReq.bloodGroup} Request in ${newReq.city}!`,
        message: `${newReq.patientName} urgently requires ${newReq.unitsRequired} unit(s) of your blood group (${newReq.bloodGroup}) at ${newReq.hospital} in ${newReq.city}. You match both location and blood group!`,
        patientName: newReq.patientName,
        bloodGroup: newReq.bloodGroup,
        units: newReq.unitsRequired,
        hospital: newReq.hospital,
        hospitalAddress: newReq.hospitalAddress || `${newReq.hospital}, ${newReq.city}`,
        city: newReq.city,
        state: newReq.state,
        urgency: newReq.urgency,
        contactName: newReq.contactName,
        contactPhone: newReq.contactPhone,
        timestamp: 'Just now',
        read: false,
        status: 'PENDING',
      }));

      const broadcastNotifs = otherCompatibleDonors.map((d) => ({
        id: 'notif_' + Date.now() + '_compat_' + d.id,
        donorId: d.id,
        requestId: newReq.id,
        type: 'BROADCAST_MATCH',
        title: `Compatible ${newReq.bloodGroup} Blood Request Match`,
        message: `${newReq.patientName} requires ${newReq.unitsRequired} unit(s) of ${newReq.bloodGroup} blood at ${newReq.hospital} (${newReq.city}).`,
        patientName: newReq.patientName,
        bloodGroup: newReq.bloodGroup,
        units: newReq.unitsRequired,
        hospital: newReq.hospital,
        hospitalAddress: newReq.hospitalAddress || `${newReq.hospital}, ${newReq.city}`,
        city: newReq.city,
        state: newReq.state,
        urgency: newReq.urgency,
        contactName: newReq.contactName,
        contactPhone: newReq.contactPhone,
        timestamp: 'Just now',
        read: false,
        status: 'PENDING',
      }));

      const allNewNotifs = [...cityMatchNotifs, ...broadcastNotifs];

      setDonorNotifications((prev) => {
        const updated = [...allNewNotifs, ...prev];
        try {
          localStorage.setItem('lifeflow_notifications_table', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });

      // If current donor has an exact city & blood type match
      if (exactCityMatches.some((d) => d.id === currentDonorId)) {
        playNotificationChime();
        sendBrowserNotification(
          `🚨 Alert: ${newReq.bloodGroup} Blood Needed in ${newReq.city}!`,
          `${newReq.patientName} urgently needs your ${newReq.bloodGroup} blood at ${newReq.hospital}.`
        );
        addToast({
          type: 'emergency',
          title: `🚨 Emergency in ${newReq.city}!`,
          message: `${newReq.patientName} urgently needs ${newReq.unitsRequired} unit(s) of your ${newReq.bloodGroup} blood at ${newReq.hospital}. Click the bell icon to respond immediately!`,
          duration: 9000,
        });
      } else if (otherCompatibleDonors.some((d) => d.id === currentDonorId)) {
        playNotificationChime();
        sendBrowserNotification(
          `New Compatible Blood Request`,
          `${newReq.patientName} needs ${newReq.bloodGroup} at ${newReq.hospital}.`
        );
        addToast({
          type: 'request',
          title: 'Compatible Blood Request Nearby',
          message: `${newReq.patientName} needs ${newReq.bloodGroup} at ${newReq.hospital} (${newReq.city}). Check your bell notifications.`,
          duration: 6000,
        });
      } else {
        addToast({
          type: 'request',
          title: 'Blood Request Published & Broadcasted!',
          message: `Alert dispatched to ${exactCityMatches.length} matching donor(s) in ${newReq.city} and ${otherCompatibleDonors.length} compatible donor(s).`,
          duration: 5000,
        });
      }
    }
  };

  const handleMarkAllNotificationsRead = () => {
    setDonorNotifications((prev) => {
      const updated = prev.map((n) =>
        n.donorId === currentDonorId ? { ...n, read: true } : n
      );
      try {
        localStorage.setItem('lifeflow_notifications_table', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    addToast({
      type: 'info',
      title: 'Notifications Cleared',
      message: 'All notifications for your profile have been marked as read.',
      duration: 3000,
    });
  };

  const handleAcceptDirectRequest = (notifId) => {
    const targetNotif = donorNotifications.find((n) => n.id === notifId);
    if (!targetNotif) return;

    setDonorNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, status: 'ACCEPTED', read: true } : n))
    );

    const newApt = {
      id: 'apt_' + Date.now(),
      donorId: currentDonorId,
      date: new Date(Date.now() + 24 * 3600 * 1000).toISOString().split('T')[0],
      time: '09:30 AM',
      donationCenter: targetNotif.hospital,
      address: `${targetNotif.hospitalAddress || targetNotif.hospital}, ${targetNotif.city}`,
      type: 'Whole Blood',
      status: 'CONFIRMED',
      notes: `Direct patient pledge for ${targetNotif.patientName} (${targetNotif.units} unit(s)). Contact: ${targetNotif.contactName} (${targetNotif.contactPhone})`,
    };

    setAppointments((prev) => [newApt, ...prev]);

    addToast({
      type: 'success',
      title: 'Donation Pledged & Scheduled!',
      message: `Thank you, ${currentDonor.name}! Your pledge for ${targetNotif.patientName} at ${targetNotif.hospital} is confirmed and added to your appointments.`,
      duration: 6000,
    });
  };

  const handleDeclineDirectRequest = (notifId) => {
    setDonorNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, status: 'DECLINED', read: true } : n))
    );

    addToast({
      type: 'info',
      title: 'Request Declined',
      message: 'You have marked this request as unavailable. Other compatible community donors will be alerted.',
      duration: 4000,
    });
  };

  const handleMarkNotificationRead = (notifId) => {
    setDonorNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
    );
  };

  const handleDirectDonorRequest = (donor) => {
    setTargetDonorForRequest(donor);
    setActiveTab('create-request');
  };

  const handleRegisterDonor = (e) => {
    e.preventDefault();
    if (!newDonor.name || !newDonor.phone || !newDonor.city) return;

    const donorItem = {
      id: 'don_' + Date.now(),
      ...newDonor,
      isAvailable: true,
      totalDonations: 0,
      lastDonationDate: 'Never',
    };
    setDonors([donorItem, ...donors]);
    setShowDonorModal(false);

    addToast({
      type: 'success',
      title: 'Welcome to LifeFlow Heroes!',
      message: `Thank you ${newDonor.name}! You are registered as an active ${newDonor.bloodGroup} donor in ${newDonor.city}.`,
      duration: 4500,
    });

    setNewDonor({
      name: '',
      bloodGroup: 'O+',
      phone: '',
      email: '',
      city: '',
      state: '',
    });
    setActiveTab('donors');
  };

  const handleFulfill = (id) => {
    const targetReq = requests.find((r) => r.id === id);
    setRequests(
      requests.map((r) => (r.id === id ? { ...r, status: 'FULFILLED' } : r))
    );

    addToast({
      type: 'donate',
      title: 'Donor Response Confirmed!',
      message: targetReq
        ? `Thank you for responding to donate ${targetReq.bloodGroup} blood for ${targetReq.patientName} at ${targetReq.hospital}! The hospital and emergency contact have been notified.`
        : 'Thank you for responding to donate! Your commitment has been recorded and the patient has been alerted.',
      duration: 5500,
    });
  };

  const toggleDonorAvailability = (id) => {
    setDonors(
      donors.map((d) => (d.id === id ? { ...d, isAvailable: !d.isAvailable } : d))
    );
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col selection:bg-red-600 selection:text-white">
      {/* Cyber Frosted Header */}
      <header className="bg-[#090a0f]/85 backdrop-blur-2xl border-b border-red-500/20 sticky top-0 z-40 shadow-[0_4px_30px_rgba(0,0,0,0.6)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => setActiveTab('home')}
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-500 to-crimson-700 flex items-center justify-center text-white shadow-[0_0_20px_rgba(220,38,38,0.7)] group-hover:scale-105 transition border border-red-400/40">
              <Droplet className="w-5 h-5 fill-current animate-pulse" />
            </div>
            <div>
              <span className="text-xl font-black text-white tracking-tight flex items-center gap-1.5">
                LifeFlow
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
              </span>
              <span className="hidden sm:inline-block text-[10px] font-extrabold text-red-400 uppercase tracking-widest bg-red-950/80 px-2 py-0.5 rounded-full border border-red-700/40">
                GEN-Z BLOOD RADAR
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-1 sm:space-x-1.5 overflow-x-auto py-1">
            {[
              { id: 'home', label: 'Home' },
              {
                id: 'dashboard',
                label: 'Portal',
                badge: currentDonorPendingCount > 0 ? currentDonorPendingCount : null,
              },
              { id: 'map', label: '📍 Map' },
              { id: 'quiz', label: '🩺 Vibe Check' },
              { id: 'donors', label: 'Squad' },
              { id: 'requests', label: `Appeals (${activeRequestsCount})` },
              { id: 'create-request', label: '+ Request' },
              { id: 'compatibility', label: 'Matrix' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === 'create-request') setTargetDonorForRequest(null);
                  if (tab.id === 'dashboard') setDonorDashboardSubTab(null);
                  setActiveTab(tab.id);
                }}
                className={`relative px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-red-600/30 to-crimson-600/30 text-white border border-red-500/50 shadow-[0_0_15px_rgba(220,38,38,0.4)]'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[10px] font-black animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.8)]">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Header Action Buttons & Logged-in Donor Quick Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3 relative">
            {/* Real-time Notification Bell for Current Donor */}
            <button
              onClick={() => setShowNotificationsDrawer(!showNotificationsDrawer)}
              className={`relative p-2 rounded-xl transition border cursor-pointer ${
                showNotificationsDrawer
                  ? 'bg-red-600/30 text-red-200 border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.5)]'
                  : 'text-zinc-400 hover:text-white hover:bg-white/10 border-white/10'
              }`}
              title={
                currentDonorPendingCount > 0
                  ? `🚨 ${currentDonorPendingCount} urgent blood request(s) waiting for you!`
                  : 'View donor alerts & inquiries'
              }
            >
              {currentDonorPendingCount > 0 ? (
                <BellRing className="w-5 h-5 text-red-400 animate-bounce" />
              ) : (
                <Bell className="w-5 h-5" />
              )}
              {currentDonorPendingCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse border-2 border-black shadow-[0_0_10px_rgba(220,38,38,0.9)]">
                  {currentDonorPendingCount}
                </span>
              )}
            </button>

            {/* NOTIFICATIONS DROPDOWN / DRAWER (Dark Cyber Style) */}
            {showNotificationsDrawer && (
              <div className="absolute right-0 top-12 z-50 w-96 max-w-[95vw] bg-[#12070a] rounded-3xl shadow-[0_10px_50px_rgba(0,0,0,0.8)] border border-red-500/30 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-2xl">
                <div className="p-4 bg-gradient-to-r from-red-950 via-crimson-900 to-[#12070a] text-white flex items-center justify-between border-b border-red-500/20">
                  <div className="flex items-center gap-2.5">
                    <BellRing className="w-5 h-5 animate-pulse text-amber-300" />
                    <div>
                      <h4 className="font-black text-sm leading-tight">Live Blood Alerts</h4>
                      <p className="text-[11px] text-red-300">
                        {currentDonor?.city} ({currentDonor?.bloodGroup}) • {currentDonorPendingCount} unread alert(s)
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowNotificationsDrawer(false)}
                    className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Switch viewing donor profile quick selector */}
                <div className="px-3.5 py-2.5 bg-black/50 border-b border-white/10 flex items-center justify-between text-xs">
                  <span className="text-zinc-400 font-bold">Viewing as:</span>
                  <select
                    value={currentDonorId}
                    onChange={(e) => handleSwitchDonor(e.target.value)}
                    className="text-xs font-black text-red-200 bg-black/80 border border-red-500/40 rounded-xl px-2.5 py-1 focus:ring-1 focus:ring-red-500 outline-none"
                  >
                    {donors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.bloodGroup} • {d.city})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filter tabs */}
                <div className="px-3 pt-2 pb-1 flex items-center gap-1.5 border-b border-gray-100 bg-white">
                  {[
                    { id: 'ALL', label: 'All Alerts' },
                    { id: 'CITY_MATCH', label: '📍 City Match' },
                    { id: 'UNREAD', label: `Pending (${currentDonorPendingCount})` },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setNotificationFilter(filter.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                        notificationFilter === filter.id
                          ? 'bg-crimson-50 text-crimson-700 font-bold border border-crimson-200'
                          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                  {currentDonorPendingCount > 0 && (
                    <button
                      onClick={handleMarkAllNotificationsRead}
                      className="ml-auto text-[11px] font-bold text-crimson-600 hover:underline cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Notification List */}
                <div className="max-h-[60vh] overflow-y-auto divide-y divide-gray-100 p-2 space-y-2">
                  {donorNotifications
                    .filter((n) => n.donorId === currentDonorId)
                    .filter((n) => {
                      if (notificationFilter === 'CITY_MATCH') return n.type === 'CITY_BLOOD_MATCH';
                      if (notificationFilter === 'UNREAD') return n.status === 'PENDING';
                      return true;
                    }).length === 0 ? (
                    <div className="text-center py-8 px-4 text-gray-500">
                      <Droplet className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-xs font-semibold">No alerts matching this filter.</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Whenever someone requests {currentDonor?.bloodGroup} blood in {currentDonor?.city}, an instant alert appears here.
                      </p>
                    </div>
                  ) : (
                    donorNotifications
                      .filter((n) => n.donorId === currentDonorId)
                      .filter((n) => {
                        if (notificationFilter === 'CITY_MATCH') return n.type === 'CITY_BLOOD_MATCH';
                        if (notificationFilter === 'UNREAD') return n.status === 'PENDING';
                        return true;
                      })
                      .map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-3 rounded-xl border transition ${
                            notif.type === 'CITY_BLOOD_MATCH'
                              ? 'bg-red-50/70 border-red-200'
                              : notif.type === 'DIRECT_REQUEST'
                              ? 'bg-amber-50/60 border-amber-200'
                              : 'bg-white border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {notif.type === 'CITY_BLOOD_MATCH' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-crimson-600 text-white text-[10px] font-black uppercase tracking-wider animate-pulse">
                                  📍 City & Blood Match
                                </span>
                              )}
                              {notif.type === 'DIRECT_REQUEST' && (
                                <span className="px-2 py-0.5 rounded-full bg-amber-600 text-white text-[10px] font-bold uppercase tracking-wider">
                                  Direct Request
                                </span>
                              )}
                              <span className="px-2 py-0.5 rounded bg-gray-900 text-white text-[10px] font-black">
                                {notif.bloodGroup} • {notif.units} unit(s)
                              </span>
                              <span className="text-[10px] font-bold text-gray-400">
                                {notif.timestamp}
                              </span>
                            </div>
                            {notif.status === 'ACCEPTED' ? (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                Accepted
                              </span>
                            ) : notif.status === 'DECLINED' ? (
                              <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                Declined
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                                Pending
                              </span>
                            )}
                          </div>

                          <h5 className="font-bold text-xs text-gray-900 leading-snug mb-1">
                            {notif.title}
                          </h5>
                          <p className="text-[11px] text-gray-600 line-clamp-2 mb-2">
                            {notif.message}
                          </p>

                          <div className="text-[10px] text-gray-500 mb-2 flex items-center justify-between">
                            <span>🏥 {notif.hospital} ({notif.city})</span>
                            <span className="font-semibold text-gray-700">Patient: {notif.patientName}</span>
                          </div>

                          <div className="flex items-center gap-1.5 pt-1 border-t border-black/5">
                            {notif.status === 'PENDING' ? (
                              <>
                                <button
                                  onClick={() => handleAcceptDirectRequest(notif.id)}
                                  className="flex-1 py-1.5 px-2 rounded-lg bg-crimson-600 hover:bg-crimson-700 text-white font-bold text-[11px] shadow-xs cursor-pointer text-center"
                                >
                                  Accept & Pledge
                                </button>
                                <button
                                  onClick={() => handleDeclineDirectRequest(notif.id)}
                                  className="py-1.5 px-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 font-semibold text-[11px] cursor-pointer"
                                >
                                  Decline
                                </button>
                              </>
                            ) : (
                              <div className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5" />
                                Appointment Scheduled
                              </div>
                            )}
                            {notif.contactPhone && (
                              <a
                                href={`tel:${notif.contactPhone}`}
                                className="p-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-crimson-600"
                                title={`Call coordinator: ${notif.contactPhone}`}
                              >
                                <Phone className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))
                  )}
                </div>

                <div className="p-2.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => {
                      setShowNotificationsDrawer(false);
                      setDonorDashboardSubTab('requests');
                      setActiveTab('dashboard');
                    }}
                    className="w-full text-center py-1.5 rounded-lg bg-gray-900 text-white font-bold text-xs hover:bg-black transition cursor-pointer"
                  >
                    Open Full Donor Portal →
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={() => {
                setDonorDashboardSubTab(null);
                setActiveTab('dashboard');
              }}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-2xl border transition cursor-pointer relative ${
                activeTab === 'dashboard'
                  ? 'bg-red-600/30 border-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]'
                  : 'bg-[#140609] border-red-500/30 hover:border-red-500/60 text-zinc-200'
              }`}
              title="View my donor dashboard & history"
            >
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-red-500 to-crimson-700 text-white font-black text-xs flex items-center justify-center relative shadow-[0_0_10px_rgba(220,38,38,0.6)]">
                {currentDonor?.bloodGroup || 'O-'}
                {currentDonorPendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-400 rounded-full border border-black animate-ping" />
                )}
              </div>
              <div className="hidden lg:block text-left text-xs">
                <div className="font-bold text-white leading-tight">
                  {currentDonor?.name?.split(' ')[0] || 'Donor'}
                </div>
                <div className="text-[10px] text-red-400 font-extrabold uppercase tracking-wider">
                  {currentDonorPendingCount > 0 ? '⚠️ Action Required' : 'Portal'}
                </div>
              </div>
            </button>

            {/* Sign In & Account Button with Forgot Password access */}
            <button
              onClick={() => {
                setAuthModalMode('login');
                setShowAuthModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 text-xs font-bold text-zinc-300 hover:text-white hover:border-red-500/40 hover:bg-white/5 transition cursor-pointer"
              title="Sign in to your account or reset password"
            >
              <User className="w-3.5 h-3.5 text-red-400" />
              <span>{authenticatedUser ? authenticatedUser.name.split(' ')[0] : 'Sign In'}</span>
            </button>

            <button
              onClick={() => {
                setTargetDonorForRequest(null);
                setActiveTab('create-request');
              }}
              className="hidden md:inline-flex px-3.5 py-1.5 rounded-xl text-xs font-black bg-white/10 text-white border border-white/20 hover:bg-white/15 transition cursor-pointer"
            >
              Request Blood
            </button>
            <button
              onClick={() => setShowDonorModal(true)}
              className="hidden sm:inline-flex px-4 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-red-600 to-crimson-600 hover:from-red-500 hover:to-crimson-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)] transition cursor-pointer border border-red-400/40"
            >
              Donate Now 🔥
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* DONOR DASHBOARD VIEW */}
        {activeTab === 'dashboard' && (
          <DonorDashboard
            currentDonor={currentDonor}
            allDonors={donors}
            onSwitchDonor={handleSwitchDonor}
            donationHistory={donationHistory}
            appointments={appointments}
            notifications={donorNotifications}
            initialSubTab={donorDashboardSubTab}
            onAcceptRequest={handleAcceptDirectRequest}
            onDeclineRequest={handleDeclineDirectRequest}
            onMarkNotificationRead={handleMarkNotificationRead}
            preselectedCenter={preselectedCenterForBooking}
            onNavigateToMap={() => setActiveTab('map')}
            onOpenQuiz={() => setShowQuizModal(true)}
            onScheduleAppointment={handleScheduleAppointment}
            onCancelAppointment={handleCancelAppointment}
            onLogDonation={handleLogDonation}
            onToggleAvailability={toggleDonorAvailability}
            onOpenAuthModal={(mode) => {
              setAuthModalMode(mode || 'login');
              setShowAuthModal(true);
            }}
          />
        )}

        {/* BLOOD BANK LIVE MAP VIEW */}
        {activeTab === 'map' && (
          <BloodBankMap
            currentDonor={currentDonor}
            onSelectCenterToBook={(center) => {
              setPreselectedCenterForBooking(center);
              setActiveTab('dashboard');
              addToast({
                type: 'info',
                title: 'Center Selected!',
                message: `Booking appointment at ${center.name}. Select your date & time slot.`,
                duration: 4000,
              });
            }}
            onOpenQuiz={() => setShowQuizModal(true)}
          />
        )}

        {/* DONOR ELIGIBILITY QUIZ VIEW */}
        {activeTab === 'quiz' && (
          <DonorEligibilityQuiz
            currentDonor={currentDonor}
            onEligibilityPassed={() => {
              addToast({
                type: 'success',
                title: 'Eligibility Verified!',
                message: 'You meet all health criteria. You can now schedule your blood donation appointment.',
                duration: 5000,
              });
              setActiveTab('dashboard');
            }}
            onClose={() => setActiveTab('home')}
          />
        )}
        {/* HOME VIEW: ANIMATED GEN-Z ORIGINKIT + THRINE */}
        {activeTab === 'home' && (
          <GenZHome
            donors={donors}
            requests={requests}
            livesSaved={livesSaved}
            activeRequestsCount={activeRequestsCount}
            onNavigateToTab={(tab) => {
              if (tab === 'create-request') setTargetDonorForRequest(null);
              if (tab === 'dashboard') setDonorDashboardSubTab(null);
              setActiveTab(tab);
            }}
            onOpenRequestModal={() => {
              setTargetDonorForRequest(null);
              setActiveTab('create-request');
            }}
            onOpenDonorModal={() => setShowDonorModal(true)}
            onFulfillRequest={handleFulfill}
            onOpenQuizModal={() => setShowQuizModal(true)}
          />
        )}

        {/* DONORS SQUAD VIEW: GEN-Z CYBER RADAR */}
        {activeTab === 'donors' && (
          <div className="space-y-6 animate-fade-in text-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-700/40 text-red-400 text-xs font-black uppercase tracking-wider mb-2">
                  <Users className="w-3.5 h-3.5 text-red-400" /> SQUAD RADAR ACTIVE
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                  Ready Blood Donors Squad
                </h1>
                <p className="text-sm text-zinc-400">
                  Direct peer-to-peer lifesaver network. Instant contact, zero gatekeeping.
                </p>
              </div>
              <button
                onClick={() => setShowDonorModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-crimson-600 hover:from-red-500 hover:to-crimson-500 text-white font-black text-xs shadow-[0_0_20px_rgba(220,38,38,0.5)] border border-red-400/40 transition cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" /> Enlist in Donor Squad 🔥
              </button>
            </div>

            {/* Filter Bar */}
            <div className="bg-[#12070a]/90 rounded-3xl border border-red-500/20 shadow-2xl p-5 space-y-4 backdrop-blur-xl">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-red-400" />
                  <input
                    type="text"
                    placeholder="Search squad by donor name, city or state..."
                    value={searchDonor}
                    onChange={(e) => setSearchDonor(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-black/60 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-zinc-300 cursor-pointer select-none hover:bg-white/10 transition">
                    <input
                      type="checkbox"
                      checked={onlyAvailable}
                      onChange={(e) => setOnlyAvailable(e.target.checked)}
                      className="rounded border-zinc-700 text-red-600 focus:ring-red-500 w-4 h-4 bg-zinc-900"
                    />
                    <span>Active & Available Only</span>
                  </label>
                </div>
              </div>

              {/* Blood group chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-white/10">
                <span className="text-[11px] font-bold text-zinc-400 mr-1 uppercase tracking-wider">Type:</span>
                <button
                  onClick={() => setSelectedBloodGroup('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                    selectedBloodGroup === 'ALL'
                      ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.6)] border border-red-400'
                      : 'bg-white/5 text-zinc-300 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  All Types
                </button>
                {bloodGroups.map((group) => (
                  <button
                    key={group}
                    onClick={() => setSelectedBloodGroup(group)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                      selectedBloodGroup === group
                        ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.6)] border border-red-400'
                        : 'bg-white/5 text-zinc-300 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    {group}
                  </button>
                ))}
              </div>
            </div>

            {/* Donor Cards Grid */}
            {filteredDonors.length === 0 ? (
              <div className="bg-[#12070a]/90 rounded-3xl border border-red-500/20 p-12 text-center max-w-md mx-auto space-y-3 backdrop-blur-xl">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 text-red-400 flex items-center justify-center mx-auto">
                  <Users className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-white">No squad members found</h3>
                <p className="text-xs text-zinc-400">
                  Try tweaking your search keywords or switching blood group filters.
                </p>
                <button
                  onClick={() => {
                    setSearchDonor('');
                    setSelectedBloodGroup('ALL');
                    setOnlyAvailable(false);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 text-white transition cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDonors.map((donor) => (
                  <div
                    key={donor.id}
                    className="bg-[#140609]/90 rounded-3xl border border-red-500/20 hover:border-red-500/50 p-5 shadow-xl hover:shadow-[0_0_30px_rgba(220,38,38,0.25)] transition flex flex-col justify-between space-y-4 backdrop-blur-xl group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-red-600 to-crimson-800 text-white font-black text-xl flex items-center justify-center shadow-lg border border-red-400/30 group-hover:scale-105 transition">
                            {donor.bloodGroup}
                          </div>
                          <div>
                            <h3 className="font-black text-white text-base leading-tight">
                              {donor.name}
                            </h3>
                            <p className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-red-400" />
                              <span>{donor.city}, {donor.state}</span>
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => toggleDonorAvailability(donor.id)}
                          className={`text-[10px] font-black px-2.5 py-1 rounded-full border transition cursor-pointer flex items-center gap-1 ${
                            donor.isAvailable
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                              : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                          }`}
                          title="Click to toggle availability"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${donor.isAvailable ? 'bg-emerald-400 animate-ping' : 'bg-zinc-500'}`} />
                          <span>{donor.isAvailable ? 'READY' : 'BUSY'}</span>
                        </button>
                      </div>

                      <div className="bg-black/50 p-3 rounded-2xl border border-white/10 text-xs text-zinc-300 space-y-1.5 mb-2">
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-400">Total Donations:</span>
                          <span className="font-black text-amber-300">{donor.totalDonations} drops (~{donor.totalDonations * 3} lives)</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-400">Last Active:</span>
                          <span className="font-semibold text-zinc-200">{donor.lastDonationDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <a
                          href={`tel:${donor.phone}`}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-emerald-400 text-xs font-bold transition"
                        >
                          <Phone className="w-3.5 h-3.5" /> Call
                        </a>
                        <a
                          href={`sms:${donor.phone}`}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-red-400 text-xs font-bold transition"
                        >
                          <MessageSquare className="w-3.5 h-3.5" /> SMS
                        </a>
                      </div>
                      <button
                        onClick={() => handleDirectDonorRequest(donor)}
                        className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-crimson-600 hover:from-red-500 hover:to-crimson-500 text-white text-xs font-black shadow-[0_0_15px_rgba(220,38,38,0.4)] border border-red-400/30 transition cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" /> Request Directly from {donor.name.split(' ')[0]}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CREATE REQUEST VIEW */}
        {activeTab === 'create-request' && (
          <CreateRequest
            donors={donors}
            targetDonor={targetDonorForRequest}
            onRequestCreated={handleRequestCreated}
            onCancel={() => {
              setTargetDonorForRequest(null);
              setActiveTab('requests');
            }}
            initialBloodGroup={targetDonorForRequest?.bloodGroup || 'O+'}
          />
        )}

        {/* REQUESTS VIEW WITH SEARCH & FILTERS */}
        {activeTab === 'requests' && (
          <SearchRequests
            requests={requests}
            onFulfillRequest={handleFulfill}
            onRequestBloodClick={() => {
              setTargetDonorForRequest(null);
              setActiveTab('create-request');
            }}
          />
        )}

        {/* COMPATIBILITY VIEW: ORIGINKIT MATRIX */}
        {activeTab === 'compatibility' && (
          <div className="space-y-6 animate-fade-in max-w-4xl mx-auto text-slate-100">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-700/40 text-red-400 text-xs font-black uppercase tracking-wider mb-2">
                <Activity className="w-3.5 h-3.5 text-red-400 animate-pulse" /> BIOLOGICAL MATRIX
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Blood Group Compatibility Matrix
              </h1>
              <p className="text-sm text-zinc-400">
                Understand biological compatibility, universal donors, and recipient transfer science.
              </p>
            </div>

            {/* Blood Type Selector */}
            <div className="bg-[#12070a]/90 rounded-3xl border border-red-500/20 shadow-2xl p-6 backdrop-blur-xl">
              <label className="text-xs font-black text-zinc-400 uppercase tracking-wider mb-3 block">
                Select Your Blood Group
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
                {bloodGroups.map((group) => (
                  <button
                    key={group}
                    onClick={() => setSelectedCompatGroup(group)}
                    className={`py-3.5 rounded-2xl font-black text-sm transition cursor-pointer ${
                      selectedCompatGroup === group
                        ? 'bg-gradient-to-b from-red-600 to-crimson-700 text-white shadow-[0_0_20px_rgba(220,38,38,0.7)] scale-105 border border-red-400'
                        : 'bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10'
                    }`}
                  >
                    {group}
                  </button>
                ))}
              </div>
            </div>

            {/* Compatibility Display Card */}
            {compatibilityData[selectedCompatGroup] && (
              <div className="bg-[#12070a]/90 rounded-3xl border border-red-500/20 shadow-2xl p-6 sm:p-8 space-y-6 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-crimson-800 text-white font-black text-2xl flex items-center justify-center shadow-lg border border-red-400/40 shrink-0">
                    {selectedCompatGroup}
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-white">
                      Blood Group {selectedCompatGroup} Science
                    </h2>
                    <p className="text-xs sm:text-sm text-zinc-400">
                      {compatibilityData[selectedCompatGroup].desc}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-red-950/30 border border-red-500/30 space-y-3">
                    <h3 className="text-xs font-black text-red-300 uppercase tracking-wider flex items-center gap-2">
                      <Droplet className="w-4 h-4 text-red-400 fill-current" /> Can Give Blood To:
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {compatibilityData[selectedCompatGroup].give.map((grp) => (
                        <span
                          key={grp}
                          className="px-3 py-1 rounded-xl bg-red-600 text-white font-black text-xs shadow-[0_0_10px_rgba(220,38,38,0.5)] border border-red-400/40"
                        >
                          {grp}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-3">
                    <h3 className="text-xs font-black text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                      <Heart className="w-4 h-4 text-emerald-400 fill-current" /> Can Receive Blood From:
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {compatibilityData[selectedCompatGroup].receive.map((grp) => (
                        <span
                          key={grp}
                          className="px-3 py-1 rounded-xl bg-emerald-600 text-white font-black text-xs shadow-[0_0_10px_rgba(16,185,129,0.5)] border border-emerald-400/40"
                        >
                          {grp}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Educational Protocol Tips */}
                <div className="p-5 rounded-2xl bg-black/50 border border-white/10 text-xs text-zinc-300 space-y-2.5">
                  <h4 className="font-black text-white text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" /> Pre-Donation Protocol (Gen-Z Optimized):
                  </h4>
                  <ul className="space-y-1.5 text-zinc-300 pl-1">
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>Drink at least 500ml of electrolytes or water 1 hour before donating.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>Eat an iron-rich meal (spinach, eggs, lentils) and avoid high-fat fast food right before.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>Skip heavy gym max-outs and avoid alcohol for 24 hours prior.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>Bring your digital ID or driver's license. Free post-donation snacks guaranteed.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* CREATE REQUEST MODAL */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <CreateRequest
              donors={donors}
              targetDonor={targetDonorForRequest}
              onRequestCreated={handleRequestCreated}
              onCancel={() => {
                setShowRequestModal(false);
                setTargetDonorForRequest(null);
              }}
              initialBloodGroup={targetDonorForRequest?.bloodGroup || 'O+'}
            />
          </div>
        </div>
      )}

      {/* REGISTER DONOR MODAL: GEN-Z CYBER */}
      {showDonorModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#12070a] border border-red-500/30 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-[0_0_60px_rgba(220,38,38,0.3)] overflow-y-auto max-h-[90vh] text-white">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-600/20 text-red-400 border border-red-500/40 flex items-center justify-center">
                  <Droplet className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">Join the Donor Squad</h2>
                  <p className="text-[11px] text-zinc-400">Save 3 lives with every donation</p>
                </div>
              </div>
              <button
                onClick={() => setShowDonorModal(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterDonor} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={newDonor.name}
                  onChange={(e) => setNewDonor({ ...newDonor, name: e.target.value })}
                  placeholder="e.g. Maya Chen"
                  className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">Blood Group *</label>
                  <select
                    value={newDonor.bloodGroup}
                    onChange={(e) => setNewDonor({ ...newDonor, bloodGroup: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-red-500 transition cursor-pointer"
                  >
                    {bloodGroups.map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={newDonor.phone}
                    onChange={(e) => setNewDonor({ ...newDonor, phone: e.target.value })}
                    placeholder="+1 555 0192"
                    className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={newDonor.email}
                  onChange={(e) => setNewDonor({ ...newDonor, email: e.target.value })}
                  placeholder="maya@example.com"
                  className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={newDonor.city}
                    onChange={(e) => setNewDonor({ ...newDonor, city: e.target.value })}
                    placeholder="e.g. Seattle"
                    className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">State</label>
                  <input
                    type="text"
                    value={newDonor.state}
                    onChange={(e) => setNewDonor({ ...newDonor, state: e.target.value })}
                    placeholder="e.g. WA"
                    className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-red-950/40 rounded-xl border border-red-500/20 text-xs text-red-200 space-y-1">
                <p className="font-extrabold text-red-300">Quick Eligibility Check:</p>
                <p className="flex items-center gap-1.5"><span className="text-emerald-400 font-bold">✓</span> Age 17+ (or 16 with parental consent)</p>
                <p className="flex items-center gap-1.5"><span className="text-emerald-400 font-bold">✓</span> Weight at least 50kg (110 lbs)</p>
                <p className="flex items-center gap-1.5"><span className="text-emerald-400 font-bold">✓</span> No whole blood donation in last 56 days</p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl font-black text-sm bg-gradient-to-r from-red-600 to-crimson-600 hover:from-red-500 hover:to-crimson-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.6)] border border-red-400/40 transition cursor-pointer"
                >
                  Confirm & Join Lifesaver Squad 🔥
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ELIGIBILITY QUIZ POPUP MODAL */}
      {showQuizModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
          <div className="w-full max-w-2xl my-8">
            <DonorEligibilityQuiz
              currentDonor={currentDonor}
              onEligibilityPassed={() => {
                setShowQuizModal(false);
                addToast({
                  type: 'success',
                  title: 'Eligibility Verified!',
                  message: 'You meet all health criteria. You can now schedule your blood donation appointment.',
                  duration: 5000,
                });
                setActiveTab('dashboard');
              }}
              onClose={() => setShowQuizModal(false)}
            />
          </div>
        </div>
      )}

      {/* AUTH & FORGOT PASSWORD MODAL */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authModalMode}
        onLoginSuccess={handleLoginSuccess}
        registeredDonors={donors}
        addToast={addToast}
      />

      {/* TOAST NOTIFICATION HOST */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
