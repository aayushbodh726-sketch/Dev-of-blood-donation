import { Link } from 'react-router-dom';
import { UserPlus, Search, Heart, ShieldCheck, ArrowRight } from 'lucide-react';
import EmergencyBanner from '../components/EmergencyBanner';
import Hero from '../components/Hero';
import LiveStats from '../components/LiveStats';
import Footer from '../components/Footer';

export default function Home() {
  const steps = [
    {
      icon: UserPlus,
      step: '01',
      title: 'Register',
      desc: 'Create your account in 1 minute as a donor or recipient with your blood type and city.',
    },
    {
      icon: Search,
      step: '02',
      title: 'Find & Match',
      desc: 'Search for available donors near you or submit urgent blood requests directly to the network.',
    },
    {
      icon: Heart,
      step: '03',
      title: 'Save Lives',
      desc: 'Connect immediately with matching donors or hospital contacts to facilitate life-saving donations.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <EmergencyBanner />
      <Hero />
      <LiveStats />

      {/* How It Works Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-crimson-700 font-bold text-sm tracking-wider uppercase">Simple & Fast</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-2">How LifeFlow Works</h2>
            <p className="mt-3 text-slate-600 text-base">
              Designed for emergency speed and ease of use when every single minute matters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <div key={idx} className="card p-8 relative overflow-hidden group hover:-translate-y-2">
                  <div className="absolute top-4 right-6 text-5xl font-black text-slate-100 group-hover:text-crimson-50 transition-colors">
                    {item.step}
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-crimson-100 text-crimson-700 flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform">
                    <IconComponent className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-crimson-900 text-white relative overflow-hidden">
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-crimson-800 rounded-full blur-3xl pointer-events-none opacity-50" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">Ready to Make a Lifesaving Difference?</h2>
          <p className="mt-4 text-crimson-100 text-lg max-w-xl mx-auto">
            Join thousands of blood donors in your area today. Your single donation can save up to 3 lives.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              to="/register"
              className="bg-white hover:bg-slate-100 text-crimson-900 font-bold py-4 px-8 rounded-xl shadow-2xl hover:scale-105 transition-all flex items-center gap-2"
            >
              Get Started Now
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
