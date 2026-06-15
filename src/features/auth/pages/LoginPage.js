// src/features/auth/pages/LoginPage.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import '../../../assets/styles/auth.css';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      
      // PERBAIKAN: Akses properti lewat data.user
      if (data && data.user) {
        toast.success(`Selamat datang, ${data.user.nama}!`);
        
        // Redirect berdasarkan role yang ada di dalam data.user
        if (data.user.role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else if (data.user.role === 'ANGGOTA') {
          navigate('/member/profile');
        } else {
          navigate('/member/profile'); // Fallback aman
        }
      } else {
        toast.error('Struktur data respon tidak sesuai.');
      }

    } catch (err) {
      toast.error(err.response?.data?.message || 'Login gagal. Periksa email dan password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">📚</div>
          <h1>Smart Library</h1>
          <p>Masuk ke akun anda</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="email@contoh.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Masukkan password"
              required
            />
          </div>

          <button type="submit" className="btn-primary btn-full" disabled={loading}>
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

      
      </div>
    </div>
  );
};

export default LoginPage;
