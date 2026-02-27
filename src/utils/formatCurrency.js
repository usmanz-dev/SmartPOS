export const formatCurrency = (amount, currency = 'PKR') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount || 0);

export const formatNumber = (n) => new Intl.NumberFormat('en-US').format(n || 0);

export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

export const formatDateTime = (date) =>
  new Date(date).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  STORE_ADMIN: 'store_admin',
  CASHIER: 'cashier',
  INVENTORY_MANAGER: 'inventory_manager',
};

export const ROLE_LABELS = {
  super_admin: 'Super Admin',
  store_admin: 'Store Admin',
  cashier: 'Cashier',
  inventory_manager: 'Inv. Manager',
};

export const ROLE_COLORS = {
  super_admin: 'purple',
  store_admin: 'blue',
  cashier: 'green',
  inventory_manager: 'amber',
};
