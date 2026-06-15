import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth';
import { AdminBookManagement } from '../../book-management';
import { adminAdminAPI } from '../services/adminAPI';
import { adminAnggotaAPI } from '../services/memberAPI';
import { toast } from 'react-toastify';

import ModalTambahAnggota from '../components/ModalTambahAnggota';
import ModalEditAnggota from '../components/ModalEditAnggota';
import ModalDetailAnggota from '../components/ModalDetailAnggota';
import ModalTambahAdmin from '../components/ModalTambahAdmin';
import '../../../assets/styles/admin.css';
import Swal from 'sweetalert2'; 

// ─── Komponen: Pagination ───────────────────────────────────────────────────
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="pagination">
      <button
        className="page-btn"
        disabled={currentPage === 0}
        onClick={() => onPageChange(currentPage - 1)}
      >‹ Sebelumnya</button>
      <span className="page-info">
        Halaman {currentPage + 1} dari {totalPages}
      </span>
      <button
        className="page-btn"
        disabled={currentPage >= totalPages - 1}
        onClick={() => onPageChange(currentPage + 1)}
      >Selanjutnya ›</button>
    </div>
  );
};

// ─── Komponen: Tab Manajemen Anggota ───────────────────────────────────────
const TabAnggota = ({ user }) => {
  const [anggotaList, setAnggotaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [stats, setStats] = useState(null);

  const [showTambah, setShowTambah] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);

  // Fetch stats dari backend
  const fetchStats = useCallback(async () => {
    try {
      const res = await adminAnggotaAPI.getStats();
      setStats(res.data.data);
    } catch {
    }
  }, []);

  // Fetch daftar anggota — OOP: tampilkanAnggota()
  const fetchAnggota = useCallback(async (p = 0, keyword = '') => {
    setLoading(true);
    try {
      let res;
      if (keyword.trim()) {
        res = await adminAnggotaAPI.search(keyword, p);
      } else {
        res = await adminAnggotaAPI.getAll(p);
      }
      const pageData = res.data.data;
      setAnggotaList(pageData.content || []);
      setTotalPages(pageData.totalPages || 0);
      setPage(pageData.number || 0);
    } catch {
      toast.error('Gagal memuat data anggota');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnggota(0, search);
    fetchStats();
  }, [search, fetchAnggota, fetchStats]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(0);
  };

  const handleReset = () => {
    setSearchInput('');
    setSearch('');
    setPage(0);
  };

  // Toggle Status Anggota + Confirmation Dialog
 const handleToggleStatus = async (anggota) => {
  const aksi = anggota.isActive ? 'nonaktifkan' : 'aktifkan';

  Swal.fire({
    title: 'Konfirmasi Status Anggota',
    text: `Apakah Anda yakin ingin ${aksi}kan akun anggota bernama "${anggota.nama}"?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: anggota.isActive ? '#d33' : '#28a745',
    cancelButtonColor: '#6c757d',
    confirmButtonText: `Ya, ${aksi}kan!`,
    cancelButtonText: 'Batal'
  }).then(async (result) => {
    if (result.isConfirmed) {
      console.log("[FE LOG] Menembak API toggle untuk anggota ID:", anggota.userId);
      try {
        await adminAnggotaAPI.toggleStatus(anggota.userId);
        Swal.fire('Berhasil!', `Akun anggota ${anggota.nama} telah di${aksi}kan.`, 'success');
        
        setAnggotaList(prevList => 
          prevList.map(item => 
            item.userId === anggota.userId ? { ...item, isActive: !item.isActive } : item
          )
        );
        fetchAnggota(0, search);
        fetchStats();
      } catch (err) {
        console.error("[FE LOG] Gagal toggle status anggota:", err);
        toast.error(err.response?.data?.message || `Gagal ${aksi}kan anggota`);
      }
    }
  });
};

  // Hapus Anggota Permanen + Confirmation Dialog
  const handleHapusAnggota = async (anggota) => {
    Swal.fire({
      title: 'Hapus Anggota Permanen?',
      text: `Apakah Anda yakin ingin menghapus secara permanen anggota "${anggota.nama}"? Semua data terkait akun ini akan dilenyapkan.`,
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        console.log("[FE LOG] Menembak API delete untuk anggota ID:", anggota.userId);
        try {
          await adminAnggotaAPI.delete(anggota.userId);
          Swal.fire('Terhapus!', `Data anggota ${anggota.nama} berhasil dihapus permanen.`, 'success');
          
          // Hapus instan dari layar
          setAnggotaList(prevList => prevList.filter(item => item.userId !== anggota.userId));
          fetchAnggota(0, search);
          fetchStats();
        } catch (err) {
          console.error("[FE LOG] Gagal menghapus anggota:", err);
          toast.error(err.response?.data?.message || 'Gagal menghapus data anggota');
        }
      }
    });
  };

  const formatTanggal = (iso) => {
    if (!iso) return '-';
    return new Date(iso).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  };

  const totalAktif = stats?.totalAktif ?? anggotaList.filter((a) => a.isActive).length;
  const totalNonaktif = stats?.totalNonaktif ?? anggotaList.filter((a) => !a.isActive).length;
  const totalAnggota = stats?.totalAnggota ?? anggotaList.length;

  return (
    <>
      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-number">{totalAnggota}</div>
          <div className="stat-label">Total Anggota</div>
        </div>
        <div className="stat-card">
          <div className="stat-number stat-green">{totalAktif}</div>
          <div className="stat-label">Anggota Aktif</div>
        </div>
        <div className="stat-card">
          <div className="stat-number stat-red">{totalNonaktif}</div>
          <div className="stat-label">Tidak Aktif</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <form className="search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Cari nama atau email anggota..."
          />
          <button type="submit" className="btn-secondary">Cari</button>
          {search && (
            <button type="button" className="btn-outline" onClick={handleReset}>Reset</button>
          )}
        </form>
        <button className="btn-primary" onClick={() => setShowTambah(true)}>
          + Tambah Anggota
        </button>
      </div>

      {/* Tabel Anggota */}
      <div className="table-wrapper">
        {loading ? (
          <div className="loading-state">Memuat data anggota...</div>
        ) : anggotaList.length === 0 ? (
          <div className="empty-state">
            {search ? `Tidak ada anggota dengan kata kunci "${search}"` : 'Belum ada data anggota'}
          </div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>No. Anggota</th>
                  <th>Nama</th>
                  <th>Email</th>
                  <th>No. Telepon</th>
                  <th>Tgl. Daftar</th>
                  <th>Pinjaman Aktif</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {anggotaList.map((anggota) => (
                  <tr key={anggota.userId}>
                    <td><code>{anggota.noAnggota || '-'}</code></td>
                    <td><strong>{anggota.nama}</strong></td>
                    <td>{anggota.email}</td>
                    <td>{anggota.noTelepon || '-'}</td>
                    <td>{formatTanggal(anggota.createdAt)}</td>
                    <td>
                      <span className="badge badge-info">
                        {anggota.totalPinjamanAktif ?? 0} buku
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${anggota.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {anggota.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-sm btn-detail"
                          onClick={() => setDetailTarget(anggota)}
                          title="Lihat detail"
                        >Detail</button>
                        <button
                          className="btn-sm btn-edit"
                          onClick={() => setEditTarget(anggota)}
                          title="Edit data"
                        >Edit</button>
                        <button
                          className={`btn-sm ${anggota.isActive ? 'btn-danger' : 'btn-success'}`}
                          onClick={() => handleToggleStatus(anggota)}
                          title={anggota.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                        >
                          {anggota.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                        {/* SUNTIKAN: Tombol Hapus Anggota */}
                        <button
                          className="btn-sm btn-outline"
                          style={{ borderColor: 'var(--red-500)', color: 'var(--red-500)' }}
                          onClick={() => handleHapusAnggota(anggota)}
                          title="Hapus permanen"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(p) => fetchAnggota(p, search)}
            />
          </>
        )}
      </div>

      {/* Modals */}
      {showTambah && (
        <ModalTambahAnggota
          onClose={() => setShowTambah(false)}
          onSuccess={() => { setShowTambah(false); fetchAnggota(page, search); fetchStats(); }}
        />
      )}
      {editTarget && (
        <ModalEditAnggota
          anggota={editTarget}
          onClose={() => setEditTarget(null)}
          onSuccess={() => { setEditTarget(null); fetchAnggota(page, search); }}
        />
      )}
      {detailTarget && (
        <ModalDetailAnggota
          anggota={detailTarget}
          onClose={() => setDetailTarget(null)}
        />
      )}
    </>
  );
};

// ─── Komponen: Tab Manajemen Admin ─────────────────────────────────────────
const TabAdmin = ({ currentUser }) => {
  const [adminList, setAdminList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showTambah, setShowTambah] = useState(false);

  const fetchAdmin = useCallback(async (p = 0) => {
    setLoading(true);
    try {
      const res = await adminAdminAPI.getAll(p);
      const pageData = res.data?.data || res.data;
      
      if (pageData) {
        const listAdmin = pageData.content || (Array.isArray(pageData) ? pageData : []);
        setAdminList(listAdmin);
        setTotalPages(pageData.totalPages || 1);
        setPage(pageData.number || 0);
      }
    } catch (err) {
      console.error("Error fetch admin:", err);
      toast.error('Gagal memuat data admin');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmin(0);
  }, [fetchAdmin]);

  // PERBAIKAN: Fungsi Toggle Status Admin Lebih Agresif
  const handleToggleStatusAdmin = async (admin) => {
    if (admin.userId === currentUser?.userId) {
      toast.error('Anda tidak diizinkan menonaktifkan akun sendiri!');
      return;
    }

    const aksi = admin.isActive ? 'nonaktifkan' : 'aktifkan';

    // ─── YANG DIUBAH 1: Mengganti window.confirm dengan SweetAlert2 ───
    Swal.fire({
      title: 'Konfirmasi Status',
      text: `Apakah Anda yakin ingin ${aksi}kan hak akses administrator "${admin.nama}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: admin.isActive ? '#d33' : '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: `Ya, ${aksi}kan!`,
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        
        // ─── YANG DIUBAH 2: Menambahkan Log Pelacak di Console Browser ───
        console.log("[FE LOG] Menembak API toggle untuk admin ID:", admin.userId);
        
        try {
          const response = await adminAdminAPI.toggleStatus(admin.userId);
          
          // Memunculkan data balikan dari Java ke Console (Biar ketahuan isinya apa)
          console.log("[FE LOG] Respons Mentah dari Java:", response);
          console.log("[FE LOG] Isi Data Respons:", response.data);

          // Efek visual sukses bawaan SweetAlert2 yang modern
          Swal.fire('Berhasil!', `Akun admin ${admin.nama} telah di${aksi}kan.`, 'success');
          
          // ─── YANG DIUBAH 3: Jalur Paksa Refresh State ───
          setAdminList(prevList => 
            prevList.map(item => 
              item.userId === admin.userId ? { ...item, isActive: !item.isActive } : item
            )
          );
          
          fetchAdmin(0); 
        } catch (err) {
          console.error("[FE LOG] Terjadi Eror Saat Toggle:", err);
          console.error("[FE LOG] Detail Eror Response:", err.response?.data);
          toast.error(err.response?.data?.message || `Gagal mengubah status akses admin`);
        }
      }
    });
  };

  // PERBAIKAN: Fungsi Hapus Admin
  const handleHapusAdmin = async (admin) => {
    if (admin.userId === currentUser?.userId) {
      toast.error('Anda tidak diizinkan menghapus akun Anda sendiri!');
      return;
    }

    Swal.fire({
      title: 'Apakah Anda Yakin?',
      text: `Akun admin "${admin.nama}" akan dihapus secara permanen dari sistem!`,
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Ya, Hapus Permanen!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        console.log("[FE LOG] Menembak API delete untuk admin ID:", admin.userId);
        try {
          await adminAdminAPI.delete(admin.userId);
          Swal.fire('Terhapus!', `Akun administrator ${admin.nama} telah dilenyapkan.`, 'success');
          
          // Hapus instan dari layar
          setAdminList(prevList => prevList.filter(item => item.userId !== admin.userId));
          fetchAdmin(0);
        } catch (err) {
          console.error("[FE LOG] Gagal menghapus admin:", err);
          toast.error(err.response?.data?.message || 'Gagal menghapus akun administrator');
        }
      }
    });
  };

  const formatTanggal = (iso) => {
    if (!iso) return '-';
    return new Date(iso).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  };

  return (
    <>
      <div className="toolbar" style={{ marginBottom: '1.25rem' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Daftar Administrator</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>
            Kelola akun admin perpustakaan
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowTambah(true)}>
          + Tambah Admin
        </button>
      </div>

      <div className="table-wrapper">
        {loading ? (
          <div className="loading-state">Memuat data admin...</div>
        ) : adminList.length === 0 ? (
          <div className="empty-state">Belum ada data admin</div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>No. Pegawai</th>
                  <th>Nama</th>
                  <th>Email</th>
                  <th>Jabatan</th>
                  <th>Tgl. Dibuat</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {adminList.map((admin) => (
                  <tr key={admin.userId}>
                    <td><code>{admin.noPegawai || '-'}</code></td>
                    <td>
                      <strong>{admin.nama}</strong>
                      {admin.userId === currentUser?.userId && (
                        <span className="badge badge-info" style={{ marginLeft: '0.5rem', fontSize: '0.65rem' }}>
                          Anda
                        </span>
                      )}
                    </td>
                    <td>{admin.email}</td>
                    <td>{admin.jabatan || '-'}</td>
                    <td>{formatTanggal(admin.createdAt)}</td>
                    <td>
                      <span className={`badge ${admin.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {admin.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td>
                      {/* SUNTIKAN: Tombol Aksi Kolon Manajemen Admin */}
                      <div className="action-buttons">
                        <button
                          className={`btn-sm ${admin.isActive ? 'btn-danger' : 'btn-success'}`}
                          disabled={admin.userId === currentUser?.userId}
                          onClick={() => handleToggleStatusAdmin(admin)}
                          style={admin.userId === currentUser?.userId ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                          title={admin.userId === currentUser?.userId ? 'Tidak bisa menonaktifkan diri sendiri' : (admin.isActive ? 'Nonaktifkan' : 'Aktifkan')}
                        >
                          {admin.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                        
                        <button
                          className="btn-sm btn-outline"
                          disabled={admin.userId === currentUser?.userId}
                          onClick={() => handleHapusAdmin(admin)}
                          style={admin.userId === currentUser?.userId ? { opacity: 0.5, cursor: 'not-allowed', borderColor: '#ccc', color: '#ccc' } : { borderColor: 'var(--red-500)', color: 'var(--red-500)' }}
                          title={admin.userId === currentUser?.userId ? 'Tidak bisa menghapus diri sendiri' : 'Hapus admin'}
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(p) => fetchAdmin(p)}
            />
          </>
        )}
      </div>

      {showTambah && (
        <ModalTambahAdmin
          onClose={() => setShowTambah(false)}
          onSuccess={() => { setShowTambah(false); fetchAdmin(0); }}
        />
      )}
    </>
  );
};

// ─── Halaman Utama: AdminDashboard ─────────────────────────────────────────
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('anggota');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const tabs = [
    { id: 'anggota', label: '👥 Manajemen Anggota' },
    { id: 'admin', label: '🛡️ Manajemen Admin' },
    { id: 'buku', label: '📝 Manajemen Buku' },
  ];

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="sidebar" style={{ background: 'linear-gradient(180deg, #1e1b4b 0%, #0f172a 100%)' }}>
        <div className="sidebar-logo">📚 Smart Library</div>
        <nav className="sidebar-nav">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <span className="user-name">{user?.nama}</span>
            <span className="user-role">Administrator</span>
          </div>
          <button className="btn-logout" onClick={handleLogout}>Keluar</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>
              {activeTab === 'anggota' ? 'Manajemen Anggota' : activeTab === 'admin' ? 'Manajemen Admin' : 'Manajemen Buku'}
            </h1>
            <p>
              {activeTab === 'anggota'
                ? 'Kelola data anggota perpustakaan'
                : activeTab === 'admin'
                  ? 'Kelola akun administrator sistem'
                  : 'Kelola katalog buku fisik dan digital'}
            </p>
          </div>
        </div>

        {activeTab === 'anggota' && <TabAnggota user={user} />}
        {activeTab === 'admin' && <TabAdmin currentUser={user} />}
        {activeTab === 'buku' && <AdminBookManagement />}
      </main>
    </div>
  );
};

export default AdminDashboard;
