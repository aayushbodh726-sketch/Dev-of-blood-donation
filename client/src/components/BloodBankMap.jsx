import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin,
  Navigation,
  Phone,
  Clock,
  Calendar,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  Compass,
  Building2,
  Droplet,
  Layers,
  Sparkles
} from 'lucide-react';
import { donationCenters } from '../data/mockData';

// Haversine distance calculator in miles
function calculateDistanceMiles(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 3958.8; // Radius of earth in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export default function BloodBankMap({
  currentDonor,
  onSelectCenterToBook,
  onOpenQuiz
}) {
  // User geolocation state
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error' | 'denied'
  const [locationErrorMsg, setLocationErrorMsg] = useState('');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBloodFilter, setSelectedBloodFilter] = useState('ALL');
  const [selectedCenterId, setSelectedCenterId] = useState(donationCenters[0]?.id);
  const [sortBy, setSortBy] = useState('distance'); // 'distance' | 'slots' | 'name'

  // Default coordinate center (New York metro area)
  const defaultCenter = { lat: 40.7484, lng: -73.9857, name: 'New York, NY' };

  // Attempt HTML5 Geolocation on mount or button click
  const requestUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('error');
      setLocationErrorMsg('Geolocation is not supported by your browser.');
      return;
    }

    setLocationStatus('loading');
    setLocationErrorMsg('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: Math.round(position.coords.accuracy),
        };
        setUserLocation(coords);
        setLocationStatus('success');
      },
      (error) => {
        setLocationStatus('denied');
        if (error.code === error.PERMISSION_DENIED) {
          setLocationErrorMsg('Location access was denied. Showing regional blood banks.');
        } else {
          setLocationErrorMsg('Unable to retrieve current location. Using regional view.');
        }
        // Fallback to demo location near NYC so distances calculate realistically
        setUserLocation({ lat: 40.7306, lng: -73.9352, isFallback: true });
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    // Automatically probe user location gently
    requestUserLocation();
  }, []);

  // Compute centers with calculated distances
  const enrichedCenters = useMemo(() => {
    const referenceLat = userLocation?.lat || defaultCenter.lat;
    const referenceLng = userLocation?.lng || defaultCenter.lng;

    return donationCenters.map((center) => {
      const distance = calculateDistanceMiles(
        referenceLat,
        referenceLng,
        center.lat,
        center.lng
      );
      const isUrgentForUser =
        currentDonor && center.urgentBloodNeeded?.includes(currentDonor.bloodGroup);

      return {
        ...center,
        distanceMiles: distance,
        isUrgentForUser,
      };
    });
  }, [userLocation, currentDonor]);

  // Filtered & sorted centers list
  const filteredCenters = useMemo(() => {
    let list = enrichedCenters.filter((center) => {
      const matchesSearch =
        center.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        center.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        center.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        center.zipCode.includes(searchQuery);

      const matchesBlood =
        selectedBloodFilter === 'ALL' ||
        center.urgentBloodNeeded?.includes(selectedBloodFilter);

      return matchesSearch && matchesBlood;
    });

    if (sortBy === 'distance') {
      list.sort((a, b) => (a.distanceMiles || 999) - (b.distanceMiles || 999));
    } else if (sortBy === 'slots') {
      list.sort((a, b) => (b.availableSlotsToday || 0) - (a.availableSlotsToday || 0));
    } else if (sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [enrichedCenters, searchQuery, selectedBloodFilter, sortBy]);

  const activeCenter = useMemo(() => {
    return (
      enrichedCenters.find((c) => c.id === selectedCenterId) ||
      filteredCenters[0] ||
      enrichedCenters[0]
    );
  }, [selectedCenterId, enrichedCenters, filteredCenters]);

  // SVG Map bounding box calculations
  // NYC area coordinates normalization for SVG rendering:
  // Lat range: 40.64 to 40.80, Lng range: -74.05 to -73.90
  const mapBounds = {
    minLat: 40.64,
    maxLat: 40.80,
    minLng: -74.05,
    maxLng: -73.90,
  };

  const getCoordinatesPct = (lat, lng) => {
    // Invert lat for Y (top to bottom)
    const yPct = ((mapBounds.maxLat - lat) / (mapBounds.maxLat - mapBounds.minLat)) * 100;
    const xPct = ((lng - mapBounds.minLng) / (mapBounds.maxLng - mapBounds.minLng)) * 100;
    return {
      x: Math.min(94, Math.max(6, xPct)),
      y: Math.min(94, Math.max(6, yPct)),
    };
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto text-slate-100">
      {/* Top Banner & Location Status */}
      <div className="bg-[#12070a]/90 rounded-3xl border border-red-500/20 p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-500/40 text-red-400 flex items-center justify-center shadow-[0_0_15px_rgba(220,38,38,0.4)]">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-950 border border-red-700/40 text-red-400 text-[10px] font-black uppercase tracking-wider mb-1">
                📍 GEO-LOCATED RADAR
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Nearby Blood Banks & Donation Centers
              </h1>
              <p className="text-xs text-zinc-400">
                Live interactive radar of certified hospital donor pavilions and mobile drives
              </p>
            </div>
          </div>
        </div>

        {/* Geolocation Button & Status */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={requestUserLocation}
            disabled={locationStatus === 'loading'}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 shadow-[0_0_15px_rgba(220,38,38,0.3)] cursor-pointer ${
              locationStatus === 'success'
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-900/60'
                : 'bg-gradient-to-r from-red-600 to-crimson-600 hover:from-red-500 hover:to-crimson-500 text-white border border-red-400/40'
            }`}
          >
            <Navigation className={`w-3.5 h-3.5 ${locationStatus === 'loading' ? 'animate-spin' : ''}`} />
            {locationStatus === 'loading'
              ? 'Pinging GPS Radar...'
              : locationStatus === 'success'
              ? 'GPS Locked In ✓'
              : 'Acquire My GPS Location'}
          </button>

          {onOpenQuiz && (
            <button
              onClick={onOpenQuiz}
              className="px-3.5 py-2.5 rounded-xl border border-white/10 text-zinc-300 text-xs font-bold hover:bg-white/10 transition flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle className="w-3.5 h-3.5 text-red-400" /> Vibe Check First
            </button>
          )}
        </div>
      </div>

      {locationErrorMsg && (
        <div className="p-3.5 bg-amber-950/40 rounded-2xl border border-amber-500/30 text-xs text-amber-200 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            {locationErrorMsg}
          </span>
          <span className="text-[11px] text-amber-400 font-semibold">Distances estimated</span>
        </div>
      )}

      {/* SEARCH & FILTER CONTROLS */}
      <div className="bg-[#12070a]/90 rounded-2xl border border-red-500/20 p-4 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3 backdrop-blur-xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by hospital name, city, or zip code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-black/60 border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Blood group urgency filter */}
          <select
            value={selectedBloodFilter}
            onChange={(e) => setSelectedBloodFilter(e.target.value)}
            className="px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs font-bold text-white focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Urgent Types</option>
            {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map((bg) => (
              <option key={bg} value={bg}>Urgent: {bg}</option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs font-bold text-white focus:outline-none cursor-pointer"
          >
            <option value="distance">Sort: Nearest First</option>
            <option value="slots">Sort: Most Available Slots</option>
            <option value="name">Sort: Center Name</option>
          </select>
        </div>
      </div>

      {/* MAIN TWO-COLUMN MAP + LIST VIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* INTERACTIVE MAP CONTAINER (7 COLS) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#12070a]/90 rounded-3xl border border-red-500/20 shadow-2xl overflow-hidden flex flex-col backdrop-blur-xl">
            {/* Map Top Bar */}
            <div className="p-4 bg-black/50 border-b border-white/10 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-white font-black">
                <Compass className="w-4 h-4 text-red-400" />
                Interactive Blood Center Radar
              </div>
              <span className="text-[11px] text-zinc-400">
                Tap any glowing pin to inspect coordinates & book
              </span>
            </div>

            {/* Visual Vector / Interactive Canvas Map */}
            <div className="relative w-full h-80 sm:h-96 bg-[#080305] overflow-hidden select-none">
              {/* Map stylized background grid & roads */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    'radial-gradient(#ef4444 1px, transparent 1px), linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px)',
                  backgroundSize: '24px 24px, 48px 48px',
                }}
              />

              {/* Waterway / River graphic element for NY map feel */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                <path
                  d="M 120 0 Q 150 180 180 400"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="32"
                />
                <path
                  d="M 280 0 Q 240 180 260 400"
                  fill="none"
                  stroke="#991b1b"
                  strokeWidth="24"
                />
              </svg>

              {/* User Location Pulsing Pin */}
              {userLocation && (
                <div
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 transition-all duration-700"
                  style={{
                    left: `${getCoordinatesPct(userLocation.lat, userLocation.lng).x}%`,
                    top: `${getCoordinatesPct(userLocation.lat, userLocation.lng).y}%`,
                  }}
                >
                  <div className="relative flex items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-9 w-9 rounded-full bg-cyan-400 opacity-60" />
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500 border-2 border-white shadow-md" />
                    <span className="absolute -bottom-5 bg-cyan-950/90 text-cyan-200 text-[9px] font-bold px-1.5 py-0.5 rounded border border-cyan-500/40 whitespace-nowrap">
                      You are here
                    </span>
                  </div>
                </div>
              )}

              {/* Blood Center Pins */}
              {enrichedCenters.map((center) => {
                const isSelected = center.id === activeCenter?.id;
                const coords = getCoordinatesPct(center.lat, center.lng);

                return (
                  <button
                    key={center.id}
                    onClick={() => setSelectedCenterId(center.id)}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10 transition-all duration-300 focus:outline-none group cursor-pointer"
                    style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
                    title={`${center.name} (${center.distanceMiles} mi)`}
                  >
                    <div className="relative flex flex-col items-center">
                      {/* Floating pin badge */}
                      <div
                        className={`px-2.5 py-1 rounded-xl flex items-center gap-1 font-black text-[10px] shadow-lg transition-transform duration-200 ${
                          isSelected
                            ? 'bg-red-600 text-white scale-125 z-30 ring-2 ring-red-400 shadow-[0_0_20px_rgba(220,38,38,0.9)]'
                            : center.isUrgentForUser
                            ? 'bg-rose-600 text-white group-hover:scale-110 shadow-[0_0_15px_rgba(225,29,72,0.6)]'
                            : 'bg-zinc-900 border border-white/20 text-white group-hover:scale-110'
                        }`}
                      >
                        <Droplet className="w-3 h-3 fill-current shrink-0 text-red-300" />
                        <span className="max-w-[85px] truncate">{center.name.split(' ')[0]}</span>
                      </div>

                      {/* Pin arrow point */}
                      <div
                        className={`w-2 h-2 rotate-45 -mt-1 ${
                          isSelected
                            ? 'bg-red-600'
                            : center.isUrgentForUser
                            ? 'bg-rose-600'
                            : 'bg-zinc-900'
                        }`}
                      />
                    </div>
                  </button>
                );
              })}

              {/* Map Footer Compass Overlay */}
              <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-[10px] flex items-center gap-2 border border-white/10">
                <span className="w-2 h-2 rounded-full bg-cyan-400" /> Your Position
                <span className="w-2 h-2 rounded-full bg-red-500 ml-1" /> Donor Pavilion
              </div>
            </div>

            {/* Active Center Spotlight Card */}
            {activeCenter && (
              <div className="p-5 bg-gradient-to-br from-[#18090c] to-[#0c0406] border-t border-red-500/20 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-500/40">
                        {activeCenter.type}
                      </span>
                      {activeCenter.distanceMiles !== null && (
                        <span className="text-xs font-bold text-zinc-400">
                          📍 {activeCenter.distanceMiles} miles away
                        </span>
                      )}
                      {activeCenter.isUrgentForUser && (
                        <span className="text-[10px] font-black bg-red-600 text-white px-2 py-0.5 rounded shadow-[0_0_10px_rgba(220,38,38,0.5)]">
                          ⚡ URGENT FOR {currentDonor?.bloodGroup}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-white mt-1">
                      {activeCenter.name}
                    </h3>

                    <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      {activeCenter.address}, {activeCenter.city}, {activeCenter.state} {activeCenter.zipCode}
                    </p>
                  </div>

                  <div className="flex sm:flex-col gap-2 shrink-0">
                    <button
                      onClick={() => onSelectCenterToBook && onSelectCenterToBook(activeCenter)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-crimson-600 hover:from-red-500 hover:to-crimson-500 text-white font-black text-xs shadow-[0_0_15px_rgba(220,38,38,0.5)] border border-red-400/40 flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5" /> Book Slot
                    </button>

                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                        `${activeCenter.name}, ${activeCenter.address}, ${activeCenter.city}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-xl border border-white/10 text-zinc-300 text-xs font-bold hover:bg-white/10 flex items-center justify-center gap-1 transition"
                    >
                      <ExternalLink className="w-3 h-3" /> Directions
                    </a>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between text-xs text-zinc-400 gap-2">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-red-400" /> Hours: {activeCenter.hours}
                  </span>
                  <a
                    href={`tel:${activeCenter.phone}`}
                    className="flex items-center gap-1 text-red-400 font-bold hover:underline"
                  >
                    <Phone className="w-3.5 h-3.5" /> {activeCenter.phone}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: SCROLLABLE CENTERS LIST (5 COLS) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-black text-zinc-400 px-1">
            <span>REGISTERED PAVILIONS ({filteredCenters.length})</span>
            <span>Sorted by {sortBy}</span>
          </div>

          <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
            {filteredCenters.map((center) => {
              const isSelected = center.id === activeCenter?.id;

              return (
                <div
                  key={center.id}
                  onClick={() => setSelectedCenterId(center.id)}
                  className={`p-4 rounded-2xl border transition cursor-pointer relative backdrop-blur-xl ${
                    isSelected
                      ? 'bg-[#18090c] border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.3)] ring-1 ring-red-500'
                      : 'bg-[#12070a]/90 border-white/10 hover:border-red-500/40 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-white leading-snug">
                        {center.name}
                      </h4>
                      <p className="text-[11px] text-zinc-400 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                        {center.address}, {center.city}
                      </p>
                    </div>

                    {center.distanceMiles !== null && (
                      <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 shrink-0">
                        {center.distanceMiles} mi
                      </span>
                    )}
                  </div>

                  {/* Urgent Needs Badge */}
                  {center.urgentBloodNeeded && (
                    <div className="mt-2.5 flex flex-wrap items-center gap-1 text-[10px]">
                      <span className="font-bold text-zinc-500">Urgent:</span>
                      {center.urgentBloodNeeded.map((bg) => (
                        <span
                          key={bg}
                          className={`font-black px-1.5 py-0.2 rounded ${
                            currentDonor?.bloodGroup === bg
                              ? 'bg-red-600 text-white shadow-[0_0_8px_rgba(220,38,38,0.6)]'
                              : 'bg-red-950/80 text-red-300 border border-red-700/40'
                          }`}
                        >
                          {bg}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px]">
                    <span className="text-zinc-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-red-400" />
                      {center.availableSlotsToday || 12} slots available
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelectCenterToBook) onSelectCenterToBook(center);
                      }}
                      className="font-black text-red-400 hover:text-red-300 flex items-center gap-0.5 cursor-pointer"
                    >
                      Book Slot <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
