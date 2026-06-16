import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, Briefcase, Settings, LogOut, Brain, Code, Sparkles, TrendingUp, Scale, Star, Library, ClipboardList, MessageSquare, Activity } from 'lucide-react';
import { Role } from '../types';

interface SidebarProps {
  role: Role;
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ role, isOpen = false, setIsOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Dashboard', path: role === 'Admin' ? '/admin/dashboard' : '/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, roles: ['Student', 'Admin'] },
    
    // Student Links
    { name: 'My Profile', path: '/profile', icon: <Settings className="w-5 h-5" />, roles: ['Student'] },
    { name: 'Skills & Certs', path: '/skills', icon: <BookOpen className="w-5 h-5" />, roles: ['Student'] },
    { name: 'Assessment', path: '/assessment', icon: <Brain className="w-5 h-5" />, roles: ['Student'] },
    { name: 'AI Recommendations', path: '/recommendations', icon: <Sparkles className="w-5 h-5" />, roles: ['Student'] },
    { name: 'Career Path', path: '/career-path', icon: <TrendingUp className="w-5 h-5" />, roles: ['Student'] },
    { name: 'Compare Careers', path: '/compare', icon: <Scale className="w-5 h-5" />, roles: ['Student'] },
    { name: 'Saved Careers', path: '/favorites', icon: <Star className="w-5 h-5" />, roles: ['Student'] },
    { name: 'Internships', path: '/internships', icon: <Briefcase className="w-5 h-5" />, roles: ['Student'] },
    { name: 'My Applications', path: '/applications', icon: <ClipboardList className="w-5 h-5" />, roles: ['Student'] },
    { name: 'Resource Library', path: '/resources', icon: <Library className="w-5 h-5" />, roles: ['Student'] },
    { name: 'Advisor Messages', path: '/messages', icon: <MessageSquare className="w-5 h-5" />, roles: ['Student'] },
    
    // Advisor Links
    { name: 'Dashboard', path: '/advisor/home', icon: <LayoutDashboard className="w-5 h-5" />, roles: ['Advisor'] },
    { name: 'Students', path: '/students', icon: <Users className="w-5 h-5" />, roles: ['Advisor'] },
    { name: 'Messages', path: '/advisor/messages', icon: <MessageSquare className="w-5 h-5" />, roles: ['Advisor'] },
    { name: 'Interventions', path: '/interventions', icon: <ClipboardList className="w-5 h-5" />, roles: ['Advisor'] },
    { name: 'Resource Library', path: '/advisor/resources', icon: <Library className="w-5 h-5" />, roles: ['Advisor'] },

    // Admin Links
    { name: 'User Management', path: '/admin/users', icon: <Users className="w-5 h-5" />, roles: ['Admin'] },
    { name: 'System Analytics', path: '/admin/analytics', icon: <Activity className="w-5 h-5" />, roles: ['Admin'] },
    { name: 'App & Jobs', path: '/admin/internships', icon: <Briefcase className="w-5 h-5" />, roles: ['Admin'] },
    { name: 'Global Content', path: '/admin/content', icon: <Code className="w-5 h-5" />, roles: ['Admin'] },
    { name: 'System Settings', path: '/admin/settings', icon: <Settings className="w-5 h-5" />, roles: ['Admin'] },
  ];

  const filteredLinks = navLinks.filter(link => link.roles.includes(role));

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsOpen?.(false)}
        />
      )}
      
      <aside className={`fixed lg:sticky top-0 inset-y-0 left-0 w-64 bg-white border-r border-slate-200 h-screen flex flex-col pt-8 pb-6 shadow-xl lg:shadow-sm z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="px-6 mb-10 flex flex-col items-center justify-center text-center">
          <Brain className="w-10 h-10 text-[#19A7CE] mb-2" />
          <h1 className="text-xl font-bold font-outfit text-[#146C94]">
            Emmerence AI
          </h1>
          <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest bg-[#F8F1F1] px-3 py-1 rounded-full">{role} Portal</p>
        </div>

      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
        {filteredLinks.map((link) => {
          const isActive = location.pathname.startsWith(link.path);
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                isActive 
                  ? 'bg-[#19A7CE]/10 text-[#146C94] shadow-sm' 
                  : 'text-slate-500 hover:text-[#19A7CE] hover:bg-slate-50'
              }`}
            >
              <div className={`${isActive ? 'text-[#19A7CE]' : ''}`}>{link.icon}</div>
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>

        <div className="px-4 mt-8 pt-6 border-t border-slate-100">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all duration-300 font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span>Secure Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
