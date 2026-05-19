// src/services/api.js
// Konfigurasi Axios untuk komunikasi dengan backend Spring Boot

import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Otomatis tambahkan token JWT ke setiap request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token expired (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==========================================
// AUTH API  →  /api/auth
// ==========================================
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getCurrentUser: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// ==========================================
// ANGGOTA API — self-service (member sendiri)
// Endpoint: /api/anggota
// ==========================================
export const anggotaAPI = {
  getProfile: (userId) => api.get(`/anggota/${userId}`),
  updateProfile: (userId, data) => api.put(`/anggota/${userId}`, data),
  lihatRiwayat: (userId) => api.get(`/anggota/${userId}/riwayat`),
};

// ==========================================
// ADMIN API — Manajemen Anggota
// Endpoint: /api/anggota  (role ADMIN)
// ==========================================
export const adminAnggotaAPI = {
  getAll: (page = 0, size = 10, sortBy = 'nama') =>
    api.get(`/anggota?page=${page}&size=${size}&sortBy=${sortBy}`),
    
  search: (keyword, page = 0, size = 10) =>
    api.get(`/anggota/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`),
    
  getStats: () => api.get('/anggota/stats'),
  
  getById: (userId) => api.get(`/anggota/${userId}`),
  
  getByNoAnggota: (noAnggota) => api.get(`/anggota/no/${noAnggota}`),
  
  // ─── KUNCI PERBAIKAN: Kembalikan ke JSON murni biasa ───
  tambah: (data) => {
    return api.post('/anggota', {
      nama: data.nama,
      email: data.email,
      password: data.password,
      noTelepon: data.noTelepon || '',
      alamat: data.alamat || '',
      noAnggota: data.noAnggota || ''
    });
  },
  
  update: (userId, data) => api.put(`/anggota/${userId}`, data),
  toggleStatus: (userId) => api.put(`/anggota/${userId}/toggle-status`),
  getRiwayat: (userId) => api.get(`/anggota/${userId}/riwayat`),
};

// ==========================================
// ADMIN API — Manajemen Admin
// ==========================================
export const adminAPI = {
  getAll: (page = 0, size = 10) =>
    api.get(`/admin?page=${page}&size=${size}`),
  getById: (userId) => api.get(`/admin/${userId}`),
  
  // PERBAIKAN TOTAL: Kirim menggunakan FormData agar dibaca oleh @ModelAttribute di backend
  tambahAdmin: (data) => {
    const formData = new FormData();
    formData.append('nama', data.nama);
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('noTelepon', data.noTelepon || '');
    formData.append('alamat', data.alamat || '');
    formData.append('noPegawai', data.noPegawai);
    formData.append('jabatan', data.jabatan || 'Staff Perpustakaan');

    return api.post('/admin', formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Memberitahu backend bahwa ini Form Data
      },
    });
  },
  
  update: (userId, data) => api.put(`/admin/${userId}`, data),
};

export default api;