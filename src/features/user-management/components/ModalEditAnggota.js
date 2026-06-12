import React, { useState } from 'react';
import { adminAnggotaAPI } from '../services/memberAPI';
import { toast } from 'react-toastify';
import '../../../assets/styles/modal.css';

const ModalEditAnggota = ({ anggota, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    nama: anggota.nama || '',
    noTelepon: anggota.noTelepon || '',
    alamat: anggota.alamat || '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminAnggotaAPI.update(anggota.userId, form);
      toast.success('Data anggota berhasil diperbarui');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Anggota</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-info">
          <span>No. Anggota: <strong>{anggota.noAnggota}</strong></span>
          <span>Email: <strong>{anggota.email}</strong></span>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Nama Lengkap</label>
            <input
              name="nama"
              value={form.nama}
              onChange={handleChange}
              placeholder="Nama lengkap"
            />
          </div>
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
            <label>Alamat</label>
            <textarea
              name="alamat"
              value={form.alamat}
              onChange={handleChange}
              rows={2}
              placeholder="Alamat lengkap"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-outline" onClick={onClose}>Batal</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalEditAnggota;
