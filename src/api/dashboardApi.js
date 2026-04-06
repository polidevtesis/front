import api from './axios';

const BASE = '/dashboard';

export const dashboardApi = {
  getSummary: async (params = {}) => {
    const { data } = await api.get(`${BASE}/summary`, { params });
    return data.data;
  },
  getLowStock: async () => {
    const { data } = await api.get(`${BASE}/low-stock`);
    return data.data;
  },
  getSalesByCategory: async (params = {}) => {
    const { data } = await api.get(`${BASE}/sales-by-category`, { params });
    return data.data;
  },
  getTopProducts: async (params = {}) => {
    const { data } = await api.get(`${BASE}/top-products`, { params });
    return data.data;
  },
  getStockHistory: async (productId) => {
    const { data } = await api.get(`${BASE}/stock-history/${productId}`);
    return data.data;
  },
};
