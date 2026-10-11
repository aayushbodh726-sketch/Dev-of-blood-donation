import { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw, UserX } from 'lucide-react';
import { api } from '../utils/api';
import { BLOOD_GROUP_OPTIONS } from '../utils/bloodGroups';
import DonorCard from '../components/DonorCard';
import Footer from '../components/Footer';

export default function Donors() {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedBloodGroup, setSelectedBloodGroup] = useState('');
  const [cityFilter, setCityFilter] = useState('');

  const fetchDonors = useCallback(async (bloodGroup = selectedBloodGroup, city = cityFilter) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.searchDonors({
        bloodGroup,
        city,
      });
      if (res.success) {
        setDonors(res.data);
      } else {
        setError(res.error || 'Failed to fetch donors');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong fetching donors');
    } finally {
      setLoading(false);
    }
  }, [selectedBloodGroup, cityFilter]);

  useEffect(() => {
    fetchDonors();
  }, []); // initial load only

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDonors(selectedBloodGroup, cityFilter);
  };

  const handleClearFilters = () => {
    setSelectedBloodGroup('');
    setCityFilter('');
    fetchDonors('', '');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-grow pb-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900">Find Blood Donors</h1>
          <p className="text-slate-600 mt-2">
            Search available blood donors by blood group and city.
          </p>
        </div>

        {/* Filter Bar Card */}
        <div className="card p-6 mb-8 bg-white shadow-sm">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Blood Group
              </label>
              <select
                value={selectedBloodGroup}
                onChange={(e) => setSelectedBloodGroup(e.target.value)}
                className="input-field"
              >
                <option value="">All Blood Groups</option>
                {BLOOD_GROUP_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label} ({opt.value})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                City / Location
              </label>
              <input
                type="text"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                placeholder="Enter city (e.g., Mumbai)"
                className="input-field"
              />
            </div>

            <div className="flex gap-2">
              <button type="submit" className="btn-primary flex-grow py-3 flex items-center justify-center gap-2">
                <Search className="w-4 h-4" />
                Search Donors
              </button>
              {(selectedBloodGroup || cityFilter) && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="btn-secondary py-3 px-4"
                  title="Reset filters"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Count display */}
        {!loading && !error && (
          <div className="mb-6 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-600">
              Showing <span className="text-slate-900 font-bold">{donors.length}</span> active donor(s)
            </span>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card p-6 h-56 flex flex-col justify-between animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-slate-200 rounded-2xl" />
                  <div className="space-y-2 flex-grow">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-10 bg-slate-200 rounded-xl mt-6" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-200 text-center max-w-md mx-auto my-12">
            <p className="font-semibold">{error}</p>
            <button onClick={() => fetchDonors()} className="mt-4 btn-secondary py-2 px-4 text-sm">
              Try Again
            </button>
          </div>
        )}

        {/* Results Grid */}
        {!loading && !error && donors.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {donors.map((donor) => (
              <DonorCard key={donor.id} donor={donor} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && donors.length === 0 && (
          <div className="card p-12 text-center max-w-lg mx-auto my-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <UserX className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Donors Found</h3>
            <p className="text-slate-600 text-sm mb-6">
              No available donors match your exact filter criteria. Try searching for a broader city or resetting filters.
            </p>
            <button
              onClick={handleClearFilters}
              className="btn-secondary py-2.5 px-6 text-sm"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
