import api from './axios';

const BASE = '/products';

export const productApi = {
  search: async (params = {}) => {
    const { data } = await api.get(BASE, { params });
    return data.data; // Spring Page
  },
  getById: async (id) => {
    const { data } = await api.get(`${BASE}/${id}`);
    return data.data;
  },
  create: async (payload) => {
    const { data } = await api.post(BASE, payload);
    return data.data;
  },
  update: async (id, payload) => {
    const { data } = await api.put(`${BASE}/${id}`, payload);
    return data.data;
  },
  remove: async (id) => {
    await api.delete(`${BASE}/${id}`);
  },
};
