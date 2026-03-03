import { useState, useEffect, useRef } from 'react';
import { getProductsAPI, getCategoriesAPI } from '../../api/product.api';
import { useCart } from '../../hooks/useCart';
import { useNotificationSound } from '../../hooks/useNotificationSound';
import { formatCurrency } from '../../utils/formatCurrency';
import toast from 'react-hot-toast';
import {
  FaBoxOpen, FaTshirt, FaAppleAlt, FaCouch,
  FaDumbbell, FaBook, FaSpa, FaCar, FaThLarge,
} from 'react-icons/fa';

const CATEGORY_ICONS = {
  'Electronics': FaBoxOpen, 'Clothing': FaTshirt,
  'Food & Beverages': FaAppleAlt, 'Home & Garden': FaCouch,
  'Sports & Fitness': FaDumbbell, 'Books & Media': FaBook,
  'Beauty & Health': FaSpa, 'Automotive': FaCar,
};
const CATEGORY_FALLBACK = {
  'Electronics': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=400&fit=crop',
  'Clothing': 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&h=400&fit=crop',
  'Food & Beverages': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop',
  'Home & Garden': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop',
  'Sports & Fitness': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=400&fit=crop',
  'Books & Media': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop',
  'Beauty & Health': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop',
  'Automotive': 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=400&fit=crop',
};
const DEFAULT_IMG = 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&h=400&fit=crop';

