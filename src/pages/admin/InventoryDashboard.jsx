import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProductsAPI } from '../../api/product.api';
import { formatCurrency } from '../../utils/formatCurrency';
import { useAuth } from '../../hooks/useAuth';
import Loader, { SkeletonRow } from '../../components/common/Loader';
import toast from 'react-hot-toast';

const StatCard = ({ label, value, sub, icon, color = 'green' }) => (
  <div className="stat-card">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3`}
      style={{ background: `${color}18`, border: `1px solid ${color}35` }}>
      {icon}
    </div>
    <p className="font-display font-black text-white text-2xl tracking-tight">{value}</p>
    <p className="text-slate-500 text-xs font-body mt-0.5">{label}</p>
    {sub && <p className="text-slate-600 text-[10px] font-body mt-1">{sub}</p>}
  </div>
);

export default function InventoryDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
    lowStockProducts: [],
    outOfStockProducts: []
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await getProductsAPI({ limit: 1000 });
      const products = res.data.data;

      const totalProducts = products.length;
      const inStock = products.filter(p => p.stock > p.lowStockAlert).length;
      const lowStock = products.filter(p => p.stock <= p.lowStockAlert).length;
      const outOfStock = products.filter(p => p.stock === 0).length;

      setStats({
        totalProducts,
        inStock,
        lowStock,
        outOfStock,
        lowStockProducts: products
          .filter(p => p.stock <= p.lowStockAlert)
          .sort((a, b) => a.stock - b.stock),
        outOfStockProducts: products.filter(p => p.stock === 0)
      });
    } catch {
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  if (!hasRole('inventory_manager')) {
    return (
      <div className="page-wrap animate-fade-in text-center py-12">
        <p className="text-slate-400">This dashboard is only accessible to inventory managers.</p>
      </div>
    );
  }

  if (loading) return <div className="page-wrap"><Loader text="Loading inventory..." /></div>;

  return (
    <div className="page-wrap space-y-6 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory Dashboard</h1>
          <p className="page-subtitle">Monitor stock levels and manage products</p>
        </div>
        <button onClick={() => navigate('/inventory/adjustment')} className="btn-primary">
          ⚙️ Adjust Stock
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Total Products" 
          value={stats.totalProducts} 
          icon="📦" 
          color="#3b82f6"
        />
        <StatCard 
          label="In Stock" 
          value={stats.inStock} 
          icon="✅" 
          color="#22c55e"
        />
        <StatCard 
          label="Low Stock" 
          value={stats.lowStock} 
          icon="⚠️" 
          color="#f59e0b"
        />
        <StatCard 
          label="Out of Stock" 
          value={stats.outOfStock} 
          icon="❌" 
          color="#ef4444"
        />
      </div>

      {/* Low Stock Section */}
      <div className="card-glow">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-display font-bold text-white tracking-wide">Low Stock Products</h3>
            <p className="text-slate-500 text-xs font-body mt-0.5">Products that need restocking</p>
          </div>
          <button onClick={() => navigate('/inventory/adjustment')} className="text-accent-green text-sm font-medium hover:underline">
            Adjust Stock →
          </button>
        </div>

        {stats.lowStockProducts.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <p className="text-sm">All products are well stocked! 🎉</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/[0.05] bg-bg-secondary/50">
                  <th className="px-4 py-3 text-left font-semibold text-slate-300">Product</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-300">SKU</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-300">Category</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-300">Stock</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-300">Min Stock</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-300">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.lowStockProducts.map(p => (
                  <tr key={p._id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-slate-300">{p.name}</td>
                    <td className="px-4 py-3 text-slate-500">{p.sku}</td>
                    <td className="px-4 py-3 text-center text-slate-500">{p.category?.name}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-block px-2.5 py-1 bg-amber-500/20 text-amber-400 rounded font-semibold">
                        {p.stock} pcs
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-500">{p.lowStockAlert || 10} pcs</td>
                    <td className="px-4 py-3 text-center">
                      <span className="badge badge-amber">Low Stock</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Out of Stock Section */}
      {stats.outOfStockProducts.length > 0 && (
        <div className="card-glow">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display font-bold text-white tracking-wide">❌ Out of Stock Products</h3>
              <p className="text-slate-500 text-xs font-body mt-0.5">These products need immediate restocking</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/[0.05] bg-bg-secondary/50">
                  <th className="px-4 py-3 text-left font-semibold text-slate-300">Product</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-300">SKU</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-300">Category</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-300">Price</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-300">Action</th>
                </tr>
              </thead>
              <tbody>
                {stats.outOfStockProducts.map(p => (
                  <tr key={p._id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-slate-300">{p.name}</td>
                    <td className="px-4 py-3 text-slate-500">{p.sku}</td>
                    <td className="px-4 py-3 text-center text-slate-500">{p.category?.name}</td>
                    <td className="px-4 py-3 text-center text-slate-300">{formatCurrency(p.sellPrice)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="badge badge-red">Out of Stock</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
