import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Input, Button } from '../../components';
import { Brain, UserPlus } from 'lucide-react';
import { authService } from '../../services';
import { notify } from '../../lib/toast';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [programs, setPrograms] = useState<any[]>([]);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [password, setPassword] = useState('');
  const [programId, setProgramId] = useState('');

  useEffect(() => {
    async function fetchPrograms() {
      try {
        const data = await authService.getPrograms();
        setPrograms(data);
        if (data.length > 0) {
          setProgramId(data[0].id.toString());
        }
      } catch (err: any) {
        notify.error('Could not load academic programs.');
      }
    }
    fetchPrograms();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!programId) {
      notify.error('Please select an academic program');
      return;
    }
    setIsLoading(true);

    try {
      await authService.register({
        full_name: fullName,
        email,
        reg_number: regNumber,
        password,
        program_id: programId,
      });

      notify.success('Registration successful! Please enter the verification code sent to your email.');
      navigate(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (error: any) {
      notify.error(error.message || 'Registration failed. Please try again.');
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
        <h2 className="text-3xl font-bold font-outfit text-[#146C94]">Create Account</h2>
        <p className="text-slate-500 mt-2 text-sm">Join the AI Career advisory platform</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <Input 
          label="Full Name" 
          type="text" 
          placeholder="Emerance Tuyisenge"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />

        <Input 
          label="Email Address" 
          type="email" 
          placeholder="student@auca.ac.rw"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input 
            label="Registration Number" 
            type="text" 
            placeholder="25256"
            value={regNumber}
            onChange={(e) => setRegNumber(e.target.value)}
            required
          />

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-medium text-gray-300 ml-1 font-outfit">
              Academic Program
            </label>
            <select
              className="glass-input bg-white text-slate-700 focus:outline-none"
              value={programId}
              onChange={(e) => setProgramId(e.target.value)}
              required
            >
              {programs.length === 0 ? (
                <option value="">Loading programs...</option>
              ) : (
                programs.map((prog) => (
                  <option key={prog.id} value={prog.id} className="text-slate-800">
                    {prog.name}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        <Input 
          label="Secure Password" 
          type="password" 
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Button 
          type="submit" 
          className="w-full mt-4" 
          isLoading={isLoading}
          leftIcon={<UserPlus className="w-5 h-5" />}
        >
          Register Account
        </Button>

        <div className="text-center mt-4">
          <span className="text-sm text-slate-400">Already have an account? </span>
          <Link to="/login" className="text-sm text-[#19A7CE] hover:text-[#146C94] font-semibold transition-colors">
            Sign In
          </Link>
        </div>
      </form>
    </Card>
  );
};
