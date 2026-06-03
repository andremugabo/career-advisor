import { useState, useEffect, FormEvent } from 'react';
import { Card, Button } from '../../components';
import { studentService } from '../../services';
import { notify } from '../../lib/toast';
import { UserCircle, GraduationCap, FileText, Save, CheckCircle } from 'lucide-react';
import { StudentProfile as StudentProfileType } from '../../types';

export const StudentProfile = () => {
  const [profile, setProfile] = useState<StudentProfileType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Form State
  const [bio, setBio] = useState('');
  const [gpa, setGpa] = useState<number | ''>('');
  const [currentYear, setCurrentYear] = useState<number | ''>('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const data = await studentService.getProfile();
      setProfile(data);
      setBio(data.bio || '');
      setGpa(data.gpa || '');
      setCurrentYear(data.current_year || '');
    } catch (error: any) {
      notify.error(error.message || 'Failed to load profile.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const dataToUpdate = {
        bio,
        gpa: Number(gpa),
        current_year: Number(currentYear),
      };
      
      const updatedProfile = await studentService.updateProfile(dataToUpdate);
      setProfile(updatedProfile);
      notify.success('Profile updated successfully!');
    } catch (error: any) {
      notify.error(error.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      notify.error('Please upload a valid PDF document.');
      return;
    }

    setIsUploading(true);
    try {
      await studentService.uploadTranscript(file);
      notify.success('Transcript uploaded and parsed successfully!');
      fetchProfile(); // Refresh to show new skills
    } catch (error: any) {
      notify.error(error.message || 'Failed to upload transcript.');
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading || !profile) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-[#146C94] animate-pulse">
        <UserCircle size={48} className="animate-bounce" />
        <span className="text-xl font-bold font-outfit">Loading your profile...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold text-[#146C94] font-outfit">My Profile</h2>
        <p className="text-slate-500 text-sm mt-1">
          Manage your personal details and academic status to improve AI recommendations.
        </p>
      </div>

      <div className="grid md:grid-cols-[1fr_2fr] gap-8">
        {/* Read-only Identity Card */}
        <div className="space-y-6">
          <Card className="text-center p-8 border-slate-200 shadow-sm flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-[#19A7CE]/10 flex items-center justify-center mb-4 border border-[#19A7CE]/20">
              <UserCircle size={48} className="text-[#146C94]" />
            </div>
            <h3 className="text-xl font-bold text-[#146C94] font-outfit">{profile.full_name}</h3>
            <p className="text-sm font-medium text-slate-400 mt-1 uppercase tracking-wider">{profile.program}</p>
            
            <div className="w-full mt-6 pt-6 border-t border-slate-100 flex flex-col gap-3 text-left">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Registration ID</span>
                  <span className="text-sm font-medium text-slate-700">{profile.reg_number}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Verified Skills</span>
                  <span className="text-sm font-medium text-slate-700">{profile.skills?.length || 0} skills mapped</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Editable Profile Settings */}
        <Card className="border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-[#146C94] font-outfit mb-6 border-b border-slate-100 pb-4">
            Academic Settings
          </h3>
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-500 ml-1 font-outfit">Current GPA (%)</label>
                <div className="relative">
                  <input 
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="e.g. 85.5"
                    value={gpa}
                    onChange={(e) => setGpa(e.target.value ? Number(e.target.value) : '')}
                    className="w-full glass-input bg-white focus:outline-none pl-10"
                  />
                  <GraduationCap className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-500 ml-1 font-outfit">Current Academic Year</label>
                <select
                  value={currentYear}
                  onChange={(e) => setCurrentYear(Number(e.target.value))}
                  className="w-full glass-input bg-white focus:outline-none"
                >
                  <option value="1">Year 1</option>
                  <option value="2">Year 2</option>
                  <option value="3">Year 3</option>
                  <option value="4">Year 4</option>
                  <option value="5">Year 5</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-500 ml-1 font-outfit">Professional Bio</label>
              <textarea
                className="w-full glass-input bg-white min-h-[120px] resize-none focus:outline-none"
                placeholder="Tell us about your career aspirations..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            <div className="pt-4 flex justify-end">
              <Button 
                type="submit" 
                className="bg-[#146C94] hover:bg-[#19A7CE] text-white px-8 h-11"
                isLoading={isSaving}
                leftIcon={<Save className="w-4 h-4" />}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </Card>

        {/* Transcript Upload */}
        <Card className="border-slate-200 shadow-sm mt-8">
          <h3 className="text-lg font-bold text-[#146C94] font-outfit mb-6 border-b border-slate-100 pb-4">
            Academic Transcript
          </h3>
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              Upload your latest academic transcript (PDF). Emmerence AI will automatically parse it to identify courses completed, update your GPA, and map verified skills to your profile.
            </p>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors">
              <input
                type="file"
                accept=".pdf"
                id="transcript-upload"
                className="hidden"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
              <label htmlFor="transcript-upload" className="cursor-pointer flex flex-col items-center">
                <FileText className={`w-12 h-12 mb-3 ${isUploading ? 'text-[#19A7CE] animate-bounce' : 'text-slate-400'}`} />
                <span className="text-sm font-bold text-[#146C94]">
                  {isUploading ? 'Parsing transcript...' : 'Click to select PDF document'}
                </span>
                <span className="text-xs text-slate-500 mt-1">Maximum file size: 5MB</span>
              </label>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
