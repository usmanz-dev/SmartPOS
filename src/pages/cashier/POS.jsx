import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ProductGrid from '../../components/pos/ProductGrid';
import Cart from '../../components/pos/Cart';

export default function POS() {
  const [showCartMobile, setShowCartMobile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // open drawer when ?cart=1 appears in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('cart') === '1') {
      setShowCartMobile(true);
    }
  }, [location.search]);

  return (
    <div className="flex h-full overflow-hidden animate-fade-in">
      {/* Product Grid - Full width on mobile, flex-1 on desktop */}
      <div className="flex-1 overflow-hidden">
        <ProductGrid onCartClick={() => setShowCartMobile(true)} />
      </div>

      {/* Cart - Hidden on mobile, visible on tablet+ */}
      <div className="hidden lg:flex flex-col">
        <Cart />
      </div>

      {/* Cart Modal for Mobile */}
      {showCartMobile && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => {
              setShowCartMobile(false);
              const params = new URLSearchParams(location.search);
              params.delete('cart');
              navigate({ search: params.toString() }, { replace: true });
            }}
          />
          {/* Drawer */}
          <div className="fixed bottom-0 left-0 right-0 top-[60px] bg-bg-sidebar border-t border-white/[0.05] z-50 lg:hidden flex flex-col rounded-t-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] flex-shrink-0">
              <h3 className="font-display font-bold text-white tracking-wide">Order Summary</h3>
              <button
                onClick={() => {
                  setShowCartMobile(false);
                  const params = new URLSearchParams(location.search);
                  params.delete('cart');
                  navigate({ search: params.toString() }, { replace: true });
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <Cart />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
