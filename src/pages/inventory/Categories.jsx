import { useEffect, useState } from 'react';
import { getCategoriesAPI, createCategoryAPI, updateCategoryAPI, deleteCategoryAPI } from '../../api/product.api';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';
import {
  FiEdit2, FiTrash2, FiPackage, FiSmartphone, FiHome, FiBook,
  FiMusic, FiGift, FiMonitor, FiTool, FiShoppingBag, FiCamera,
  FiHeart, FiStar, FiCoffee, FiTruck, FiZap, FiGlobe,
  FiAward, FiShoppingCart, FiWifi, FiWatch, FiSunrise,
  FiFeather, FiDroplet, FiUmbrella, FiScissors, FiPieChart
} from 'react-icons/fi';

const COLORS = ['#22c55e','#3b82f6','#8b5cf6','#f59e0b','#ef4444','#06b6d4','#ec4899','#64748b','#14b8a6','#f97316'];

const ICON_LIST = [
  { key: 'FiShoppingBag',  El: FiShoppingBag },
  { key: 'FiSmartphone',   El: FiSmartphone },
  { key: 'FiHome',         El: FiHome },
  { key: 'FiBook',         El: FiBook },
  { key: 'FiMusic',        El: FiMusic },
  { key: 'FiGift',         El: FiGift },
  { key: 'FiMonitor',      El: FiMonitor },
  { key: 'FiTool',         El: FiTool },
  { key: 'FiCamera',       El: FiCamera },
  { key: 'FiHeart',        El: FiHeart },
  { key: 'FiStar',         El: FiStar },
  { key: 'FiCoffee',       El: FiCoffee },
  { key: 'FiTruck',        El: FiTruck },
  { key: 'FiZap',          El: FiZap },
  { key: 'FiGlobe',        El: FiGlobe },
  { key: 'FiAward',        El: FiAward },
  { key: 'FiShoppingCart', El: FiShoppingCart },
  { key: 'FiWifi',         El: FiWifi },
  { key: 'FiWatch',        El: FiWatch },
  { key: 'FiSunrise',      El: FiSunrise },
  { key: 'FiFeather',      El: FiFeather },
  { key: 'FiDroplet',      El: FiDroplet },
  { key: 'FiUmbrella',     El: FiUmbrella },
  { key: 'FiScissors',     El: FiScissors },
  { key: 'FiPieChart',     El: FiPieChart },
  { key: 'FiPackage',      El: FiPackage },
];

// name se icon key guess karta hai
const guessIconByName = (name = '') => {
  const n = name.toLowerCase();
  if (n.includes('phone') || n.includes('mobile') || n.includes('tech') || n.includes('electronic')) return 'FiSmartphone';
  if (n.includes('home') || n.includes('house') || n.includes('furniture') || n.includes('decor')) return 'FiHome';
  if (n.includes('book') || n.includes('education') || n.includes('stationery')) return 'FiBook';
  if (n.includes('music') || n.includes('audio') || n.includes('sound')) return 'FiMusic';
  if (n.includes('gift') || n.includes('toy') || n.includes('present')) return 'FiGift';
  if (n.includes('computer') || n.includes('laptop') || n.includes('monitor') || n.includes('pc')) return 'FiMonitor';
  if (n.includes('tool') || n.includes('hardware') || n.includes('repair')) return 'FiTool';
  if (n.includes('cloth') || n.includes('fashion') || n.includes('wear') || n.includes('shirt') || n.includes('dress')) return 'FiShoppingBag';
  if (n.includes('camera') || n.includes('photo') || n.includes('picture')) return 'FiCamera';
  if (n.includes('health') || n.includes('beauty') || n.includes('cosmetic') || n.includes('care')) return 'FiHeart';
  if (n.includes('coffee') || n.includes('drink') || n.includes('beverage') || n.includes('cafe')) return 'FiCoffee';
  if (n.includes('food') || n.includes('grocery') || n.includes('fruit') || n.includes('vegetable')) return 'FiDroplet';
  if (n.includes('sport') || n.includes('game') || n.includes('fitness') || n.includes('gym')) return 'FiZap';
  if (n.includes('car') || n.includes('auto') || n.includes('vehicle') || n.includes('transport')) return 'FiTruck';
  if (n.includes('watch') || n.includes('jewel') || n.includes('accessory')) return 'FiWatch';
  if (n.includes('award') || n.includes('premium') || n.includes('luxury')) return 'FiAward';
  if (n.includes('medicine') || n.includes('pharmacy') || n.includes('medical')) return 'FiFeather';
  if (n.includes('travel') || n.includes('outdoor') || n.includes('camping')) return 'FiGlobe';
  if (n.includes('shoe') || n.includes('footwear') || n.includes('boot')) return 'FiScissors';
  if (n.includes('baby') || n.includes('kid') || n.includes('child')) return 'FiStar';
  return 'FiPackage';
};

