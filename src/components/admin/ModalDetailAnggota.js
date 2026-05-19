import React, { useState, useEffect } from 'react';
import { adminAnggotaAPI } from '../../services/api';
import { toast } from 'react-toastify';
import '../../assets/styles/modal.css';

const ModalDetailAnggota = ({ anggota, onClose }) => {
  const [riwayat, setRiwayat] = useState([]);
  const [loadingRiwayat, setLoadingRiwayat] = useState(true);

  useEffect(() => {
    const fetchRiwayat = async () => {
      try {
        const res = await adminAnggotaAPI.getRiwayat(anggota.userId);
        setRiwayat(res.data.data || []);
      } catch {
        toast.error('Gagal memuat riwayat peminjaman');
      } finally {
        setLoadingRiwayat(false);
      }
    };
    fetchRiwayat();
  }, [anggota.userId]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box modal-box-lg" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2>Detail Anggota</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Info Utama */}
        <div className="detail-anggota-header">
          <div className="detail-avatar">
            {anggota.nama?.charAt(0).toUpperCase()}
          </div>
          <div className="detail-anggota-info">
            <h3>{anggota.nama}</h3>
            <span className="detail-no-anggota">{anggota.noAnggota}</span>
            <span className={`badge ${anggota.isActive ? 'badge-success' : 'badge-danger'}`}>
              {anggota.isActive ? 'Aktif' : 'Nonaktif'}
            </span>
          </div>
        </div>

        {/* Grid Info */}
        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-item-label">Email</span>
            <span className="detail-item-value">{anggota.email}</span>
          </div>
          <div className="detail-item">
            <span className="detail-item-label">No. Telepon</span>
            <span className="detail-item-value">{anggota.noTelepon || '-'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-item-label">Alamat</span>
            <span className="detail-item-value">{anggota.alamat || '-'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-item-label">Pinjaman Aktif</span>
            <span className="detail-item-value">
              <span className="badge badge-info">{anggota.totalPinjamanAktif || 0} buku</span>
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-item-label">Tanggal Daftar</span>
            <span className="detail-item-value">
              {anggota.createdAt
                ? new Date(anggota.createdAt).toLocaleDateString('id-ID', {
                    day: '2-digit', month: 'long', year: 'numeric',
                  })
                : '-'}
            </span>
          </div>
        </div>

        {/* Riwayat Peminjaman */}
        <div className="riwayat-section">
          <h4 className="riwayat-title">Riwayat Peminjaman</h4>
          {loadingRiwayat ? (
            <div className="loading-state" style={{ padding: '1.5rem' }}>Memuat riwayat...</div>
          ) : riwayat.length === 0 ? (
            <div className="empty-state" style={{ padding: '1.5rem' }}>
              Belum ada riwayat peminjaman
            </div>
          ) : (
            <ul className="riwayat-list">
              {riwayat.map((item, idx) => (
                <li key={idx} className="riwayat-item">
                  <span className="riwayat-icon">📖</span>
                  <span className="riwayat-text">{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="modal-actions" style={{ padding: '0 1.5rem 1.5rem' }}>
          <button className="btn-primary" onClick={onClose}>Tutup</button>
        </div>
      </div>
    </div>
  );
};

export default ModalDetailAnggota;