import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Input, Button } from '../../components';
import { Brain, LogIn } from 'lucide-react';
import { authService } from '../../services';
import { notify } from '../../lib/toast';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Direct call to Django Backend via authService
      const response = await authService.login({ email, password });
      
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

    } catch (error: any) {
      notify.error(error.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

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
      </form>
    </Card>
  );
};
