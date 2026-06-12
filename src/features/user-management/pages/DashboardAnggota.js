import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../auth';
import { adminAnggotaAPI } from '../services/memberAPI';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import '../../../assets/styles/admin.css';

const DashboardAnggota = () => {
  const { user, logout } = useAuth();
  const [profil, setProfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  //State untuk mengatur tab mana yang sedang aktif
  const [activeSubTab, setActiveSubTab] = useState('profil');

  const [formData, setFormData] = useState({
    nama: '',
    noTelepon: '',
    alamat: ''
  });

  const loadProfilSaya = useCallback(async () => {
    if (!user?.userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // Menembak API detail anggota berdasarkan ID user yang login
      const res = await adminAnggotaAPI.getById(user.userId);
      
      // Mengamankan pembacaan data jika res atau res.data bernilai undefined
      const data = res?.data?.data || res?.data; 
      
      if (data) {
        setProfil(data);
        setFormData({
          nama: data.nama || user?.nama || '',
          noTelepon: data.noTelepon || '',
          alamat: data.alamat || ''
        });
      } else {
        // Jika API sukses tapi payload kosong, gunakan data fallback dari context
        setProfil({
          nama: user?.nama || 'Anggota Perpustakaan',
          email: user?.email || '-',
          noAnggota: 'BELUM DISET',
          isActive: true
        });
      }
    } catch (err) {
      console.error("Error Detail API Anggota:", err);
      //Jika API kena 403/Forbidden, data lokal tetap diisi agar nama tidak kosong (-)
      setProfil({
        nama: user?.nama || 'Anggota Perpustakaan',
        email: user?.email || '-',
        noAnggota: 'ERR-403',
        isActive: true
      });
      toast.warning('Menggunakan data sesi lokal (Backend mengembalikan status 403)');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadProfilSaya();
  }, [loadProfilSaya]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSimpanProfil = async (e) => {
    e.preventDefault();
    try {
      await adminAnggotaAPI.update(user.userId, formData);
      Swal.fire('Berhasil!', 'Informasi profil Anda telah diperbarui.', 'success');
      setIsEditing(false);
      loadProfilSaya();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan perubahan profil');
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Keluar dari Sistem?',
      text: 'Sesi perpustakaan Anda akan diakhiri.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Ya, Keluar',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        window.location.href = '/login';
      }
    });
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
        Memuat Profil Anggota...
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <aside className="sidebar" style={{ background: 'linear-gradient(180deg, #1e1b4b 0%, #0f172a 100%)' }}>
        <div className="sidebar-logo">📚 Smart Library</div>
        <nav className="sidebar-nav">
          <div 
            className={`nav-item ${activeSubTab === 'profil' ? 'active' : ''}`} 
            onClick={() => setActiveSubTab('profil')}
          >
            👤 Profil
          </div>
          <div 
            className={`nav-item ${activeSubTab === 'katalog' ? 'active' : ''}`} 
            onClick={() => setActiveSubTab('katalog')}
          >
            Base Koleksi Buku
          </div>
          <div 
            className={`nav-item ${activeSubTab === 'peminjaman' ? 'active' : ''}`} 
            onClick={() => setActiveSubTab('peminjaman')}
          >
            ⏳ Peminjaman Saya
          </div>
        </nav>
        <div className="sidebar-footer">
          <button className="btn-logout" onClick={handleLogout}>Keluar Aplikasi</button>
        </div>
      </aside>

      <main className="main-content" style={{ backgroundColor: '#f8fafc', padding: '2rem' }}>
        
        {/* PROFIL SAYA */}
        {activeSubTab === 'profil' && (
          <>
            <div className="page-header" style={{ marginBottom: '2rem' }}>
              <div>
                <h1 style={{ fontSize: '1.65rem', fontWeight: 700, color: '#0f172a' }}>Ruang Anggota Perpustakaan</h1>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', alignItems: 'start' }}>
              {/* Kartu Status Member */}
              <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <div style={{ width: '64px', height: '64px', backgroundColor: '#e0e7ff', color: '#4f46e5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', margin: '0 auto 1rem auto' }}>
                  {profil?.nama ? profil.nama.charAt(0).toUpperCase() : user?.nama?.charAt(0).toUpperCase()}
                </div>
                <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.2rem', fontWeight: 700 }}>{profil?.nama || user?.nama}</h3>
                <p style={{ margin: '0 0 1rem 0', color: '#64748b', fontSize: '0.85rem' }}>{profil?.email || user?.email}</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                  <code style={{ background: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                    {profil?.noAnggota || '-'}
                  </code>
                  <span className={`badge ${profil?.isActive ? 'badge-success' : 'badge-danger'}`} style={{ padding: '0.25rem 0.75rem', borderRadius: '4px' }}>
                    Status Akun: {profil?.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
              </div>

              {/* Form Informasi Akun Lengkap */}
              <div style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', justifyContent: 'space-between' }}>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#1e293b' }}>Biodata Personal</h4>
                  {!isEditing && (
                    <button type="button" className="btn-primary" onClick={() => setIsEditing(true)} style={{ padding: '0.4rem 1rem', borderRadius: '6px', fontSize: '0.85rem' }}>
                      Edit Profil
                    </button>
                  )}
                </div>

                <form onSubmit={handleSimpanProfil} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', alignItems: 'center' }}>
                    <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>Nama Lengkap</span>
                    <input type="text" name="nama" value={formData.nama} onChange={handleInputChange} disabled={!isEditing} style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: isEditing ? '#fff' : '#f8fafc' }} required />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', alignItems: 'center' }}>
                    <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>No. Telepon</span>
                    <input type="text" name="noTelepon" value={formData.noTelepon} onChange={handleInputChange} disabled={!isEditing} style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: isEditing ? '#fff' : '#f8fafc' }} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', alignItems: 'start' }}>
                    <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>Alamat Rumah</span>
                    <textarea name="alamat" value={formData.alamat} onChange={handleInputChange} disabled={!isEditing} rows="3" style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: isEditing ? '#fff' : '#f8fafc', resize: 'none' }}></textarea>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', alignItems: 'center' }}>
                    <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>Buku Dipinjam</span>
                    <span style={{ fontWeight: 600, color: '#1e293b' }}>{profil?.totalPinjamanAktif || 0} Buku</span>
                  </div>

                  {isEditing && (
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                      <button type="button" className="btn-outline" onClick={() => { setIsEditing(false); loadProfilSaya(); }} style={{ padding: '0.5rem 1rem', borderRadius: '6px' }}>
                        Batal
                      </button>
                      <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1.25rem', borderRadius: '6px' }}>
                        Simpan Perubahan
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </>
        )}

        {activeSubTab === 'katalog' && (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#94a3b8', border: '2px dashed #e2e8f0', borderRadius: '12px', backgroundColor: '#fff' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#64748b', marginBottom: '0.5rem' }}>📖 Katalog Buku</h2>
          
          </div>
        )}

        {activeSubTab === 'peminjaman' && (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#94a3b8', border: '2px dashed #e2e8f0', borderRadius: '12px', backgroundColor: '#fff' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#64748b', marginBottom: '0.5rem' }}>⏳ Transaksi Peminjaman Saya</h2>
            
          </div>
        )}

      </main>
    </div>
  );
};

export default DashboardAnggota;
