import { useState } from 'react';
import { Building2, MapPin, Phone, HeartHandshake, Clock, CheckCircle2 } from 'lucide-react';
import { displayBloodGroup } from '../utils/bloodGroups';

function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function RequestCard({ request, onPledge, showPledge = false }) {
  const [pledging, setPledging] = useState(false);
  const [pledged, setPledged] = useState(false);

  const urgencyStyles = {
    CRITICAL: {
      bar: 'bg-crimson-600',
      badge: 'bg-red-100 text-red-800 border-red-200 animate-pulse-slow',
      label: 'CRITICAL',
    },
    HIGH: {
      bar: 'bg-amber-500',
      badge: 'bg-amber-100 text-amber-800 border-amber-200',
      label: 'HIGH',
    },
    NORMAL: {
      bar: 'bg-blue-500',
      badge: 'bg-blue-100 text-blue-800 border-blue-200',
      label: 'NORMAL',
    },
  };

  const currentUrgency = urgencyStyles[request.urgency] || urgencyStyles.NORMAL;

  const handlePledgeClick = async () => {
    if (!onPledge || pledging || pledged) return;
    setPledging(true);
    try {
      const success = await onPledge(request.id);
      if (success) {
        setPledged(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPledging(false);
    }
  };

  return (
    <div className="card overflow-hidden flex flex-col justify-between hover:-translate-y-1 transition-all duration-300">
      <div>
        {/* Top Urgency Color Strip */}
        <div className={`h-2 w-full ${currentUrgency.bar}`} />

        <div className="p-6">
          {/* Header Row */}
          <div className="flex items-center justify-between mb-4">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${currentUrgency.badge}`}>
              {currentUrgency.label}
            </span>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{timeAgo(request.createdAt)}</span>
            </div>
          </div>

          {/* Main Info */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-xl">{request.patientName}</h3>
              <div className="flex items-center gap-1.5 text-slate-600 text-sm mt-1">
                <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-medium">{request.hospitalName}</span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="badge-blood text-xl px-3.5 py-1.5 font-black shadow-sm">
                {displayBloodGroup(request.bloodGroup)}
              </div>
              <p className="text-xs font-bold text-crimson-700 mt-1">{request.unitsNeeded} Unit(s) Needed</p>
            </div>
          </div>

          {/* Location & Contact Details */}
          <div className="space-y-2 pt-4 border-t border-slate-100 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{request.city}, {request.state}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Contact: {request.contactPhone}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer / Pledge Action */}
      {showPledge && request.status === 'OPEN' && (
        <div className="p-6 pt-0">
          {pledged ? (
            <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl py-3 px-4 flex items-center justify-center gap-2 font-semibold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Pledged successfully! Hospital will contact you.
            </div>
          ) : (
            <button
              onClick={handlePledgeClick}
              disabled={pledging}
              className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2"
            >
              <HeartHandshake className="w-5 h-5" />
              {pledging ? 'Pledging...' : 'Pledge to Donate Blood'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
