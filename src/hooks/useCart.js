import { createSlice } from '@reduxjs/toolkit';
import { useSelector, useDispatch } from 'react-redux';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    discount: 0,
    note: '',
    paymentMethod: 'cash',
  },
  reducers: {
    addItem: (state, { payload: product }) => {
      const existing = state.items.find(i => i._id === product._id);
      if (existing) { existing.quantity += 1; }
      else { state.items.push({ ...product, quantity: 1 }); }
    },
    removeItem: (state, { payload: id }) => {
      state.items = state.items.filter(i => i._id !== id);
    },
    updateQty: (state, { payload: { id, qty } }) => {
      if (qty < 1) { state.items = state.items.filter(i => i._id !== id); return; }
      const item = state.items.find(i => i._id === id);
      if (item) item.quantity = qty;
    },
    clearCart: (state) => { state.items = []; state.discount = 0; state.note = ''; },
    setDiscount: (state, { payload }) => { state.discount = payload; },
    setNote: (state, { payload }) => { state.note = payload; },
    setPaymentMethod: (state, { payload }) => { state.paymentMethod = payload; },
  },
});

export const { addItem, removeItem, updateQty, clearCart, setDiscount, setNote, setPaymentMethod } = cartSlice.actions;
export default cartSlice.reducer;

// Custom hook
export const useCart = () => {
  const dispatch = useDispatch();
  const cart = useSelector(s => s.cart);

  const subtotal = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const tax = cart.items.reduce((s, i) => s + (i.price * i.quantity * (i.taxRate || 0) / 100), 0);
  const total = subtotal + tax - cart.discount;
  const itemCount = cart.items.reduce((s, i) => s + i.quantity, 0);

  return {
    ...cart,
    subtotal, tax, total, itemCount,
    addItem: (p) => dispatch(addItem(p)),
    removeItem: (id) => dispatch(removeItem(id)),
    updateQty: (id, qty) => dispatch(updateQty({ id, qty })),
    clearCart: () => dispatch(clearCart()),
    setDiscount: (d) => dispatch(setDiscount(d)),
    setNote: (n) => dispatch(setNote(n)),
    setPaymentMethod: (pm) => dispatch(setPaymentMethod(pm)),
  };
};
