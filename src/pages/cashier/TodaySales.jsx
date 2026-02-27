import { useEffect, useState } from 'react';
import { getTodayOrdersAPI } from '../../api/order.api';
import { formatCurrency, formatDateTime } from '../../utils/formatCurrency';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

export default function TodaySales() {
  const [orders, setOrders] = useState([]);
  const [totalSales, setTotalSales] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTodayOrdersAPI()
      .then(res => { setOrders(res.data.data); setTotalSales(res.data.totalSales); })
      .catch(() => toast.error('Failed to load today\'s sales'))
      .finally(() => setLoading(false));
  }, []);

  const byMethod = orders.reduce((acc, o) => {
    acc[o.paymentMethod] = (acc[o.paymentMethod] || 0) + o.total;
    return acc;
  }, {});

  if (loading) return <div className="page-wrap"><Loader /></div>;

  return (
    <div className="page-wrap space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Today's Sales</h1>
          <p className="page-subtitle">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
        <div className="stat-card">
          <p className="text-slate-500 text-xs font-body uppercase tracking-widest mb-2">Total Sales</p>
          <p className="font-display font-black text-accent-green text-3xl">{formatCurrency(totalSales)}</p>
        </div>
        <div className="stat-card">
          <p className="text-slate-500 text-xs font-body uppercase tracking-widest mb-2">Orders</p>
          <p className="font-display font-black text-white text-3xl">{orders.length}</p>
        </div>
        {Object.entries(byMethod).map(([method, amount]) => (
          <div key={method} className="stat-card">
            <p className="text-slate-500 text-xs font-body uppercase tracking-widest mb-2 capitalize">{method} Sales</p>
            <p className="font-display font-black text-white text-2xl">{formatCurrency(amount)}</p>
          </div>
        ))}
      </div>

      {/* Orders table */}
      <div className="hidden md:block card-glow overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <h3 className="font-display font-bold text-white tracking-wide text-sm">Today's Transactions</h3>
        </div>
        <table className="table-wrap text-xs">
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
              {['Order #', 'Time', 'Items', 'Payment', 'Total'].map(h => <th key={h} className="th">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr><td colSpan="5" className="td text-center py-12 text-slate-600">No sales today yet</td></tr>
            ) : orders.map(o => (
              <tr key={o._id} className="tr">
                <td className="td"><span className="font-display font-bold text-accent-green text-xs">{o.orderNumber}</span></td>
                <td className="td text-slate-400 text-xs">{new Date(o.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</td>
                <td className="td">{o.items?.length} item(s)</td>
                <td className="td capitalize"><span className="badge badge-green">{o.paymentMethod}</span></td>
                <td className="td font-display font-bold text-white">{formatCurrency(o.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        <h3 className="font-display font-bold text-white tracking-wide text-sm px-4">Today's Transactions</h3>
        {orders.length === 0 ? (
          <div className="text-center text-slate-600 font-body text-sm py-8">No sales today yet</div>
        ) : (
          orders.map(o => (
            <div key={o._id} className="bg-bg-card border border-white/[0.05] rounded-xl p-3 mx-4">
              <div className="flex items-start justify-between mb-2">
                <span className="font-display font-bold text-accent-green text-sm">{o.orderNumber}</span>
                <span className="badge badge-green text-[9px]">{o.paymentMethod}</span>
              </div>
              <p className="text-slate-400 text-xs mb-2">{new Date(o.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
              <div className="flex items-center justify-between text-xs font-body">
                <span className="text-slate-500">{o.items?.length} item(s)</span>
                <span className="font-display font-bold text-white">{formatCurrency(o.total)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
