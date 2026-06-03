// Public / Landing
export { LandingPage } from './landing/LandingPage';

// Authentication
export { Login } from './auth/Login';
export { Register } from './auth/Register';
export { ForgotPassword } from './auth/ForgotPassword';
export { ResetPassword } from './auth/ResetPassword';
export { VerifyEmail } from './auth/VerifyEmail';

// Student Portal
export { default as Dashboard } from './dashboard/Dashboard';

// Advisor Portal
export { default as AdvisorHome } from './advisors/AdvisorHome';
export { default as AdvisorDashboard } from './advisors/AdvisorDashboard';
export { AdvisorNotifications } from './advisors/AdvisorNotifications';
export { InterventionsHistory } from './advisors/InterventionsHistory';
export { AdvisorResourceLibrary } from './advisors/AdvisorResourceLibrary';

// Admin Portal
export { default as AdminDashboard } from './admin/AdminDashboard';
export { AdminAnalytics } from './admin/AdminAnalytics';
export { default as AdminContent } from './admin/AdminContent';
export { default as AdminInternships } from './admin/AdminInternships';
export { default as AdminSettings } from './admin/AdminSettings';
export { default as AdminUsers } from './admin/AdminUsers';
// 5. Student Portal Feature Pages
export { StudentProfile } from './profile/StudentProfile';
export { SkillsCerts } from './skills/SkillsCerts';
export { InternshipBoard } from './internships/InternshipBoard';
export { RecommendationsPage } from './recommendations/RecommendationsPage';
export { CareerAssessment } from './careers/CareerAssessment';
export { CareerVisualization } from './careers/CareerVisualization';
export { CareerComparison } from './careers/CareerComparison';
export { FavoriteCareers } from './careers/FavoriteCareers';
export { ResourceLibrary } from './resources/ResourceLibrary';
export { ApplicationsTracker } from './applications/ApplicationsTracker';

// 6. Miscellaneous
export { NotFoundPage } from './misc/NotFoundPage';
