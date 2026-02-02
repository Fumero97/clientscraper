'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  ArrowUpRight,
  TrendingUp,
  Loader2
} from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  if (loading) return (
    <div className="h-[80vh] flex flex-col items-center justify-center gap-4 text-slate-500">
      <Loader2 className="animate-spin" size={32} />
      <span>Sincronizzazione Airtable...</span>
    </div>
  );

  const stats = [
    { label: 'Total Pages', value: data?.pages?.length || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Discrepancies', value: data?.discrepancies?.length || 0, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' },
    { label: 'Verified', value: data?.pages?.filter((p: any) => p.status === 'Verificata').length || 0, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Pending', value: data?.pages?.filter((p: any) => p.status !== 'Verificata').length || 0, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
  ];

  return (
    <div className="w-full">
      <header className="flex justify-between items-center mb-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Insights Dashboard</h1>
          <p className="text-slate-500">Overview of client compliance and web coherence</p>
        </motion.div>
        
        <div className="flex gap-3">
          <button 
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm"
            onClick={() => window.location.reload()}
          >
            Sync Data
          </button>
        </div>
      </header>

      <div className="auto-grid gap-6 mb-10">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              key={stat.label}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                  <Icon size={20} />
                </div>
              </div>
              <h3 className="text-sm font-medium text-slate-500 mb-2">{stat.label}</h3>
              <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 min-h-[400px] shadow-sm"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold text-slate-900">Severity Distribution</h2>
          </div>
          <div className="h-[300px] flex items-end justify-center gap-10 p-10">
             <div className="w-16 rounded-t-lg bg-red-400 relative flex justify-center h-[60%]">
               <span className="absolute -bottom-8 text-xs text-slate-500 font-medium">High</span>
             </div>
             <div className="w-16 rounded-t-lg bg-amber-400 relative flex justify-center h-[40%]">
               <span className="absolute -bottom-8 text-xs text-slate-500 font-medium">Med</span>
             </div>
             <div className="w-16 rounded-t-lg bg-emerald-400 relative flex justify-center h-[80%]">
               <span className="absolute -bottom-8 text-xs text-slate-500 font-medium">Low</span>
             </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white p-6 rounded-2xl border border-slate-200 min-h-[400px] shadow-sm"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-xl font-bold text-slate-900 mb-6">Recent Discrepancies</h2>
          <div className="space-y-4">
            {data?.discrepancies?.slice(0, 5).map((disc: any) => (
              <div key={disc.id} className="flex items-center gap-4 py-4 border-b border-slate-100 last:border-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm
                  ${disc.severity === 'High' ? 'bg-red-50 text-red-500' : 
                    disc.severity === 'Medium' ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-500'}`}>
                  !
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900 line-clamp-1">{disc.name}</p>
                  <p className="text-xs text-slate-500">{new Date(disc.date).toLocaleDateString()}</p>
                </div>
                <ArrowUpRight size={16} className="text-slate-400" />
              </div>
            ))}
          </div>
        </motion.div>
      </div>
      
      <style jsx global>{`
        .auto-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        }
      `}</style>
    </div>
  );
}
