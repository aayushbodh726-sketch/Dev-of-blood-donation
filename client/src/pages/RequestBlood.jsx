import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Building2, Phone, MapPin, CheckCircle2 } from 'lucide-react';
import { api } from '../utils/api';
import { BLOOD_GROUP_OPTIONS } from '../utils/bloodGroups';
import Toast from '../components/Toast';

export default function RequestBlood() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    patientName: '',
    hospitalName: '',
    hospitalAddr: '',
    bloodGroup: 'A_POS',
    unitsNeeded: 1,
    urgency: 'NORMAL',
    contactPhone: '',
    city: '',
    state: '',
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.patientName.trim()) newErrors.patientName = 'Patient name is required';
    if (!formData.hospitalName.trim()) newErrors.hospitalName = 'Hospital name is required';
    if (!formData.contactPhone.trim()) newErrors.contactPhone = 'Contact phone is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (formData.unitsNeeded < 1) newErrors.unitsNeeded = 'At least 1 unit required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await api.createRequest({
        ...formData,
        unitsNeeded: Number(formData.unitsNeeded),
      });

      if (res.success) {
        setToast({ message: 'Emergency blood request published successfully!', type: 'success' });
        setTimeout(() => {
          navigate('/active-requests');
        }, 1500);
      } else {
        setToast({ message: res.error || 'Failed to submit request', type: 'error' });
      }
    } catch (err) {
      setToast({ message: err.message || 'Something went wrong', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-2xl mx-auto px-4">
        <div className="card p-8 sm:p-10 shadow-lg border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-crimson-100 text-crimson-700 flex items-center justify-center shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Request Blood</h1>
              <p className="text-sm text-slate-600">Submit an emergency requirement to alert compatible donors.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Patient & Hospital */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Patient Name *</label>
                <input
                  type="text"
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleChange}
                  placeholder="Full name of patient"
                  className={`input-field ${errors.patientName ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                {errors.patientName && <p className="mt-1 text-xs text-red-500">{errors.patientName}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Hospital Name *</label>
                <input
                  type="text"
                  name="hospitalName"
                  value={formData.hospitalName}
                  onChange={handleChange}
                  placeholder="e.g. City General Hospital"
                  className={`input-field ${errors.hospitalName ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                {errors.hospitalName && <p className="mt-1 text-xs text-red-500">{errors.hospitalName}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Hospital Address (Optional)</label>
              <input
                type="text"
                name="hospitalAddr"
                value={formData.hospitalAddr}
                onChange={handleChange}
                placeholder="Ward, floor or street address"
                className="input-field"
              />
            </div>

            {/* Blood Group & Units */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Blood Group Needed *</label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  className="input-field font-semibold text-crimson-800"
                >
                  {BLOOD_GROUP_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label} ({opt.value})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Units Needed *</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  name="unitsNeeded"
                  value={formData.unitsNeeded}
                  onChange={handleChange}
                  className={`input-field ${errors.unitsNeeded ? 'border-red-500' : ''}`}
                />
                {errors.unitsNeeded && <p className="mt-1 text-xs text-red-500">{errors.unitsNeeded}</p>}
              </div>
            </div>

            {/* Urgency Radio Cards */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Urgency Level *</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'NORMAL', label: 'NORMAL', desc: 'Scheduled', color: 'border-blue-200 bg-blue-50/50 text-blue-900' },
                  { id: 'HIGH', label: 'HIGH', desc: 'Within 24h', color: 'border-amber-200 bg-amber-50/50 text-amber-900' },
                  { id: 'CRITICAL', label: 'CRITICAL', desc: 'Immediate', color: 'border-crimson-200 bg-crimson-50/50 text-crimson-900' },
                ].map((item) => (
                  <label
                    key={item.id}
                    className={`cursor-pointer border-2 rounded-2xl p-3 text-center transition-all ${
                      formData.urgency === item.id
                        ? 'border-crimson-700 bg-crimson-50 ring-2 ring-crimson-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="urgency"
                      value={item.id}
                      checked={formData.urgency === item.id}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="font-black text-sm">{item.label}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{item.desc}</div>
                  </label>
                ))}
              </div>
            </div>

            {/* Location & Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Contact Phone *</label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className={`input-field ${errors.contactPhone ? 'border-red-500' : ''}`}
                />
                {errors.contactPhone && <p className="mt-1 text-xs text-red-500">{errors.contactPhone}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g. Mumbai"
                  className={`input-field ${errors.city ? 'border-red-500' : ''}`}
                />
                {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">State *</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="e.g. Maharashtra"
                  className={`input-field ${errors.state ? 'border-red-500' : ''}`}
                />
                {errors.state && <p className="mt-1 text-xs text-red-500">{errors.state}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full py-4 text-base shadow-xl shadow-crimson-700/20"
            >
              {submitting ? 'Publishing Request...' : 'Publish Emergency Request'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
