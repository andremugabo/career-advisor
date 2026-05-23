import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layouts
import { AuthLayout, StudentLayout, AdvisorLayout, AdminLayout } from '../layouts';

// Pages — all feature views from the barrel export
import {
  LandingPage,
  Login,
  Register,
  ForgotPassword,
  ResetPassword,
  Dashboard,
  AdvisorDashboard,
  AdminDashboard,
  AdminUsers,
  AdminInternships,
  AdminContent,
  AdminSettings,
  StudentProfile,
  SkillsCerts,
  InternshipBoard,
  NotFoundPage,
} from '../features';

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
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        {/* Student Routes wrapped in RBAC StudentLayout */}
        <Route element={<StudentLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<StudentProfile />} />
          <Route path="/skills" element={<SkillsCerts />} />
          <Route path="/internships" element={<InternshipBoard />} />
        </Route>

        {/* Advisor Routes wrapped in RBAC AdvisorLayout */}
        <Route element={<AdvisorLayout />}>
          <Route path="/students" element={<AdvisorDashboard />} /> 
        </Route>

        {/* Admin Routes wrapped in RBAC AdminLayout */}
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} /> 
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
