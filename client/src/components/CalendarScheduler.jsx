import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Building,
  CheckCircle,
  AlertCircle,
  Phone,
  Droplet,
  Info,
  CalendarCheck,
  Download,
  X,
  Sparkles
} from 'lucide-react';
import { donationCenters } from '../data/mockData';

export default function CalendarScheduler({
  currentDonor,
  initialCenterId,
  onAppointmentConfirmed,
  onCancel,
  onOpenQuiz
}) {
  // Calendar viewing state
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed

  // Selected appointment details state
  // Default to 3 days from today
  const defaultSelectedDate = new Date(today);
  defaultSelectedDate.setDate(today.getDate() + 3);

  const [selectedDate, setSelectedDate] = useState(defaultSelectedDate);
  const [selectedCenterId, setSelectedCenterId] = useState(initialCenterId || donationCenters[0].id);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('10:00 AM');
  const [selectedDonationType, setSelectedDonationType] = useState('Whole Blood');
  const [specialNotes, setSpecialNotes] = useState('');
  const [isBooked, setIsBooked] = useState(false);
  const [bookedAppointmentData, setBookedAppointmentData] = useState(null);

  // Month navigation
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  // Calendar calculations
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 is Sunday

  const selectedCenter = useMemo(() => {
    return donationCenters.find((c) => c.id === selectedCenterId) || donationCenters[0];
  }, [selectedCenterId]);

  // Generate realistic time slots for the selected date
  const timeSlots = useMemo(() => {
    return [
      { id: 'm1', time: '08:30 AM', period: 'Morning', spotsLeft: 3 },
      { id: 'm2', time: '09:15 AM', period: 'Morning', spotsLeft: 5 },
      { id: 'm3', time: '10:00 AM', period: 'Morning', spotsLeft: 2 },
      { id: 'm4', time: '10:45 AM', period: 'Morning', spotsLeft: 4 },
      { id: 'm5', time: '11:30 AM', period: 'Morning', spotsLeft: 1 },
      { id: 'a1', time: '01:00 PM', period: 'Afternoon', spotsLeft: 6 },
      { id: 'a2', time: '01:45 PM', period: 'Afternoon', spotsLeft: 3 },
      { id: 'a3', time: '02:30 PM', period: 'Afternoon', spotsLeft: 4 },
      { id: 'a4', time: '03:15 PM', period: 'Afternoon', spotsLeft: 2 },
      { id: 'a5', time: '04:00 PM', period: 'Afternoon', spotsLeft: 5 },
    ];
  }, [selectedDate, selectedCenterId]);

  // Format selected date string
  const formattedSelectedDate = useMemo(() => {
    return selectedDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [selectedDate]);

  const isoDateString = useMemo(() => {
    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const d = String(selectedDate.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [selectedDate]);

  const handleDayClick = (day) => {
    const clickedDate = new Date(viewYear, viewMonth, day);
    // Ignore past dates
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (clickedDate < startOfToday) return;

    setSelectedDate(clickedDate);
  };

  const isSameDay = (d1, d2) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const isPastDay = (year, month, day) => {
    const checkDate = new Date(year, month, day);
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return checkDate < startOfToday;
  };

  const handleConfirmBooking = () => {
    const newAppointment = {
      id: 'apt_' + Date.now(),
      donorId: currentDonor?.id || 'd1',
      date: isoDateString,
      time: selectedTimeSlot,
      donationCenter: selectedCenter.name,
      address: `${selectedCenter.address}, ${selectedCenter.city}, ${selectedCenter.state}`,
      type: selectedDonationType,
      status: 'CONFIRMED',
      notes: specialNotes || 'Hydrate with 500ml water and bring photo ID.',
    };

    setBookedAppointmentData(newAppointment);
    setIsBooked(true);

    if (onAppointmentConfirmed) {
      onAppointmentConfirmed(newAppointment);
    }
  };

  // Helper to generate an iCal/ICS file for the scheduled appointment
  const handleDownloadCalendarEvent = () => {
    if (!bookedAppointmentData) return;
    const title = `Blood Donation Appointment at ${bookedAppointmentData.donationCenter}`;
    const desc = `LifeFlow Blood Donation Appointment (${bookedAppointmentData.type}). Please drink plenty of fluids and bring valid photo ID. Notes: ${bookedAppointmentData.notes}`;
    const location = bookedAppointmentData.address;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//LifeFlow//Blood Donation Appointment//EN',
      'BEGIN:VEVENT',
      `SUMMARY:${title}`,
      `DESCRIPTION:${desc}`,
      `LOCATION:${location}`,
      `STATUS:CONFIRMED`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `blood-donation-${bookedAppointmentData.date}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isBooked && bookedAppointmentData) {
    return (
      <div className="bg-[#12070a] rounded-3xl border border-red-500/30 p-8 sm:p-10 shadow-[0_0_50px_rgba(220,38,38,0.3)] max-w-2xl mx-auto text-center space-y-6 animate-scale-in text-white backdrop-blur-2xl">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(16,185,129,0.4)]">
          <CalendarCheck className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs font-black uppercase tracking-wider text-emerald-300 bg-emerald-950/80 px-3.5 py-1 rounded-full border border-emerald-500/40">
            Appointment Confirmed ✓
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white mt-3">
            Your Donation Appointment is Booked!
          </h2>
          <p className="text-sm text-zinc-300 mt-1">
            Thank you, {currentDonor?.name || 'Lifesaver'}! A reminder has been placed on your profile.
          </p>
        </div>

        <div className="bg-black/50 p-5 rounded-2xl border border-white/10 text-left text-xs space-y-3 text-zinc-300">
          <div className="flex items-start gap-3">
            <Building className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-black text-sm text-white">{bookedAppointmentData.donationCenter}</div>
              <div className="text-zinc-400">{bookedAppointmentData.address}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-red-400 shrink-0" />
            <div>
              <strong className="text-white">{formattedSelectedDate}</strong> at <strong className="text-amber-300">{bookedAppointmentData.time}</strong>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Droplet className="w-4 h-4 text-red-400 shrink-0" />
            <div>
              Donation Type: <strong className="text-white">{bookedAppointmentData.type}</strong> • Blood Type: <strong className="text-red-400">{currentDonor?.bloodGroup || 'O+'}</strong>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10 text-zinc-400">
            <strong className="text-white">Preparation Note:</strong> {bookedAppointmentData.notes}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={handleDownloadCalendarEvent}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-xs font-bold hover:bg-white/10 shadow-xs flex items-center justify-center gap-2 cursor-pointer transition"
          >
            <Download className="w-4 h-4 text-red-400" /> Export to Calendar (.ics)
          </button>

          <button
            onClick={onCancel}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-crimson-600 text-white text-xs font-black hover:from-red-500 hover:to-crimson-500 shadow-md cursor-pointer transition"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto text-slate-100">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-700/40 text-red-400 text-xs font-black uppercase tracking-wider mb-2">
            <CalendarIcon className="w-3.5 h-3.5 text-red-400" /> CALENDAR DISPATCH
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            Appointment Dispatch Scheduler
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Choose an authorized hospital or blood center and pick your donation time slot
          </p>
        </div>

        {onCancel && (
          <button
            onClick={onCancel}
            className="text-xs font-bold text-zinc-400 hover:text-white flex items-center gap-1 self-start sm:self-auto bg-white/5 hover:bg-white/10 border border-white/10 px-3.5 py-2 rounded-xl transition cursor-pointer"
          >
            <X className="w-4 h-4" /> Cancel & Return
          </button>
        )}
      </div>

      {/* Pre-donation Safety Verification Banner */}
      {onOpenQuiz && (
        <div className="p-4 bg-emerald-950/20 rounded-2xl border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-zinc-300">
              Ensure you meet health & interval safety guidelines before locking in your hospital appointment.
            </span>
          </div>
          <button
            type="button"
            onClick={onOpenQuiz}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-black hover:bg-emerald-500/30 transition shrink-0 cursor-pointer"
          >
            Take 30-Sec Vibe Check →
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: HOSPITAL SELECTION & DONATION TYPE (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* STEP 1: SELECT HOSPITAL */}
          <div className="bg-[#12070a]/90 rounded-3xl border border-red-500/20 p-5 shadow-2xl space-y-4 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-red-400">
              <span className="w-5 h-5 rounded-full bg-red-600/30 text-red-300 border border-red-500/40 flex items-center justify-center text-[10px]">1</span>
              Select Blood Pavilion
            </div>

            <div className="space-y-2.5">
              {donationCenters.map((center) => {
                const isSelected = center.id === selectedCenterId;
                const hasUrgentMatch = currentDonor && center.urgentBloodNeeded?.includes(currentDonor.bloodGroup);

                return (
                  <div
                    key={center.id}
                    onClick={() => setSelectedCenterId(center.id)}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer relative ${
                      isSelected
                        ? 'border-red-500 bg-red-600/20 shadow-[0_0_15px_rgba(220,38,38,0.4)]'
                        : 'border-white/10 hover:border-white/20 bg-black/40'
                    }`}
                  >
                    {hasUrgentMatch && (
                      <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md text-[10px] font-black bg-red-600 text-white shadow-sm">
                        ⚡ URGENT
                      </span>
                    )}

                    <div className="font-black text-xs text-white pr-14 leading-snug">
                      {center.name}
                    </div>

                    <div className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                      {center.address}, {center.city}
                    </div>

                    <div className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3 shrink-0" /> {center.hours}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 2: DONATION TYPE */}
          <div className="bg-[#12070a]/90 rounded-3xl border border-red-500/20 p-5 shadow-2xl space-y-3 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-red-400">
              <span className="w-5 h-5 rounded-full bg-red-600/30 text-red-300 border border-red-500/40 flex items-center justify-center text-[10px]">2</span>
              Donation Procedure
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { type: 'Whole Blood', desc: '450 ml • ~45 min', popular: true },
                { type: 'Double Red Cells', desc: 'Power red • ~75 min', popular: false },
                { type: 'Platelets', desc: 'Apheresis • ~90 min', popular: false },
                { type: 'Plasma', desc: 'Plasma • ~60 min', popular: false },
              ].map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setSelectedDonationType(item.type)}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                    selectedDonationType === item.type
                      ? 'border-red-500 bg-red-600/30 text-white font-black shadow-[0_0_10px_rgba(220,38,38,0.4)]'
                      : 'border-white/10 text-zinc-300 hover:bg-white/5 bg-black/40'
                  }`}
                >
                  <div className="text-xs font-bold">{item.type}</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CALENDAR & TIME SLOTS (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* STEP 3: INTERACTIVE CALENDAR */}
          <div className="bg-[#12070a]/90 rounded-3xl border border-red-500/20 p-6 shadow-2xl space-y-4 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-red-400">
                <span className="w-5 h-5 rounded-full bg-red-600/30 text-red-300 border border-red-500/40 flex items-center justify-center text-[10px]">3</span>
                Select Calendar Date
              </div>

              {/* Month Navigation Controls */}
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white">
                  {monthNames[viewMonth]} {viewYear}
                </h3>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handlePrevMonth}
                    className="p-1.5 rounded-xl border border-white/10 hover:bg-white/10 text-zinc-300 transition cursor-pointer"
                    title="Previous Month"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="p-1.5 rounded-xl border border-white/10 hover:bg-white/10 text-zinc-300 transition cursor-pointer"
                    title="Next Month"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* 7-Day Calendar Grid */}
            <div className="grid grid-cols-7 gap-1.5 text-center">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="text-[11px] font-black text-zinc-500 py-1 uppercase">
                  {d}
                </div>
              ))}

              {/* Blank filler days */}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="h-11" />
              ))}

              {/* Month Days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const cellDate = new Date(viewYear, viewMonth, dayNum);
                const isPast = isPastDay(viewYear, viewMonth, dayNum);
                const isSelected = isSameDay(cellDate, selectedDate);
                const isToday = isSameDay(cellDate, today);

                return (
                  <button
                    key={`day-${dayNum}`}
                    type="button"
                    disabled={isPast}
                    onClick={() => handleDayClick(dayNum)}
                    className={`h-11 rounded-xl text-xs font-black transition flex flex-col items-center justify-center relative cursor-pointer ${
                      isPast
                        ? 'text-zinc-600 cursor-not-allowed bg-black/20'
                        : isSelected
                        ? 'bg-gradient-to-b from-red-600 to-crimson-700 text-white font-black shadow-[0_0_15px_rgba(220,38,38,0.8)] scale-105 z-10 border border-red-400'
                        : 'text-zinc-200 hover:bg-white/10 hover:text-white bg-black/40 border border-white/5'
                    }`}
                  >
                    <span>{dayNum}</span>

                    {/* Today indicator dot */}
                    {isToday && !isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 -mt-0.5 animate-ping" />
                    )}

                    {/* Availability dot on upcoming dates */}
                    {!isPast && !isSelected && (
                      <span className="w-1 h-1 rounded-full bg-emerald-400 -mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 flex items-center justify-between text-[11px] text-zinc-400 border-t border-white/10">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Available Donation Days
              </span>
              <span>
                Selected: <strong className="text-red-400">{formattedSelectedDate}</strong>
              </span>
            </div>
          </div>

          {/* STEP 4: AVAILABLE TIME SLOTS */}
          <div className="bg-[#12070a]/90 rounded-3xl border border-red-500/20 p-6 shadow-2xl space-y-4 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-red-400">
                <span className="w-5 h-5 rounded-full bg-red-600/30 text-red-300 border border-red-500/40 flex items-center justify-center text-[10px]">4</span>
                Select Time Slot
              </div>
              <span className="text-[11px] text-zinc-400 font-semibold">
                {timeSlots.length} available slots
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                  Morning Slots
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {timeSlots.filter(s => s.period === 'Morning').map((slot) => {
                    const isSelected = selectedTimeSlot === slot.time;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setSelectedTimeSlot(slot.time)}
                        className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                          isSelected
                            ? 'bg-red-600 border-red-400 text-white font-black shadow-[0_0_10px_rgba(220,38,38,0.6)]'
                            : 'border-white/10 bg-black/40 hover:bg-white/10 text-zinc-200'
                        }`}
                      >
                        <div className="text-xs font-bold">{slot.time}</div>
                        <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-red-100' : 'text-emerald-400 font-medium'}`}>
                          {slot.spotsLeft} spot{slot.spotsLeft > 1 ? 's' : ''} left
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                  Afternoon Slots
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {timeSlots.filter(s => s.period === 'Afternoon').map((slot) => {
                    const isSelected = selectedTimeSlot === slot.time;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setSelectedTimeSlot(slot.time)}
                        className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                          isSelected
                            ? 'bg-red-600 border-red-400 text-white font-black shadow-[0_0_10px_rgba(220,38,38,0.6)]'
                            : 'border-white/10 bg-black/40 hover:bg-white/10 text-zinc-200'
                        }`}
                      >
                        <div className="text-xs font-bold">{slot.time}</div>
                        <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-red-100' : 'text-emerald-400 font-medium'}`}>
                          {slot.spotsLeft} spot{slot.spotsLeft > 1 ? 's' : ''} left
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Special Instructions Note */}
            <div className="pt-2">
              <label className="text-xs font-bold text-zinc-300 block mb-1">
                Special Instructions or Medical Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Need morning slot before work, requested O- donor certificate"
                value={specialNotes}
                onChange={(e) => setSpecialNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition"
              />
            </div>
          </div>

          {/* STEP 5: BOOKING SUMMARY & CONFIRMATION BAR */}
          <div className="bg-gradient-to-r from-red-950 via-crimson-900 to-[#12070a] rounded-3xl p-6 text-white shadow-2xl border border-red-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-[11px] font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Ready to Confirm Appointment
              </div>
              <div className="text-base sm:text-lg font-black text-white">
                {formattedSelectedDate} at {selectedTimeSlot}
              </div>
              <div className="text-xs text-zinc-300 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                {selectedCenter.name} ({selectedDonationType})
              </div>
            </div>

            <button
              onClick={handleConfirmBooking}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-crimson-600 hover:from-red-500 hover:to-crimson-500 text-white font-black text-sm shadow-[0_0_20px_rgba(220,38,38,0.6)] border border-red-400/40 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <CalendarCheck className="w-4 h-4" /> Confirm & Dispatch Booking 🔥
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

