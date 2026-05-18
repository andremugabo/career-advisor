import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar, Topbar } from '../components';

export const AdminLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const storedRole = localStorage.getItem('user_role');
  
  if (storedRole !== 'Admin') {
    // Bounce non-Admins back to their respective dashboards or login
    const fallbackRoute = storedRole === 'Advisor' ? '/students' : storedRole === 'Student' ? '/dashboard' : '/login';
    return <Navigate to={fallbackRoute} replace />;
  }

  return (
    <div className="flex h-screen bg-[#F8F1F1] font-inter text-slate-700 overflow-hidden">
      <Sidebar role="Admin" isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar role="Admin" onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 relative">
          {/* Admin decorative background elements */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#146C94]/5 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="relative z-10 animate-fade-in max-w-7xl mx-auto h-full">
            {/* Header for Admin Context */}
            <div className="mb-8 border-b border-slate-200 pb-4">
              <h1 className="text-3xl font-bold font-outfit text-[#146C94]">System Administration</h1>
              <p className="text-slate-500 mt-1">Manage users, audit logs, and global platform settings.</p>
            </div>
            
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
