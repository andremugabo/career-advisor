import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, Menu, CheckCircle2, MessageSquare, Briefcase, User, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TopbarProps {
  role: string;
  onMenuClick?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ role, onMenuClick }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    navigate('/login');
  };

  const mockNotifications = [
    { id: 1, title: 'New Internship Match', desc: 'Google has posted a Software Engineering role matching your Python skills!', time: '10 min ago', icon: <Briefcase className="w-4 h-4 text-[#19A7CE]" />, unread: true },
    { id: 2, title: 'Advisor Message', desc: 'Mr. Smith sent you a message regarding your recent resume upload.', time: '2 hrs ago', icon: <MessageSquare className="w-4 h-4 text-emerald-500" />, unread: true },
    { id: 3, title: 'Skill Verified', desc: 'Your React.js certification has been approved and added to your profile.', time: '1 day ago', icon: <CheckCircle2 className="w-4 h-4 text-[#146C94]" />, unread: false },
  ];

  const unreadCount = mockNotifications.filter(n => n.unread).length;

  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        {/* Mobile menu toggle */}
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-[#146C94] rounded-lg hover:bg-slate-50 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        {/* Search */}
        <div className="hidden md:flex relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search for internships, students, or skills..." 
            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-[#19A7CE] focus:ring-1 focus:ring-[#19A7CE] transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Notifications */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative transition-colors ${showNotifications ? 'text-[#19A7CE]' : 'text-slate-400 hover:text-[#19A7CE]'}`}
          >
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-fade-in z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                <span className="font-bold text-[#146C94] text-sm">Notifications</span>
                <span className="text-xs font-bold text-[#19A7CE] bg-[#19A7CE]/10 px-2 py-0.5 rounded-full">{unreadCount} New</span>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {mockNotifications.map(notification => (
                  <div key={notification.id} className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer ${notification.unread ? 'bg-[#19A7CE]/5' : ''}`}>
                    <div className="flex gap-3">
                      <div className={`mt-0.5 shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${notification.unread ? 'bg-white shadow-sm' : 'bg-slate-100'}`}>
                        {notification.icon}
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${notification.unread ? 'text-[#146C94]' : 'text-slate-600'}`}>{notification.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{notification.desc}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-2">{notification.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 text-center border-t border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors">
                <span className="text-xs font-bold text-[#19A7CE]">View All Activity</span>
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative pl-6 border-l border-slate-200" ref={profileRef}>
          <div 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-[#146C94] group-hover:text-[#19A7CE] transition-colors">Active {role}</p>
              <p className="text-xs text-slate-500">{showProfileMenu ? 'Close Menu' : 'View Profile'}</p>
            </div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-sm transition-colors ${showProfileMenu ? 'bg-[#19A7CE] text-white' : 'bg-[#AFD3E2]/30 text-[#146C94] border border-[#19A7CE]/20 group-hover:bg-[#19A7CE]/10'}`}>
              {role.charAt(0).toUpperCase()}
            </div>
          </div>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden animate-fade-in z-50">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                <p className="text-sm font-bold text-[#146C94]">{role} Account</p>
                <p className="text-xs text-slate-500 truncate">Settings & Preferences</p>
              </div>
              <div className="py-1">
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#146C94] transition-colors text-left">
                  <User className="w-4 h-4" /> My Profile
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#146C94] transition-colors text-left">
                  <Settings className="w-4 h-4" /> Account Settings
                </button>
              </div>
              <div className="border-t border-slate-100 py-1">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
