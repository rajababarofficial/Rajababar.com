import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  const token = localStorage.getItem('token');
  
  if (!token) {
    // Agar token nahi hai to login page par bhej dein
    return <Navigate to="/login" replace />;
  }

  // Agar token hai to nested routes render karein
  return <Outlet />;
}
