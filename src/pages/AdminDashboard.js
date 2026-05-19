import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAnggotaAPI, adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

import ModalTambahAnggota from '../components/admin/ModalTambahAnggota';
import ModalEditAnggota from '../components/admin/ModalEditAnggota';
import ModalDetailAnggota from '../components/admin/ModalDetailAnggota';
import ModalTambahAdmin from '../components/admin/ModalTambahAdmin';
import '../assets/styles/admin.css';

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
      // stats tidak kritis, abaikan error
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

  const handleToggleStatus = async (anggota) => {
    const aksi = anggota.isActive ? 'nonaktifkan' : 'aktifkan';
    if (!window.confirm(`${aksi.charAt(0).toUpperCase() + aksi.slice(1)} akun ${anggota.nama}?`)) return;
    try {
      await adminAnggotaAPI.toggleStatus(anggota.userId);
      toast.success(`Akun ${anggota.nama} berhasil di${aksi}kan`);
      fetchAnggota(page, search);
      fetchStats();
    } catch {
      toast.error(`Gagal ${aksi}kan anggota`);
    }
  };

  const formatTanggal = (iso) => {
    if (!iso) return '-';
    return new Date(iso).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  };

  // Hitung stats lokal jika backend belum ada
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

      {/* Tabel Anggota — OOP: tampilkanAnggota() */}
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
      const res = await adminAPI.getAll(p);
      
      // PERBAIKAN: Antisipasi jika format backend langsung res.data atau res.data.data
      const pageData = res.data?.data || res.data;
      
      if (pageData) {
        // Cek apakah data list-nya bernama 'content' (Bawaan Spring Boot Page) atau array langsung
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
  ];

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="sidebar">
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
              {activeTab === 'anggota' ? 'Manajemen Anggota' : 'Manajemen Admin'}
            </h1>
            <p>
              {activeTab === 'anggota'
                ? 'Kelola data anggota perpustakaan'
                : 'Kelola akun administrator sistem'}
            </p>
          </div>
        </div>

        {activeTab === 'anggota' && <TabAnggota user={user} />}
        {activeTab === 'admin' && <TabAdmin currentUser={user} />}
      </main>
    </div>
  );
};

export default AdminDashboard;