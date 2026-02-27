import { useEffect, useState } from 'react';
import { getUsersAPI, createUserAPI, updateUserAPI, deleteUserAPI, toggleUserAPI } from '../../api/order.api';
import { ROLE_LABELS, ROLE_COLORS } from '../../utils/formatCurrency';
import Modal from '../../components/common/Modal';
import Loader, { SkeletonRow } from '../../components/common/Loader';
import toast from 'react-hot-toast';

const ROLES = ['super_admin', 'store_admin', 'cashier', 'inventory_manager'];
const init = { name: '', email: '', password: '', role: 'cashier', phone: '', store: 'Main Branch' };

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(init);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const load = () => { setLoading(true); getUsersAPI().then(r => { setUsers(r.data.data); setLoading(false); }).catch(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const openAdd = () => { setEditing(null); setForm(init); setErrors({}); setModal(true); };
  const openEdit = (u) => { setEditing(u); setForm({ name: u.name, email: u.email, password: '', role: u.role, phone: u.phone || '', store: u.store || 'Main Branch' }); setErrors({}); setModal(true); };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.email.trim()) e.email = 'Required';
    if (!editing && form.password.length < 6) e.password = 'Min 6 characters';
    setErrors(e); return !Object.keys(e).length;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const p = { ...form };
      if (editing && !p.password) delete p.password;
      editing ? await updateUserAPI(editing._id, p) : await createUserAPI(p);
      toast.success(editing ? 'User updated' : 'User created');
      setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try { await deleteUserAPI(id); toast.success('User deleted'); load(); }
    catch { toast.error('Failed'); }
  };

  const handleToggle = async (id) => {
    try { await toggleUserAPI(id); load(); } catch { toast.error('Failed'); }
  };

  return (
    <div className="page-wrap animate-fade-in">
      <div className="page-header flex-col sm:flex-row gap-3">
        <div><h1 className="page-title text-2xl sm:text-3xl">User Management</h1><p className="page-subtitle text-xs sm:text-sm">{users.length} users</p></div>
        <button onClick={openAdd} className="btn-primary w-full sm:w-auto h-10">+ Add User</button>
      </div>

      <div className="hidden md:block card-glow overflow-hidden">
        <table className="table-wrap text-xs">
          <thead><tr style={{ background: 'rgba(255,255,255,0.02)' }}>{['User', 'Email', 'Role', 'Store', 'Status', 'Last Login', 'Actions'].map(h => <th key={h} className="th text-xs">{h}</th>)}</tr></thead>
          <tbody>
            {loading ? [...Array(5)].map((_, i) => <SkeletonRow key={i} cols={7}/>) :
              users.map(u => (
                <tr key={u._id} className="tr">
                  <td className="td">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center font-display font-bold text-xs border border-accent-green/20" style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(59,130,246,0.1))' }}>
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      <span className="text-slate-200 text-xs font-body hidden sm:inline">{u.name}</span>
                    </div>
                  </td>
                  <td className="td text-slate-400 text-xs hidden lg:table-cell">{u.email}</td>
                  <td className="td"><span className={`badge badge-${ROLE_COLORS[u.role] || 'gray'} text-[9px]`}>{ROLE_LABELS[u.role]}</span></td>
                  <td className="td text-slate-400 text-xs hidden xl:table-cell">{u.store || '—'}</td>
                  <td className="td">
                    <button onClick={() => handleToggle(u._id)} className={`badge cursor-pointer hover:opacity-80 transition-opacity text-[9px] ${u.isActive ? 'badge-green' : 'badge-red'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="td text-slate-500 text-xs hidden md:table-cell">{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}</td>
                  <td className="td">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(u)} className="btn-icon w-6 h-6">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button onClick={() => handleDelete(u._id, u.name)} className="btn-icon w-6 h-6 hover:text-accent-red hover:border-accent-red/30">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {!loading && !users.length && <div className="py-12 text-center text-slate-600 font-body">No users found</div>}
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {loading ? [...Array(5)].map((_, i) => <div key={i} className="skeleton h-32 rounded-xl"/>) :
          users.length > 0 ? users.map(u => (
            <div key={u._id} className="bg-bg-card border border-white/[0.05] rounded-xl p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center font-display font-bold text-sm border border-accent-green/20 flex-shrink-0" style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(59,130,246,0.1))' }}>
                    {u.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-body font-semibold text-white text-sm truncate">{u.name}</p>
                    <p className="text-slate-400 text-xs truncate">{u.email}</p>
                  </div>
                </div>
                <span className={`badge badge-${ROLE_COLORS[u.role] || 'gray'} text-[9px] flex-shrink-0`}>{ROLE_LABELS[u.role]}</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Store</span><span className="text-white">{u.store || '—'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Status</span>
                  <button onClick={() => handleToggle(u._id)} className={`badge cursor-pointer hover:opacity-80 transition-opacity text-[9px] ${u.isActive ? 'badge-green' : 'badge-red'}`}>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Last Login</span><span className="text-slate-300">{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}</span>
                </div>
              </div>
              <div className="flex gap-2 pt-2 border-t border-white/[0.05]">
                <button onClick={() => openEdit(u)} className="btn-secondary flex-1 h-8 text-xs">Edit</button>
                <button onClick={() => handleDelete(u._id, u.name)} className="btn-danger flex-1 h-8 text-xs">Delete</button>
              </div>
            </div>
          )) : (
            <div className="py-12 text-center text-slate-600 font-body">No users found</div>
          )}
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Edit User' : 'Add User'} size="sm">
        <div className="space-y-4">
          <div>
            <label className="label">Full Name *</label>
            <input className={`input ${errors.name ? 'input-error' : ''}`} value={form.name} onChange={e => set('name', e.target.value)} placeholder="John Doe"/>
            {errors.name && <p className="text-accent-red text-[11px] mt-1">{errors.name}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Email *</label>
              <input className={`input ${errors.email ? 'input-error' : ''}`} type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="john@store.com"/>
              {errors.email && <p className="text-accent-red text-[11px] mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="label">{editing ? 'New Password' : 'Password *'}</label>
              <input className={`input ${errors.password ? 'input-error' : ''}`} type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder={editing ? 'Leave blank to keep' : 'Min 6 chars'}/>
              {errors.password && <p className="text-accent-red text-[11px] mt-1">{errors.password}</p>}
            </div>
            <div>
              <label className="label">Role</label>
              <select className="input" value={form.role} onChange={e => set('role', e.target.value)}>
                {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+1-555-0000"/>
            </div>
          </div>
          <div>
            <label className="label">Store</label>
            <input className="input" value={form.store} onChange={e => set('store', e.target.value)} placeholder="Main Branch"/>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : editing ? 'Update User' : 'Create User'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
