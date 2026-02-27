import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTodayOrdersAPI } from '../../api/order.api';
import { formatCurrency, formatDateTime } from '../../utils/formatCurrency';
import { useAuth } from '../../hooks/useAuth';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';
import { CiCreditCard1 , CiShoppingBasket } from "react-icons/ci";
import { BsCashCoin } from "react-icons/bs";
import { SiCashapp } from "react-icons/si";
import { GoCheckCircleFill } from "react-icons/go";
import { FaMobileScreen } from "react-icons/fa6";


const StatCard = ({ label, value, sub, icon, color = 'green' }) => (
  <div className="stat-card">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3`}
      style={{ background: `${color}18`, border: `1px solid ${color}35`, color: color }}>
      {icon}
    </div>
    <p className="font-display font-black text-white text-2xl tracking-tight">{value}</p>
    <p className="text-slate-500 text-xs font-body mt-0.5">{label}</p>
    {sub && <p className="text-slate-600 text-[10px] font-body mt-1">{sub}</p>}
  </div>
);

export default function CashierDashboard() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    avgOrder: 0,
    byMethod: {}
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const { user, hasRole } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await getTodayOrdersAPI();
      const data = res.data.data || [];
      const totalSales = res.data.totalSales || 0;

      setOrders(data);

      const byMethod = data.reduce((acc, o) => {
        acc[o.paymentMethod] = (acc[o.paymentMethod] || 0) + o.total;
        return acc;
      }, {});

      setStats({
        totalSales,
        totalOrders: data.length,
        avgOrder: data.length > 0 ? totalSales / data.length : 0,
        byMethod
      });
    } catch {
      toast.error('Failed to load sales data');
    } finally {
      setLoading(false);
    }
  };

  if (!hasRole('cashier')) {
    return (
      <div className="page-wrap animate-fade-in text-center py-12">
        <p className="text-slate-400">This dashboard is only accessible to cashiers.</p>
      </div>
    );
  }

  if (loading) return <div className="page-wrap"><Loader text="Loading sales..." /></div>;

  const methodColors = {
    cash: '#22c55e',
    card: '#3b82f6',
    mobile: '#8b5cf6',
    default: '#f59e0b'
  };

  return (
    <div className="page-wrap space-y-6 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome, {user?.name}!</h1>
          <p className="page-subtitle">Cashier Panel — Manage your sales</p>
        </div>
        <button onClick={() => navigate('/pos')} className="btn-primary">
          <CiCreditCard1 size={28} className="mr-2" /> Open POS
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="My Total Sales" 
          value={formatCurrency(stats.totalSales)}
          icon={<BsCashCoin size={22} />}
          color="#22c55e"
        />
        <StatCard 
          label="My Revenue" 
          value={formatCurrency(stats.totalSales)}
          sub={new Date().toLocaleDateString()}
          icon={<SiCashapp size={22} />}
          color="#f59e0b"
        />
        <StatCard 
          label="Completed" 
          value={stats.totalOrders}
          icon={<GoCheckCircleFill size={22} />}
          color="#02a51b"
        />
        <StatCard 
          label="Avg Order" 
          value={formatCurrency(stats.avgOrder)}
          icon={<CiShoppingBasket size={22} />}
          color="#8b5cf6"
        />
      </div>

      {/* Payment Methods */}
      {Object.keys(stats.byMethod).length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(stats.byMethod).map(([method, amount]) => {
            const color = methodColors[method] || methodColors.default;
            return (
              <div key={method} className="card-glow">
                <p className="text-slate-500 text-xs font-body uppercase tracking-widest mb-3 flex items-center gap-2">
                  {method === 'cash'
                    ? <BsCashCoin size={16} style={{ color: '#22c55e' }} />
                    : method === 'card'
                    ? <CiCreditCard1 size={18} style={{ color: '#3b82f6' }} />
                    : <FaMobileScreen size={14} style={{ color: '#8b5cf6' }} />
                  }
                  {method} Sales
                </p>
                <p className="font-display font-black text-2xl" style={{ color }}>{formatCurrency(amount)}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Recent Sales */}
      <div className="card-glow">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-display font-bold text-white tracking-wide">My Recent Sales</h3>
            <p className="text-slate-500 text-xs font-body mt-0.5">Your latest transactions</p>
          </div>
          <button onClick={() => navigate('/orders')} className="text-accent-green text-sm font-medium hover:underline">
            View All →
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <p className="text-sm">No sales yet today. Start selling!</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/[0.05] bg-bg-secondary/50">
                    <th className="px-4 py-3 text-left font-semibold text-slate-300">Invoice</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-300">Customer</th>
                    <th className="px-4 py-3 text-center font-semibold text-slate-300">Items</th>
                    <th className="px-4 py-3 text-center font-semibold text-slate-300">Total</th>
                    <th className="px-4 py-3 text-center font-semibold text-slate-300">Payment</th>
                    <th className="px-4 py-3 text-center font-semibold text-slate-300">Status</th>
                    <th className="px-4 py-3 text-center font-semibold text-slate-300">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o._id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                      <td className="px-4 py-3">
                        <span className="font-display font-bold text-accent-green">{o.orderNumber}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-300">{o.cashier?.name || 'N/A'}</td>
                      <td className="px-4 py-3 text-center text-slate-500">{o.items?.length} item(s)</td>
                      <td className="px-4 py-3 text-center font-display font-bold text-white">{formatCurrency(o.total)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`badge ${o.paymentMethod === 'cash' ? 'badge-green' : o.paymentMethod === 'card' ? 'badge-blue' : 'badge-purple'}`}>
                          {o.paymentMethod}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="badge badge-green">completed</span>
                      </td>
                      <td className="px-4 py-3 text-center text-slate-500">
                        {new Date(o.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {orders.map(o => (
                <div key={o._id} className="bg-bg-card border border-white/[0.05] rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <span className="font-display font-bold text-accent-green text-sm">{o.orderNumber}</span>
                    <span className={`badge ${o.paymentMethod === 'cash' ? 'badge-green' : o.paymentMethod === 'card' ? 'badge-blue' : 'badge-purple'}`}>
                      {o.paymentMethod}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mb-3">
                    {new Date(o.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-xs">{o.items?.length} item(s)</span>
                    <span className="font-display font-bold text-accent-green text-lg">{formatCurrency(o.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}