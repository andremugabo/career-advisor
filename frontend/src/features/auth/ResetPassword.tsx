import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Input, Button } from '../../components';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { authService } from '../../services';
import { notify } from '../../lib/toast';

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await authService.resetPassword({ token, new_password: newPassword });
      notify.success('Password securely updated! You can now log in.');
      navigate('/login');
    } catch (error: any) {
      notify.error(error.message || 'Failed to update password. Invalid token?');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <div className="mb-6">
        <Link to="/login" className="inline-flex items-center text-sm text-slate-500 hover:text-[#146C94] font-medium transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to login
        </Link>
      </div>

      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#19A7CE]/10 mb-4">
          <ShieldCheck className="w-8 h-8 text-[#146C94]" />
        </div>
        <h2 className="text-3xl font-bold font-outfit text-[#146C94]">Set New Password</h2>
        <p className="text-slate-500 mt-2 text-sm">
          Enter the 6-digit OTP from your email and your new secure password.
        </p>
      </div>

      <form onSubmit={handleReset} className="space-y-5">
        <Input 
          label="6-Digit OTP Code" 
          type="text" 
          placeholder="e.g. 123456"
          maxLength={6}
          value={token}
          onChange={(e) => setToken(e.target.value)}
          required
          className="text-center text-xl tracking-widest font-bold"
        />
        
        <Input 
          label="New Password" 
          type="password" 
          placeholder="••••••••"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />

        <Button 
          type="submit" 
          className="w-full mt-2" 
          isLoading={isLoading}
        >
          Securely Update Password
        </Button>
      </form>
    </Card>
  );
};
