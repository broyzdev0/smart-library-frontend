import React, { useState, useEffect } from 'react';
import { adminAnggotaAPI } from '../services/memberAPI';
import { toast } from 'react-toastify';
import '../../../assets/styles/modal.css';

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
    if (anggota?.userId) {
      fetchRiwayat();
    }
  }, [anggota.userId]);

  if (!anggota) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-box" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '500px', borderRadius: '16px', overflow: 'hidden', padding: 0 }}
      >
        {/* Header Modal */}
        <div className="modal-header" style={{ padding: '1.25rem 1.5rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', margin: 0 }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#1e293b' }}>Profil Detail Anggota</h2>
          <button className="modal-close" onClick={onClose} style={{ fontSize: '1.2rem' }}>✕</button>
        </div>

        {/* Isi Konten Utama */}
        <div className="modal-body" style={{ padding: '1.75rem 1.5rem 1.25rem 1.5rem' }}>
          
          {/* Avatar & Informasi Singkat Atas */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.75rem', textAlign: 'center' }}>
            <div style={{
              width: '64px',
              height: '64px',
              backgroundColor: '#e0e7ff',
              color: '#4f46e5',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: '0.5rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
              {anggota.nama?.charAt(0).toUpperCase()}
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: '#0f172a' }}>
              {anggota.nama}
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center' }}>
              <code style={{ background: '#f1f5f9', padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>
                {anggota.noAnggota || '-'}
              </code>
              <span className={`badge ${anggota.isActive ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                {anggota.isActive ? 'Aktif' : 'Nonaktif'}
              </span>
            </div>
          </div>

          <hr style={{ border: '0', borderTop: '1px solid #f1f5f9', margin: '0 0 1.25rem 0' }} />

          {/* Grid Informasi Form Bersih */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'start' }}>
              <span style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>Email</span>
              <span style={{ color: '#1e293b', fontSize: '0.875rem', fontWeight: 600, wordBreak: 'break-all' }}>{anggota.email}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'start' }}>
              <span style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>No. Telepon</span>
              <span style={{ color: '#1e293b', fontSize: '0.875rem', fontWeight: 600 }}>{anggota.noTelepon || '-'}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'start' }}>
              <span style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>Alamat</span>
              <span style={{ color: '#1e293b', fontSize: '0.875rem', lineHeight: '1.4', fontWeight: 500 }}>{anggota.alamat || '-'}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'start' }}>
              <span style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>Pinjaman Aktif</span>
              <div>
                <span className="badge badge-info" style={{ fontSize: '0.75rem', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                  {anggota.totalPinjamanAktif || 0} buku
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'start' }}>
              <span style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>Tanggal Daftar</span>
              <span style={{ color: '#1e293b', fontSize: '0.875rem', fontWeight: 500 }}>
                {anggota.createdAt
                  ? new Date(anggota.createdAt).toLocaleDateString('id-ID', {
                      day: '2-digit', month: 'long', year: 'numeric',
                    })
                  : '-'}
              </span>
            </div>

          </div>

          {/* Kontainer Riwayat Peminjaman (Dinamis) */}
          <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 0.6rem 0', fontSize: '0.8rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              Riwayat Peminjaman
            </h4>
            
            {loadingRiwayat ? (
              <div style={{ fontSize: '0.85rem', color: '#64748b', textAlign: 'center', padding: '0.5rem 0' }}>
                🔄 Memuat riwayat...
              </div>
            ) : riwayat.length === 0 ? (
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', padding: '0.5rem 0' }}>
                Belum ada riwayat peminjaman buku
              </p>
            ) : (
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', maxHeight: '120px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {riwayat.map((item, idx) => (
                  <li key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem', color: '#334155', backgroundColor: '#fff', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                    <span>📖</span>
                    <span style={{ fontWeight: 500 }}>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

        </div>

        {/* Footer Tombol */}
        <div className="modal-actions" style={{ padding: '0.75rem 1.5rem 1.25rem 1.5rem', margin: 0, justifyContent: 'flex-end', display: 'flex' }}>
          <button type="button" className="btn-primary" onClick={onClose} style={{ padding: '0.4rem 1.25rem', borderRadius: '6px', fontSize: '0.9rem' }}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalDetailAnggota;
