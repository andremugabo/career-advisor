import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar, Topbar } from '../components';

export const AdvisorLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const storedRole = localStorage.getItem('user_role');
  
  if (storedRole !== 'Advisor' && storedRole !== 'Admin') {
    // If Student tries to access, bounce to their home. Otherwise login.
    return <Navigate to={storedRole === 'Student' ? '/dashboard' : '/login'} replace />;
  }

  return (
    <div className="flex h-screen bg-[#F8F1F1] font-inter text-slate-700 overflow-hidden">
      <Sidebar role="Advisor" isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar role="Advisor" onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 relative">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#AFD3E2]/20 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="relative z-10 animate-fade-in h-full max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
