import React, { useState } from 'react';
import { adminAdminAPI } from '../services/adminAPI';
import { toast } from 'react-toastify';
import '../../../assets/styles/modal.css';

const ModalTambahAdmin = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({
    nama: '',
    email: '',
    password: '',
    noTelepon: '',
    alamat: '',
    noPegawai: '',
    jabatan: 'Staff Perpustakaan'
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, role: 'ADMIN' };
      await adminAdminAPI.tambahAdmin(payload);
      toast.success(`Admin ${form.nama} berhasil ditambahkan`);
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menambahkan admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Tambah Administrator Baru</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Nama Lengkap <span className="required">*</span></label>
            <input 
              name="nama" 
              value={form.nama} 
              onChange={handleChange} 
              placeholder="Nama lengkap" 
              required 
            />
          </div>

          <div className="form-group">
            <label>Email <span className="required">*</span></label>
            <input 
              type="email" 
              name="email" 
              value={form.email} 
              onChange={handleChange} 
              placeholder="email@contoh.com" 
              required 
            />
          </div>

          <div className="form-group">
            <label>Password <span className="required">*</span></label>
            <input 
              type="password" 
              name="password" 
              value={form.password} 
              onChange={handleChange} 
              placeholder="Minimal 6 karakter" 
              required 
              minLength={6} 
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>No. Telepon</label>
              <input 
                name="noTelepon" 
                value={form.noTelepon} 
                onChange={handleChange} 
                placeholder="08xxxxxxxxxx" 
              />
            </div>
            <div className="form-group">
              <label>No. Pegawai <span className="required">*</span></label>
              <input 
                name="noPegawai" 
                value={form.noPegawai} 
                onChange={handleChange} 
                placeholder="PEG-XXX" 
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Jabatan</label>
            <input 
              name="jabatan" 
              value={form.jabatan} 
              onChange={handleChange} 
              placeholder="Contoh: Kepala Perpustakaan" 
            />
          </div>

          <div className="form-group">
            <label>Alamat</label>
            <textarea 
              name="alamat" 
              value={form.alamat} 
              onChange={handleChange} 
              placeholder="Alamat lengkap" 
              rows={2} 
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-outline" onClick={onClose}>Batal</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalTambahAdmin;