// ─── Variant Select Popup ─────────────────────────────────────────────────────
function VariantPopup({ product, onSelect, onClose }) {
  const wrapRef = useRef();
  const activeVariants = (product.variants || []).filter(v => v.isActive !== false);

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div
        ref={wrapRef}
        className="w-full max-w-sm bg-bg-sidebar border border-white/[0.09] rounded-2xl shadow-2xl overflow-hidden animate-fade-in"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
          <div>
            <p className="font-display font-bold text-white text-sm">{product.name}</p>
            <p className="text-slate-500 text-[10px]">Variant select karein cart mein add karne ke liye</p>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 border border-white/10 text-slate-400 hover:text-white rounded-lg flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Variant list */}
        <div className="p-3 space-y-2 max-h-[55vh] overflow-y-auto">
          {activeVariants.length === 0 ? (
            <p className="text-center text-slate-500 text-xs py-8">Koi active variant nahi hai</p>
          ) : (
            activeVariants.map((variant) => {
              const outOfStock = variant.stock <= 0;
              return (
                <button
                  key={variant._id}
                  type="button"
                  disabled={outOfStock}
                  onClick={() => onSelect(variant)}
                  className={`w-full flex items-center justify-between px-3 py-3 rounded-xl border text-left transition-all
                    ${outOfStock
                      ? 'border-white/[0.04] opacity-40 cursor-not-allowed'
                      : 'border-white/[0.07] hover:border-accent-green/50 hover:bg-accent-green/5 cursor-pointer'
                    }`}
                >
                  <div className="space-y-0.5">
                    <p className="text-slate-200 text-xs font-medium">{variant.name}</p>
                    {variant.attributes?.length > 0 && (
                      <div className="flex gap-2">
                        {variant.attributes.map((a, i) => (
                          <span key={i} className="text-[9px] text-slate-500">
                            {a.key}: <span className="text-slate-400">{a.value}</span>
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-[9px] text-slate-600 font-mono">{variant.sku}</p>
                  </div>
                  <div className="text-right space-y-0.5 ml-3 flex-shrink-0">
                    <p className="text-accent-green font-display font-bold text-sm">
                      {formatCurrency(variant.price)}
                    </p>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded border inline-block
                      ${outOfStock
                        ? 'text-accent-red border-accent-red/20 bg-accent-red/5'
                        : variant.stock <= 5
                          ? 'text-amber-400 border-amber-400/20'
                          : 'text-slate-400 border-white/10'
                      }`}>
                      {outOfStock ? 'Out of Stock' : `${variant.stock} baqi`}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="px-4 py-2.5 border-t border-white/[0.06]">
          <p className="text-center text-slate-600 text-[10px]">
            {activeVariants.filter(v => v.stock > 0).length} / {activeVariants.length} variants available
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ product, onAdd }) {
  const [imgError, setImgError]   = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const Icon   = CATEGORY_ICONS[product.category?.name] || FaBoxOpen;
  const imgSrc = !imgError && product.image
    ? product.image
    : (CATEGORY_FALLBACK[product.category?.name] || DEFAULT_IMG);

  const hasVariants   = product.hasVariants && product.variants?.length > 0;
  const activeVariants = hasVariants ? product.variants.filter(v => v.isActive !== false) : [];
  const displayStock  = hasVariants
    ? activeVariants.reduce((s, v) => s + v.stock, 0)
    : product.stock;
  const outOfStock = displayStock <= 0;

  return (
    <div
      onClick={() => !outOfStock && onAdd(product)}
      className={`group relative flex flex-col overflow-hidden transition-all duration-300 rounded-2xl border shadow-lg hover:shadow-xl bg-gradient-to-br from-slate-800 via-slate-900 to-slate-900
        ${outOfStock
          ? 'border-white/5 opacity-50 cursor-not-allowed'
          : 'border-white/15 cursor-pointer hover:scale-105 hover:border-accent-green/40 hover:shadow-accent-green/10'
        }`}
    >
      <div className="relative h-[140px] overflow-hidden rounded-t-xl">
        {!imgLoaded && <div className="absolute inset-0 animate-pulse bg-slate-700"/>}
        <img
          src={imgSrc} alt={product.name}
          onLoad={() => setImgLoaded(true)}
          onError={() => { setImgError(true); setImgLoaded(true); }}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"/>

        {/* Category icon */}
        <div className="absolute top-2 left-2 bg-black/40 backdrop-blur-md p-1.5 rounded-full border border-white/20">
          <Icon className="text-xs text-white"/>
        </div>

        {/* Variants badge */}
        {hasVariants && (
          <div className="absolute top-2 right-2 bg-accent-cyan/20 backdrop-blur-md px-1.5 py-0.5 rounded-full border border-accent-cyan/30">
            <span className="text-[8px] text-accent-cyan font-bold">{activeVariants.length} vars</span>
          </div>
        )}

        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="text-[9px] text-accent-red border border-accent-red/30 px-2 py-0.5 rounded-full bg-accent-red/10">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="px-3 py-3 flex flex-col gap-2 flex-1">
        <p className="text-slate-100 text-[12px] font-medium line-clamp-2 min-h-[32px] leading-tight">
          {product.name}
        </p>
        <div className="flex items-center justify-between gap-2 mt-auto">
          <span className="text-accent-green text-base font-bold font-display">
            {formatCurrency(product.price)}
          </span>
          <span className="text-[9px] px-2 py-1 rounded-full border border-white/15 text-slate-400 bg-white/5">
            {hasVariants ? `${displayStock} total` : `${product.stock} ${product.unit || 'pcs'}`}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ProductGrid({ onCartClick }) {
  const [products,       setProducts]       = useState([]);
  const [categories,     setCategories]     = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search,         setSearch]         = useState('');
  const [loading,        setLoading]        = useState(true);
  const [variantPopup,   setVariantPopup]   = useState(null); // product object

  const { addItem } = useCart();
  const { playSound } = useNotificationSound();

  useEffect(() => {
    (async () => {
      try {
        const [pRes, cRes] = await Promise.all([
          getProductsAPI({ limit: 100 }),
          getCategoriesAPI(),
        ]);
        setProducts(pRes.data.data);
        setCategories(cRes.data.data);
      } catch {
        toast.error('Products load nahi hue');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = products.filter(p => {
    const matchCat    = activeCategory === 'all' || p.category?._id === activeCategory;
    const matchSearch = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  // ── When card is clicked ───────────────────────────────────────────────────
  const handleProductClick = (product) => {
    if (product.hasVariants && product.variants?.filter(v => v.isActive !== false).length > 0) {
      setVariantPopup(product);   // open popup
    } else {
      addToCart(product, null);   // direct add
    }
  };

  // ── When variant is chosen from popup ─────────────────────────────────────
  const handleVariantSelect = (variant) => {
    addToCart(variantPopup, variant);
    setVariantPopup(null);
  };

  // ── Common add logic ───────────────────────────────────────────────────────
  const addToCart = (product, variant) => {
    if (variant) {
      addItem({
        _id:        `${product._id}__${variant._id}`,   // unique cart key
        _parentId:  product._id,
        variantId:  variant._id,
        name:       `${product.name} — ${variant.name}`,
        price:      variant.price,
        costPrice:  variant.costPrice || 0,
        stock:      variant.stock,
        sku:        variant.sku,
        image:      variant.image || product.image,
        category:   product.category,
        taxRate:    product.taxRate || 0,
        discount:   product.discount || 0,
        unit:       product.unit || 'pcs',
      });
      playSound();
      toast.success(`${product.name} — ${variant.name} added`, { duration: 1200 });
    } else {
      addItem({
        _id:        product._id,
        name:       product.name,
        price:      product.price,
        costPrice:  product.costPrice || 0,
        stock:      product.stock,
        sku:        product.sku,
        image:      product.image,
        category:   product.category,
        taxRate:    product.taxRate || 0,
        discount:   product.discount || 0,
        unit:       product.unit || 'pcs',
      });
      playSound();
      toast.success(`${product.name} added`, { duration: 1000 });
    }

    // open cart on mobile if handler provided
    if (onCartClick) onCartClick();
  };

  return (
    <div className="flex h-full overflow-hidden">

      {/* Variant Popup */}
      {variantPopup && (
        <VariantPopup
          product={variantPopup}
          onSelect={handleVariantSelect}
          onClose={() => setVariantPopup(null)}
        />
      )}

      {/* Category Sidebar */}
      <div className="hidden sm:flex w-[180px] flex-col border-r border-white/10 bg-slate-900 overflow-y-auto">
        <div className="p-3 space-y-1">
          <button onClick={() => setActiveCategory('all')}
            className={`flex items-center gap-2 px-2 py-2 rounded-lg text-xs w-full ${activeCategory === 'all' ? 'bg-accent-green/20 text-accent-green' : 'text-slate-400 hover:bg-white/5'}`}>
            <FaThLarge/>
            <span className="flex-1 text-left">All Products</span>
            <span className="text-[9px]">{products.length}</span>
          </button>
          {categories.map(cat => {
            const Icon  = CATEGORY_ICONS[cat.name] || FaBoxOpen;
            const count = products.filter(p => p.category?._id === cat._id).length;
            return (
              <button key={cat._id} onClick={() => setActiveCategory(cat._id)}
                className={`flex items-center gap-2 px-2 py-2 rounded-lg text-xs w-full ${activeCategory === cat._id ? 'bg-accent-green/20 text-accent-green' : 'text-slate-400 hover:bg-white/5'}`}>
                <Icon/>
                <span className="truncate flex-1 text-left">{cat.name}</span>
                <span className="text-[9px]">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: Search + Grid */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="p-3 border-b border-white/[0.06]">
          <div className="relative">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
              className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Product ya SKU dhundein..."
              className="input pl-9 w-full h-8 py-0 text-xs"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <div className="grid gap-5 sm:gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))' }}>
              {[...Array(12)].map((_, i) => (
                <div key={i} className="rounded-xl border border-white/5 overflow-hidden animate-pulse">
                  <div className="h-[140px] bg-slate-800"/>
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-slate-800 rounded w-3/4"/>
                    <div className="h-3 bg-slate-800 rounded w-1/2"/>
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-600">
              <FaBoxOpen className="text-3xl mb-2"/>
              <p className="text-xs">Koi product nahi mila</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))' }}>
              {filtered.map(product => (
                <ProductCard key={product._id} product={product} onAdd={handleProductClick}/>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}