const RenderIcon = ({ iconKey, className = '', style = {} }) => {
  const found = ICON_LIST.find(i => i.key === iconKey);
  const El = found ? found.El : FiPackage;
  return <El className={className} style={style} />;
};

export default function Categories() {
  const [cats, setCats] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', icon: 'FiPackage', color: '#22c55e', description: '' });
  const [loading, setLoading] = useState(false);

  const load = () => getCategoriesAPI().then(r => setCats(r.data.data));
  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', icon: 'FiPackage', color: '#22c55e', description: '' });
    setModal(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    // purane emoji ya unknown key ko bhi handle karo
    const validKey = ICON_LIST.find(i => i.key === cat.icon) ? cat.icon : guessIconByName(cat.name);
    setForm({ name: cat.name, icon: validKey, color: cat.color, description: cat.description || '' });
    setModal(true);
  };

  // name type karne par auto icon suggest karo
  const handleNameChange = (e) => {
    const name = e.target.value;
    setForm(f => ({ ...f, name, icon: guessIconByName(name) }));
  };

  const handleSave = async () => {
    if (!form.name) return toast.error('Name required');
    setLoading(true);
    try {
      if (editing) await updateCategoryAPI(editing._id, form);
      else await createCategoryAPI(form);
      toast.success(editing ? 'Category updated' : 'Category created');
      setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete category "${name}"?`)) return;
    try { await deleteCategoryAPI(id); toast.success('Deleted'); load(); }
    catch { toast.error('Cannot delete category with products'); }
  };

  return (
    <div className="page-wrap animate-fade-in">
      <div className="page-header">
        <div><h1 className="page-title">Categories</h1><p className="page-subtitle">{cats.length} categories</p></div>
        <button onClick={openAdd} className="btn-primary">+ Add Category</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {cats.map(cat => (
          <div key={cat._id} className="card-hover group relative">
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: `${cat.color}18`, border: `1px solid ${cat.color}35`, color: cat.color, fontSize: '1.4rem' }}>
                <RenderIcon iconKey={ICON_LIST.find(i => i.key === cat.icon) ? cat.icon : guessIconByName(cat.name)} />
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(cat)} className="btn-icon w-7 h-7"><FiEdit2 size={14} /></button>
                <button onClick={() => handleDelete(cat._id, cat.name)} className="btn-icon w-7 h-7 hover:text-accent-red hover:border-accent-red/30"><FiTrash2 size={14} /></button>
              </div>
            </div>
            <p className="font-display font-bold text-white text-base tracking-wide">{cat.name}</p>
            {cat.description && <p className="text-slate-500 text-xs font-body mt-1 line-clamp-1">{cat.description}</p>}
            <div className="w-full h-0.5 mt-3 rounded-full" style={{ background: `linear-gradient(90deg, ${cat.color}, transparent)` }}/>
          </div>
        ))}
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Edit Category' : 'Add Category'} size="sm">
        <div className="space-y-4">
          <div>
            <label className="label">Name *</label>
            <input className="input" value={form.name} onChange={handleNameChange} placeholder="Category name"/>
          </div>
          <div>
            <label className="label">Icon</label>
            <div className="grid grid-cols-5 gap-2 p-3 bg-bg-primary rounded-xl border border-white/[0.06]">
              {ICON_LIST.map(ico => {
                const El = ico.El;
                return (
                  <button key={ico.key} type="button" onClick={() => setForm(f => ({ ...f, icon: ico.key }))}
                    className={`p-2 rounded-lg transition-all flex flex-col items-center justify-center gap-1 text-xs ${form.icon === ico.key ? 'bg-accent-green/20 text-accent-green scale-105 border border-accent-green/40' : 'hover:bg-white/5 text-slate-400 border border-transparent'}`}>
                    <El size={20} />
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="label">Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))}
                  className={`w-8 h-8 rounded-lg transition-all ${form.color === c ? 'scale-125 ring-2 ring-white/40 ring-offset-1 ring-offset-bg-secondary' : 'hover:scale-110'}`}
                  style={{ background: c }}/>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Description</label>
            <input className="input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional description"/>
          </div>

          {/* Preview */}
          <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: `${form.color}10`, border: `1px solid ${form.color}30` }}>
            <span style={{ color: form.color, fontSize: '1.6rem', display: 'flex' }}>
              <RenderIcon iconKey={form.icon} />
            </span>
            <div>
              <p className="font-display font-bold text-white">{form.name || 'Category Name'}</p>
              <p className="text-[10px] text-slate-500 font-body">Preview</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleSave} disabled={loading} className="btn-primary flex-1">{loading ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}