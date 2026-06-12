import React, { useState } from 'react';
import { toast } from 'react-toastify';
import '../../../assets/styles/modal.css';
import { bookAPI } from '../services/bookAPI';

const initialForm = {
  title: '',
  author: '',
  isbn: '',
  bookType: 'PHYSICAL',
  available: true,
  shelfLocation: '',
  fileUrl: '',
};

const toFormState = (book) => ({
  title: book?.title || '',
  author: book?.author || '',
  isbn: book?.isbn || '',
  bookType: book?.bookType || 'PHYSICAL',
  available: book?.available ?? true,
  shelfLocation: book?.shelfLocation || '',
  fileUrl: book?.fileUrl || '',
});

const toPayload = (form) => ({
  title: form.title.trim(),
  author: form.author.trim(),
  isbn: form.isbn.trim(),
  bookType: form.bookType,
  available: form.available,
  shelfLocation: form.bookType === 'PHYSICAL' ? form.shelfLocation.trim() || null : null,
  fileUrl: form.bookType === 'DIGITAL' ? form.fileUrl.trim() || null : null,
});

const BookFormModal = ({ book, onClose, onSuccess }) => {
  const [form, setForm] = useState(book ? toFormState(book) : initialForm);
  const [loading, setLoading] = useState(false);
  const isEdit = Boolean(book);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = toPayload(form);
      if (isEdit) {
        await bookAPI.update(book.id ?? book.bookId, payload);
        toast.success('Data buku berhasil diperbarui');
      } else {
        await bookAPI.create(payload);
        toast.success('Buku baru berhasil ditambahkan');
      }
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan data buku');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEdit ? 'Edit Buku' : 'Tambah Buku'}</h2>
          <button className="modal-close" onClick={onClose}>x</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Judul <span className="required">*</span></label>
            <input name="title" value={form.title} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Penulis <span className="required">*</span></label>
            <input name="author" value={form.author} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>ISBN <span className="required">*</span></label>
            <input name="isbn" value={form.isbn} onChange={handleChange} required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Tipe Buku</label>
              <select name="bookType" value={form.bookType} onChange={handleChange}>
                <option value="PHYSICAL">Fisik</option>
                <option value="DIGITAL">Digital</option>
              </select>
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                name="available"
                value={String(form.available)}
                onChange={(e) => setForm((current) => ({ ...current, available: e.target.value === 'true' }))}
              >
                <option value="true">Tersedia</option>
                <option value="false">Tidak tersedia</option>
              </select>
            </div>
          </div>

          {form.bookType === 'PHYSICAL' ? (
            <div className="form-group">
              <label>Lokasi Rak</label>
              <input
                name="shelfLocation"
                value={form.shelfLocation}
                onChange={handleChange}
                placeholder="Rack A1"
              />
            </div>
          ) : (
            <div className="form-group">
              <label>URL File</label>
              <input
                type="url"
                name="fileUrl"
                value={form.fileUrl}
                onChange={handleChange}
                placeholder="https://example.com/book.pdf"
              />
            </div>
          )}

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

export default BookFormModal;
