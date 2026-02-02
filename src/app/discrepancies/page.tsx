'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, 
  ExternalLink, 
  CheckCircle,
  Eye,
  Calendar,
  Loader2,
  RefreshCw,
  AlertTriangle,
  Filter,
  X
} from 'lucide-react';

export default function Discrepancies() {
  const [discrepancies, setDiscrepancies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterClient, setFilterClient] = useState('');
  const [filterCentre, setFilterCentre] = useState('');
  const [showResolved, setShowResolved] = useState(false);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

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

  const handleMarkSolved = async () => {
    if (!resolvingId) return;
    
    try {
      const res = await fetch(`/api/discrepancies/${resolvingId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: resolutionNotes || 'Risolto dall\'utente' })
      });

      if (res.ok) {
        setResolvingId(null);
        setResolutionNotes('');
        fetchDiscrepancies();
      }
    } catch (err) {
      console.error('Error marking as solved:', err);
    }
  };

  // Get unique clients and centres for filters
  const uniqueClients = Array.from(new Set(discrepancies.map(d => d.client).filter(Boolean)));
  const uniqueCentres = Array.from(new Set(discrepancies.map(d => d.product).filter(Boolean)));

  // Filter discrepancies
  const filteredDiscrepancies = discrepancies.filter(disc => {
    const clientMatch = !filterClient || disc.client === filterClient;
    const centreMatch = !filterCentre || disc.product === filterCentre;
    const resolvedMatch = showResolved || !disc.resolved;
    
    return clientMatch && centreMatch && resolvedMatch;
  });

  if (loading) return (
    <div className="h-[80vh] flex flex-col items-center justify-center gap-4 text-slate-500">
      <Loader2 className="animate-spin" size={32} />
      <span>Caricamento discrepanze...</span>
    </div>
  );

  return (
    <div className="w-full">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Discrepancy Notes</h1>
          <p className="text-sm text-slate-500 mt-1">Identified inconsistencies synced from Airtable</p>
        </div>
        
        <div className="flex gap-4">
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm text-sm"
            onClick={fetchDiscrepancies}
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={16} className="text-slate-500" />
          <span className="text-sm font-semibold text-slate-700">Filters</span>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {/* Client Filter */}
          <select
            value={filterClient}
            onChange={(e) => setFilterClient(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Clients</option>
            {uniqueClients.map(client => (
              <option key={client} value={client}>{client}</option>
            ))}
          </select>

          {/* Centre Filter */}
          <select
            value={filterCentre}
            onChange={(e) => setFilterCentre(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Centres</option>
            {uniqueCentres.map(centre => (
              <option key={centre} value={centre}>{centre}</option>
            ))}
          </select>

          {/* Show Resolved Toggle */}
          <label className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm cursor-pointer hover:bg-slate-50">
            <input
              type="checkbox"
              checked={showResolved}
              onChange={(e) => setShowResolved(e.target.checked)}
              className="rounded"
            />
            <span>Show Resolved</span>
          </label>

          {/* Clear Filters */}
          {(filterClient || filterCentre) && (
            <button
              onClick={() => {
                setFilterClient('');
                setFilterCentre('');
              }}
              className="flex items-center gap-1 px-3 py-2 text-slate-600 hover:text-slate-900 text-sm"
            >
              <X size={14} /> Clear
            </button>
          )}
        </div>

        <div className="mt-2 text-xs text-slate-500">
          Showing {filteredDiscrepancies.length} of {discrepancies.length} discrepancies
        </div>
      </div>

      {/* Discrepancies List */}
      <div className="flex flex-col gap-6">
        {filteredDiscrepancies.length === 0 ? (
          <div className="p-20 text-center text-slate-500 bg-white rounded-2xl border border-dashed border-slate-300">
             <CheckCircle className="mx-auto mb-4 text-slate-300" size={48} />
             <p className="text-lg font-medium text-slate-900">All clear!</p>
             <p className="text-sm">No discrepancies found matching your filters.</p>
          </div>
        ) : (
          filteredDiscrepancies.map((note, index) => (
            <motion.div 
              key={note.id}
              className={`bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-shadow ${
                note.resolved ? 'border-slate-200 opacity-60' : 'border-slate-200'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                       {note.severity && (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border
                          ${note.severity === 'High' ? 'bg-red-50 text-red-600 border-red-100' : 
                            note.severity === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                            'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                          {note.severity}
                        </span>
                      )}
                      <h3 className="text-lg font-bold text-slate-900 leading-tight">{note.name}</h3>
                    </div>
                    
                    {/* Description - MOST IMPORTANT FIELD */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {note.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex-shrink-0 ml-4">
                    {note.resolved ? (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600">
                        <CheckCircle size={14} /> Resolved
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600">
                        <ShieldAlert size={14} /> Unresolved
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end pt-5 mt-auto border-t border-slate-100 gap-4">
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900 mb-0.5">Client</span>
                      {note.client || 'N/A'}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900 mb-0.5">Centre</span>
                      {note.product || 'N/A'}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900 mb-0.5">Detected</span>
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} /> {note.date ? new Date(note.date).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {!note.resolved && (
                      <button
                        onClick={() => setResolvingId(note.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors text-sm"
                      >
                        <CheckCircle size={16} /> Mark as Solved
                      </button>
                    )}
                    <button className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 bg-slate-50 hover:bg-slate-100 transition-colors">
                      <Eye size={18} />
                    </button>
                    <button className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 bg-slate-50 hover:bg-slate-100 transition-colors">
                      <ExternalLink size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Resolution Modal */}
      <AnimatePresence>
        {resolvingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h2 className="text-lg font-bold text-slate-900">Risolvi Discrepanza</h2>
                <button onClick={() => setResolvingId(null)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6">
                <p className="text-sm text-slate-600 mb-4">
                  Aggiungi una nota o una giustificazione. Questa verrà salvata e usata dall'IA come memoria per non segnalare più questa discrepanza se non necessario.
                </p>
                
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Esempio: La variazione delle date è corretta perché..."
                  className="w-full h-32 p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                />
              </div>
              
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  onClick={() => setResolvingId(null)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
                >
                  Annulla
                </button>
                <button 
                  onClick={handleMarkSolved}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors text-sm shadow-sm"
                >
                  Confirm Resolution
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
