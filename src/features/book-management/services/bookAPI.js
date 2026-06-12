import httpClient from '../../../services/httpClient';

export const bookAPI = {
  getAll: () => httpClient.get('/books'),
  getById: (bookId) => httpClient.get(`/books/${bookId}`),
  create: (data) => httpClient.post('/books', data),
  update: (bookId, data) => httpClient.put(`/books/${bookId}`, data),
  delete: (bookId) => httpClient.delete(`/books/${bookId}`),
  search: (keyword) => httpClient.get('/books/search', { params: { keyword } }),
  searchByTitle: (keyword) => httpClient.get('/books/search/title', { params: { keyword } }),
  searchByAuthor: (keyword) => httpClient.get('/books/search/author', { params: { keyword } }),
  searchByIsbn: (keyword) => httpClient.get('/books/search/isbn', { params: { keyword } }),
};
