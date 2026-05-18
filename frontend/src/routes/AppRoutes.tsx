import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layouts
import { AuthLayout, StudentLayout, AdvisorLayout, AdminLayout } from '../layouts';

// Pages
import { LandingPage } from '../features/landing/LandingPage';
import { Login } from '../features/auth/Login';
import { ForgotPassword } from '../features/auth/ForgotPassword';
import { ResetPassword } from '../features/auth/ResetPassword';
import Dashboard from '../features/dashboard/Dashboard';
import AdminDashboard from '../features/admin/AdminDashboard';
import AdminUsers from '../features/admin/AdminUsers';
import AdminInternships from '../features/admin/AdminInternships';
import AdminContent from '../features/admin/AdminContent';
import { NotFoundPage } from '../features/misc/NotFoundPage';

export default function AppRoutes() {
  return (
    <BrowserRouter 
      future={{ 
        v7_startTransition: true, 
        v7_relativeSplatPath: true 
      }}
    >
      {/* Global Toaster for the centralized notifications */}
      <Toaster position="top-right" reverseOrder={false} />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Auth Routes wrapped in AuthLayout */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        {/* Student Routes wrapped in RBAC StudentLayout */}
        <Route element={<StudentLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        {/* Advisor Routes wrapped in RBAC AdvisorLayout */}
        <Route element={<AdvisorLayout />}>
          <Route path="/students" element={<Dashboard />} /> 
        </Route>

        {/* Admin Routes wrapped in RBAC AdminLayout */}
        <Route element={<AdminLayout />}>
          <Route path="/admin/settings" element={<AdminDashboard />} /> 
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/internships" element={<AdminInternships />} />
          <Route path="/admin/content" element={<AdminContent />} />
        </Route>

        {/* 404 Catch-all */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
