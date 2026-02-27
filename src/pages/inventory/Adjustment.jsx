import { useEffect, useState } from 'react';
import { getProductsAPI, adjustStockAPI } from '../../api/product.api';
import { formatCurrency } from '../../utils/formatCurrency';
import { useAuth } from '../../hooks/useAuth';
import Loader, { SkeletonRow } from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

export default function Adjustment() {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustType, setAdjustType] = useState('add'); // 'add' or 'subtract'
  const [quantity, setQuantity] = useState('');
  const [adjusting, setAdjusting] = useState(false);
  const { hasRole } = useAuth();

  const load = async () => {
    setLoading(true);
    try {
      const res = await getProductsAPI({ page, limit: 15, search });
      setProducts(res.data.data);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, search]);

  const handleAdjustClick = (product) => {
    setSelectedProduct(product);
    setAdjustType('add');
    setQuantity('');
    setModalOpen(true);
  };

  const handleAdjustment = async () => {
    if (!quantity || parseInt(quantity) <= 0) {
      return toast.error('Please enter a valid quantity');
    }

    setAdjusting(true);
    try {
      await adjustStockAPI(selectedProduct._id, {
        quantity: parseInt(quantity),
        type: adjustType === 'add' ? 'add' : 'subtract'
      });
      
      toast.success(
        `${adjustType === 'add' ? 'Added' : 'Removed'} ${quantity} units of ${selectedProduct.name}`
      );
      
      setModalOpen(false);
      setQuantity('');
      setSelectedProduct(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Adjustment failed');
    } finally {
      setAdjusting(false);
    }
  };

  if (!hasRole('inventory_manager')) {
    return (
      <div className="page-wrap animate-fade-in text-center py-12">
        <p className="text-slate-400">You don't have access to inventory adjustments. Contact your manager.</p>
      </div>
    );
  }

  return (
    <div className="page-wrap animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Stock Adjustment</h1>
          <p className="page-subtitle">Add or remove inventory from products</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="🔍 Search products..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="input w-full"
        />
      </div>

      {/* Products Table */}
      <div className="bg-gradient-to-br from-bg-card to-bg-primary rounded-2xl border border-white/[0.05] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.05] bg-bg-secondary/50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Product</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">SKU</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-300">Stock</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">Price</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-300">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(10)
                  .fill(null)
                  .map((_, i) => <SkeletonRow key={i} cols={5} />)
              ) : products.length > 0 ? (
                products.map((product) => (
                  <tr
                    key={product._id}
                    className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image || '/placeholder.png'}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover bg-bg-secondary"
                        />
                        <div>
                          <p className="font-medium text-white">{product.name}</p>
                          <p className="text-xs text-slate-500">{product.category?.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">{product.sku || 'N/A'}</td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          product.stock <= 10
                            ? 'bg-red-500/20 text-red-400'
                            : product.stock <= 20
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-accent-green/20 text-accent-green'
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-slate-300">
                      {formatCurrency(product.sellPrice || 0)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleAdjustClick(product)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-accent-green/10 border border-accent-green/30 hover:border-accent-green/60 rounded-lg text-accent-green font-medium transition-all text-sm"
                      >
                        ⚙️ Adjust
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-4 py-2 rounded-lg transition-all ${
                page === p
                  ? 'bg-accent-green text-white'
                  : 'bg-bg-card border border-white/[0.1] text-slate-400 hover:border-white/20'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Adjustment Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Adjust Stock" size="sm">
        {selectedProduct && (
          <div className="space-y-5">
            {/* Product Info */}
            <div className="bg-bg-secondary rounded-xl p-4 flex items-center gap-3">
              <img
                src={selectedProduct.image || '/placeholder.png'}
                alt={selectedProduct.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div>
                <p className="font-semibold text-white">{selectedProduct.name}</p>
                <p className="text-sm text-slate-500">Current Stock: {selectedProduct.stock}</p>
              </div>
            </div>

            {/* Adjustment Type */}
            <div>
              <label className="label">Adjustment Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setAdjustType('add')}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-semibold transition-all ${
                    adjustType === 'add'
                      ? 'border-accent-green/50 bg-accent-green/10 text-accent-green'
                      : 'border-white/[0.1] bg-bg-card text-slate-400 hover:border-white/20'
                  }`}
                >
                  <span className="text-xl">➕</span> Add
                </button>
                <button
                  onClick={() => setAdjustType('subtract')}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-semibold transition-all ${
                    adjustType === 'subtract'
                      ? 'border-red-500/50 bg-red-500/10 text-red-400'
                      : 'border-white/[0.1] bg-bg-card text-slate-400 hover:border-white/20'
                  }`}
                >
                  <span className="text-xl">➖</span> Remove
                </button>
              </div>
            </div>

            {/* Quantity Input */}
            <div>
              <label className="label">Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity..."
                min="1"
                className="input text-center text-lg"
                autoFocus
              />
            </div>

            {/* Preview */}
            {quantity && (
              <div className="bg-bg-secondary rounded-xl p-4 text-center space-y-2">
                <p className="text-slate-400 text-sm">After adjustment:</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl font-bold text-white">{selectedProduct.stock}</span>
                  <span className={`text-lg font-semibold ${adjustType === 'add' ? 'text-accent-green' : 'text-red-400'}`}>
                    {adjustType === 'add' ? '+' : '-'} {quantity}
                  </span>
                  <span className="text-xl">=</span>
                  <span className={`text-2xl font-bold ${
                    (adjustType === 'add'
                      ? selectedProduct.stock + parseInt(quantity)
                      : selectedProduct.stock - parseInt(quantity)) <= 10
                      ? 'text-red-400'
                      : 'text-accent-green'
                  }`}>
                    {adjustType === 'add'
                      ? selectedProduct.stock + parseInt(quantity)
                      : selectedProduct.stock - parseInt(quantity)}
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setModalOpen(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleAdjustment}
                disabled={adjusting || !quantity}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                {adjusting ? 'Adjusting...' : 'Confirm'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
