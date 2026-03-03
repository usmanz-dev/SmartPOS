import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  createProductAPI, updateProductAPI, getProductAPI, getCategoriesAPI,
} from '../../api/product.api';
import Input, { Select, Textarea } from '../../components/common/Input';
import toast from 'react-hot-toast';

const UNITS = ['pcs', 'pairs', 'kg', 'g', 'L', 'mL', 'boxes', 'bags', 'sets', 'rolls'];

const emptyForm = {
  name: '', description: '', sku: '', barcode: '',
  price: '', costPrice: '', stock: '', lowStockAlert: 10,
  category: '', taxRate: 0, discount: 0, unit: 'pcs', tags: '',
  hasVariants: false,
  variantOptions: [],
  variants: [],
};

// ─── Small helper: generate cartesian product ───────────────────────────────
function cartesian(arrays) {
  return arrays.reduce(
    (acc, arr) => acc.flatMap(x => arr.map(y => [...x, y])),
    [[]]
  );
}

// ─── Single Variant Row ─────────────────────────────────────────────────────
function VariantRow({ v, i, onChange, onRemove }) {
  return (
    <div className="grid grid-cols-12 gap-2 items-center p-2.5 rounded-lg bg-bg-primary border border-white/[0.05]">
      <div className="col-span-3">
        <input
          className="input text-xs h-8 py-0"
          placeholder="Naam e.g. Red / XL"
          value={v.name}
          onChange={e => onChange(i, 'name', e.target.value)}
        />
      </div>
      <div className="col-span-2">
        <input
          className="input text-xs h-8 py-0 font-mono uppercase"
          placeholder="SKU"
          value={v.sku}
          onChange={e => onChange(i, 'sku', e.target.value.toUpperCase())}
        />
      </div>
      <div className="col-span-2">
        <input
          type="number" min="0" step="0.01"
          className="input text-xs h-8 py-0"
          placeholder="Price"
          value={v.price}
          onChange={e => onChange(i, 'price', e.target.value)}
        />
      </div>
      <div className="col-span-2">
        <input
          type="number" min="0" step="0.01"
          className="input text-xs h-8 py-0"
          placeholder="Cost"
          value={v.costPrice}
          onChange={e => onChange(i, 'costPrice', e.target.value)}
        />
      </div>
      <div className="col-span-2">
        <input
          type="number" min="0"
          className="input text-xs h-8 py-0"
          placeholder="Stock"
          value={v.stock}
          onChange={e => onChange(i, 'stock', e.target.value)}
        />
      </div>
      <div className="col-span-1 flex justify-center">
        <button
          type="button"
          onClick={() => onRemove(i)}
          className="w-7 h-7 rounded-lg border border-accent-red/30 text-accent-red hover:bg-accent-red/10 flex items-center justify-center"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── Option Builder (Color, Size etc.) ───────────────────────────────────────
function OptionRow({ opt, i, onChange, onRemove }) {
  const [val, setVal] = useState('');

  const addVal = () => {
    const trimmed = val.trim();
    if (!trimmed || opt.values.includes(trimmed)) return;
    onChange(i, 'values', [...opt.values, trimmed]);
    setVal('');
  };

  return (
    <div className="p-3 rounded-lg bg-bg-primary border border-white/[0.05] space-y-2">
      <div className="flex gap-2 items-center">
        <input
          className="input text-xs h-8 py-0 w-36"
          placeholder="Option e.g. Color, Size"
          value={opt.label}
          onChange={e => onChange(i, 'label', e.target.value)}
        />
        <button type="button" onClick={() => onRemove(i)}
          className="ml-auto w-6 h-6 border border-accent-red/30 text-accent-red hover:bg-accent-red/10 rounded flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {opt.values.map((v, vi) => (
          <span key={vi} className="inline-flex items-center gap-1 text-[10px] bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 px-2 py-0.5 rounded-full">
            {v}
            <button type="button"
              onClick={() => onChange(i, 'values', opt.values.filter((_, ii) => ii !== vi))}
              className="hover:text-accent-red">×</button>
          </span>
        ))}
        <div className="flex gap-1">
          <input
            className="input text-[10px] h-6 py-0 px-2 w-24"
            placeholder="Add value..."
            value={val}
            onChange={e => setVal(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addVal(); } }}
          />
          <button type="button" onClick={addVal}
            className="text-[10px] px-2 h-6 rounded bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 hover:bg-accent-cyan/20">
            + Add
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main AddProduct ─────────────────────────────────────────────────────────
export default function AddProduct() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    getCategoriesAPI().then(r => setCategories(r.data.data)).catch(() => {});
    if (isEdit) {
      getProductAPI(id).then(r => {
        const p = r.data.data;
        setForm({
          ...p,
          category:       p.category?._id || p.category || '',
          tags:           (p.tags || []).join(', '),
          hasVariants:    p.hasVariants || false,
          variantOptions: p.variantOptions || [],
          variants:       (p.variants || []).map(v => ({
            ...v,
            price:     v.price ?? '',
            costPrice: v.costPrice ?? '',
            stock:     v.stock ?? '',
          })),
        });
      }).catch(() => toast.error('Product load nahi hua'));
    }
  }, [id]);

  const setField = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: '' }));
  };

  // ── Option helpers ──────────────────────────────────────────────────────────
  const addOption = () => setField('variantOptions', [...form.variantOptions, { label: '', values: [] }]);
  const changeOption = (i, field, val) => setField('variantOptions', form.variantOptions.map((o, idx) => idx === i ? { ...o, [field]: val } : o));
  const removeOption = (i) => setField('variantOptions', form.variantOptions.filter((_, idx) => idx !== i));

  const generateVariants = () => {
    const validOpts = form.variantOptions.filter(o => o.label.trim() && o.values.length > 0);
    if (!validOpts.length) return toast.error('Pehle options define karein');

    const combos = cartesian(validOpts.map(o => o.values.map(v => ({ key: o.label, value: v }))));
    const generated = combos.map(attrs => ({
      name:       attrs.map(a => a.value).join(' / '),
      sku:        (form.sku || 'VAR') + '-' + attrs.map(a => a.value.slice(0, 3).toUpperCase()).join('-'),
      price:      form.price || 0,
      costPrice:  form.costPrice || 0,
      stock:      0,
      barcode:    '',
      attributes: attrs,
    }));

    setField('variants', generated);
    toast.success(`${generated.length} variants generate ho gaye!`);
  };

  const addBlankVariant = () => setField('variants', [
    ...form.variants,
    { name:'', attributes:[], sku:(form.sku||'VAR')+'-'+(form.variants.length+1), price:form.price||0, costPrice:form.costPrice||0, stock:0, barcode:'' }
  ]);

  const changeVariant = (i, field, val) => setField('variants', form.variants.map((v, idx) => idx===i?{...v,[field]:val}:v));
  const removeVariant = (i) => setField('variants', form.variants.filter((_, idx)=>idx!==i));

  // ── Validate ────────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.name || !form.name.trim()) e.name = 'Product name required';
    if (!form.sku || !form.sku.trim()) e.sku = 'SKU required';
    if (!form.price || isNaN(+form.price) || +form.price < 0) e.price = 'Valid price required';
    if (!form.category) e.category = 'Category required';

    if (!form.hasVariants) {
      if (form.stock === '' || isNaN(+form.stock) || +form.stock < 0) e.stock = 'Valid stock required';
    } else {
      if (!form.variants.length) e.variants = 'Kam az kam 1 variant chahiye';
      form.variants.forEach((v,i)=>{
        if(!v.name||!v.name.trim()) e[`v_name_${i}`]='Name required';
        if(!v.sku||!v.sku.trim()) e[`v_sku_${i}`]='SKU required';
        if(v.price===''||isNaN(+v.price)||+v.price<0) e[`v_price_${i}`]='Valid price required';
        if(v.stock===''||isNaN(+v.stock)||+v.stock<0) e[`v_stock_${i}`]='Valid stock required';
      });
    }
    setErrors(e);
    return Object.keys(e).length===0;
  };

  const handleSubmit = async e=>{
    e.preventDefault();
    if(!validate()) return toast.error('Kuch fields mein error hai');
    setLoading(true);
    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t=>t.trim()).filter(Boolean):[],
        variants: form.variants.map(v=>({...v, price:+v.price, costPrice:+(v.costPrice||0), stock:+(v.stock||0)}))
      };
      if(isEdit) await updateProductAPI(id,payload);
      else await createProductAPI(payload);
      toast.success(isEdit?'Product updated!':'Product created!');
      navigate('/products');
    } catch(err) {
      toast.error(err.response?.data?.message||'Save nahi hua');
    } finally {
      setLoading(false);
    }
  };

  const totalVariantStock = form.variants.reduce((s,v)=>s+(+(v.stock)||0),0);

  return (
    <div className="page-wrap animate-fade-in">
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="page-title">{isEdit?'Edit Product':'Add New Product'}</h1>
          <p className="page-subtitle">{isEdit?'Update product info':'Naya product banayein'}</p>
        </div>
        <button onClick={()=>navigate('/products')} className="btn-secondary">← Back</button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-5 mt-5">
        {/* Left */}
        <div className="col-span-2 space-y-5">
          {/* Basic Info */}
          <div className="card-glow space-y-4">
            <h3 className="font-display font-bold text-white">Product Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Product Name *" value={form.name} onChange={e=>setField('name',e.target.value)} error={errors.name} placeholder="e.g. Nike Air Max" className="col-span-2"/>
              <Input label="SKU *" value={form.sku} onChange={e=>setField('sku',e.target.value.toUpperCase())} error={errors.sku} placeholder="SHOE-001"/>
              <Input label="Barcode" value={form.barcode} onChange={e=>setField('barcode',e.target.value)} placeholder="8901234567890"/>
            </div>
            <Textarea label="Description" value={form.description} onChange={e=>setField('description',e.target.value)} rows={3}/>
            <Input label="Tags (comma se alag)" value={form.tags} onChange={e=>setField('tags',e.target.value)} placeholder="shoes, nike, sports"/>
          </div>

          {/* Pricing */}
          <div className="card-glow space-y-4">
            <h3 className="font-display font-bold text-white">Pricing & Tax</h3>
            <div className="grid grid-cols-3 gap-4">
              <Input label="Selling Price *" type="number" value={form.price} onChange={e=>setField('price',e.target.value)} error={errors.price} placeholder="0.00" min="0" step="0.01"/>
              <Input label="Cost Price" type="number" value={form.costPrice} onChange={e=>setField('costPrice',e.target.value)} placeholder="0.00" min="0" step="0.01"/>
              <Input label="Discount ($)" type="number" value={form.discount} onChange={e=>setField('discount',e.target.value)} placeholder="0.00" min="0" step="0.01"/>
              <div>
                <label className="label">Tax Rate (%)</label>
                <select className="input" value={form.taxRate} onChange={e=>setField('taxRate',e.target.value)}>
                  {[0,5,8,10,12,15,18,20].map(r=><option key={r} value={r}>{r}%</option>)}
                </select>
              </div>
            </div>
            {form.price && form.costPrice && (
              <div className="bg-bg-primary rounded-lg p-3 flex gap-6 text-sm">
                <div>
                  <p className="text-slate-500 text-[10px] uppercase tracking-widest">Profit</p>
                  <p className="text-accent-green font-display font-bold">${(+form.price - +form.costPrice).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[10px] uppercase tracking-widest">Margin</p>
                  <p className="text-accent-blue font-display font-bold">{form.price>0?((+form.price - +form.costPrice)/+form.price*100).toFixed(1):0}%</p>
                </div>
              </div>
            )}
          </div>

          {/* Stock */}
          {!form.hasVariants && (
            <div className="card-glow space-y-4">
              <h3 className="font-display font-bold text-white">Stock Management</h3>
              <div className="grid grid-cols-3 gap-4">
                <Input label="Current Stock *" type="number" value={form.stock} onChange={e=>setField('stock',e.target.value)} error={errors.stock} placeholder="0" min="0"/>
                <Input label="Low Stock Alert" type="number" value={form.lowStockAlert} onChange={e=>setField('lowStockAlert',e.target.value)} placeholder="10" min="0"/>
                <div>
                  <label className="label">Unit</label>
                  <select className="input" value={form.unit} onChange={e=>setField('unit',e.target.value)}>
                    {UNITS.map(u=><option key={u}>{u}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Variants */}
          <div className="card-glow space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-white">Product Variants</h3>
              <label className="flex items-center gap-2 cursor-pointer select-none" onClick={()=>setField('hasVariants',!form.hasVariants)}>
                <div className={`w-10 h-5 rounded-full p-0.5 transition-all ${form.hasVariants?'bg-accent-cyan':'bg-white/20'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white shadow transform transition-transform ${form.hasVariants?'translate-x-5':'translate-x-0'}`}></div>
                </div>
                <span className="text-xs text-slate-400">{form.hasVariants?'Enabled':'Disabled'}</span>
              </label>
            </div>

            {form.hasVariants && (
              <>
                <button type="button" onClick={addOption} className="btn-secondary btn-sm mb-2">+ Add Option</button>
                {form.variantOptions.map((opt,i)=>(
                  <OptionRow key={i} opt={opt} i={i} onChange={changeOption} onRemove={removeOption}/>
                ))}

                <div className="flex gap-2 mt-2">
                  <button type="button" onClick={generateVariants} className="btn-primary btn-sm">Generate Variants</button>
                  <button type="button" onClick={addBlankVariant} className="btn-secondary btn-sm">+ Add Blank Variant</button>
                </div>

                {errors.variants && <p className="text-accent-red text-xs mt-1">{errors.variants}</p>}

                <div className="space-y-2 mt-3">
                  {form.variants.map((v,i)=><VariantRow key={i} v={v} i={i} onChange={changeVariant} onRemove={removeVariant}/>)}
                </div>

                {form.variants.length>0 && (
                  <p className="text-xs text-slate-400 mt-2">Total Stock: {totalVariantStock}</p>
                )}
              </>
            )}
          </div>

        </div>

        {/* Right Sidebar */}
        <div className="space-y-5">
          <div className="card-glow space-y-4">
            <h3 className="font-display font-bold text-white">Category</h3>
            <Select label="Category *" value={form.category} onChange={e=>setField('category',e.target.value)} error={errors.category}>
              <option value="">-- Select --</option>
              {categories.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}
            </Select>
          </div>
        </div>

        <div className="col-span-3 flex justify-end mt-5">
          <button type="submit" disabled={loading} className="btn-primary btn-lg">{loading?'Saving...':'Save Product'}</button>
        </div>

      </form>
    </div>
  );
}