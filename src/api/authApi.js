import api from './axios';

export async function loginApi(credentials) {
  const { data } = await api.post('/auth/login', credentials);
  return data.data; // { token, expiresIn }
}
