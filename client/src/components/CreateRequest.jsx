import React, { useState } from 'react';
import {
  Droplet,
  MapPin,
  Building,
  User,
  Phone,
  Calendar,
  AlertTriangle,
  Clock,
  Heart,
  CheckCircle,
  Users,
  Send,
  Sparkles,
  Info
} from 'lucide-react';
import { compatibilityData } from '../data/mockData';

export default function CreateRequest({
  donors = [],
  onRequestCreated,
  onCancel,
  initialBloodGroup = 'O+',
  targetDonor = null,
}) {
  const [requestType, setRequestType] = useState(targetDonor ? 'direct_donor' : 'broadcast'); // 'broadcast' | 'direct_donor'
  const [selectedDonorId, setSelectedDonorId] = useState(targetDonor ? targetDonor.id : '');

  const [formData, setFormData] = useState({
    patientName: '',
    bloodGroup: targetDonor ? targetDonor.bloodGroup : initialBloodGroup,
    quantity: 1, // units/bags
    hospitalName: '',
    hospitalAddress: '',
    city: targetDonor ? targetDonor.city : '',
    state: targetDonor ? (targetDonor.state || 'NY') : '',
    zipCode: '',
    urgency: 'URGENT', // CRITICAL, URGENT, NORMAL
    requiredByDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString().split('T')[0],
    contactName: '',
    contactPhone: '',
    alternatePhone: '',
    medicalCondition: '',
    notes: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [syncStatus, setSyncStatus] = useState('local'); // 'synced' | 'local'

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  // Find donors compatible with recipient's requested blood group
  const compatibleBloodGroups = compatibilityData[formData.bloodGroup]?.receive || [formData.bloodGroup];
  const matchingDonors = donors.filter(
    (d) => (compatibleBloodGroups.includes(d.bloodGroup) && d.isAvailable) || (targetDonor && d.id === targetDonor.id)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (requestType === 'direct_donor' && !selectedDonorId) {
      setError('Please select a specific donor from the list to send your direct request.');
      return;
    }

    if (!formData.patientName.trim()) {
      setError('Please provide patient name.');
      return;
    }
    if (!formData.hospitalName.trim() || !formData.hospitalAddress.trim() || !formData.city.trim()) {
      setError('Please provide complete hospital name and address details.');
      return;
    }
    if (!formData.contactName.trim() || !formData.contactPhone.trim()) {
      setError('Please provide contact person name and phone number.');
      return;
    }
    if (formData.quantity < 1) {
      setError('Quantity must be at least 1 unit.');
      return;
    }

    setIsSubmitting(true);

    const newRequestItem = {
      id: 'req_' + Date.now(),
      patientName: formData.patientName.trim(),
      bloodGroup: formData.bloodGroup,
      unitsRequired: Number(formData.quantity),
      hospital: formData.hospitalName.trim(),
      hospitalAddress: formData.hospitalAddress.trim(),
      city: formData.city.trim(),
      state: formData.state.trim() || 'NY',
      zipCode: formData.zipCode.trim(),
      urgency: formData.urgency,
      requiredByDate: formData.requiredByDate,
      contactName: formData.contactName.trim(),
      contactPhone: formData.contactPhone.trim(),
      alternatePhone: formData.alternatePhone.trim(),
      medicalCondition: formData.medicalCondition.trim(),
      note: formData.notes.trim(),
      requestType: requestType,
      targetDonorId: requestType === 'direct_donor' ? selectedDonorId : null,
      status: 'OPEN',
      createdAt: 'Just now',
    };

    // Try optional API sync if VITE_API_BASE_URL is configured
    const apiBase = import.meta.env?.VITE_API_BASE_URL;
    const apiKey = import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY;

    if (apiBase) {
      try {
        const payload = {
          patientName: newRequestItem.patientName,
          bloodGroup: newRequestItem.bloodGroup,
          units: newRequestItem.unitsRequired,
          hospital: newRequestItem.hospital,
          hospitalAddress: newRequestItem.hospitalAddress,
          city: newRequestItem.city,
          state: newRequestItem.state,
          zipCode: newRequestItem.zipCode,
          urgency: newRequestItem.urgency,
          requiredByDate: newRequestItem.requiredByDate,
          contactName: newRequestItem.contactName,
          contactPhone: newRequestItem.contactPhone,
          alternatePhone: newRequestItem.alternatePhone,
          medicalCondition: newRequestItem.medicalCondition,
          notes: newRequestItem.note,
        };

        const res = await fetch(`${apiBase}/requests`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(apiKey ? { apikey: apiKey, Authorization: `Bearer ${apiKey}` } : {}),
          },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          setSyncStatus('synced');
        } else {
          // If server returns 500 or error, fall back smoothly so the emergency request is never lost
          console.warn('Backend server returned error, saving request locally to community network:', res.status);
          setSyncStatus('local');
        }
      } catch (err) {
        console.warn('Could not connect to remote backend, saving request locally:', err);
        setSyncStatus('local');
      }
    } else {
      setSyncStatus('local');
    }

    // Always add request to active community list
    if (onRequestCreated) {
      onRequestCreated(newRequestItem);
    }

    setIsSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-[#12070a] rounded-3xl p-8 max-w-2xl mx-auto border border-red-500/30 shadow-[0_0_50px_rgba(220,38,38,0.3)] text-center space-y-5 animate-scale-in text-white backdrop-blur-2xl">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(16,185,129,0.4)]">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white">Blood Request Broadcasted!</h2>
        <p className="text-zinc-300 max-w-md mx-auto text-sm">
          {requestType === 'direct_donor'
            ? 'Your direct request has been dispatched to the selected donor. They will receive an immediate audible chime and priority alert.'
            : `Your emergency request for ${formData.quantity} unit(s) of ${formData.bloodGroup} has been dispatched to all compatible donors near ${formData.hospitalName}.`}
        </p>

        <div className="bg-black/50 p-4 rounded-2xl text-left border border-white/10 text-xs space-y-2 max-w-md mx-auto text-zinc-300">
          <p><strong className="text-white">Patient:</strong> {formData.patientName}</p>
          <p><strong className="text-white">Blood Group Needed:</strong> <span className="font-extrabold text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-500/40 ml-1">{formData.bloodGroup}</span> ({formData.quantity} units)</p>
          <p><strong className="text-white">Hospital:</strong> {formData.hospitalName}, {formData.hospitalAddress}, {formData.city}, {formData.state}</p>
          <p><strong className="text-white">Emergency Contact:</strong> {formData.contactName} ({formData.contactPhone})</p>
          <p><strong className="text-white">Urgency:</strong> <span className="text-amber-300 font-bold">{formData.urgency}</span></p>
        </div>

        <div className="pt-2">
          <button
            onClick={() => {
              setSubmitted(false);
              if (onCancel) onCancel();
            }}
            className="px-7 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-crimson-600 hover:from-red-500 hover:to-crimson-500 text-white font-black text-sm shadow-[0_0_20px_rgba(220,38,38,0.5)] border border-red-400/40 transition cursor-pointer"
          >
            Done & Return to Dispatch
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#12070a]/95 rounded-3xl border border-red-500/20 shadow-2xl max-w-3xl mx-auto overflow-hidden animate-fade-in text-slate-100 backdrop-blur-2xl">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-red-950 via-crimson-900 to-[#12070a] text-white p-6 sm:p-8 border-b border-red-500/20">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 rounded-2xl bg-red-600/30 border border-red-500/40 backdrop-blur-md flex items-center justify-center text-red-300 shadow-[0_0_15px_rgba(220,38,38,0.5)]">
            <Droplet className="w-6 h-6 fill-current animate-pulse" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-950 border border-red-600/40 text-red-400 text-[10px] font-black uppercase tracking-wider mb-1">
              🚨 EMERGENCY DISPATCH
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Create Blood Request</h1>
            <p className="text-xs sm:text-sm text-red-200">
              Broadcast critical blood appeals to matching local donors and hospital registries
            </p>
          </div>
        </div>

        {/* Toggle Request Mode */}
        <div className="mt-5 grid grid-cols-2 gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/10">
          <button
            type="button"
            onClick={() => setRequestType('broadcast')}
            className={`py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
              requestType === 'broadcast'
                ? 'bg-gradient-to-r from-red-600 to-crimson-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)] border border-red-400/40'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" /> Broadcast to All Donors
          </button>
          <button
            type="button"
            onClick={() => setRequestType('direct_donor')}
            className={`py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
              requestType === 'direct_donor'
                ? 'bg-gradient-to-r from-red-600 to-crimson-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)] border border-red-400/40'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Send className="w-4 h-4" /> Request Specific Donor
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
        {error && (
          <div className="bg-red-950/80 border border-red-500/50 text-red-300 px-4 py-3 rounded-2xl text-sm flex items-center gap-2 shadow-[0_0_15px_rgba(220,38,38,0.3)]">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* SECTION 1: BLOOD DETAILS & QUANTITY */}
        <div>
          <h2 className="text-xs font-black uppercase tracking-wider mb-3 flex items-center gap-2 text-red-400">
            <Droplet className="w-4 h-4 text-red-500 fill-current" /> Blood Requirement & Urgency
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1.5">
                Required Blood Type *
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {bloodGroups.map((bg) => (
                  <button
                    key={bg}
                    type="button"
                    onClick={() => setFormData({ ...formData, bloodGroup: bg })}
                    className={`py-2.5 rounded-xl text-sm font-black border transition cursor-pointer ${
                      formData.bloodGroup === bg
                        ? 'bg-red-600 text-white border-red-400 shadow-[0_0_15px_rgba(220,38,38,0.6)]'
                        : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'
                    }`}
                  >
                    {bg}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-zinc-400 mt-2 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-red-400" />
                <span>Compatible groups: <strong className="text-zinc-200">{compatibleBloodGroups.join(', ')}</strong></span>
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1.5">
                Quantity Required (Units / Bags) *
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, quantity: Math.max(1, formData.quantity - 1) })}
                  className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center font-bold text-lg hover:bg-white/10 text-white cursor-pointer"
                >
                  -
                </button>
                <div className="flex-1 text-center py-2 border border-white/10 rounded-xl bg-black/60 font-black text-lg text-white">
                  {formData.quantity} {formData.quantity === 1 ? 'Unit (~450ml)' : 'Units'}
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, quantity: Math.min(10, formData.quantity + 1) })}
                  className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center font-bold text-lg hover:bg-white/10 text-white cursor-pointer"
                >
                  +
                </button>
              </div>

              <div className="mt-3">
                <label className="text-xs font-bold text-zinc-300 block mb-1.5">
                  Urgency Level *
                </label>
                <select
                  value={formData.urgency}
                  onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-white/10 rounded-xl text-sm bg-black/60 text-white focus:outline-none focus:border-red-500 cursor-pointer"
                >
                  <option value="CRITICAL" className="bg-zinc-900">🚨 Critical (Immediate / within 2 hours)</option>
                  <option value="URGENT" className="bg-zinc-900">⚠️ Urgent (Within 24 hours)</option>
                  <option value="NORMAL" className="bg-zinc-900">🩺 Normal / Scheduled Surgery</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: DIRECT DONOR SELECTION */}
        {requestType === 'direct_donor' && (
          <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/30 space-y-2">
            <h3 className="text-xs font-black text-red-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" /> Select Registered Donor to Notify
            </h3>
            {matchingDonors.length === 0 ? (
              <p className="text-xs text-zinc-400">
                No active donors currently match {formData.bloodGroup}. You can switch to "Broadcast to All Donors" to alert the wider community.
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {matchingDonors.map((d) => (
                  <label
                    key={d.id}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition ${
                      selectedDonorId === d.id
                        ? 'bg-red-600/20 border-red-500 shadow-[0_0_10px_rgba(220,38,38,0.4)]'
                        : 'bg-black/40 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="selectedDonor"
                        value={d.id}
                        checked={selectedDonorId === d.id}
                        onChange={() => setSelectedDonorId(d.id)}
                        className="text-red-600 focus:ring-red-500"
                      />
                      <div>
                        <div className="font-bold text-white">{d.name}</div>
                        <div className="text-zinc-400 text-[11px]">{d.city}, {d.state} • {d.totalDonations} donations</div>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-lg font-black bg-red-600 text-white text-[11px]">
                      {d.bloodGroup}
                    </span>
                  </label>
                ))}
              </div>
            )}
            <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-[11px] text-zinc-300 flex items-center gap-2">
              <span className="text-base">🔔</span>
              <span><strong>Instant Alert:</strong> Selected donor will receive an audio chime and direct push notification in their dashboard.</span>
            </div>
          </div>
        )}

        {/* SECTION 3: PATIENT & MEDICAL DETAILS */}
        <div>
          <h2 className="text-xs font-black uppercase tracking-wider mb-3 flex items-center gap-2 text-red-400">
            <User className="w-4 h-4 text-red-500" /> Patient Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1">
                Patient Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Maya Lin"
                value={formData.patientName}
                onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1">
                Needed By Date *
              </label>
              <input
                type="date"
                required
                value={formData.requiredByDate}
                onChange={(e) => setFormData({ ...formData, requiredByDate: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-red-500 transition"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-zinc-300 block mb-1">
                Medical Reason / Surgery / Condition (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Emergency trauma care, pediatric open heart surgery"
                value={formData.medicalCondition}
                onChange={(e) => setFormData({ ...formData, medicalCondition: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: HOSPITAL NAME & FULL ADDRESS */}
        <div>
          <h2 className="text-xs font-black uppercase tracking-wider mb-3 flex items-center gap-2 text-red-400">
            <Building className="w-4 h-4 text-red-500" /> Hospital Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-3">
              <label className="text-xs font-bold text-zinc-300 block mb-1">
                Hospital / Clinic Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Mount Sinai Medical Center"
                value={formData.hospitalName}
                onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="text-xs font-bold text-zinc-300 block mb-1">
                Full Hospital Address (Street & Ward/Room) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 1468 Madison Ave, ICU Ward 4B"
                value={formData.hospitalAddress}
                onChange={(e) => setFormData({ ...formData, hospitalAddress: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1">
                City *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. New York"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1">
                State
              </label>
              <input
                type="text"
                placeholder="e.g. NY"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1">
                ZIP Code
              </label>
              <input
                type="text"
                placeholder="e.g. 10029"
                value={formData.zipCode}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition"
              />
            </div>
          </div>
        </div>

        {/* SECTION 5: CONTACT INFORMATION */}
        <div>
          <h2 className="text-xs font-black uppercase tracking-wider mb-3 flex items-center gap-2 text-red-400">
            <Phone className="w-4 h-4 text-red-500" /> Emergency Point of Contact
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1">
                Contact Person Name *
              </label>
              <input
                type="text"
                required
                placeholder="Relative / Attending Coordinator"
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1">
                Emergency Phone Number *
              </label>
              <input
                type="tel"
                required
                placeholder="+1 (555) 000-0000"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-zinc-300 block mb-1">
                Doctor's Notes & Instructions (Optional)
              </label>
              <textarea
                rows="2"
                placeholder="e.g. Please bring donor card. Report directly to 4th floor blood bank coordinator."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl border border-white/10 text-zinc-300 text-xs font-bold hover:bg-white/10 cursor-pointer transition"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-crimson-600 hover:from-red-500 hover:to-crimson-500 text-white text-xs font-black shadow-[0_0_20px_rgba(220,38,38,0.5)] border border-red-400/40 flex items-center gap-2 cursor-pointer transition ${
              isSubmitting ? 'opacity-70 cursor-wait' : ''
            }`}
          >
            <Send className="w-4 h-4" />
            {isSubmitting
              ? 'Publishing Request...'
              : requestType === 'direct_donor'
              ? 'Send Request to Selected Donor'
              : 'Broadcast Blood Appeal 🚨'}
          </button>
        </div>
      </form>
    </div>
  );
}
