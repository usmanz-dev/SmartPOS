import { useState } from 'react';
import { useCart } from '../../hooks/useCart';
import { formatCurrency } from '../../utils/formatCurrency';
import PaymentModal from './PaymentModal';

export default function Cart() {
  const { items, subtotal, tax, total, discount, note, paymentMethod, removeItem, updateQty, setDiscount, setNote, clearCart } = useCart();
  const [showPayment, setShowPayment] = useState(false);
  const [discountInput, setDiscountInput] = useState('');

  const applyDiscount = () => {
    const val = parseFloat(discountInput) || 0;
    setDiscount(Math.min(val, subtotal));
    setDiscountInput('');
  };

  return (
    <>
      <div className="flex flex-col h-full bg-bg-sidebar border-l border-white/[0.05]" style={{ width: '100%', minWidth: '100%' }}>
        {/* Header */}
        <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-white/[0.06] flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="font-display font-bold text-white tracking-wide text-sm sm:text-base">Order Summary</h3>
            <p className="text-slate-600 text-[9px] sm:text-[10px] font-body">{items.length} item{items.length !== 1 ? 's' : ''}</p>
          </div>
          {items.length > 0 && (
            <button onClick={clearCart} className="text-xs text-accent-red/70 hover:text-accent-red font-body transition-colors">
              Clear All
            </button>
          )}
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-2 sm:px-3 py-2 space-y-2">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-slate-700">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-10 h-10 mb-2">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
              </svg>
              <p className="text-xs font-body">Cart is empty</p>
            </div>
          ) : items.map(item => (
            <div key={item._id} className="bg-bg-card rounded-lg sm:rounded-xl p-2 sm:p-3 border border-white/[0.05]">
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-slate-200 text-[10px] sm:text-xs font-body line-clamp-2 flex-1">{item.name}</p>
                <button onClick={() => removeItem(item._id)} className="text-slate-600 hover:text-accent-red transition-colors flex-shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 sm:w-3.5 sm:h-3.5">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button onClick={() => updateQty(item._id, item.quantity - 1)}
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-bg-elevated border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-white/20 transition-all">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-2.5 h-2.5 sm:w-3 sm:h-3"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </button>
                  <span className="font-display font-bold text-white text-sm w-5 text-center">{item.quantity}</span>
                  <button onClick={() => updateQty(item._id, item.quantity + 1)}
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-bg-elevated border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-white/20 transition-all">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-2.5 h-2.5 sm:w-3 sm:h-3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </button>
                </div>
                <p className="font-display font-bold text-accent-green text-xs sm:text-sm">{formatCurrency(item.price * item.quantity)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer totals */}
        <div className="border-t border-white/[0.06] p-2 sm:p-4 space-y-2 sm:space-y-3 flex-shrink-0">
          {/* Discount */}
          <div className="flex gap-2">
            <input value={discountInput} onChange={e => setDiscountInput(e.target.value)}
              placeholder="Discount ($)"
              className="input text-xs h-8 flex-1 py-0"
              type="number" min="0"
            />
            <button onClick={applyDiscount} className="btn-secondary btn-sm text-xs px-2 sm:px-3 h-8">Apply</button>
          </div>

          {/* Note */}
          <input value={note} onChange={e => setNote(e.target.value)}
            placeholder="Order note..."
            className="input text-xs h-8 py-0 w-full"
          />

          {/* Totals */}
          <div className="space-y-1 sm:space-y-1.5 pt-1 text-xs sm:text-sm">
            <div className="flex justify-between font-body text-slate-400">
              <span>Subtotal</span><span className="text-slate-200">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between font-body text-slate-400">
              <span>Tax</span><span className="text-slate-200">{formatCurrency(tax)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between font-body text-accent-green">
                <span>Discount</span><span>-{formatCurrency(discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-display font-bold text-white text-base sm:text-lg pt-1 sm:pt-2 border-t border-white/[0.06]">
              <span>Total</span>
              <span className="text-accent-green">{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Pay button */}
          <button
            onClick={() => setShowPayment(true)}
            disabled={items.length === 0}
            className="btn-primary w-full text-center disabled:opacity-40 text-xs sm:text-sm h-9 sm:h-10">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
            Pay Now
          </button>
        </div>
      </div>

      <PaymentModal isOpen={showPayment} onClose={() => setShowPayment(false)} />
    </>
  );
}
