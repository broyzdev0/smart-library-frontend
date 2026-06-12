// src/features/auth/context/AuthContext.js
// Global state untuk autentikasi pengguna

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/authAPI';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cek jika sudah login sebelumnya
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData)); // Sekarang ini akan berisi objek user murni
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await authAPI.login({ email, password });
    
    // 1. Ambil properti 'data' dari response.data (sesuai struktur bawaan kodemu)
    const payload = response.data.data || response.data;

    // 2. Cek apakah di dalam payload tersebut ada objek 'user'
    if (payload && payload.user) {
      // Simpan token token utuh
      localStorage.setItem('token', payload.token);
      
      // MURNI Hanya simpan objek profil user-nya saja ke localStorage & state
      localStorage.setItem('user', JSON.stringify(payload.user));
      setUser(payload.user); 
      
      // 3. Kembalikan objek payload utuh agar LoginPage bisa membaca payload.user
      return payload; 
    }
    
    // Fallback jika strukturnya langsung datar tanpa bersarang di .data
    return payload;
  };
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const isAdmin = () => user?.role === 'ADMIN';
  const isAnggota = () => user?.role === 'ANGGOTA';

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, isAnggota, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth harus digunakan di dalam AuthProvider');
  return context;
};
