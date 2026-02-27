import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLowStockReportAPI } from '../../api/report.api';
import { adjustStockAPI } from '../../api/product.api';
import { formatCurrency } from '../../utils/formatCurrency';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';
import { FiAlertTriangle, FiCheckCircle, FiPackage } from 'react-icons/fi';
import { FaCheck } from 'react-icons/fa';

export default function LowStock() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adjusting, setAdjusting] = useState(null);
  const [adjVal, setAdjVal] = useState('');
  const navigate = useNavigate();

  const load = () => getLowStockReportAPI().then(r => { setProducts(r.data.data); setLoading(false); });
  useEffect(() => { load(); }, []);

  const handleAdjust = async () => {
    if (!adjVal || isNaN(adjVal)) return toast.error('Enter valid quantity');
    try {
      await adjustStockAPI(adjusting._id, { quantity: +adjVal, type: 'add' });
      toast.success(`Stock updated for ${adjusting.name}`);
      setAdjusting(null); setAdjVal('');
      load();
    } catch { toast.error('Failed to update stock'); }
  };

  if (loading) return <div className="page-wrap"><Loader /></div>;

  return (
    <div className="page-wrap animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <FiAlertTriangle className="text-amber-400" /> Low Stock Alert
          </h1>
          <p className="page-subtitle">{products.length} product{products.length !== 1 ? 's' : ''} need restocking</p>
        </div>
        <button onClick={() => navigate('/products')} className="btn-secondary">View All Products →</button>
      </div>

      {products.length === 0 ? (
        <div className="card-glow flex flex-col items-center justify-center py-20">
          <FiCheckCircle size={64} className="mb-4 text-accent-green" />
          <h3 className="font-display font-bold text-white text-xl">All Stock Levels OK!</h3>
          <p className="text-slate-500 text-sm font-body mt-2">No products require restocking right now</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {products.map(p => (
            <div key={p._id} className={`card border ${p.stock === 0 ? 'border-accent-red/30 bg-accent-red/5' : 'border-accent-amber/30 bg-accent-amber/5'} animate-fade-in overflow-hidden`}>
              {p.image && (
                <div className="w-full h-24 overflow-hidden -mx-0 -mt-0 mb-3 rounded-t-xl">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover opacity-60"/>
                </div>
              )}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center text-lg sm:text-xl flex-shrink-0"
                    style={{ background: `${p.category?.color || '#22c55e'}18`, color: p.category?.color || '#22c55e' }}>
                    {p.category?.icon || <FiPackage size={18} />}
                  </div>
                  <div>
                    <p className="font-body font-medium text-slate-200 text-xs sm:text-sm line-clamp-1">{p.name}</p>
                    <p className="text-slate-500 text-[9px] sm:text-[10px]">{p.sku}</p>
                  </div>
                </div>
                <span className={`badge ${p.stock === 0 ? 'badge-red' : 'badge-amber'}`}>
                  {p.stock === 0 ? 'OUT OF STOCK' : `${p.stock} left`}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-[9px] sm:text-xs font-body text-slate-500 mb-3 gap-1 sm:gap-0">
                <span className="truncate">Alert: {p.lowStockAlert} {p.unit}</span>
                <span className="hidden sm:inline">{p.category?.name}</span>
                <span className="text-accent-green font-display font-bold">{formatCurrency(p.price)}</span>
              </div>

              <div className="w-full h-1.5 bg-bg-elevated rounded-full overflow-hidden mb-3">
                <div className={`h-full rounded-full transition-all ${p.stock === 0 ? 'bg-accent-red' : 'bg-accent-amber'}`}
                  style={{ width: `${Math.min(100, (p.stock / (p.lowStockAlert * 3)) * 100)}%` }}/>
              </div>

              <button onClick={() => { setAdjusting(p); setAdjVal(''); }} className="btn-primary w-full text-xs sm:text-sm h-8 sm:h-9">
                + Restock
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={!!adjusting} onClose={() => setAdjusting(null)} title="Restock Product" size="sm">
        {adjusting && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-bg-primary rounded-xl">
              <span className="text-2xl" style={{ color: adjusting.category?.color || '#22c55e' }}>
                {adjusting.category?.icon || <FiPackage size={22} />}
              </span>
              <div>
                <p className="font-body font-medium text-white">{adjusting.name}</p>
                <p className="text-slate-500 text-xs">Current stock: <span className={adjusting.stock === 0 ? 'text-accent-red' : 'text-accent-amber'}>{adjusting.stock} {adjusting.unit}</span></p>
              </div>
            </div>
            <div>
              <label className="label">Quantity to Add *</label>
              <input type="number" className="input" value={adjVal} onChange={e => setAdjVal(e.target.value)}
                placeholder={`Add more ${adjusting.unit}...`} min="1" autoFocus/>
            </div>
            {adjVal && +adjVal > 0 && (
              <div className="flex justify-between text-sm font-body bg-bg-primary p-3 rounded-xl">
                <span className="text-slate-400">New stock level:</span>
                <span className="text-accent-green font-display font-bold">{adjusting.stock + +adjVal} {adjusting.unit}</span>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setAdjusting(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleAdjust} className="btn-primary flex-1 flex items-center justify-center gap-2">
                <FaCheck size={12} /> Update Stock
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}