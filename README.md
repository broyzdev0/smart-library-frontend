Aplikasi web manajemen perpustakaan pintar yang dibangun dengan React. Sistem ini memungkinkan pengguna (anggota) dan admin untuk mengelola koleksi buku, profil, serta berbagai fitur perpustakaan digital.

---

## 📋 Daftar Isi

- [Teknologi yang Digunakan](#teknologi-yang-digunakan)
- [Prasyarat Sistem](#prasyarat-sistem)
- [Cara Instalasi & Setup](#cara-instalasi--setup)
- [Cara Menjalankan Project](#cara-menjalankan-project)
- [Struktur Project](#struktur-project)
- [Fitur Utama](#fitur-utama)
- [Konfigurasi Environment](#konfigurasi-environment)
- [API Integration](#api-integration)
- [Panduan Pengembangan](#panduan-pengembangan)
- [Troubleshooting](#troubleshooting)

---

## 🛠️ Teknologi yang Digunakan

| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| **React** | 18.2.0 | Library UI framework utama |
| **React Router DOM** | 6.20.0 | Routing dan navigasi halaman |
| **Axios** | 1.6.0 | HTTP client untuk komunikasi dengan backend API |
| **React Toastify** | 9.1.3 | Notification/toast messages |
| **SweetAlert2** | 11.26.24 | Modal dialog dan konfirmasi |
| **React Scripts** | 5.0.1 | Build tools dan development server |
| **Node.js** | 14+ | Runtime JavaScript untuk development |
| **npm** | 6+ | Package manager |

---

## ✅ Prasyarat Sistem

Sebelum memulai, pastikan Anda sudah menginstal:

1. **Node.js** (versi 14 atau lebih baru)
   - Download: https://nodejs.org/
   - Verifikasi: `node --version` dan `npm --version`

2. **Backend Server**
   - Pastikan Smart Library Backend sudah running di `http://localhost:8080`
   - Lihat README di folder `backend/smart-library-backend`

3. **Text Editor atau IDE** (opsional)
   - Visual Studio Code (recommended)
   - WebStorm, Sublime Text, atau editor lainnya

---

## 🚀 Cara Instalasi & Setup

### 1. Clone atau Buka Project

```bash
cd frontend/smart-library-frontend
```

### 2. Install Dependencies

```bash
npm install
```

Atau jika menggunakan yarn:

```bash
yarn install
```

**Penjelasan**: Perintah ini akan mengunduh semua package yang didefinisikan di `package.json` dan menyimpannya di folder `node_modules/`.

### 3. Setup Environment Variables

Buat file `.env` di root folder frontend (jika belum ada):

```bash
# Windows (PowerShell)
echo. > .env

# Linux/Mac (bash)
touch .env
```

Tambahkan konfigurasi berikut ke file `.env`:

```env
# Backend API URL
REACT_APP_API_BASE_URL=http://localhost:8080/api

# Opsional: Port development server (default: 3000)
PORT=3000
```

**Catatan**: Restart development server setelah mengubah file `.env`.

---

## ▶️ Cara Menjalankan Project

### Mode Development (dengan Hot Reload)

```bash
npm start
```

- Aplikasi akan otomatis terbuka di browser: `http://localhost:3000`
- Server akan auto-reload ketika ada perubahan file
- Buka DevTools (F12) untuk melihat error/warning

### Mode Production (Build)

```bash
npm run build
```

- Menghasilkan folder `build/` berisi file production-ready
- File sudah di-optimize dan di-minify
- Ukuran lebih kecil untuk deployment

### Testing

```bash
npm test
```

- Menjalankan test suite menggunakan Jest
- Tekan `a` untuk menjalankan semua test, atau `q` untuk quit

---

## 📁 Struktur Project

```
frontend/smart-library-frontend/
├── public/
│   └── index.html                    # HTML template utama
├── src/
│   ├── features/
│   │   ├── auth/
│   │   │   ├── index.js             # Export fitur auth
│   │   │   ├── components/
│   │   │   │   └── PrivateRoute.js  # Protected route component
│   │   │   ├── context/
│   │   │   │   └── AuthContext.js   # Auth state management
│   │   │   ├── pages/
│   │   │   │   ├── LoginPage.js     # Halaman login
│   │   │   │   └── RegisterPage.js  # Halaman register
│   │   │   └── services/
│   │   │       └── authAPI.js       # API calls untuk auth
│   │   │
│   │   ├── user-management/
│   │   │   ├── index.js
│   │   │   ├── components/
│   │   │   │   ├── ModalDetailAnggota.js   # Detail anggota
│   │   │   │   ├── ModalEditAnggota.js     # Edit anggota
│   │   │   │   ├── ModalTambahAdmin.js     # Tambah admin
│   │   │   │   └── ModalTambahAnggota.js   # Tambah anggota
│   │   │   ├── pages/
│   │   │   │   ├── AdminDashboard.js       # Dashboard admin
│   │   │   │   ├── DashboardAnggota.js     # Dashboard anggota
│   │   │   │   └── MemberProfile.js        # Profil anggota
│   │   │   └── services/
│   │   │       ├── adminAPI.js             # Admin API calls
│   │   │       └── memberAPI.js            # Member API calls
│   │   │
│   │   └── book-management/
│   │       ├── index.js
│   │       ├── components/
│   │       │   ├── AdminBookManagement.js  # Manajemen buku
│   │       │   └── BookFormModal.js        # Form modal buku
│   │       └── services/
│   │           └── bookAPI.js              # Book API calls
│   │
│   ├── assets/
│   │   └── styles/
│   │       ├── global.css           # Style global
│   │       ├── auth.css             # Style auth pages
│   │       ├── admin.css            # Style admin dashboard
│   │       ├── member.css           # Style member pages
│   │       └── modal.css            # Style modal
│   │
│   ├── config/
│   │   └── env.js                   # Konfigurasi environment
│   │
│   ├── services/
│   │   ├── api.js                   # API endpoints constants
│   │   └── httpClient.js            # Axios HTTP client dengan interceptor
│   │
│   ├── App.js                       # Root component & routing
│   ├── index.js                     # Entry point React
│   └── index.html                   # HTML file
│
├── package.json                     # Dependencies & scripts
├── .env                             # Environment variables (create this)
└── README.md                        # Dokumentasi ini
```

---

## ✨ Fitur Utama

### 1. **Authentication (Autentikasi)**
   - Login dengan email dan password
   - Register akun baru
   - JWT token-based authentication
   - Role-based access (Admin & Anggota/Member)
   - Protected routes dengan PrivateRoute component

### 2. **Admin Dashboard**
   - Manajemen buku (tambah, edit, hapus)
   - Manajemen anggota (view, edit, hapus)
   - Manajemen admin (tambah admin baru)
   - Statistics dashboard

### 3. **Member/Anggota Features**
   - View profil pribadi
   - Lihat daftar buku yang tersedia
   - History peminjaman
   - Update profil

### 4. **Notifications**
   - Toast notifications untuk success/error
   - Konfirmasi dialog dengan SweetAlert2
   - Form validation messages

---
