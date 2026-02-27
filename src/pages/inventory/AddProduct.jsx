import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createProductAPI, updateProductAPI, getProductAPI, getCategoriesAPI } from '../../api/product.api';
import Input, { Select, Textarea } from '../../components/common/Input';
import toast from 'react-hot-toast';

const UNITS = ['pcs', 'pairs', 'kg', 'g', 'L', 'mL', 'boxes', 'bags', 'sets', 'rolls'];

const initial = { name: '', description: '', sku: '', barcode: '', price: '', costPrice: '', stock: '', lowStockAlert: 10, category: '', taxRate: 0, discount: 0, unit: 'pcs', tags: '' };

export default function AddProduct() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [form, setForm] = useState(initial);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    getCategoriesAPI().then(res => setCategories(res.data.data));
    if (isEdit) {
      getProductAPI(id).then(res => {
        const p = res.data.data;
        setForm({ ...p, category: p.category?._id || p.category, tags: (p.tags || []).join(', ') });
      });
    }
  }, [id]);

  const set = (key, val) => { setForm(f => ({ ...f, [key]: val })); setErrors(e => ({ ...e, [key]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.name) e.name = 'Product name required';
    if (!form.sku) e.sku = 'SKU required';
    if (!form.price || isNaN(form.price) || +form.price < 0) e.price = 'Valid price required';
    if (!form.category) e.category = 'Category required';
    if (form.stock === '' || isNaN(form.stock)) e.stock = 'Valid stock required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = { ...form, tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [] };
      if (isEdit) await updateProductAPI(id, payload);
      else await createProductAPI(payload);
      toast.success(isEdit ? 'Product updated!' : 'Product created!');
      navigate('/products');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save product'); }
    finally { setLoading(false); }
  };

  return (
    <div className="page-wrap animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
          <p className="page-subtitle">{isEdit ? 'Update product information' : 'Create a new product for your store'}</p>
        </div>
        <button onClick={() => navigate('/products')} className="btn-secondary">← Back</button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-5">
        {/* Main info */}
        <div className="col-span-2 space-y-5">
          <div className="card-glow space-y-4">
            <h3 className="font-display font-bold text-white tracking-wide">Product Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Product Name *" value={form.name} onChange={e => set('name', e.target.value)} error={errors.name} placeholder="e.g. iPhone 15 Pro" className="col-span-2"/>
              <Input label="SKU *" value={form.sku} onChange={e => set('sku', e.target.value.toUpperCase())} error={errors.sku} placeholder="ELEC-001"/>
              <Input label="Barcode" value={form.barcode} onChange={e => set('barcode', e.target.value)} placeholder="8901234567890"/>
            </div>
            <Textarea label="Description" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Product description..." rows={3}/>
            <Input label="Tags (comma separated)" value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="electronics, apple, mobile"/>
          </div>

          <div className="card-glow space-y-4">
            <h3 className="font-display font-bold text-white tracking-wide">Pricing & Tax</h3>
            <div className="grid grid-cols-3 gap-4">
              <Input label="Selling Price *" type="number" value={form.price} onChange={e => set('price', e.target.value)} error={errors.price} placeholder="0.00" min="0" step="0.01"/>
              <Input label="Cost Price" type="number" value={form.costPrice} onChange={e => set('costPrice', e.target.value)} placeholder="0.00" min="0" step="0.01"/>
              <Input label="Discount ($)" type="number" value={form.discount} onChange={e => set('discount', e.target.value)} placeholder="0.00" min="0" step="0.01"/>
              <div>
                <label className="label">Tax Rate (%)</label>
                <select className="input" value={form.taxRate} onChange={e => set('taxRate', e.target.value)}>
                  {[0, 5, 8, 10, 12, 15, 18, 20].map(r => <option key={r} value={r}>{r}%</option>)}
                </select>
              </div>
            </div>
            {form.price && form.costPrice && (
              <div className="bg-bg-primary rounded-lg p-3 flex gap-6 text-sm font-body">
                <div><p className="text-slate-500 text-[10px] uppercase tracking-widest">Profit</p><p className="text-accent-green font-display font-bold">${(+form.price - +form.costPrice).toFixed(2)}</p></div>
                <div><p className="text-slate-500 text-[10px] uppercase tracking-widest">Margin</p><p className="text-accent-blue font-display font-bold">{form.price > 0 ? (((+form.price - +form.costPrice) / +form.price) * 100).toFixed(1) : 0}%</p></div>
              </div>
            )}
          </div>

          <div className="card-glow space-y-4">
            <h3 className="font-display font-bold text-white tracking-wide">Stock Management</h3>
            <div className="grid grid-cols-3 gap-4">
              <Input label="Current Stock *" type="number" value={form.stock} onChange={e => set('stock', e.target.value)} error={errors.stock} placeholder="0" min="0"/>
              <Input label="Low Stock Alert" type="number" value={form.lowStockAlert} onChange={e => set('lowStockAlert', e.target.value)} placeholder="10" min="0"/>
              <div>
                <label className="label">Unit</label>
                <select className="input" value={form.unit} onChange={e => set('unit', e.target.value)}>
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="card-glow space-y-4">
            <h3 className="font-display font-bold text-white tracking-wide">Category</h3>
            <div>
              <label className="label">Category *</label>
              <select className={`input ${errors.category ? 'input-error' : ''}`} value={form.category} onChange={e => set('category', e.target.value)}>
                <option value="">Select category</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.icon} {c.name}</option>)}
              </select>
              {errors.category && <p className="text-accent-red text-[11px] mt-1 font-body">{errors.category}</p>}
            </div>
          </div>

          <div className="card-glow">
            <button type="submit" disabled={loading} className="btn-primary w-full h-11 text-center">
              {loading ? '⏳ Saving...' : isEdit ? '✓ Update Product' : '+ Create Product'}
            </button>
            <button type="button" onClick={() => navigate('/products')} className="btn-secondary w-full h-10 text-center mt-3">
              Cancel
            </button>
          </div>

          {form.price && (
            <div className="card-glow space-y-2">
              <h4 className="font-display text-sm text-slate-400 uppercase tracking-widest">Preview</h4>
              <p className="font-display font-bold text-white text-lg">{form.name || 'Product Name'}</p>
              <p className="font-display font-black text-accent-green text-3xl">${(+form.price || 0).toFixed(2)}</p>
              <p className="text-slate-500 text-xs font-body">SKU: {form.sku || '—'}</p>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
