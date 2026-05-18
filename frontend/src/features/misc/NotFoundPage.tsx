import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components';
import { ShieldAlert } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#F8F1F1] font-inter text-center relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#19A7CE]/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="relative z-10 animate-fade-in max-w-md">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-[#146C94]/10 mb-6">
          <ShieldAlert className="w-12 h-12 text-[#146C94]" />
        </div>
        
        <h1 className="text-6xl font-bold font-outfit text-[#146C94] mb-4">404</h1>
        <h2 className="text-2xl font-bold text-slate-700 mb-2">Page Not Found</h2>
        <p className="text-slate-500 mb-8">
          The page you are looking for does not exist, has been removed, or you lack the required permissions to view it.
        </p>
        
        <Link to="/">
          <Button className="bg-[#146C94] hover:bg-[#19A7CE] text-white px-8 py-3 rounded-md shadow-md">
            Return to Safety
          </Button>
        </Link>
      </div>
    </div>
  );
};
