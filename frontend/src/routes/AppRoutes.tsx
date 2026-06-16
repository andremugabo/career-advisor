import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layouts
import { AuthLayout, StudentLayout, AdvisorLayout, AdminLayout } from '../layouts';

// Pages — all feature views from the barrel export
import {
  LandingPage,
  Login,
  Register,
  VerifyEmail,
  ForgotPassword,
  ResetPassword,
  Dashboard,
  AdvisorHome,
  AdvisorDashboard,
  AdvisorNotifications,
  InterventionsHistory,
  AdvisorResourceLibrary,
  AdminDashboard,
  AdminUsers,
  AdminInternships,
  AdminContent,
  AdminSettings,
  StudentProfile,
  SkillsCerts,
  InternshipBoard,
  RecommendationsPage,
  CareerAssessment,
  CareerVisualization,
  CareerComparison,
  FavoriteCareers,
  ResourceLibrary,
  ApplicationsTracker,
  AdminAnalytics,
  NotFoundPage,
  StudentMessages,
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
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        {/* Student Routes wrapped in RBAC StudentLayout */}
        <Route element={<StudentLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<StudentProfile />} />
          <Route path="/skills" element={<SkillsCerts />} />
          <Route path="/internships" element={<InternshipBoard />} />
          <Route path="/recommendations" element={<RecommendationsPage />} />
          <Route path="/assessment" element={<CareerAssessment />} />
          <Route path="/career-path" element={<CareerVisualization />} />
          <Route path="/compare" element={<CareerComparison />} />
          <Route path="/favorites" element={<FavoriteCareers />} />
          <Route path="/resources" element={<ResourceLibrary />} />
          <Route path="/applications" element={<ApplicationsTracker />} />
          <Route path="/messages" element={<StudentMessages />} />
        </Route>

        {/* Advisor Routes wrapped in RBAC AdvisorLayout */}
        <Route element={<AdvisorLayout />}>
          <Route path="/advisor/home" element={<AdvisorHome />} />
          <Route path="/students" element={<AdvisorDashboard />} />
          <Route path="/advisor/messages" element={<AdvisorNotifications />} />
          <Route path="/interventions" element={<InterventionsHistory />} />
          <Route path="/advisor/resources" element={<AdvisorResourceLibrary />} />
        </Route>

        {/* Admin Routes wrapped in RBAC AdminLayout */}
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} /> 
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/internships" element={<AdminInternships />} />
          <Route path="/admin/content" element={<AdminContent />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Route>

        {/* 404 Catch-all */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
