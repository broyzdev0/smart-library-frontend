import httpClient from '../../../services/httpClient';

export const bookAPI = {
  getAll: (params = {}) => httpClient.get('/buku', { params }),
  getById: (bookId) => httpClient.get(`/buku/${bookId}`),
  create: (data) => httpClient.post('/buku', data),
  update: (bookId, data) => httpClient.put(`/buku/${bookId}`, data),
  delete: (bookId) => httpClient.delete(`/buku/${bookId}`),
};
