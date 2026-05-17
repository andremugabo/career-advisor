import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../features/dashboard/Dashboard';
import Login from '../features/auth/Login';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
