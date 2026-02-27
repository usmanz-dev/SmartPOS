import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, Legend } from 'recharts';
import { getDashboardAPI } from '../../api/report.api';
import { formatCurrency, formatNumber } from '../../utils/formatCurrency';
import { useAuth } from '../../hooks/useAuth';
import Loader from '../../components/common/Loader';
import InventoryDashboard from './InventoryDashboard';
import CashierDashboard from './CashierDashboard';
import toast from 'react-hot-toast';
import { BsCashCoin } from 'react-icons/bs';
import { FiTrendingUp, FiFileText, FiAlertTriangle, FiCheckCircle, FiPackage } from 'react-icons/fi';

const StatCard = ({ label, value, sub, icon, color = 'green', trend }) => (
  <div className="stat-card">
    <div className="flex items-start justify-between mb-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl`}
        style={{ background: `${color}18`, border: `1px solid ${color}35`, color: color }}>
        {icon}
      </div>
      {trend !== undefined && (
        <span className={`badge text-[9px] ${trend >= 0 ? 'badge-green' : 'badge-red'}`}>
          {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
        </span>
      )}
    </div>
    <p className="font-display font-black text-white text-2xl tracking-tight">{value}</p>
    <p className="text-slate-500 text-xs font-body mt-0.5">{label}</p>
    {sub && <p className="text-slate-600 text-[10px] font-body mt-1">{sub}</p>}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-bg-card border border-white/[0.08] rounded-xl p-3 shadow-xl text-xs font-body">
      <p className="text-slate-400 mb-2 font-display uppercase tracking-wider text-[10px]">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="flex justify-between gap-4">
          <span className="capitalize">{p.name}</span>
          <span className="font-bold">{p.name === 'sales' || p.name === 'revenue' ? formatCurrency(p.value) : p.value}</span>
        </p>
      ))}
    </div>
  );
};

const PIE_COLORS = { cash: '#22c55e', card: '#3b82f6', online: '#f59e0b', split: '#8b5cf6' };

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  if (hasRole('inventory_manager')) return <InventoryDashboard />;
  if (hasRole('cashier')) return <CashierDashboard />;

  useEffect(() => {
    getDashboardAPI()
      .then(res => setData(res.data.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-wrap"><Loader text="Loading dashboard..." /></div>;
  if (!data) return null;

  return (
    <div className="page-wrap space-y-6 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Today's Sales" value={formatCurrency(data.todaySales)} sub={`${data.todayOrders} orders today`} icon={<BsCashCoin size={20} />} color="#22c55e"/>
        <StatCard label="Monthly Revenue" value={formatCurrency(data.monthSales)} sub="This month" icon={<FiTrendingUp size={20} />} color="#3b82f6" trend={data.growth}/>
        <StatCard label="Total Orders" value={formatNumber(data.totalOrders)} sub="All time" icon={<FiFileText size={20} />} color="#f59e0b"/>
        <StatCard label="Low Stock Alerts" value={data.lowStockCount} sub={`${data.productCount} total products`} icon={<FiAlertTriangle size={20} />} color="#ef4444"/>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card-glow lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display font-bold text-white tracking-wide">Sales — Last 7 Days</h3>
              <p className="text-slate-500 text-xs font-body mt-0.5">Revenue and order volume</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data.last7Days} margin={{ left: -20, right: 10 }}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
              <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'Exo 2' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'Exo 2' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`}/>
              <Tooltip content={<CustomTooltip />}/>
              <Area type="monotone" dataKey="sales" stroke="#22c55e" strokeWidth={2} fill="url(#salesGrad)" dot={{ fill: '#22c55e', strokeWidth: 0, r: 3 }}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card-glow">
          <h3 className="font-display font-bold text-white tracking-wide mb-1">Payment Methods</h3>
          <p className="text-slate-500 text-xs font-body mb-4">This month</p>
          {data.paymentBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={data.paymentBreakdown} dataKey="total" nameKey="_id" cx="50%" cy="50%" outerRadius={65} strokeWidth={0}>
                  {data.paymentBreakdown.map((entry, i) => (
                    <Cell key={i} fill={PIE_COLORS[entry._id] || '#64748b'}/>
                  ))}
                </Pie>
                <Legend formatter={(v) => <span style={{ color: '#94a3b8', fontSize: '10px', fontFamily: 'Exo 2' }} className="capitalize">{v}</span>} iconSize={8}/>
                <Tooltip content={<CustomTooltip />}/>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[180px] text-slate-700 text-sm font-body">No data yet</div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Top products */}
        <div className="card-glow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-white tracking-wide">Top Sellers</h3>
            <span className="text-[10px] text-slate-500 font-body">This month</span>
          </div>
          {data.topProducts.length === 0 ? (
            <p className="text-slate-600 text-sm font-body text-center py-8">No sales data yet</p>
          ) : (
            <div className="space-y-3">
              {data.topProducts.map((p, i) => (
                <div key={p._id} className="flex items-center gap-3">
                  <span className="font-display font-bold text-slate-600 text-sm w-5">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-200 text-xs font-body truncate">{p._id}</p>
                    <div className="mt-1 h-1 bg-bg-elevated rounded-full overflow-hidden">
                      <div className="h-full bg-accent-green rounded-full transition-all"
                        style={{ width: `${(p.qty / data.topProducts[0].qty) * 100}%` }}/>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-display font-bold text-accent-green text-xs">{formatCurrency(p.revenue)}</p>
                    <p className="text-slate-600 text-[10px] font-body">{p.qty} units</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low stock */}
        <div className="card-glow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-white tracking-wide">Low Stock Alert</h3>
            <button onClick={() => navigate('/inventory/low-stock')} className="text-[10px] text-accent-green font-body hover:underline">View all →</button>
          </div>
          {data.lowStockProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-600">
              <FiCheckCircle size={32} className="mb-2 text-accent-green" />
              <p className="text-sm font-body">All stock levels are healthy</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {data.lowStockProducts.slice(0, 5).map(p => (
                <div key={p._id} className="flex items-center gap-3">

                  {/* ✅ Product image ya fallback icon */}
                  <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 border border-white/[0.06]"
                    style={{ background: `${p.category?.color || '#64748b'}15` }}>
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"
                        style={{ color: p.category?.color || '#64748b' }}>
                        {p.category?.icon
                          ? <span className="text-base">{p.category.icon}</span>
                          : <FiPackage size={16} />
                        }
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-slate-200 text-xs font-body truncate">{p.name}</p>
                    <p className="text-slate-600 text-[10px] font-body">{p.sku}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`badge text-[9px] ${p.stock === 0 ? 'badge-red' : 'badge-amber'}`}>
                      {p.stock === 0 ? 'OUT' : `${p.stock} left`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}