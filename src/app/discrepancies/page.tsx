'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldAlert, 
  ExternalLink, 
  CheckCircle,
  Eye,
  MoreVertical,
  Calendar,
  Loader2,
  RefreshCw
} from 'lucide-react';

export default function Discrepancies() {
  const [discrepancies, setDiscrepancies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDiscrepancies();
  }, []);

  const fetchDiscrepancies = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/data');
      const data = await res.json();
      setDiscrepancies(data.discrepancies || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="loading-state">
      <Loader2 className="spinning" />
      <style jsx>{`
        .loading-state { height: 80vh; display: flex; align-items: center; justify-content: center; }
        .spinning { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );

  return (
    <div className="discrepancies">
      <header className="page-header">
        <div>
          <h1>Discrepancy Notes</h1>
          <p className="subtitle">Identified inconsistencies synced from Airtable</p>
        </div>
        
        <div className="header-actions">
          <button className="btn-primary" onClick={fetchDiscrepancies}>
            <RefreshCw size={18} /> Refresh
          </button>
        </div>
      </header>

      <div className="discrepancy-list animate-fade-in">
        {discrepancies.length === 0 ? (
          <div className="empty-state">No discrepancies found. All clear!</div>
        ) : (
          discrepancies.map((note, index) => (
            <motion.div 
              key={note.id}
              className="discrepancy-card glass"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="card-media">
                <img src={note.screenshot || 'https://picsum.photos/seed/dis/400/250'} alt="Evidence" />
                <div className={`severity-tag ${note.severity?.toLowerCase() || 'medium'}`}>
                  {note.severity || 'Medium'}
                </div>
              </div>
              
              <div className="card-content">
                <div className="card-header">
                  <h3>{note.name}</h3>
                  <div className="status-badge">
                    {note.resolved ? (
                      <span className="resolved"><CheckCircle size={14} /> Resolved</span>
                    ) : (
                      <span className="pending"><ShieldAlert size={14} /> Unresolved</span>
                    )}
                  </div>
                </div>

                <p className="description">{note.description}</p>

                <div className="card-footer">
                  <div className="meta-info">
                    <div className="meta-item">
                      <strong>Client:</strong> {note.client || 'N/A'}
                    </div>
                    <div className="meta-item">
                      <strong>Product:</strong> {note.product || 'N/A'}
                    </div>
                    <div className="meta-item calendar">
                      <Calendar size={12} /> {new Date(note.date).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="card-actions">
                    <button className="icon-btn"><Eye size={18} /></button>
                    <button className="icon-btn"><ExternalLink size={18} /></button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <style jsx>{`
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
        h1 { font-size: 28px; margin-bottom: 4px; }
        .subtitle { color: var(--text-secondary); font-size: 14px; }
        .btn-primary { background: var(--accent-color); color: white; padding: 10px 16px; border-radius: 8px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
        .discrepancy-list { display: flex; flex-direction: column; gap: 20px; }
        .discrepancy-card { display: grid; grid-template-columns: 300px 1fr; border-radius: 20px; overflow: hidden; transition: transform 0.2s; }
        .discrepancy-card:hover { transform: translateY(-2px); }
        .card-media { position: relative; height: 100%; }
        .card-media img { width: 100%; height: 100%; object-fit: cover; }
        .severity-tag { position: absolute; top: 12px; left: 12px; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
        .severity-tag.high { background: var(--danger-color); color: white; }
        .severity-tag.medium { background: var(--warning-color); color: white; }
        .card-content { padding: 24px; display: flex; flex-direction: column; }
        .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
        .card-header h3 { font-size: 18px; font-weight: 600; }
        .status-badge span { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; }
        .status-badge .resolved { color: var(--success-color); }
        .status-badge .pending { color: var(--danger-color); }
        .description { color: var(--text-secondary); font-size: 14px; line-height: 1.6; margin-bottom: 24px; flex: 1; }
        .card-footer { display: flex; justify-content: space-between; align-items: flex-end; padding-top: 20px; border-top: 1px solid var(--border-color); }
        .meta-info { display: flex; gap: 20px; }
        .meta-item { font-size: 12px; color: var(--text-secondary); }
        .meta-item strong { color: var(--text-primary); font-weight: 500; }
        .calendar { display: flex; align-items: center; gap: 6px; }
        .card-actions { display: flex; gap: 8px; }
        .icon-btn { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: var(--text-secondary); background: rgba(255, 255, 255, 0.03); transition: all 0.2s; }
        .empty-state { padding: 80px; text-align: center; color: var(--text-secondary); background: var(--card-bg); border-radius: 20px; border: 1px dashed var(--border-color); }
        @media (max-width: 768px) { .discrepancy-card { grid-template-columns: 1fr; } .card-media { height: 180px; } }
      `}</style>
    </div>
  );
}
