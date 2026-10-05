import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ChevronRight } from 'lucide-react';
import { api } from '../utils/api';
import { displayBloodGroup } from '../utils/bloodGroups';

export default function EmergencyBanner() {
  const [criticalRequests, setCriticalRequests] = useState([]);

  useEffect(() => {
    async function fetchCritical() {
      try {
        const res = await api.getRequests('OPEN');
        if (res.success && Array.isArray(res.data)) {
          const critical = res.data.filter((r) => r.urgency === 'CRITICAL');
          setCriticalRequests(critical);
        }
      } catch (err) {
        console.error('Failed to load critical requests:', err);
      }
    }
    fetchCritical();
  }, []);

  if (criticalRequests.length === 0) return null;

  return (
    <div className="bg-crimson-800 text-white shadow-md relative z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs sm:text-sm">
        <div className="flex items-center gap-2 overflow-hidden w-full sm:w-auto">
          <span className="flex h-3 w-3 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          <span className="font-bold tracking-wider uppercase bg-crimson-900 px-2 py-0.5 rounded text-[11px] shrink-0">
            Urgent Alert
          </span>
          <div className="truncate font-medium">
            Critical need: <span className="font-bold text-red-200">{displayBloodGroup(criticalRequests[0].bloodGroup)}</span> blood required at{' '}
            <span className="font-semibold">{criticalRequests[0].hospitalName}</span> ({criticalRequests[0].city})
          </div>
        </div>

        <Link
          to="/active-requests"
          className="shrink-0 flex items-center gap-1 font-semibold text-red-100 hover:text-white underline underline-offset-2 transition-colors"
        >
          View All ({criticalRequests.length})
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
