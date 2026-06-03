import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Input, Button } from '../../components';
import { Brain, CheckCircle2, ArrowLeft } from 'lucide-react';
import { authService } from '../../services';
import { notify } from '../../lib/toast';

export const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [otpToken, setOtpToken] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<HTMLInputElement[]>([]);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otpToken];
    newOtp[index] = value.substring(value.length - 1);
    setOtpToken(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpToken[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      notify.error('Please enter your email address');
      return;
    }
    
    const token = otpToken.join('');
    if (token.length < 6) {
      notify.error('Please enter the full 6-digit verification code');
      return;
    }

    setIsLoading(true);
    try {
      await authService.verifyEmail(email, token);
      notify.success('Email verified successfully! You can now log in.');
      navigate('/login');
    } catch (error: any) {
      notify.error(error.message || 'Verification failed. Please check the code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#19A7CE]/10 mb-4">
          <Brain className="w-8 h-8 text-[#146C94]" />
        </div>
        <h2 className="text-3xl font-bold font-outfit text-[#146C94]">Verify Email</h2>
        <p className="text-slate-500 mt-2 text-sm">
          Enter the 6-digit code sent to your email to verify your account
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-6">
        <Input
          label="Email Address"
          type="email"
          placeholder="student@auca.ac.rw"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-600 block">
            Verification Code
          </label>
          <div className="flex gap-2.5 justify-between">
            {otpToken.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el as HTMLInputElement)}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(idx, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                className="w-12 h-12 text-center text-xl font-bold rounded-xl border border-slate-200 focus:outline-none focus:border-[#19A7CE] focus:ring-1 focus:ring-[#19A7CE] transition-all bg-[#F8F1F1] text-slate-800"
              />
            ))}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          isLoading={isLoading}
          leftIcon={<CheckCircle2 className="w-5 h-5" />}
        >
          Verify Account
        </Button>

        <div className="text-center mt-4">
          <Link to="/login" className="inline-flex items-center text-sm text-slate-500 hover:text-[#19A7CE] transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Login
          </Link>
        </div>
      </form>
    </Card>
  );
};
