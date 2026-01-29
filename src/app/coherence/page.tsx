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
    <div className="products-ref">
      <header className="page-header">
        <div>
          <h1>Products Reference</h1>
          <p className="subtitle">Source of Truth for official offerings from Airtable</p>
        </div>
        
        <div className="header-actions">
          <button className="btn-secondary" onClick={handleSmartImport} disabled={isImporting}>
            {isImporting ? <Sparkles className="spinning" size={18} /> : <Sparkles size={18} />}
            {isImporting ? 'Analyzing Site & Brochure...' : 'Smart Import (AI Agent)'}
          </button>
          <button className="btn-primary" onClick={fetchProducts}>
            <RefreshCw size={18} /> Refresh
          </button>
        </div>
      </header>

      <div className="data-table-container animate-fade-in">
        <table className="data-table">
          <thead>
            <tr>
              <th>Product / Service Name</th>
              <th>Description</th>
              <th>Official Price</th>
              <th>Status</th>
              <th>AI Coherence Summary</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td className="name-cell">
                  <div className="product-icon"><Tag size={16} /></div>
                  <strong>{product.name}</strong>
                </td>
                <td className="desc-cell">{product.description}</td>
                <td className="price-cell">
                  <div className="price-tag">{product.price}</div>
                </td>
                <td>
                  {product.active ? (
                    <div className="status-pill active"><CheckCircle size={14} /> Active</div>
                  ) : (
                    <div className="status-pill inactive"><XCircle size={14} /> Inactive</div>
                  )}
                </td>
                <td>
                  <div className="ai-summary">
                    <Sparkles size={14} className="sparkle" />
                    <span>{product.coherence || 'No AI summary yet.'}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
        h1 { font-size: 28px; margin-bottom: 4px; }
        .subtitle { color: var(--text-secondary); font-size: 14px; }
        .header-actions { display: flex; gap: 12px; }
        .btn-primary { background: var(--accent-color); color: white; padding: 10px 16px; border-radius: 8px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
        .btn-secondary { background: rgba(139, 92, 246, 0.1); color: #a78bfa; border: 1px solid rgba(139, 92, 246, 0.2); padding: 10px 16px; border-radius: 8px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
        .name-cell { display: flex; align-items: center; gap: 12px; }
        .product-icon { width: 32px; height: 32px; background: rgba(255, 255, 255, 0.05); border-radius: 8px; display: flex; align-items: center; justify-content: center; }
        .desc-cell { max-width: 300px; color: var(--text-secondary); font-size: 13px; line-height: 1.5; }
        .price-tag { font-family: monospace; font-weight: 700; color: var(--success-color); font-size: 15px; }
        .status-pill { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 100px; }
        .status-pill.active { background: rgba(16, 185, 129, 0.1); color: var(--success-color); }
        .status-pill.inactive { background: rgba(100, 116, 139, 0.1); color: var(--text-secondary); }
        .ai-summary { display: flex; gap: 10px; background: rgba(255, 255, 255, 0.03); padding: 12px; border-radius: 10px; font-size: 13px; border: 1px solid var(--border-color); }
        .sparkle { color: #a78bfa; }
        .spinning { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
