import api from './axios';

export const aiApi = {
  getOrderRecommendation: async (claudeApiKey, payload) => {
    const { data } = await api.post('/ai/order-recommendation', payload, {
      headers: { 'X-Claude-Api-Key': claudeApiKey },
    });
    return data.data;
  },
};
