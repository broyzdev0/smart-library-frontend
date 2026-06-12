import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import BookFormModal from './BookFormModal';
import { bookAPI } from '../services/bookAPI';

const unwrapBooks = (response) => {
  const payload = response?.data?.data ?? response?.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.books)) return payload.books;
  return [];
};

const getBookId = (book) => book.id ?? book.bookId;

const AdminBookManagement = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [searchMode, setSearchMode] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const fetchBooks = useCallback(async (keyword = '', mode = 'all') => {
    setLoading(true);
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
      toast.error(err.response?.data?.message || 'Gagal memuat data buku');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBooks('', 'all');
  }, [fetchBooks]);

  const stats = useMemo(() => {
    const total = books.length;
    const totalPhysical = books.filter((book) => book.bookType === 'PHYSICAL').length;
    const totalDigital = books.filter((book) => book.bookType === 'DIGITAL').length;
    return { total, totalPhysical, totalDigital };
  }, [books]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    fetchBooks(searchInput, searchMode);
  };

  const handleReset = () => {
    setSearchInput('');
    setSearch('');
    setSearchMode('all');
    fetchBooks('', 'all');
  };

  const handleDelete = (book) => {
    Swal.fire({
      title: 'Hapus Buku?',
      text: `Buku "${book.title}" akan dihapus dari katalog.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      try {
        await bookAPI.delete(getBookId(book));
        toast.success('Buku berhasil dihapus');
        fetchBooks(search, searchMode);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Gagal menghapus buku');
      }
    });
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditTarget(null);
    fetchBooks(search, searchMode);
  };

  return (
    <>
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total Buku</div>
        </div>
        <div className="stat-card">
          <div className="stat-number stat-green">{stats.totalPhysical}</div>
          <div className="stat-label">Buku Fisik</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: 'var(--info)' }}>{stats.totalDigital}</div>
          <div className="stat-label">Buku Digital</div>
        </div>
      </div>

      <div className="toolbar">
        <form className="search-bar" onSubmit={handleSearch}>
          <select value={searchMode} onChange={(e) => setSearchMode(e.target.value)}>
            <option value="all">Semua</option>
            <option value="title">Judul</option>
            <option value="author">Penulis</option>
            <option value="isbn">ISBN</option>
          </select>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Cari buku..."
          />
          <button type="submit" className="btn-secondary">Cari</button>
          {search && (
            <button type="button" className="btn-outline" onClick={handleReset}>Reset</button>
          )}
        </form>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          + Tambah Buku
        </button>
      </div>

      <div className="table-wrapper">
        {loading ? (
          <div className="loading-state">Memuat data buku...</div>
        ) : books.length === 0 ? (
          <div className="empty-state">
            {search ? `Tidak ada buku dengan kata kunci "${search}"` : 'Belum ada data buku'}
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Judul</th>
                <th>Penulis</th>
                <th>ISBN</th>
                <th>Tipe</th>
                <th>Lokasi / File</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={getBookId(book)}>
                  <td><strong>{book.title}</strong></td>
                  <td>{book.author}</td>
                  <td><code>{book.isbn}</code></td>
                  <td>
                    <span className="badge badge-info">
                      {book.bookType === 'DIGITAL' ? 'Digital' : 'Fisik'}
                    </span>
                  </td>
                  <td>{book.bookType === 'DIGITAL' ? book.fileUrl || '-' : book.shelfLocation || '-'}</td>
                  <td>
                    <span className={`badge ${book.available ? 'badge-success' : 'badge-danger'}`}>
                      {book.available ? 'Tersedia' : 'Tidak tersedia'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-sm btn-edit" onClick={() => setEditTarget(book)}>
                        Edit
                      </button>
                      <button className="btn-sm btn-danger" onClick={() => handleDelete(book)}>
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <BookFormModal onClose={() => setShowForm(false)} onSuccess={handleFormSuccess} />
      )}
      {editTarget && (
        <BookFormModal book={editTarget} onClose={() => setEditTarget(null)} onSuccess={handleFormSuccess} />
      )}
    </>
  );
};

export default AdminBookManagement;
