'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  Tag, 
  Sparkles,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';

export default function ProductsReference() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/data');
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSmartImport = async () => {
    setIsImporting(true);
    try {
      await fetch('/api/import-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: 'https://mysite.com/products' })
      });
      fetchProducts();
    } catch (err) {
      console.error(err);
    } finally {
      setIsImporting(false);
    }
  };

  if (loading) return (
    <div className="h-[80vh] flex flex-col items-center justify-center gap-4 text-slate-500">
      <Loader2 className="animate-spin" size={32} />
      <span>Caricamento prodotti...</span>
    </div>
  );

  return (
    <div className="w-full">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products Reference</h1>
          <p className="text-sm text-slate-500 mt-1">Source of Truth for official offerings from Airtable</p>
        </div>
        
        <div className="flex gap-3">
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 border border-purple-200 rounded-lg font-semibold hover:bg-purple-100 transition-colors shadow-sm text-sm"
            onClick={handleSmartImport} 
            disabled={isImporting}
          >
            {isImporting ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {isImporting ? 'Analyzing...' : 'Smart Import (AI Agent)'}
          </button>
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm text-sm"
            onClick={fetchProducts}
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </header>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Product / Service Name</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center border border-slate-200">
                      <Tag size={14} />
                    </div>
                    <strong>{product.name}</strong>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500 max-w-xs">{product.description}</td>
                <td className="px-6 py-4">
                  {product.active ? (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600">
                      <CheckCircle size={12} /> Active
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">
                      <XCircle size={12} /> Inactive
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
