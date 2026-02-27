import { useEffect, useState } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getSalesReportAPI, getBestSellersAPI, getLowStockReportAPI } from '../../api/report.api';
import { formatCurrency } from '../../utils/formatCurrency';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';
import { BsCashCoin } from 'react-icons/bs';
import { FiFileText, FiAlertTriangle, FiCheckCircle, FiPackage } from 'react-icons/fi';
import { MdAccountBalance } from 'react-icons/md';

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-bg-card border border-white/[0.08] rounded-xl p-3 text-xs font-body shadow-xl">
      <p className="text-slate-400 mb-2 font-display uppercase tracking-wider text-[10px]">{label}</p>
      {payload.map(p => <p key={p.name} style={{ color: p.color }} className="flex justify-between gap-4"><span className="capitalize">{p.name}</span><span className="font-bold">{p.name === 'revenue' ? formatCurrency(p.value) : p.value}</span></p>)}
    </div>
  );
};

export default function Reports() {
  const [salesData, setSalesData] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [totals, setTotals] = useState({});
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ start: new Date(new Date().setDate(1)).toISOString().slice(0, 10), end: new Date().toISOString().slice(0, 10) });
  const [groupBy, setGroupBy] = useState('day');

  const load = async () => {
    setLoading(true);
    try {
      const [sales, sellers, stock] = await Promise.all([
        getSalesReportAPI({ startDate: dateRange.start, endDate: dateRange.end, groupBy }),
        getBestSellersAPI({ startDate: dateRange.start, endDate: dateRange.end }),
        getLowStockReportAPI(),
      ]);
      setSalesData(sales.data.data);
      setTotals(sales.data.totals);
      setBestSellers(sellers.data.data);
      setLowStock(stock.data.data);
    } catch { toast.error('Failed to load reports'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [dateRange, groupBy]);

  const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#06b6d4', '#ef4444', '#ec4899', '#14b8a6', '#f97316', '#64748b'];

  return (
    <div className="page-wrap space-y-6 animate-fade-in">
      {/* Header with filters */}
      <div className="space-y-4">
        <div><h1 className="page-title text-2xl sm:text-3xl">Reports & Analytics</h1><p className="page-subtitle text-xs sm:text-sm">Business intelligence dashboard</p></div>
        <div className="card-glow p-4 space-y-3 sm:space-y-0">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center">
            <div className="flex-shrink-0">
              <select value={groupBy} onChange={e => setGroupBy(e.target.value)} className="input h-10 py-0 text-xs sm:text-sm w-full sm:w-32">
                <option value="day">Daily</option>
                <option value="month">Monthly</option>
              </select>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:items-center flex-1">
              <div className="flex gap-2 flex-1 sm:flex-none">
                <input type="date" className="input h-10 py-0 text-xs sm:text-sm flex-1 sm:flex-none sm:w-auto" value={dateRange.start} onChange={e => setDateRange(d => ({ ...d, start: e.target.value }))}/>
                <span className="hidden sm:flex items-center text-slate-500 text-sm flex-shrink-0">→</span>
              </div>
              <input type="date" className="input h-10 py-0 text-xs sm:text-sm flex-1 sm:flex-none sm:w-auto" value={dateRange.end} onChange={e => setDateRange(d => ({ ...d, end: e.target.value }))}/>
            </div>
            <button onClick={load} className="btn-primary h-10 px-4 text-xs sm:text-sm w-full sm:w-auto flex-shrink-0 font-semibold">REFRESH</button>
          </div>
        </div>
      </div>

      {loading ? <Loader /> : (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              { label: 'Total Revenue',   val: formatCurrency(totals.revenue), icon: <BsCashCoin size={20} />,       color: '#22c55e' },
              { label: 'Total Orders',    val: totals.orders || 0,             icon: <FiFileText size={20} />,       color: '#3b82f6' },
              { label: 'Total Tax',       val: formatCurrency(totals.tax),     icon: <MdAccountBalance size={20} />, color: '#f59e0b' },
              { label: 'Low Stock Items', val: lowStock.length,                icon: <FiAlertTriangle size={20} />,  color: '#ef4444' },
            ].map(s => (
              <div key={s.label} className="stat-card text-center sm:text-left">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 mx-auto sm:mx-0"
                  style={{ background: `${s.color}18`, border: `1px solid ${s.color}30`, color: s.color }}>
                  {s.icon}
                </div>
                <p className="font-display font-black text-white text-lg sm:text-2xl">{s.val}</p>
                <p className="text-slate-500 text-[11px] sm:text-xs font-body mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Sales chart */}
          <div className="card-glow">
            <h3 className="font-display font-bold text-white mb-1 tracking-wide text-sm sm:text-base">Revenue Over Time</h3>
            <p className="text-slate-500 text-xs sm:text-sm font-body mb-5">{groupBy === 'day' ? 'Daily' : 'Monthly'} revenue breakdown</p>
            {salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={salesData} margin={{ left: -15, right: 10 }}>
                  <defs>
                    <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                  <XAxis dataKey="_id" tick={{ fill: '#64748b', fontSize: 9, fontFamily: 'Exo 2' }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fill: '#64748b', fontSize: 9, fontFamily: 'Exo 2' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`}/>
                  <Tooltip content={<Tip />}/>
                  <Area type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} fill="url(#rg)" name="revenue"/>
                </AreaChart>
              </ResponsiveContainer>
            ) : <div className="h-[180px] flex items-center justify-center text-slate-600 font-body text-sm">No data for selected period</div>}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Best sellers */}
            <div className="card-glow">
              <h3 className="font-display font-bold text-white tracking-wide mb-4 text-sm sm:text-base">Best Selling Products</h3>
              {bestSellers.length === 0 ? <p className="text-slate-600 text-xs sm:text-sm font-body py-8 text-center">No sales data</p> : (
                <div className="space-y-3">
                  {bestSellers.slice(0, 8).map((p, i) => (
                    <div key={p._id?.id || i} className="flex items-center gap-2 sm:gap-3">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-[10px] sm:text-xs font-display font-bold flex-shrink-0"
                        style={{ background: `${COLORS[i % COLORS.length]}18`, color: COLORS[i % COLORS.length], border: `1px solid ${COLORS[i % COLORS.length]}30` }}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-200 text-[11px] sm:text-xs font-body truncate">{p._id?.name}</p>
                        <div className="mt-1 h-1 bg-bg-elevated rounded-full">
                          <div className="h-full rounded-full" style={{ width: `${(p.totalQty / bestSellers[0].totalQty) * 100}%`, background: COLORS[i % COLORS.length] }}/>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-display font-bold text-[10px] sm:text-xs" style={{ color: COLORS[i % COLORS.length] }}>{formatCurrency(p.totalRevenue)}</p>
                        <p className="text-slate-600 text-[9px] sm:text-[10px]">{p.totalQty} units</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Low stock */}
            <div className="card-glow">
              <h3 className="font-display font-bold text-white tracking-wide mb-4 text-sm sm:text-base flex items-center gap-2">
                <FiAlertTriangle size={16} className="text-amber-400" /> Low Stock Items
              </h3>
              {lowStock.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-slate-600">
                  <FiCheckCircle size={36} className="mb-2 text-accent-green" />
                  <p className="text-[11px] sm:text-sm font-body">Stock levels healthy</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[280px] overflow-y-auto">
                  {lowStock.map(p => (
                    <div key={p._id} className="flex items-center gap-2 sm:gap-3 bg-bg-primary rounded-lg p-2.5">
                      <span className="text-base sm:text-lg flex-shrink-0" style={{ color: p.category?.color || '#64748b' }}>
                        {p.category?.icon || <FiPackage size={18} />}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-200 text-[11px] sm:text-xs font-body truncate">{p.name}</p>
                        <p className="text-slate-500 text-[9px] sm:text-[10px]">{p.sku}</p>
                      </div>
                      <span className={`badge text-[8px] sm:text-[9px] flex-shrink-0 ${p.stock === 0 ? 'badge-red' : 'badge-amber'}`}>{p.stock === 0 ? 'OUT' : `${p.stock} left`}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}