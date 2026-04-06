import api from './axios';

const BASE = '/movements';

export const movementApi = {
  search: async (params = {}) => {
    const { data } = await api.get(BASE, { params });
    return data.data;
  },
  getById: async (id) => {
    const { data } = await api.get(`${BASE}/${id}`);
    return data.data;
  },
  getByProduct: async (productId) => {
    const { data } = await api.get(`${BASE}/product/${productId}`);
    return data.data;
  },
  register: async (payload) => {
    const { data } = await api.post(BASE, payload);
    return data.data;
  },
};
