import httpClient from '../../../services/httpClient';

export const anggotaAPI = {
  getProfile: (userId) => httpClient.get(userId ? `/anggota/${userId}` : '/anggota/profile'),
  updateProfile: (userIdOrData, maybeData) => {
    if (maybeData) return httpClient.put(`/anggota/${userIdOrData}`, maybeData);
    return httpClient.put('/anggota/profile', userIdOrData);
  },
  lihatRiwayat: (userId) => httpClient.get(`/anggota/${userId}/riwayat`),
};

export const adminAnggotaAPI = {
  getAll: (page = 0, size = 10, sortBy = 'nama') =>
    httpClient.get(`/anggota?page=${page}&size=${size}&sortBy=${sortBy}`),

  search: (keyword, page = 0, size = 10) =>
    httpClient.get(`/anggota/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`),

  getStats: () => httpClient.get('/anggota/stats'),
  getById: (userId) => httpClient.get(`/anggota/${userId}`),
  getByNoAnggota: (noAnggota) => httpClient.get(`/anggota/no/${noAnggota}`),

  tambah: (data) => httpClient.post('/anggota', {
    nama: data.nama,
    email: data.email,
    password: data.password,
    noTelepon: data.noTelepon || '',
    alamat: data.alamat || '',
    noAnggota: data.noAnggota || '',
  }),

  update: (userId, data) => httpClient.put(`/anggota/${userId}`, data),
  getRiwayat: (userId) => httpClient.get(`/anggota/${userId}/riwayat`),
  toggleStatus: (userId) => httpClient.put(`/anggota/${userId}/toggle-status`),
  delete: (userId) => httpClient.delete(`/anggota/${userId}`),
};
