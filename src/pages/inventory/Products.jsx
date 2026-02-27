import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProductsAPI, deleteProductAPI, getCategoriesAPI } from '../../api/product.api';
import { formatCurrency } from '../../utils/formatCurrency';
import { useAuth } from '../../hooks/useAuth';
import Loader, { SkeletonRow } from '../../components/common/Loader';
import toast from 'react-hot-toast';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const canEdit = hasRole('super_admin', 'store_admin', 'inventory_manager');

  const load = async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        getProductsAPI({ page, limit: 15, search, category }),
        getCategoriesAPI(),
      ]);
      setProducts(pRes.data.data);
      setTotal(pRes.data.total);
      setPages(pRes.data.pages);
      setCategories(cRes.data.data);
    } catch { toast.error('Failed to load products'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page, search, category]);

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try { await deleteProductAPI(id); toast.success('Product deleted'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
  };

  return (
    <div className="page-wrap animate-fade-in">
      <div className="page-header">
        <div><h1 className="page-title">Products</h1><p className="page-subtitle">{total} products</p></div>
        <div className="flex gap-3">
          <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }} className="input w-44 h-9 py-0 text-sm">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.icon} {c.name}</option>)}
          </select>
          <div className="relative">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search..." className="input pl-9 w-52 h-9 py-0 text-sm"/>
          </div>
          {canEdit && <button onClick={() => navigate('/products/add')} className="btn-primary h-9 px-4 text-sm">+ Add Product</button>}
        </div>
      </div>

      <div className="card-glow overflow-hidden">
        <table className="table-wrap">
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
              {['Product', 'SKU', 'Category', 'Price', 'Cost', 'Stock', 'Status', ...(canEdit ? ['Actions'] : [])].map(h => <th key={h} className="th">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {loading ? [...Array(8)].map((_, i) => <SkeletonRow key={i} cols={canEdit ? 8 : 7}/>) :
              products.map(p => (
                <tr key={p._id} className="tr">
                  <td className="td">
                    <div className="flex items-center gap-3">
                      {/* Product image thumbnail */}
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-white/[0.07]"
                        style={{ background: `${p.category?.color || '#22c55e'}12` }}>
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover"
                            onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
                          />
                        ) : null}
                        <div className="w-full h-full items-center justify-center text-base"
                          style={{ display: p.image ? 'none' : 'flex' }}>
                          {p.category?.icon || '📦'}
                        </div>
                      </div>
                      <div>
                        <p className="text-slate-200 font-body text-sm">{p.name}</p>
                        <p className="text-slate-600 text-[10px]">{p.barcode || p.description?.slice(0, 30)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="td"><code className="text-xs text-accent-cyan bg-accent-cyan/10 px-2 py-0.5 rounded">{p.sku}</code></td>
                  <td className="td text-slate-400 text-xs">{p.category?.name || '—'}</td>
                  <td className="td font-display font-bold text-accent-green">{formatCurrency(p.price)}</td>
                  <td className="td text-slate-400">{formatCurrency(p.costPrice)}</td>
                  <td className="td">
                    <span className={`badge text-[10px] ${p.stock === 0 ? 'badge-red' : p.isLowStock ? 'badge-amber' : 'badge-green'}`}>
                      {p.stock} {p.unit}
                    </span>
                  </td>
                  <td className="td"><span className={`badge ${p.isActive ? 'badge-green' : 'badge-red'}`}>{p.isActive ? 'Active' : 'Inactive'}</span></td>
                  {canEdit && (
                    <td className="td">
                      <div className="flex gap-1.5">
                        <button onClick={() => navigate(`/products/edit/${p._id}`)} className="btn-icon w-7 h-7">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button onClick={() => handleDelete(p._id, p.name)} className="btn-icon w-7 h-7 hover:text-accent-red hover:border-accent-red/30">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
          </tbody>
        </table>
        {!loading && products.length === 0 && <div className="py-16 text-center text-slate-600 font-body">No products found</div>}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-slate-500 text-sm font-body">{total} products</p>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary btn-sm disabled:opacity-40">← Prev</button>
            <span className="px-3 py-1.5 bg-bg-card rounded-lg text-sm font-display text-white border border-white/[0.07]">{page} / {pages}</span>
            <button disabled={page === pages} onClick={() => setPage(p => p + 1)} className="btn-secondary btn-sm disabled:opacity-40">Next →</button>
          </div>
        </div>
      )}
    </div>
  );
}
