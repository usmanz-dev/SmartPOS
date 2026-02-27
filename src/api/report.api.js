import api from './axios';
export const getDashboardAPI = (params) => api.get('/reports/dashboard', { params });
export const getSalesReportAPI = (params) => api.get('/reports/sales', { params });
export const getLowStockReportAPI = (params) => api.get('/reports/low-stock', { params });
export const getBestSellersAPI = (params) => api.get('/reports/best-sellers', { params });
