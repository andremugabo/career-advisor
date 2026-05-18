import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Input, Button } from '../../components';
import { KeyRound, ArrowLeft, Mail } from 'lucide-react';
import { authService } from '../../services';
import { notify } from '../../lib/toast';

export const ForgotPassword: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [email, setEmail] = useState('');

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await authService.forgotPassword(email);
      notify.success('Recovery code sent successfully!');
      setIsSent(true);
    } catch (error: any) {
      notify.error(error.message || 'Failed to send recovery code.');
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
          <KeyRound className="w-8 h-8 text-[#146C94]" />
        </div>
        <h2 className="text-3xl font-bold font-outfit text-[#146C94]">Recover Password</h2>
        <p className="text-slate-500 mt-2 text-sm max-w-sm mx-auto">
          {isSent 
            ? "We've sent a 6-digit verification code to your email." 
            : "Enter your email address and we'll send you a secure 6-digit OTP code."}
        </p>
      </div>

      {!isSent ? (
        <form onSubmit={handleResetRequest} className="space-y-5">
          <Input 
            label="Email Address" 
            type="email" 
            placeholder="student@auca.ac.rw"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button 
            type="submit" 
            className="w-full" 
            isLoading={isLoading}
            leftIcon={<Mail className="w-5 h-5" />}
          >
            Send Recovery Code
          </Button>
        </form>
      ) : (
        <div className="space-y-5 text-center">
          <div className="p-4 rounded-xl bg-[#AFD3E2]/20 border border-[#AFD3E2]/50 text-[#146C94] font-medium">
            Check your inbox for the code!
          </div>
          <Link to="/reset-password">
            <Button className="w-full">
              Enter 6-Digit Code
            </Button>
          </Link>
        </div>
      )}
    </Card>
  );
};
