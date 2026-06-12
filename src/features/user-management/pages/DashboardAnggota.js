import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../auth';
import { bookAPI } from '../../book-management';
import { adminAnggotaAPI } from '../services/memberAPI';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import '../../../assets/styles/admin.css';

const unwrapBooks = (response) => {
  const payload = response?.data?.data ?? response?.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.books)) return payload.books;
  return [];
};

const DashboardAnggota = () => {
  const { user, logout } = useAuth();
  const [profil, setProfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('profil');

  const [formData, setFormData] = useState({
    nama: '',
    noTelepon: '',
    alamat: '',
  });

  const [books, setBooks] = useState([]);
  const [bookLoading, setBookLoading] = useState(false);
  const [bookSearchInput, setBookSearchInput] = useState('');
  const [bookSearch, setBookSearch] = useState('');
  const [bookSearchMode, setBookSearchMode] = useState('all');
  const [bookTypeFilter, setBookTypeFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');

  const loadProfilSaya = useCallback(async () => {
    if (!user?.userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await adminAnggotaAPI.getById(user.userId);
      const data = res?.data?.data || res?.data;

      if (data) {
        setProfil(data);
        setFormData({
          nama: data.nama || user?.nama || '',
          noTelepon: data.noTelepon || '',
          alamat: data.alamat || '',
        });
      } else {
        setProfil({
          nama: user?.nama || 'Anggota Perpustakaan',
          email: user?.email || '-',
          noAnggota: 'BELUM DISET',
          isActive: true,
        });
      }
    } catch (err) {
      console.error('Error Detail API Anggota:', err);
      setProfil({
        nama: user?.nama || 'Anggota Perpustakaan',
        email: user?.email || '-',
        noAnggota: 'ERR-403',
        isActive: true,
      });
      toast.warning('Menggunakan data sesi lokal (Backend mengembalikan status 403)');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadKatalogBuku = useCallback(async (keyword = '', mode = 'all') => {
    setBookLoading(true);
    try {
      let response;
      const trimmedKeyword = keyword.trim();

      if (!trimmedKeyword) {
        response = await bookAPI.getAll();
      } else if (mode === 'title') {
        response = await bookAPI.searchByTitle(trimmedKeyword);
      } else if (mode === 'author') {
        response = await bookAPI.searchByAuthor(trimmedKeyword);
      } else if (mode === 'isbn') {
        response = await bookAPI.searchByIsbn(trimmedKeyword);
      } else {
        response = await bookAPI.search(trimmedKeyword);
      }

      setBooks(unwrapBooks(response));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memuat katalog buku');
    } finally {
      setBookLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfilSaya();
  }, [loadProfilSaya]);

  useEffect(() => {
    if (activeSubTab === 'katalog' && books.length === 0) {
      loadKatalogBuku();
    }
  }, [activeSubTab, books.length, loadKatalogBuku]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      cancelButtonText: 'Batal',
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        window.location.href = '/login';
      }
    });
  };

  const handleCariBuku = (e) => {
    e.preventDefault();
    setBookSearch(bookSearchInput);
    loadKatalogBuku(bookSearchInput, bookSearchMode);
  };

  const handleResetKatalog = () => {
    setBookSearchInput('');
    setBookSearch('');
    setBookSearchMode('all');
    setBookTypeFilter('all');
    setAvailabilityFilter('all');
    loadKatalogBuku('', 'all');
  };

  const filteredBooks = books.filter((book) => {
    const matchesType = bookTypeFilter === 'all' || book.bookType === bookTypeFilter;
    const matchesAvailability =
      availabilityFilter === 'all' ||
      (availabilityFilter === 'available' ? book.available : !book.available);
    return matchesType && matchesAvailability;
  });

  const katalogStats = {
    total: books.length,
    available: books.filter((book) => book.available).length,
    digital: books.filter((book) => book.bookType === 'DIGITAL').length,
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
        <div className="sidebar-logo">Smart Library</div>
        <nav className="sidebar-nav">
          <div className={`nav-item ${activeSubTab === 'profil' ? 'active' : ''}`} onClick={() => setActiveSubTab('profil')}>
            Profil
          </div>
          <div className={`nav-item ${activeSubTab === 'katalog' ? 'active' : ''}`} onClick={() => setActiveSubTab('katalog')}>
            Katalog Buku
          </div>
          <div className={`nav-item ${activeSubTab === 'peminjaman' ? 'active' : ''}`} onClick={() => setActiveSubTab('peminjaman')}>
            Peminjaman Saya
          </div>
        </nav>
        <div className="sidebar-footer">
          <button className="btn-logout" onClick={handleLogout}>Keluar Aplikasi</button>
        </div>
      </aside>

      <main className="main-content" style={{ backgroundColor: '#f8fafc', padding: '2rem' }}>
        {activeSubTab === 'profil' && (
          <>
            <div className="page-header" style={{ marginBottom: '2rem' }}>
              <div>
                <h1 style={{ fontSize: '1.65rem', fontWeight: 700, color: '#0f172a' }}>Ruang Anggota Perpustakaan</h1>
              </div>
            </div>

            <div className="member-profile-grid">
              <div className="member-profile-card">
                <div className="member-avatar">
                  {profil?.nama ? profil.nama.charAt(0).toUpperCase() : user?.nama?.charAt(0).toUpperCase()}
                </div>
                <h3>{profil?.nama || user?.nama}</h3>
                <p>{profil?.email || user?.email}</p>

                <div className="member-profile-badges">
                  <code>{profil?.noAnggota || '-'}</code>
                  <span className={`badge ${profil?.isActive ? 'badge-success' : 'badge-danger'}`}>
                    Status Akun: {profil?.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
              </div>

              <div className="member-form-panel">
                <div className="member-form-header">
                  <h4>Biodata Personal</h4>
                  {!isEditing && (
                    <button type="button" className="btn-primary" onClick={() => setIsEditing(true)}>
                      Edit Profil
                    </button>
                  )}
                </div>

                <form onSubmit={handleSimpanProfil} className="member-profile-form">
                  <div className="member-form-row">
                    <span>Nama Lengkap</span>
                    <input type="text" name="nama" value={formData.nama} onChange={handleInputChange} disabled={!isEditing} required />
                  </div>

                  <div className="member-form-row">
                    <span>No. Telepon</span>
                    <input type="text" name="noTelepon" value={formData.noTelepon} onChange={handleInputChange} disabled={!isEditing} />
                  </div>

                  <div className="member-form-row member-form-row-start">
                    <span>Alamat Rumah</span>
                    <textarea name="alamat" value={formData.alamat} onChange={handleInputChange} disabled={!isEditing} rows="3" />
                  </div>

                  <div className="member-form-row">
                    <span>Buku Dipinjam</span>
                    <strong>{profil?.totalPinjamanAktif || 0} Buku</strong>
                  </div>

                  {isEditing && (
                    <div className="member-form-actions">
                      <button type="button" className="btn-outline" onClick={() => { setIsEditing(false); loadProfilSaya(); }}>
                        Batal
                      </button>
                      <button type="submit" className="btn-primary">
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
          <>
            <div className="page-header">
              <div>
                <h1>Katalog Buku</h1>
                <p>Temukan koleksi buku fisik dan digital yang tersedia di perpustakaan.</p>
              </div>
              <button type="button" className="btn-outline" onClick={() => loadKatalogBuku(bookSearch, bookSearchMode)}>
                Muat Ulang
              </button>
            </div>

            <div className="stats-row">
              <div className="stat-card">
                <div className="stat-number">{katalogStats.total}</div>
                <div className="stat-label">Total Koleksi</div>
              </div>
              <div className="stat-card">
                <div className="stat-number stat-green">{katalogStats.available}</div>
                <div className="stat-label">Tersedia Dipinjam</div>
              </div>
              <div className="stat-card">
                <div className="stat-number" style={{ color: 'var(--info)' }}>{katalogStats.digital}</div>
                <div className="stat-label">Buku Digital</div>
              </div>
            </div>

            <div className="member-catalog-toolbar">
              <form className="search-bar member-catalog-search" onSubmit={handleCariBuku}>
                <select value={bookSearchMode} onChange={(e) => setBookSearchMode(e.target.value)}>
                  <option value="all">Semua</option>
                  <option value="title">Judul</option>
                  <option value="author">Penulis</option>
                  <option value="isbn">ISBN</option>
                </select>
                <input
                  type="text"
                  value={bookSearchInput}
                  onChange={(e) => setBookSearchInput(e.target.value)}
                  placeholder="Cari judul, penulis, atau ISBN..."
                />
                <button type="submit" className="btn-secondary">Cari</button>
              </form>

              <div className="member-catalog-filters">
                <select value={bookTypeFilter} onChange={(e) => setBookTypeFilter(e.target.value)}>
                  <option value="all">Semua Tipe</option>
                  <option value="PHYSICAL">Fisik</option>
                  <option value="DIGITAL">Digital</option>
                </select>
                <select value={availabilityFilter} onChange={(e) => setAvailabilityFilter(e.target.value)}>
                  <option value="all">Semua Status</option>
                  <option value="available">Tersedia</option>
                  <option value="unavailable">Tidak tersedia</option>
                </select>
                {(bookSearch || bookTypeFilter !== 'all' || availabilityFilter !== 'all') && (
                  <button type="button" className="btn-outline" onClick={handleResetKatalog}>Reset</button>
                )}
              </div>
            </div>

            {bookLoading ? (
              <div className="loading-state">Memuat katalog buku...</div>
            ) : filteredBooks.length === 0 ? (
              <div className="empty-state">
                {bookSearch ? `Tidak ada buku dengan kata kunci "${bookSearch}"` : 'Belum ada buku yang cocok dengan filter.'}
              </div>
            ) : (
              <div className="member-book-grid">
                {filteredBooks.map((book) => (
                  <article className="member-book-card" key={book.id ?? book.bookId ?? book.isbn}>
                    <div className="member-book-cover" aria-hidden="true">
                      <span>{book.bookType === 'DIGITAL' ? 'DB' : 'BK'}</span>
                    </div>
                    <div className="member-book-content">
                      <div className="member-book-meta">
                        <span className="badge badge-info">{book.bookType === 'DIGITAL' ? 'Digital' : 'Fisik'}</span>
                        <span className={`badge ${book.available ? 'badge-success' : 'badge-danger'}`}>
                          {book.available ? 'Tersedia' : 'Tidak tersedia'}
                        </span>
                      </div>
                      <h3>{book.title || 'Tanpa Judul'}</h3>
                      <p className="member-book-author">{book.author || 'Penulis tidak diketahui'}</p>
                      <div className="member-book-details">
                        <span>ISBN</span>
                        <strong>{book.isbn || '-'}</strong>
                      </div>
                      <div className="member-book-details">
                        <span>{book.bookType === 'DIGITAL' ? 'File' : 'Rak'}</span>
                        <strong>{book.bookType === 'DIGITAL' ? book.fileUrl || '-' : book.shelfLocation || '-'}</strong>
                      </div>
                    </div>
                    <div className="member-book-actions">
                      {book.bookType === 'DIGITAL' && book.fileUrl ? (
                        <a className="btn-primary" href={book.fileUrl} target="_blank" rel="noreferrer">
                          Buka Digital
                        </a>
                      ) : (
                        <button type="button" className="btn-outline" disabled>
                          {book.available ? 'Pinjam di Perpustakaan' : 'Sedang Tidak Tersedia'}
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}

        {activeSubTab === 'peminjaman' && (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#94a3b8', border: '2px dashed #e2e8f0', borderRadius: '12px', backgroundColor: '#fff' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#64748b', marginBottom: '0.5rem' }}>Transaksi Peminjaman Saya</h2>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardAnggota;
