import { useState } from 'react';
import { useCart } from '../../hooks/useCart';
import { createOrderAPI } from '../../api/order.api';
import { formatCurrency } from '../../utils/formatCurrency';
import Modal from '../common/Modal';
import Invoice from './Invoice';
import toast from 'react-hot-toast';
import { BsCashCoin, BsScissors } from "react-icons/bs";
import { CiCreditCard1 } from "react-icons/ci";
import { FaMobileScreen } from "react-icons/fa6";

const PAYMENT_METHODS = [
  { id: 'cash', label: 'Cash', icon: <BsCashCoin size={18} /> },
  { id: 'card', label: 'Card', icon: <CiCreditCard1 size={18} /> },
  { id: 'online', label: 'Online', icon: <FaMobileScreen size={18} /> },
  { id: 'split', label: 'Split', icon: <BsScissors size={18} /> },
];

export default function PaymentModal({ isOpen, onClose }) {
  const { items, subtotal, tax, total, discount, note, paymentMethod, setPaymentMethod, clearCart } = useCart();
  const [amountPaid, setAmountPaid] = useState('');
  const [loading, setLoading] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  const change = Math.max(0, (parseFloat(amountPaid) || 0) - total);

  const handlePayment = async () => {
    if (paymentMethod === 'cash' && parseFloat(amountPaid) < total) {
      return toast.error('Amount paid is less than total');
    }
    setLoading(true);
    try {
      const { data } = await createOrderAPI({
        items: items.map(i => {
          if (i._parentId && i.variantId) {
            return { product: i._parentId, variant: i.variantId, quantity: i.quantity };
          }
          return { product: i._id, quantity: i.quantity };
        }),
        paymentMethod,
        amountPaid: paymentMethod === 'cash' ? parseFloat(amountPaid) : total,
        discountAmount: discount,
        note,
      });
      clearCart();
      setAmountPaid('');
      setCompletedOrder(data.data);
      toast.success('Order completed! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCompletedOrder(null);
    setAmountPaid('');
    onClose();
  };

  if (completedOrder) {
    return <Invoice order={completedOrder} onClose={handleClose} />;
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Process Payment" size="sm">
      <div className="space-y-5">
        {/* Total */}
        <div className="bg-bg-primary rounded-xl p-4 text-center border border-accent-green/20">
          <p className="text-slate-500 text-xs font-body uppercase tracking-widest mb-1">Amount Due</p>
          <p className="font-display font-black text-accent-green text-4xl text-glow">{formatCurrency(total)}</p>
          {discount > 0 && <p className="text-accent-green text-xs mt-1 font-body">Includes -{formatCurrency(discount)} discount</p>}
        </div>

        {/* Payment method */}
        <div>
          <label className="label">Payment Method</label>
          <div className="grid grid-cols-4 gap-2">
            {PAYMENT_METHODS.map(pm => (
              <button key={pm.id} onClick={() => setPaymentMethod(pm.id)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-body transition-all ${paymentMethod === pm.id ? 'border-accent-green/50 bg-accent-green/10 text-accent-green' : 'border-white/[0.07] bg-bg-card text-slate-400 hover:border-white/20'}`}>
                <span className="text-xl">{pm.icon}</span>
                {pm.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cash input */}
        {paymentMethod === 'cash' && (
          <div>
            <label className="label">Cash Received</label>
            <input type="number" value={amountPaid} onChange={e => setAmountPaid(e.target.value)}
              placeholder={`Min: ${formatCurrency(total)}`}
              className="input text-lg font-display font-bold h-12"
              min={total}
            />
            {parseFloat(amountPaid) >= total && (
              <div className="mt-2 flex items-center justify-between bg-accent-green/10 border border-accent-green/25 rounded-lg px-4 py-2">
                <span className="text-accent-green text-sm font-body">Change</span>
                <span className="font-display font-bold text-accent-green text-lg">{formatCurrency(change)}</span>
              </div>
            )}
          </div>
        )}

        {/* Order summary mini */}
        <div className="bg-bg-primary rounded-lg p-3 space-y-1 text-xs font-body text-slate-400">
          <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
          <div className="flex justify-between"><span>Tax</span><span>{formatCurrency(tax)}</span></div>
          {discount > 0 && <div className="flex justify-between text-accent-green"><span>Discount</span><span>-{formatCurrency(discount)}</span></div>}
          <div className="flex justify-between text-white font-bold text-sm pt-1 border-t border-white/[0.06] mt-1">
            <span>Total</span><span>{formatCurrency(total)}</span>
          </div>
        </div>

        <button onClick={handlePayment} disabled={loading || (paymentMethod === 'cash' && !amountPaid)}
          className="btn-primary w-full disabled:opacity-40 text-center h-12">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
              Processing...
            </span>
          ) : `Confirm Payment — ${formatCurrency(total)}`}
        </button>
      </div>
    </Modal>
  );
}
