// src/App.js

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/common/PrivateRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import MemberProfile from './pages/MemberProfile';

/**
 * Smart Library Management System
 * Modul: Manajemen Anggota dan User
 * 
 * Routing:
 * /login           → LoginPage (publik)
 * /register        → RegisterPage (publik)
 * /admin/dashboard → AdminDashboard (khusus ADMIN)
 * /member/profile  → MemberProfile (khusus ANGGOTA)
 */
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Route publik */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Route Admin */}
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />

          {/* Route Anggota */}
          <Route
            path="/member/profile"
            element={
              <PrivateRoute allowedRoles={['ANGGOTA']}>
                <MemberProfile />
              </PrivateRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
      />
    </AuthProvider>
  );
}

export default App;
