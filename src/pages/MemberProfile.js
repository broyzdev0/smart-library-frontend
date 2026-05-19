// src/pages/MemberProfile.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { anggotaAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import '../assets/styles/member.css';

const MemberProfile = () => {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ nama: '', noTelepon: '', alamat: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const fetchProfile = async () => {
    try {
      const res = await anggotaAPI.getProfile();
      const data = res.data.data;
      setProfile(data);
      setForm({ nama: data.nama, noTelepon: data.noTelepon || '', alamat: data.alamat || '' });
    } catch {
      toast.error('Gagal memuat profil');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await anggotaAPI.updateProfile(form);
      toast.success('Profil berhasil diperbarui');
      setEditMode(false);
      fetchProfile();
    } catch {
      toast.error('Gagal memperbarui profil');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) return <div className="loading-page">Memuat profil...</div>;

  return (
    <div className="member-layout">
      {/* Navbar */}
      <nav className="member-nav">
        <div className="nav-logo">📚 Smart Library</div>
        <div className="nav-user">
          <span>Halo, {user?.nama}</span>
          <button className="btn-logout-sm" onClick={handleLogout}>Keluar</button>
        </div>
      </nav>

      <div className="member-content">
        <div className="profile-card">
          {/* Avatar */}
          <div className="profile-avatar">
            {profile?.nama?.charAt(0).toUpperCase()}
          </div>

          {/* Info Utama */}
          <div className="profile-info-header">
            <h2>{profile?.nama}</h2>
            <span className="badge badge-info">{profile?.noAnggota}</span>
            <span className={`badge ${profile?.active ? 'badge-success' : 'badge-danger'}`}>
              {profile?.active ? 'Aktif' : 'Tidak Aktif'}
            </span>
          </div>

          {/* Stats Pinjaman */}
          <div className="borrow-stats">
            <div className="borrow-bar-label">
              <span>Buku Dipinjam</span>
              <span>{profile?.jumlahPinjaman} / {profile?.maxPinjam}</span>
            </div>
            <div className="borrow-bar">
              <div
                className="borrow-bar-fill"
                style={{ width: `${(profile?.jumlahPinjaman / profile?.maxPinjam) * 100}%` }}
              />
            </div>
          </div>

          {/* Form Detail */}
          {editMode ? (
            <form onSubmit={handleSave} className="profile-form">
              <div className="form-group">
                <label>Nama Lengkap</label>
                <input
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  placeholder="Nama lengkap"
                />
              </div>
              <div className="form-group">
                <label>No. Telepon</label>
                <input
                  value={form.noTelepon}
                  onChange={(e) => setForm({ ...form, noTelepon: e.target.value })}
                  placeholder="08xxxxxxxxxx"
                />
              </div>
              <div className="form-group">
                <label>Alamat</label>
                <textarea
                  value={form.alamat}
                  onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                  rows={3}
                  placeholder="Alamat lengkap"
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-outline" onClick={() => setEditMode(false)}>Batal</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-details">
              <div className="detail-row">
                <span className="detail-label">Email</span>
                <span className="detail-value">{profile?.email}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">No. Telepon</span>
                <span className="detail-value">{profile?.noTelepon || '-'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Alamat</span>
                <span className="detail-value">{profile?.alamat || '-'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Tanggal Daftar</span>
                <span className="detail-value">{profile?.tanggalDaftar || '-'}</span>
              </div>
              <button className="btn-primary btn-edit-profile" onClick={() => setEditMode(true)}>
                Edit Profil
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberProfile;
