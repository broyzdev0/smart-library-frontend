import httpClient from '../../../services/httpClient';

export const authAPI = {
  login: (data) => httpClient.post('/auth/login', data),
  register: (data) => httpClient.post('/auth/register', data),
  getCurrentUser: () => httpClient.get('/auth/me'),
  logout: () => httpClient.post('/auth/logout'),
};
