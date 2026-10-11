import { useState, useEffect, useRef } from 'react';
import { Users, Heart, AlertTriangle } from 'lucide-react';
import { api } from '../utils/api';

function CountUp({ target, duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    let start = 0;
    const end = parseInt(target, 10);
    if (isNaN(end) || end === 0) {
      setCount(0);
      return;
    }

    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * (end - start) + start));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [target, duration]);

  return <span ref={ref}>{count}</span>;
}

export default function LiveStats() {
  const [stats, setStats] = useState({ totalDonors: 0, livesSaved: 0, activeRequests: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await api.getStats();
        if (res.success) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const statItems = [
    {
      icon: Users,
      value: stats.totalDonors,
      label: 'Registered Donors',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Heart,
      value: stats.livesSaved,
      label: 'Lives Saved',
      color: 'text-crimson-600',
      bgColor: 'bg-crimson-50',
    },
    {
      icon: AlertTriangle,
      value: stats.activeRequests,
      label: 'Active Requests',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
  ];

  return (
    <section className="py-20 bg-white border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-14">
          <h2 className="text-3xl font-bold text-slate-900">Our Real-time Impact</h2>
          <p className="mt-2 text-slate-600">Together, our community makes life-saving emergency support possible.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {statItems.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div key={idx} className="card p-8 text-center group hover:-translate-y-1">
                <div className={`w-16 h-16 mx-auto rounded-2xl ${item.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className={`w-8 h-8 ${item.color}`} />
                </div>
                <div className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                  {loading ? (
                    <div className="h-10 w-20 bg-slate-200 animate-pulse rounded-lg mx-auto" />
                  ) : (
                    <>
                      <CountUp target={item.value} />
                      <span className="text-crimson-600">+</span>
                    </>
                  )}
                </div>
                <p className="mt-2 text-slate-600 font-medium text-sm sm:text-base">{item.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
