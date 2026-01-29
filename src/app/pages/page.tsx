'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Play, 
  Trash2, 
  ExternalLink,
  RefreshCw,
  Image as ImageIcon,
  FileText,
  Loader2
} from 'lucide-react';

export default function WebPages() {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScanning, setIsScanning] = useState<string | null>(null);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/data');
      const data = await res.json();
      setPages(data.pages || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startScan = async (id: string) => {
    setIsScanning(id);
    try {
      const resp = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId: id })
      });
      const data = await resp.json();
      if (data.success) {
        // Refresh pages after scan
        fetchPages();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(null);
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
    <div className="web-pages">
      <header className="page-header">
        <div>
          <h1>Client Web Pages</h1>
          <p className="subtitle">Manage and monitor client-facing URLs from Airtable</p>
        </div>
        
        <div className="header-actions">
          <button className="btn-primary" onClick={fetchPages}>
            <RefreshCw size={18} /> Refresh
          </button>
        </div>
      </header>

      <div className="data-table-container animate-fade-in">
        <table className="data-table">
          <thead>
            <tr>
              <th>Client Name</th>
              <th>Web Page URL</th>
              <th>Media</th>
              <th>Last Checked</th>
              <th>Status</th>
              <th># Discrepancies</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {pages.map((page) => (
                <motion.tr key={page.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <td><strong>{page.client || 'N/A'}</strong></td>
                  <td>
                    <a href={page.url} target="_blank" className="url-link">
                      {page.url} <ExternalLink size={12} />
                    </a>
                  </td>
                  <td>
                    <div className="media-cell">
                      <div className={`media-icon ${page.screenshot ? 'active' : ''}`} title="Screenshot">
                        <ImageIcon size={14} />
                      </div>
                      <div className={`media-icon ${page.text ? 'active' : ''}`} title="Transcribed Text">
                        <FileText size={14} />
                      </div>
                    </div>
                  </td>
                  <td className="time-cell">{page.lastChecked ? new Date(page.lastChecked).toLocaleString() : 'Never'}</td>
                  <td>
                    <span className={`badge ${page.status === 'Verificata' ? 'badge-low' : 'badge-medium'}`}>
                      {page.status || 'Da verificare'}
                    </span>
                  </td>
                  <td>
                    <div className={`discrepancy-count ${page.discrepancies > 0 ? 'alert' : ''}`}>
                      {page.discrepancies}
                    </div>
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button 
                        className={`action-btn run ${isScanning === page.id ? 'spinning' : ''}`}
                        onClick={() => startScan(page.id)}
                        disabled={isScanning !== null}
                      >
                        {isScanning === page.id ? <RefreshCw size={16} /> : <Play size={16} />}
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
        h1 { font-size: 28px; margin-bottom: 4px; }
        .subtitle { color: var(--text-secondary); font-size: 14px; }
        .header-actions { display: flex; gap: 16px; }
        .btn-primary { background: var(--accent-color); color: white; padding: 10px 16px; border-radius: 8px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
        .url-link { color: var(--accent-color); display: flex; align-items: center; gap: 6px; font-family: monospace; font-size: 13px; }
        .media-cell { display: flex; gap: 8px; }
        .media-icon { width: 28px; height: 28px; border-radius: 6px; background: rgba(255, 255, 255, 0.03); display: flex; align-items: center; justify-content: center; color: var(--text-secondary); }
        .media-icon.active { color: var(--accent-color); background: rgba(59, 130, 246, 0.1); }
        .time-cell { color: var(--text-secondary); font-size: 13px; }
        .discrepancy-count { width: 24px; height: 24px; border-radius: 6px; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; }
        .discrepancy-count.alert { background: rgba(239, 68, 68, 0.1); color: var(--danger-color); }
        .actions-cell { display: flex; gap: 8px; }
        .action-btn { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .action-btn.run { background: rgba(16, 185, 129, 0.1); color: var(--success-color); }
        .spinning { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
