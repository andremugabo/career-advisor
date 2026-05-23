import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Input, Button } from '../../components';
import { Brain, LogIn, KeyRound, ArrowLeft } from 'lucide-react';
import { authService } from '../../services';
import { notify } from '../../lib/toast';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // MFA States
  const [showMfa, setShowMfa] = useState(false);
  const [mfaToken, setMfaToken] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<HTMLInputElement[]>([]);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    
    try {
      // Direct call to Django Backend via authService
      const response = await authService.login({ email, password });
      
      if (response.mfa_required) {
        setShowMfa(true);
        notify.success('Verification code sent to your email.');
        return;
      }

      if (response.access && response.refresh) {
        // Persist secure JWT tokens
        localStorage.setItem('access_token', response.access);
        localStorage.setItem('refresh_token', response.refresh);
        
        // Note: In production, you would fetch /users/me to get the actual role. 
        // For immediate routing based on your cheat sheet credentials:
        const role = email.includes('admin') ? 'Admin' : email.includes('advisor') ? 'Advisor' : 'Student';
        localStorage.setItem('user_role', role);
        
        notify.success(`Welcome back, ${role}!`);
        
        // Route based on RBAC layouts
        if (role === 'Admin') navigate('/admin/settings');
        else navigate('/dashboard');
      }
    } catch (error: any) {
      notify.error(error.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMfaChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newMfaToken = [...mfaToken];
    newMfaToken[index] = value.substring(value.length - 1);
    setMfaToken(newMfaToken);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleMfaKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !mfaToken[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleMfaVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = mfaToken.join('');
    if (token.length < 6) {
      notify.error('Please enter the full 6-digit code');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.mfaVerify(email, token);
      
      if (response.access && response.refresh) {
        localStorage.setItem('access_token', response.access);
        localStorage.setItem('refresh_token', response.refresh);
        
        const role = email.includes('admin') ? 'Admin' : email.includes('advisor') ? 'Advisor' : 'Student';
        localStorage.setItem('user_role', role);
        
        notify.success(`Verification successful. Welcome back!`);
        
        if (role === 'Admin') navigate('/admin/settings');
        else navigate('/dashboard');
      }
    } catch (error: any) {
      notify.error(error.message || 'Invalid or expired verification code');
    } finally {
      setIsLoading(false);
    }
  };

  if (showMfa) {
    return (
      <Card className="w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#19A7CE]/10 mb-4 animate-pulse">
            <KeyRound className="w-8 h-8 text-[#146C94]" />
          </div>
          <h2 className="text-3xl font-bold font-outfit text-[#146C94]">Enter Code</h2>
          <p className="text-slate-500 mt-2 text-sm">
            We sent a verification code to <span className="font-semibold text-slate-700">{email}</span>
          </p>
        </div>

        <form onSubmit={handleMfaVerify} className="space-y-6">
          <div className="flex justify-between gap-2 max-w-xs mx-auto">
            {mfaToken.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el as HTMLInputElement)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleMfaChange(idx, e.target.value)}
                onKeyDown={(e) => handleMfaKeyDown(idx, e)}
                className="w-12 h-12 text-center text-xl font-bold border border-slate-200 rounded-xl bg-slate-50/50 text-[#146C94] focus:outline-none focus:ring-2 focus:ring-[#19A7CE] focus:border-transparent transition-all"
              />
            ))}
          </div>

          <Button 
            type="submit" 
            className="w-full mt-4" 
            isLoading={isLoading}
          >
            Verify and Sign In
          </Button>

          <div className="flex justify-between items-center text-sm pt-2">
            <button
              type="button"
              onClick={() => {
                setShowMfa(false);
                setMfaToken(['', '', '', '', '', '']);
              }}
              className="flex items-center text-slate-500 hover:text-[#146C94] transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Login
            </button>
            <button
              type="button"
              onClick={() => handleLogin()}
              className="text-[#19A7CE] hover:text-[#146C94] font-medium transition-colors"
            >
              Resend Code
            </button>
          </div>
        </form>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#19A7CE]/10 mb-4">
          <Brain className="w-8 h-8 text-[#146C94]" />
        </div>
        <h2 className="text-3xl font-bold font-outfit text-[#146C94]">Welcome Back</h2>
        <p className="text-slate-500 mt-2 text-sm">Sign in to your AI Career portal</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        <Input 
          label="Email Address" 
          type="email" 
          placeholder="student@auca.ac.rw"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        <div className="space-y-1">
          <Input 
            label="Password" 
            type="password" 
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="text-right">
            <Link to="/forgot-password" className="text-sm text-[#19A7CE] hover:text-[#146C94] font-medium transition-colors">
              Forgot your password?
            </Link>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full mt-4" 
          isLoading={isLoading}
          leftIcon={<LogIn className="w-5 h-5" />}
        >
          Sign In
        </Button>

        <div className="mt-6 text-center text-sm text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#19A7CE] hover:text-[#146C94] font-bold transition-colors">
            Sign up here
          </Link>
        </div>
      </form>
    </Card>
  );
};
