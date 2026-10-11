import { useState, useEffect } from 'react';
import { Inbox } from 'lucide-react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import RequestCard from '../components/RequestCard';
import Footer from '../components/Footer';
import Toast from '../components/Toast';

export default function ActiveRequests() {
  const { user, isAuthenticated } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [toast, setToast] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getRequests('OPEN');
      if (res.success) {
        setRequests(res.data);
      } else {
        setError(res.error || 'Failed to fetch requests');
      }
    } catch (err) {
      setError(err.message || 'Error loading active requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  /** Returns true only when the pledge was recorded successfully. */
  const handlePledge = async (requestId) => {
    if (!isAuthenticated) {
      setToast({ message: 'Please log in as a donor to pledge blood', type: 'error' });
      return false;
    }
    if (user?.role !== 'DONOR') {
      setToast({ message: 'Only registered donors can pledge blood', type: 'error' });
      return false;
    }

    try {
      const res = await api.pledgeToRequest(requestId);
      if (res.success) {
        setToast({ message: 'Thank you! Your pledge has been recorded.', type: 'success' });
        fetchRequests();
        return true;
      }
      setToast({ message: res.error || 'Could not record pledge', type: 'error' });
      return false;
    } catch (err) {
      setToast({ message: err.message || 'Pledge failed', type: 'error' });
      return false;
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (activeTab === 'ALL') return true;
    return r.urgency === activeTab;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pt-24">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-grow pb-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900">Active Blood Requests</h1>
          <p className="text-slate-600 mt-2">
            Respond to open blood requests from patients and hospitals in need.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
          {['ALL', 'CRITICAL', 'HIGH', 'NORMAL'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 shrink-0 ${
                activeTab === tab
                  ? 'bg-crimson-700 text-white shadow-md shadow-crimson-700/20'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {tab === 'ALL' ? 'All Urgencies' : tab}
            </button>
          ))}
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 4].map((i) => (
              <div key={i} className="card p-6 h-64 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/4 mb-4" />
                <div className="h-6 bg-slate-200 rounded w-1/2 mb-2" />
                <div className="h-4 bg-slate-200 rounded w-1/3 mb-6" />
                <div className="h-10 bg-slate-200 rounded-xl" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-200 text-center max-w-md mx-auto my-12">
            <p className="font-semibold">{error}</p>
            <button onClick={fetchRequests} className="mt-4 btn-secondary py-2 px-4 text-sm">
              Retry
            </button>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && filteredRequests.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRequests.map((req) => (
              <RequestCard
                key={req.id}
                request={req}
                onPledge={handlePledge}
                showPledge={isAuthenticated && user?.role === 'DONOR'}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filteredRequests.length === 0 && (
          <div className="card p-12 text-center max-w-lg mx-auto my-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Inbox className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Active Requests</h3>
            <p className="text-slate-600 text-sm">
              There are currently no open blood requests matching this urgency filter.
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
