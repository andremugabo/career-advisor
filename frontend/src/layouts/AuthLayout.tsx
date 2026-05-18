import React from 'react';
import { Outlet } from 'react-router-dom';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[#146C94]">
      {/* Decorative background wave-like elements (simulated with CSS circles) */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#19A7CE]/40 rounded-full blur-[80px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#AFD3E2]/30 rounded-full blur-[100px]" />
      
      {/* Abstract wave decoration */}
      <div className="absolute top-20 left-20 w-32 h-32 border-[16px] border-[#AFD3E2]/20 rounded-full" />
      <div className="absolute bottom-20 right-20 w-48 h-48 border-[24px] border-[#19A7CE]/20 rounded-full" />
      
      <div className="w-full max-w-md relative z-10 animate-fade-in shadow-2xl">
        <Outlet />
      </div>
    </div>
  );
};
