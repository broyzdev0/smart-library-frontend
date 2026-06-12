import httpClient from '../../../services/httpClient';

export const adminAdminAPI = {
  getAll: (page = 0, size = 10) =>
    httpClient.get(`/admin?page=${page}&size=${size}`),

  getById: (userId) => httpClient.get(`/admin/${userId}`),

  tambahAdmin: (data) => {
    const formData = new FormData();
    formData.append('nama', data.nama);
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('noTelepon', data.noTelepon || '');
    formData.append('alamat', data.alamat || '');
    formData.append('noPegawai', data.noPegawai);
    formData.append('jabatan', data.jabatan || 'Staff Perpustakaan');

    return httpClient.post('/admin', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  update: (userId, data) => httpClient.put(`/admin/${userId}`, data),
  toggleStatus: (userId) => httpClient.put(`/admin/${userId}/toggle-status`),
  delete: (userId) => httpClient.delete(`/admin/${userId}`),
};
