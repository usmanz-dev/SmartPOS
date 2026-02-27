import { useEffect, useState } from 'react';
import { getOrdersAPI, refundOrderAPI } from '../../api/order.api';
import { formatCurrency, formatDateTime } from '../../utils/formatCurrency';
import { useAuth } from '../../hooks/useAuth';
import Modal from '../../components/common/Modal';
import Loader, { SkeletonRow } from '../../components/common/Loader';
import toast from 'react-hot-toast';

const PM_BADGE = { cash: 'badge-green', card: 'badge-blue', online: 'badge-amber', split: 'badge-purple' };
const STATUS_BADGE = { completed: 'badge-green', refunded: 'badge-red', cancelled: 'badge-gray' };

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const { isAdmin } = useAuth();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getOrdersAPI({ page, limit: 15 });
      setOrders(data.data);
      setTotal(data.total);
      setPages(data.pages);
    } catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page]);

  const handleRefund = async (id) => {
    if (!confirm('Are you sure you want to refund this order? Stock will be restored.')) return;
    try {
      await refundOrderAPI(id);
      toast.success('Order refunded');
      load();
      setSelected(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Refund failed'); }
  };

  const filtered = orders.filter(o =>
    !search || o.orderNumber?.includes(search.toUpperCase()) || o.cashier?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-wrap animate-fade-in">
      <div className="page-header flex-col sm:flex-row gap-3">
        <div>
          <h1 className="page-title text-2xl sm:text-3xl">Orders</h1>
          <p className="page-subtitle text-xs sm:text-sm">{total} total orders</p>
        </div>
        <div className="relative w-full sm:w-auto">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search order #..." className="input pl-9 w-full sm:w-64 text-xs sm:text-sm h-9"/>
        </div>
      </div>

      <div className="hidden md:block card-glow overflow-hidden">
        <table className="table-wrap">
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
              {['Order #', 'Date', 'Cashier', 'Items', 'Payment', 'Total', 'Status', 'Actions'].map(h => (
                <th key={h} className="th text-xs">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? [...Array(8)].map((_, i) => <SkeletonRow key={i} cols={8}/>) :
              filtered.map(order => (
                <tr key={order._id} className="tr">
                  <td className="td"><span className="font-display font-bold text-accent-green text-xs">{order.orderNumber}</span></td>
                  <td className="td text-slate-400 text-xs">{formatDateTime(order.createdAt)}</td>
                  <td className="td text-xs">{order.cashier?.name || '—'}</td>
                  <td className="td text-xs">{order.items?.length || 0} items</td>
                  <td className="td"><span className={`${PM_BADGE[order.paymentMethod]} capitalize text-xs`}>{order.paymentMethod}</span></td>
                  <td className="td font-display font-bold text-white text-xs">{formatCurrency(order.total)}</td>
                  <td className="td"><span className={`${STATUS_BADGE[order.status]} capitalize text-xs`}>{order.status}</span></td>
                  <td className="td">
                    <div className="flex gap-2">
                      <button onClick={() => setSelected(order)} className="btn-icon w-6 h-6 text-slate-400 hover:text-white">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      </button>
                      {isAdmin() && order.status === 'completed' && (
                        <button onClick={() => handleRefund(order._id)} className="btn-danger btn-sm text-[9px] px-2 h-7">Refund</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {loading ? [...Array(5)].map((_, i) => <div key={i} className="skeleton h-24 rounded-xl"/>) :
          filtered.length > 0 ? filtered.map(order => (
            <div key={order._id} className="bg-bg-card border border-white/[0.05] rounded-xl p-3 cursor-pointer hover:border-accent-green/30 transition-colors" onClick={() => setSelected(order)}>
              <div className="flex items-start justify-between mb-2">
                <span className="font-display font-bold text-accent-green text-sm">{order.orderNumber}</span>
                <span className={`${STATUS_BADGE[order.status]} capitalize text-[9px]`}>{order.status}</span>
              </div>
              <p className="text-slate-400 text-xs mb-2">{formatDateTime(order.createdAt)}</p>
              <div className="flex items-center justify-between text-xs font-body">
                <span className="text-slate-500">{order.items?.length || 0} items</span>
                <span className={`${PM_BADGE[order.paymentMethod]} capitalize text-[9px]`}>{order.paymentMethod}</span>
                <span className="font-display font-bold text-white">{formatCurrency(order.total)}</span>
              </div>
            </div>
          )) : (
            <div className="py-12 text-center text-slate-600 font-body">No orders found</div>
          )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-slate-500 text-sm font-body">{total} orders total</p>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary btn-sm disabled:opacity-40">← Prev</button>
            <span className="px-3 py-1.5 bg-bg-card rounded-lg text-sm font-display text-white border border-white/[0.07]">{page} / {pages}</span>
            <button disabled={page === pages} onClick={() => setPage(p => p + 1)} className="btn-secondary btn-sm disabled:opacity-40">Next →</button>
          </div>
        </div>
      )}

      {/* Order detail modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={`Order ${selected?.orderNumber}`} size="md">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm font-body">
              {[['Date', formatDateTime(selected.createdAt)], ['Cashier', selected.cashier?.name], ['Payment', <span className={`${PM_BADGE[selected.paymentMethod]} capitalize`}>{selected.paymentMethod}</span>], ['Status', <span className={`${STATUS_BADGE[selected.status]} capitalize`}>{selected.status}</span>]].map(([k, v]) => (
                <div key={k} className="bg-bg-primary rounded-lg p-3">
                  <p className="label">{k}</p>
                  <p className="text-slate-200">{v}</p>
                </div>
              ))}
            </div>
            <div className="bg-bg-primary rounded-xl overflow-hidden">
              <table className="table-wrap text-xs">
                <thead><tr style={{ background: 'rgba(255,255,255,0.02)' }}><th className="th">Product</th><th className="th">Qty</th><th className="th">Price</th><th className="th">Total</th></tr></thead>
                <tbody>{selected.items?.map((item, i) => (
                  <tr key={i} className="tr"><td className="td">{item.name}</td><td className="td">×{item.quantity}</td><td className="td">{formatCurrency(item.price)}</td><td className="td font-bold">{formatCurrency(item.subtotal)}</td></tr>
                ))}</tbody>
              </table>
            </div>
            <div className="bg-bg-primary rounded-xl p-4 space-y-2 text-sm font-body">
              {[['Subtotal', formatCurrency(selected.subtotal)], ['Tax', formatCurrency(selected.taxAmount)], ...(selected.discountAmount > 0 ? [['Discount', `-${formatCurrency(selected.discountAmount)}`]] : [])].map(([k, v]) => (
                <div key={k} className="flex justify-between text-slate-400"><span>{k}</span><span>{v}</span></div>
              ))}
              <div className="flex justify-between text-white font-display font-bold text-base pt-2 border-t border-white/[0.06]">
                <span>Total</span><span className="text-accent-green">{formatCurrency(selected.total)}</span>
              </div>
              {selected.change > 0 && <div className="flex justify-between text-accent-cyan font-body"><span>Change Given</span><span>{formatCurrency(selected.change)}</span></div>}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
