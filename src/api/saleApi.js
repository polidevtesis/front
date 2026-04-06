import api from './axios';

const BASE = '/sales';

export const saleApi = {
  getAll: async (params = {}) => {
    const { data } = await api.get(BASE, { params });
    return data.data;
  },
  getById: async (id) => {
    const { data } = await api.get(`${BASE}/${id}`);
    return data.data;
  },
  create: async (payload) => {
    const { data } = await api.post(BASE, payload);
    return data.data;
  },
  cancel: async (id) => {
    await api.delete(`${BASE}/${id}`);
  },
};
