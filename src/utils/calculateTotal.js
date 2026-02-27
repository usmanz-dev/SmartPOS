export const calculateItemTotal = (price, quantity, taxRate = 0, discount = 0) => {
  const subtotal = price * quantity;
  const tax = subtotal * (taxRate / 100);
  return { subtotal, tax, total: subtotal + tax - discount };
};

export const calculateCartTotals = (items, discountAmount = 0) => {
  let subtotal = 0, tax = 0;
  items.forEach(item => {
    subtotal += item.price * item.quantity;
    tax += item.price * item.quantity * ((item.taxRate || 0) / 100);
  });
  return {
    subtotal: +subtotal.toFixed(2),
    tax: +tax.toFixed(2),
    discount: +discountAmount.toFixed(2),
    total: +(subtotal + tax - discountAmount).toFixed(2),
  };
};
