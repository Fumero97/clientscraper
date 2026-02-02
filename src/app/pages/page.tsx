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
  Loader2,
  CheckCircle,
  AlertTriangle
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
        // Show success notification
        alert(`✅ Scan completato!\n\n` +
              `Nuove discrepanze: ${data.newDiscrepanciesCount}\n` +
              `Duplicati evitati: ${data.skippedDuplicates}\n\n` +
              `${data.summary}`);
        fetchPages();
      } else {
        alert(`❌ Errore durante lo scan: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      alert('❌ Errore di connessione durante lo scan');
    } finally {
      setIsScanning(null);
    }
  };

  if (loading) return (
    <div className="h-[80vh] flex flex-col items-center justify-center gap-4 text-slate-500">
      <Loader2 className="animate-spin" size={32} />
      <span>Caricamento pagine...</span>
    </div>
  );

  return (
    <div className="w-full">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Client Web Pages</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and monitor client-facing URLs from Airtable</p>
        </div>
        
        <div className="flex gap-4">
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm text-sm"
            onClick={fetchPages}
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </header>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Client Name</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Centres</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Web Page URL</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Checked</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <AnimatePresence>
              {pages.map((page) => (
                <motion.tr 
                  key={page.id} 
                  layout 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{page.client || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600">{page.centres || 'N/A'}</span>
                  </td>
                  <td className="px-6 py-4">
                    {page.url ? (
                      <a href={page.url} target="_blank" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-xs font-mono">
                        <span className="truncate max-w-[200px]">{page.url}</span> <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400 italic">No URL provided</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    {page.lastChecked ? new Date(page.lastChecked).toLocaleString() : 'Never'}
                  </td>
                  <td className="px-6 py-4">
                    {page.discrepancies === 0 ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600">
                        <CheckCircle size={14} /> Verificato
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600">
                        <AlertTriangle size={14} /> {page.discrepancies} {page.discrepancies === 1 ? 'discrepancy' : 'discrepancies'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button 
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all bg-indigo-50 text-indigo-600 hover:bg-indigo-100
                          ${isScanning === page.id ? 'opacity-70 cursor-not-allowed' : ''}`}
                        onClick={() => startScan(page.id)}
                        disabled={isScanning !== null}
                      >
                        {isScanning === page.id ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
