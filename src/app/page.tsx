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
    <div className="loading-state">
      <Loader2 className="spinning" />
      <span>Sincronizzazione Airtable...</span>
      <style jsx>{`
        .loading-state { height: 80vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; color: var(--text-secondary); }
        .spinning { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );

  const stats = [
    { label: 'Total Pages', value: data?.pages?.length || 0, icon: Users, color: 'var(--accent-color)' },
    { label: 'Discrepancies', value: data?.discrepancies?.length || 0, icon: AlertTriangle, color: 'var(--danger-color)' },
    { label: 'Verified', value: data?.pages?.filter((p: any) => p.status === 'Verificata').length || 0, icon: CheckCircle2, color: 'var(--success-color)' },
    { label: 'Pending', value: data?.pages?.filter((p: any) => p.status !== 'Verificata').length || 0, icon: Clock, color: 'var(--warning-color)' },
  ];

  return (
    <div className="dashboard">
      <header className="page-header">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1>Insights Dashboard</h1>
          <p className="subtitle">Overview of client compliance and web coherence</p>
        </motion.div>
        
        <div className="header-actions">
          <button className="btn-primary" onClick={() => window.location.reload()}>Sync Data</button>
        </div>
      </header>

      <div className="dashboard-grid">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              key={stat.label}
              className="stat-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="card-header">
                <div className="icon-box" style={{ background: `${stat.color}15`, color: stat.color }}>
                  <Icon size={20} />
                </div>
              </div>
              <h3>{stat.label}</h3>
              <div className="value">{stat.value}</div>
            </motion.div>
          );
        })}
      </div>

      <div className="dashboard-layout">
        <motion.div 
          className="main-chart-card glass"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="card-header">
            <h2>Severity Distribution</h2>
          </div>
          <div className="placeholder-chart">
             <div className="chart-bar" style={{ height: '60%', background: 'var(--danger-color)' }}><span>High</span></div>
             <div className="chart-bar" style={{ height: '40%', background: 'var(--warning-color)' }}><span>Med</span></div>
             <div className="chart-bar" style={{ height: '80%', background: 'var(--success-color)' }}><span>Low</span></div>
          </div>
        </motion.div>

        <motion.div 
          className="recent-activity glass"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2>Recent Discrepancies</h2>
          <div className="activity-list">
            {data?.discrepancies?.slice(0, 5).map((disc: any) => (
              <div key={disc.id} className="activity-item">
                <div className={`activity-icon ${disc.severity?.toLowerCase() || 'medium'}`}>!</div>
                <div className="activity-info">
                  <p className="activity-title">{disc.name}</p>
                  <p className="activity-time">{new Date(disc.date).toLocaleDateString()}</p>
                </div>
                <ArrowUpRight size={16} className="arrow" />
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
        h1 { font-size: 32px; margin-bottom: 8px; }
        .subtitle { color: var(--text-secondary); }
        .btn-primary { background: var(--accent-color); color: white; padding: 10px 20px; border-radius: 8px; font-weight: 600; }
        .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
        .icon-box { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
        .dashboard-layout { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; }
        .main-chart-card, .recent-activity { padding: 24px; border-radius: 20px; min-height: 400px; }
        .placeholder-chart { height: 300px; display: flex; align-items: flex-end; gap: 40px; padding: 40px; justify-content: center; }
        .chart-bar { width: 60px; border-radius: 8px 8px 0 0; position: relative; display: flex; justify-content: center; }
        .chart-bar span { position: absolute; bottom: -25px; font-size: 12px; color: var(--text-secondary); }
        .activity-item { display: flex; align-items: center; gap: 16px; padding: 16px 0; border-bottom: 1px solid var(--border-color); }
        .activity-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: bold; }
        .activity-icon.high { background: rgba(239, 68, 68, 0.1); color: var(--danger-color); }
        .activity-info { flex: 1; }
        .activity-title { font-size: 14px; font-weight: 500; }
        .activity-time { font-size: 12px; color: var(--text-secondary); }
        .arrow { color: var(--text-secondary); }
      `}</style>
    </div>
  );
}
