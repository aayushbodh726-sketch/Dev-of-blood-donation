import React, { useState, useMemo } from 'react';
import {
  Search,
  MapPin,
  Droplet,
  Filter,
  X,
  Phone,
  CheckCircle,
  AlertTriangle,
  Building,
  Clock,
  Sparkles,
  RefreshCw,
  Share2,
  Radio,
  Plus
} from 'lucide-react';
import { compatibilityData } from '../data/mockData';

export default function SearchRequests({
  requests = [],
  onFulfillRequest,
  onRequestBloodClick
}) {
  const [locationQuery, setLocationQuery] = useState('');
  const [selectedBloodType, setSelectedBloodType] = useState('ALL');
  const [selectedUrgency, setSelectedUrgency] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('OPEN'); // 'OPEN' | 'FULFILLED' | 'ALL'
  const [donorCompatibilityMode, setDonorCompatibilityMode] = useState(false);
  const [donorBloodType, setDonorBloodType] = useState('O+');

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  // Extract unique cities from requests for quick filter chips
  const popularLocations = useMemo(() => {
    const cities = requests.map((r) => r.city).filter(Boolean);
    return Array.from(new Set(cities)).slice(0, 6);
  }, [requests]);

  // Filtering logic
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      // 1. Location filter: checks city, state, hospital, hospitalAddress, or zipCode
      const query = locationQuery.trim().toLowerCase();
      const matchesLocation =
        !query ||
        (req.city && req.city.toLowerCase().includes(query)) ||
        (req.state && req.state.toLowerCase().includes(query)) ||
        (req.hospital && req.hospital.toLowerCase().includes(query)) ||
        (req.hospitalAddress && req.hospitalAddress.toLowerCase().includes(query)) ||
        (req.zipCode && req.zipCode.toLowerCase().includes(query));

      // 2. Blood Type filter
      let matchesBloodType = false;
      if (donorCompatibilityMode) {
        // If user is a donor searching for patients they CAN donate to
        const canGiveTo = compatibilityData[donorBloodType]?.give || [donorBloodType];
        matchesBloodType = canGiveTo.includes(req.bloodGroup);
      } else {
        matchesBloodType = selectedBloodType === 'ALL' || req.bloodGroup === selectedBloodType;
      }

      // 3. Urgency filter
      const matchesUrgency = selectedUrgency === 'ALL' || req.urgency === selectedUrgency;

      // 4. Status filter
      const matchesStatus =
        selectedStatus === 'ALL' ||
        (selectedStatus === 'OPEN' && req.status === 'OPEN') ||
        (selectedStatus === 'FULFILLED' && req.status === 'FULFILLED');

      return matchesLocation && matchesBloodType && matchesUrgency && matchesStatus;
    });
  }, [
    requests,
    locationQuery,
    selectedBloodType,
    selectedUrgency,
    selectedStatus,
    donorCompatibilityMode,
    donorBloodType,
  ]);

  const hasActiveFilters =
    locationQuery.trim() !== '' ||
    selectedBloodType !== 'ALL' ||
    selectedUrgency !== 'ALL' ||
    selectedStatus !== 'OPEN' ||
    donorCompatibilityMode;

  const handleClearFilters = () => {
    setLocationQuery('');
    setSelectedBloodType('ALL');
    setSelectedUrgency('ALL');
    setSelectedStatus('OPEN');
    setDonorCompatibilityMode(false);
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-700/40 text-red-400 text-xs font-black uppercase tracking-wider mb-2">
            <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" /> LIVE DISPATCH RADAR
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <Search className="w-7 h-7 text-red-500" />
            Urgent Blood Appeals Radar
          </h1>
          <p className="text-sm text-zinc-400">
            Real-time emergency appeals matching donor types across hospital ICUs.
          </p>
        </div>

        {onRequestBloodClick && (
          <button
            onClick={onRequestBloodClick}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-crimson-600 hover:from-red-500 hover:to-crimson-500 text-white font-black text-xs shadow-[0_0_20px_rgba(220,38,38,0.5)] transition self-start sm:self-auto cursor-pointer flex items-center gap-2 border border-red-400/40"
          >
            <Plus className="w-4 h-4" />
            <span>Post Emergency Request</span>
          </button>
        )}
      </div>

      {/* FILTER CONTROLS CARD (CYBER FROSTED) */}
      <div className="bg-[#12070a]/90 rounded-3xl border border-red-500/20 shadow-2xl p-5 sm:p-6 space-y-5 backdrop-blur-xl">
        {/* Row 1: Location Search Bar */}
        <div>
          <label className="text-xs font-black text-zinc-400 uppercase tracking-wider block mb-1.5">
            Filter by Location (City, State, or Hospital)
          </label>
          <div className="relative">
            <MapPin className="w-5 h-5 absolute left-3.5 top-3 text-red-500" />
            <input
              type="text"
              placeholder="Search by city (e.g. New York, Chicago), hospital name, or state..."
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-2.5 bg-black/60 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
            />
            {locationQuery && (
              <button
                onClick={() => setLocationQuery('')}
                className="absolute right-3 top-3 text-zinc-400 hover:text-white cursor-pointer"
                title="Clear location"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Location Suggestion Chips */}
          {popularLocations.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
              <span className="text-[11px] font-bold text-zinc-500 mr-1 uppercase">Locations:</span>
              {popularLocations.map((city) => (
                <button
                  key={city}
                  onClick={() => setLocationQuery(locationQuery === city ? '' : city)}
                  className={`text-xs px-2.5 py-0.5 rounded-full border transition font-bold cursor-pointer ${
                    locationQuery.toLowerCase() === city.toLowerCase()
                      ? 'bg-red-600/30 border-red-500 text-red-300 shadow-[0_0_10px_rgba(220,38,38,0.4)]'
                      : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  📍 {city}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Row 2: Blood Type Filter */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-black text-zinc-400 uppercase tracking-wider block">
              Filter by Blood Type
            </label>

            {/* Compatibility toggle switch */}
            <button
              type="button"
              onClick={() => setDonorCompatibilityMode(!donorCompatibilityMode)}
              className={`text-xs font-black px-3 py-1 rounded-xl transition flex items-center gap-1.5 cursor-pointer border ${
                donorCompatibilityMode
                  ? 'bg-red-600/30 text-red-200 border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.4)]'
                  : 'text-zinc-400 hover:text-white bg-white/5 border-white/10'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              {donorCompatibilityMode ? 'Compatibility Match Mode ON' : 'Match My Donor Type'}
            </button>
          </div>

          {donorCompatibilityMode ? (
            <div className="p-3.5 bg-red-950/30 rounded-2xl border border-red-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-300">I am donating Blood Type:</span>
                <select
                  value={donorBloodType}
                  onChange={(e) => setDonorBloodType(e.target.value)}
                  className="px-2.5 py-1 bg-zinc-900 border border-red-500/40 rounded-xl text-sm font-black text-white focus:outline-none"
                >
                  {bloodGroups.map((bg) => (
                    <option key={bg} value={bg} className="bg-zinc-900 text-white">{bg}</option>
                  ))}
                </select>
              </div>
              <div className="text-xs text-red-300">
                Compatible patients you can save: <strong className="text-white">{(compatibilityData[donorBloodType]?.give || []).join(', ')}</strong>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedBloodType('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                  selectedBloodType === 'ALL'
                    ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.6)] border border-red-400'
                    : 'bg-white/5 text-zinc-400 hover:text-white border border-white/10'
                }`}
              >
                All Types
              </button>
              {bloodGroups.map((group) => (
                <button
                  key={group}
                  onClick={() => setSelectedBloodType(group)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition border cursor-pointer ${
                    selectedBloodType === group
                      ? 'bg-red-600 text-white border-red-400 shadow-[0_0_15px_rgba(220,38,38,0.6)]'
                      : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
                  }`}
                >
                  {group}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Row 3: Urgency & Status Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-white/10">
          <div>
            <label className="text-xs font-black text-zinc-400 uppercase tracking-wider block mb-1.5">
              Urgency Level
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'ALL', label: 'All Urgencies' },
                { id: 'CRITICAL', label: 'Critical' },
                { id: 'URGENT', label: 'Urgent' },
                { id: 'NORMAL', label: 'Normal' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedUrgency(item.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer border ${
                    selectedUrgency === item.id
                      ? 'bg-red-600/30 text-red-200 border-red-500 shadow-[0_0_10px_rgba(220,38,38,0.4)]'
                      : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-black text-zinc-400 uppercase tracking-wider block mb-1.5">
              Status
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'OPEN', label: 'Active Appeals' },
                { id: 'FULFILLED', label: 'Fulfilled' },
                { id: 'ALL', label: 'All Statuses' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedStatus(item.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer border ${
                    selectedStatus === item.id
                      ? 'bg-red-600/30 text-red-200 border-red-500 shadow-[0_0_10px_rgba(220,38,38,0.4)]'
                      : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filter Summary & Reset Bar */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <div className="text-xs text-zinc-400 font-semibold">
            Showing <strong className="text-white">{filteredRequests.length}</strong> of{' '}
            {requests.length} requests
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer transition"
            >
              <RefreshCw className="w-3 h-3" /> Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* RESULTS LIST SECTION */}
      {filteredRequests.length === 0 ? (
        <div className="bg-[#12070a]/90 rounded-3xl border border-red-500/20 p-12 text-center max-w-lg mx-auto space-y-3 backdrop-blur-xl">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 text-red-400 flex items-center justify-center mx-auto">
            <Search className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-black text-white">No matching appeals found</h3>
          <p className="text-xs text-zinc-400">
            No active appeals matched blood group <strong>{selectedBloodType}</strong> in{' '}
            {locationQuery ? `"${locationQuery}"` : 'any location'}.
          </p>
          <div className="pt-2 flex justify-center gap-2">
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 text-white hover:bg-white/15 cursor-pointer"
            >
              Clear All Filters
            </button>
            {onRequestBloodClick && (
              <button
                onClick={onRequestBloodClick}
                className="px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-red-600 to-crimson-600 text-white hover:from-red-500 hover:to-crimson-500 cursor-pointer shadow-md"
              >
                Post New Appeal
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRequests.map((req) => {
            const isFulfilled = req.status === 'FULFILLED';
            const urgencyBg =
              req.urgency === 'CRITICAL'
                ? 'bg-red-950/90 text-red-300 border-red-500/50 animate-pulse'
                : req.urgency === 'URGENT'
                ? 'bg-amber-950/90 text-amber-300 border-amber-500/50'
                : 'bg-zinc-800 text-zinc-300 border-zinc-700';

            return (
              <div
                key={req.id}
                className="bg-[#140609]/90 rounded-2xl border border-red-500/20 hover:border-red-500/50 p-5 shadow-xl hover:shadow-[0_0_30px_rgba(220,38,38,0.25)] transition flex flex-col justify-between space-y-4 backdrop-blur-xl"
              >
                <div className="space-y-3">
                  {/* Top card header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-crimson-800 text-white font-black text-xl flex items-center justify-center shadow-lg border border-red-400/30 shrink-0">
                        {req.bloodGroup}
                      </div>
                      <div>
                        <h2 className="font-black text-white text-base leading-tight">
                          {req.patientName}
                        </h2>
                        <div className="text-xs font-semibold text-zinc-400 mt-0.5">
                          {req.unitsRequired} unit(s) needed urgently
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                          isFulfilled
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                            : urgencyBg
                        }`}
                      >
                        {isFulfilled ? 'FULFILLED' : req.urgency}
                      </span>
                      <span className="text-[11px] text-zinc-400 font-medium">
                        {req.createdAt || 'Recent'}
                      </span>
                    </div>
                  </div>

                  {/* Hospital & Location Details */}
                  <div className="bg-black/50 p-3.5 rounded-xl border border-white/10 space-y-2 text-xs text-zinc-300">
                    <div className="flex items-start gap-2">
                      <Building className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white">{req.hospital}</strong>
                        {req.hospitalAddress && (
                          <div className="text-zinc-400 text-[11px]">{req.hospitalAddress}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span>
                        {req.city}, {req.state} {req.zipCode ? `(${req.zipCode})` : ''}
                      </span>
                    </div>

                    {req.medicalCondition && (
                      <div className="text-[11px] text-zinc-300 pt-1 border-t border-white/10">
                        <strong className="text-red-300">Reason:</strong> {req.medicalCondition}
                      </div>
                    )}

                    {req.note && (
                      <div className="text-[11px] text-zinc-400 italic">
                        "{req.note}"
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom card footer: Contact & Action */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                  <div>
                    <div className="text-[11px] text-zinc-400 font-medium">Emergency Contact</div>
                    <div className="text-xs font-bold text-white">
                      {req.contactName || 'Hospital Desk'}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${req.contactPhone}`}
                      className="p-2 rounded-xl bg-white/10 text-zinc-300 hover:text-white hover:bg-white/15 transition"
                      title="Call Contact"
                    >
                      <Phone className="w-4 h-4 text-red-400" />
                    </a>

                    {!isFulfilled ? (
                      <button
                        onClick={() => onFulfillRequest && onFulfillRequest(req.id)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-crimson-600 hover:from-red-500 hover:to-crimson-500 text-white text-xs font-black shadow-[0_0_15px_rgba(220,38,38,0.5)] transition cursor-pointer"
                      >
                        I Can Donate 🩸
                      </button>
                    ) : (
                      <span className="text-xs font-black text-emerald-300 flex items-center gap-1 bg-emerald-950/80 border border-emerald-500/40 px-3 py-1 rounded-xl">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Donation Pledged
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
