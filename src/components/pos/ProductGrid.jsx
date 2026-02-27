import { useState, useEffect } from 'react';
import { getProductsAPI, getCategoriesAPI } from '../../api/product.api';
import { useCart } from '../../hooks/useCart';
import { useNotificationSound } from '../../hooks/useNotificationSound';
import { formatCurrency } from '../../utils/formatCurrency';
import toast from 'react-hot-toast';

import {
  FaBoxOpen,
  FaTshirt,
  FaAppleAlt,
  FaCouch,
  FaDumbbell,
  FaBook,
  FaSpa,
  FaCar,
  FaThLarge
} from 'react-icons/fa';

const CATEGORY_ICONS = {
  'Electronics': FaBoxOpen,
  'Clothing': FaTshirt,
  'Food & Beverages': FaAppleAlt,
  'Home & Garden': FaCouch,
  'Sports & Fitness': FaDumbbell,
  'Books & Media': FaBook,
  'Beauty & Health': FaSpa,
  'Automotive': FaCar,
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

const DEFAULT_IMG =
  'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&h=400&fit=crop';

function ProductCard({ product, onAdd }) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const Icon = CATEGORY_ICONS[product.category?.name] || FaBoxOpen;

  const imgSrc =
    !imgError && product.image
      ? product.image
      : CATEGORY_FALLBACK[product.category?.name] || DEFAULT_IMG;

  return (
    <div
      onClick={() => onAdd(product)}
      className="group relative flex flex-col overflow-hidden cursor-pointer transition-all duration-200 rounded-xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-800 hover:scale-[1.02]"
    >
      {/* Image */}
      <div className="relative h-[85px] overflow-hidden">
        {!imgLoaded && <div className="absolute inset-0 animate-pulse bg-slate-700" />}
        <img
          src={imgSrc}
          alt={product.name}
          onLoad={() => setImgLoaded(true)}
          onError={() => {
            setImgError(true);
            setImgLoaded(true);
          }}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* Category Icon */}
        <div className="absolute top-2 left-2 bg-black/40 backdrop-blur-md p-1.5 rounded-full border border-white/20">
          <Icon className="text-xs text-white" />
        </div>
      </div>

      {/* Info */}
      <div className="px-2 py-2 flex flex-col gap-1">
        <p className="text-slate-200 text-[11px] font-medium line-clamp-2 min-h-[28px]">
          {product.name}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-accent-green text-sm font-bold">
            {formatCurrency(product.price)}
          </span>

          <span className="text-[9px] px-1.5 py-0.5 rounded border border-white/10 text-slate-400">
            {product.stock} pcs
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ProductGrid({ onCartClick }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const { addItem, items } = useCart();
  const { playSound } = useNotificationSound();

  useEffect(() => {
    const load = async () => {
      try {
        const [pRes, cRes] = await Promise.all([
          getProductsAPI({ limit: 100 }),
          getCategoriesAPI(),
        ]);
        setProducts(pRes.data.data);
        setCategories(cRes.data.data);
      } catch {
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = products.filter((p) => {
    const matchCat =
      activeCategory === 'all' || p.category?._id === activeCategory;
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleAdd = (product) => {
    addItem(product);
    playSound();
    toast.success(`${product.name} added`, { duration: 1000 });
  };

  return (
    <div className="flex h-full overflow-hidden">

      {/* Sidebar */}
      <div className="hidden sm:flex w-[180px] flex-col border-r border-white/10 bg-slate-900 overflow-y-auto">
        <div className="p-3 space-y-1">
          <button
            onClick={() => setActiveCategory('all')}
            className={`flex items-center gap-2 px-2 py-2 rounded-lg text-xs w-full ${
              activeCategory === 'all'
                ? 'bg-accent-green/20 text-accent-green'
                : 'text-slate-400 hover:bg-white/5'
            }`}
          >
            <FaThLarge />
            <span className="flex-1 text-left">All Products</span>
            <span className="text-[9px]">{products.length}</span>
          </button>

          {categories.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.name] || FaBoxOpen;
            const count = products.filter(
              (p) => p.category?._id === cat._id
            ).length;

            return (
              <button
                key={cat._id}
                onClick={() => setActiveCategory(cat._id)}
                className={`flex items-center gap-2 px-2 py-2 rounded-lg text-xs w-full ${
                  activeCategory === cat._id
                    ? 'bg-accent-green/20 text-accent-green'
                    : 'text-slate-400 hover:bg-white/5'
                }`}
              >
                <Icon />
                <span className="truncate flex-1 text-left">
                  {cat.name}
                </span>
                <span className="text-[9px]">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-3">
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))' }}
        >
          {filtered.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onAdd={handleAdd}
            />
          ))}
        </div>
      </div>
    </div>
  );
}