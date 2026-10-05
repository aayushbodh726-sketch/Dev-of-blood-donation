import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, CheckCircle, XCircle } from 'lucide-react';
import { displayBloodGroup } from '../utils/bloodGroups';

export default function DonorCard({ donor }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="card p-6 flex flex-col justify-between hover:-translate-y-1 transition-all duration-300">
        <div>
          {/* Top Row: Avatar + Blood Group */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-crimson-100 text-crimson-800 font-black text-xl flex items-center justify-center shadow-inner">
                {donor.name?.[0]?.toUpperCase() || 'D'}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg leading-snug">{donor.name}</h3>
                <div className="flex items-center gap-1.5 text-slate-500 text-sm mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{donor.city}, {donor.state}</span>
                </div>
              </div>
            </div>

            <div className="badge-blood text-base px-3 py-1 font-black">
              {displayBloodGroup(donor.bloodGroup)}
            </div>
          </div>

          {/* Availability Status */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Status</span>
            {donor.isAvailable ? (
              <span className="badge-available flex items-center gap-1 text-xs">
                <CheckCircle className="w-3.5 h-3.5" />
                Available to donate
              </span>
            ) : (
              <span className="badge-unavailable flex items-center gap-1 text-xs">
                <XCircle className="w-3.5 h-3.5" />
                Currently unavailable
              </span>
            )}
          </div>
        </div>

        {/* Action button */}
        <button
          onClick={() => setShowModal(true)}
          className="mt-6 btn-secondary py-2.5 text-sm flex items-center justify-center gap-2 w-full"
        >
          <Phone className="w-4 h-4 text-crimson-600" />
          Contact Donor
        </button>
      </div>

      {/* Contact Privacy Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-scale-in">
            <div className="w-12 h-12 rounded-full bg-crimson-100 text-crimson-700 flex items-center justify-center mx-auto mb-4">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 text-center mb-2">Donor Privacy Protection</h3>
            <p className="text-slate-600 text-sm text-center mb-6 leading-relaxed">
              To protect donor privacy and prevent spam, contact details are shared when an active emergency request matches donor availability.
            </p>
            <div className="space-y-3">
              <Link
                to="/request-blood"
                className="btn-primary w-full text-center block text-sm"
              >
                Create Emergency Request
              </Link>
              <button
                onClick={() => setShowModal(false)}
                className="w-full text-center text-sm font-semibold text-slate-500 hover:text-slate-800 py-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
