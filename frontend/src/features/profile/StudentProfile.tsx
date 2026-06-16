import { useState, useEffect, FormEvent, DragEvent } from 'react';
import { Button } from '../../components';
import { studentService } from '../../services';
import { notify } from '../../lib/toast';
import {
  UserCircle, FileText, Save, Star,
  Plus, Trash2, Upload, Shield
} from 'lucide-react';
import { StudentProfile as StudentProfileType, WorkExperience } from '../../types';

// ─── Section Card Component (defined outside to maintain stable reference) ───
const SectionCard = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
  <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: '#F0EDFF' }}>
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-800 font-outfit">{title}</h3>
    </div>
    {children}
  </div>
);

export const StudentProfile = () => {
  const [profile, setProfile] = useState<StudentProfileType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // ─── Form State ───
  // Personal Information
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [bio, setBio] = useState('');

  // Academic Information
  const [institutionName, setInstitutionName] = useState('');
  const [gpa, setGpa] = useState<number | ''>('');
  const [currentYear, setCurrentYear] = useState<number | ''>('');
  const [expectedGraduation, setExpectedGraduation] = useState('');
  const [coursesCompleted, setCoursesCompleted] = useState('');

  // Skills & Certifications (display)
  const [skillsText, setSkillsText] = useState('');
  const [certsText, setCertsText] = useState('');

  // Work Experience
  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>([]);
  const [newWork, setNewWork] = useState<WorkExperience>({ company: '', role: '', duration: '', description: '' });

  // Career Interests
  const [preferredIndustries, setPreferredIndustries] = useState('');
  const [careerGoals, setCareerGoals] = useState('');
  const [extracurriculars, setExtracurriculars] = useState('');

  // ─── Load Profile ───
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const data = await studentService.getProfile();
      setProfile(data);
      populateForm(data);
    } catch (error: any) {
      notify.error(error.message || 'Failed to load profile.');
    } finally {
      setIsLoading(false);
    }
  };

  const populateForm = (data: StudentProfileType) => {
    setFullName(data.full_name || '');
    setPhoneNumber(data.phone_number || '');
    setDateOfBirth(data.date_of_birth || '');
    setBio(data.bio || '');
    setInstitutionName(data.institution_name || '');
    setGpa(data.gpa ?? '');
    setCurrentYear(data.current_year ?? '');
    setExpectedGraduation(data.expected_graduation || '');
    setCoursesCompleted(data.courses_completed || '');
    setPreferredIndustries(data.preferred_industries || '');
    setCareerGoals(data.career_goals || '');
    setExtracurriculars(data.extracurricular_activities || '');
    // Skills display text
    if (data.skills && data.skills.length > 0) {
      setSkillsText(data.skills.map((s: any) => s.name).join(', '));
    }
    // Certifications display text
    if (data.certifications && data.certifications.length > 0) {
      setCertsText(data.certifications.map((c: any) => c.name).join(', '));
    }
    // Work experiences
    if (data.work_experiences) {
      setWorkExperiences(data.work_experiences);
    }
  };

  // ─── Save Profile ───
  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const dataToUpdate: Record<string, any> = {
        full_name: fullName,
        bio: bio || null,
        phone_number: phoneNumber || null,
        date_of_birth: dateOfBirth || null,
        institution_name: institutionName || null,
        gpa: gpa !== '' ? Number(gpa) : 0,
        current_year: currentYear !== '' ? Number(currentYear) : 1,
        expected_graduation: expectedGraduation || null,
        courses_completed: coursesCompleted || null,
        preferred_industries: preferredIndustries || null,
        career_goals: careerGoals || null,
        extracurricular_activities: extracurriculars || null,
      };

      const updatedProfile = await studentService.updateProfile(dataToUpdate);
      setProfile(updatedProfile);
      populateForm(updatedProfile);
      notify.success('Profile saved successfully!');
    } catch (error: any) {
      notify.error(error.message || 'Failed to save profile.');
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Transcript Upload (click + drag & drop) ───
  const handleFileUpload = async (file: File) => {
    if (file.type !== 'application/pdf') {
      notify.error('Please upload a valid PDF document.');
      return;
    }
    setIsUploading(true);
    try {
      await studentService.uploadTranscript(file);
      notify.success('Transcript uploaded and parsed successfully!');
      fetchProfile();
    } catch (error: any) {
      notify.error(error.message || 'Failed to upload transcript.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  };

  // ─── Work Experience CRUD ───
  const handleAddWorkExperience = async () => {
    if (!newWork.company || !newWork.role) {
      notify.error('Please fill in company and role.');
      return;
    }
    try {
      const created = await studentService.addWorkExperience(newWork);
      setWorkExperiences([created, ...workExperiences]);
      setNewWork({ company: '', role: '', duration: '', description: '' });
      notify.success('Work experience added!');
      fetchProfile(); // Refresh profile strength
    } catch (error: any) {
      notify.error(error.message || 'Failed to add work experience.');
    }
  };

  const handleDeleteWorkExperience = async (id: string) => {
    try {
      await studentService.deleteWorkExperience(id);
      setWorkExperiences(workExperiences.filter(w => w.id !== id));
      notify.success('Work experience removed.');
      fetchProfile(); // Refresh profile strength
    } catch (error: any) {
      notify.error(error.message || 'Failed to delete work experience.');
    }
  };

  // ─── Loading State ───
  if (isLoading || !profile) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 animate-pulse" style={{ color: '#6C63FF' }}>
        <UserCircle size={48} className="animate-bounce" />
        <span className="text-xl font-bold font-outfit">Loading your profile...</span>
      </div>
    );
  }

  // ─── Profile Strength ───
  const strength = profile.profile_strength || { total: 0 };



  // ─── Reusable Input Styles ───
  const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/10 transition-all";
  const readOnlyClass = `${inputClass} cursor-default opacity-75 bg-slate-100`;
  const labelClass = "block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5";

  return (
    <div className="animate-fade-in pb-12 max-w-3xl mx-auto">
      {/* ─── Page Header ─── */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: '#6C63FF' }}>
            <UserCircle size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 font-outfit">Profile Management</h1>
            <p className="text-sm text-slate-500">Keep your profile up to date for better career matches</p>
          </div>
        </div>
        {/* Profile Strength Indicator */}
        <div className="text-right hidden sm:block">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Profile Strength</p>
          <div className="flex items-center gap-3">
            <div className="w-32 h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${strength.total}%`,
                  background: strength.total >= 70 ? '#22c55e' : strength.total >= 40 ? '#6C63FF' : '#f59e0b',
                }}
              />
            </div>
            <span className="text-sm font-bold" style={{ color: '#6C63FF' }}>{strength.total}% Complete</span>
          </div>
        </div>
      </div>

      {/* ─── Mobile Profile Strength ─── */}
      <div className="sm:hidden mb-6 bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase">Profile Strength</span>
          <span className="text-sm font-bold" style={{ color: '#6C63FF' }}>{strength.total}%</span>
        </div>
        <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${strength.total}%`,
              background: strength.total >= 70 ? '#22c55e' : strength.total >= 40 ? '#6C63FF' : '#f59e0b',
            }}
          />
        </div>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* ─── 1. Personal Information ─── */}
        <SectionCard icon={<span>👤</span>} title="Personal Information">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Aisha Johnson"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Email Address</label>
              <input
                type="email"
                value={profile.email || ''}
                readOnly
                placeholder="e.g. aisha@example.com"
                className={readOnlyClass}
              />
            </div>
            <div>
              <label className={labelClass}>Phone Number</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g. +1 555 000 0000"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Date of Birth</label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          <div className="mt-4">
            <label className={labelClass}>Bio / Personal Statement</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself, your interests, and aspirations..."
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>
        </SectionCard>

        {/* ─── 2. Academic Information ─── */}
        <SectionCard icon={<span>🎓</span>} title="Academic Information">
          <div className="space-y-4">
            <div>
              <label className={labelClass}>University / Institution</label>
              <input
                type="text"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                placeholder="e.g. University of Nairobi"
                className={inputClass}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Student ID</label>
                <input
                  type="text"
                  value={profile.reg_number || ''}
                  readOnly
                  placeholder="e.g. STU-20240001"
                  className={readOnlyClass}
                />
              </div>
              <div>
                <label className={labelClass}>Program</label>
                <input
                  type="text"
                  value={profile.program || ''}
                  readOnly
                  placeholder="e.g. Computer Science"
                  className={readOnlyClass}
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Current GPA (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={gpa}
                  onChange={(e) => setGpa(e.target.value ? Number(e.target.value) : '')}
                  placeholder="e.g. 85.5"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Academic Year</label>
                <select
                  value={currentYear}
                  onChange={(e) => setCurrentYear(Number(e.target.value))}
                  className={inputClass}
                >
                  <option value="">Select Year</option>
                  {[...Array(7)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>Year {i + 1}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Expected Graduation</label>
                <input
                  type="date"
                  value={expectedGraduation}
                  onChange={(e) => setExpectedGraduation(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Courses / Subjects Completed</label>
              <textarea
                value={coursesCompleted}
                onChange={(e) => setCoursesCompleted(e.target.value)}
                placeholder="e.g. Data Structures, Operating Systems, Database Systems, Linear Algebra"
                rows={2}
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>
        </SectionCard>

        {/* ─── 3. Skills & Certifications ─── */}
        <SectionCard icon={<span>✨</span>} title="Skills & Certifications">
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Skills</label>
              {/* Skills pill display */}
              {profile.skills && profile.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {profile.skills.map((skill: any) => (
                    <span
                      key={skill.id}
                      className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1"
                      style={{ background: '#F0EDFF', color: '#6C63FF' }}
                    >
                      <Star size={12} /> {skill.name}
                      {skill.proficiency_level && (
                        <span className="text-[10px] opacity-70 ml-1">Lv.{skill.proficiency_level}</span>
                      )}
                    </span>
                  ))}
                </div>
              )}
              <input
                type="text"
                value={skillsText}
                onChange={(e) => setSkillsText(e.target.value)}
                placeholder="e.g. Python, SQL, Machine Learning, Communication"
                className={inputClass}
              />
              <p className="text-xs text-slate-400 mt-1">Separate each skill with a comma for best results.</p>
            </div>
            <div>
              <label className={labelClass}>Certifications</label>
              {/* Certifications pill display */}
              {profile.certifications && profile.certifications.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {profile.certifications.map((cert: any) => (
                    <span
                      key={cert.id}
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{ background: '#ECFDF5', color: '#059669' }}
                    >
                      {cert.name} ({cert.status})
                    </span>
                  ))}
                </div>
              )}
              <input
                type="text"
                value={certsText}
                onChange={(e) => setCertsText(e.target.value)}
                placeholder="e.g. AWS Cloud Practitioner, Google Data Analytics"
                className={inputClass}
              />
            </div>
          </div>
        </SectionCard>

        {/* ─── 4. Work Experience ─── */}
        <SectionCard icon={<span>💼</span>} title="Work Experience">
          {/* Existing entries */}
          {workExperiences.length > 0 && (
            <div className="space-y-3 mb-6">
              {workExperiences.map((exp) => (
                <div key={exp.id} className="flex items-start justify-between bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{exp.role} <span className="text-slate-400 font-normal">at</span> {exp.company}</p>
                    {exp.duration && <p className="text-xs text-slate-500 mt-0.5">{exp.duration}</p>}
                    {exp.description && <p className="text-xs text-slate-600 mt-1">{exp.description}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => exp.id && handleDeleteWorkExperience(exp.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors p-1"
                    title="Remove"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add new entry form */}
          <div className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Company / Organization</label>
                <input
                  type="text"
                  value={newWork.company}
                  onChange={(e) => setNewWork({ ...newWork, company: e.target.value })}
                  placeholder="e.g. Andela"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Role / Position</label>
                <input
                  type="text"
                  value={newWork.role}
                  onChange={(e) => setNewWork({ ...newWork, role: e.target.value })}
                  placeholder="e.g. Software Engineering Intern"
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Duration</label>
              <input
                type="text"
                value={newWork.duration}
                onChange={(e) => setNewWork({ ...newWork, duration: e.target.value })}
                placeholder="e.g. Jan 2023 – Dec 2023"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea
                value={newWork.description}
                onChange={(e) => setNewWork({ ...newWork, description: e.target.value })}
                placeholder="Describe your key responsibilities and achievements..."
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </div>
            <button
              type="button"
              onClick={handleAddWorkExperience}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-90"
              style={{ background: '#F0EDFF', color: '#6C63FF' }}
            >
              <Plus size={16} /> Add Experience
            </button>
          </div>
        </SectionCard>

        {/* ─── 5. Career Interests ─── */}
        <SectionCard icon={<span>🎯</span>} title="Career Interests">
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Preferred Fields</label>
              <input
                type="text"
                value={preferredIndustries}
                onChange={(e) => setPreferredIndustries(e.target.value)}
                placeholder="e.g. Artificial Intelligence, FinTech, Data Science"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Career Goals</label>
              <textarea
                value={careerGoals}
                onChange={(e) => setCareerGoals(e.target.value)}
                placeholder="Describe where you see yourself in 3-5 years and what you'd like to achieve..."
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </div>
            <div>
              <label className={labelClass}>Extracurricular Activities</label>
              <textarea
                value={extracurriculars}
                onChange={(e) => setExtracurriculars(e.target.value)}
                placeholder="e.g. Robotics Club President, Hackathon participant, Community volunteer..."
                rows={2}
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>
        </SectionCard>

        {/* ─── 6. Academic Transcript Upload ─── */}
        <SectionCard icon={<span>📄</span>} title="Academic Transcript">
          <p className="text-sm text-slate-500 mb-4">
            Upload your latest academic transcript (PDF). Emmerence AI will parse it and enrich your profile.
          </p>
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
              isDragOver
                ? 'border-[#6C63FF] bg-[#F0EDFF]'
                : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".pdf"
              id="transcript-upload"
              className="hidden"
              onChange={handleFileInputChange}
              disabled={isUploading}
            />
            <label htmlFor="transcript-upload" className="cursor-pointer flex flex-col items-center">
              {isUploading ? (
                <Upload size={36} className="mb-3 animate-bounce" style={{ color: '#6C63FF' }} />
              ) : (
                <FileText size={36} className="mb-3 text-slate-400" />
              )}
              <span className="text-sm font-semibold" style={{ color: '#6C63FF' }}>
                {isUploading ? 'Parsing transcript...' : 'Drag & drop or click to upload PDF'}
              </span>
              <span className="text-xs text-slate-400 mt-1">Supported: PDF • Max size: 5MB</span>
            </label>
          </div>
          {profile.transcript_uploaded && (
            <div className="mt-4 flex items-center gap-2 text-sm" style={{ color: '#22c55e' }}>
              <Shield size={16} />
              <span className="font-medium">Transcript uploaded and parsed</span>
            </div>
          )}
          {/* Parsed transcript text preview */}
          {profile.transcript_text && (
            <div className="mt-6">
              <h4 className={labelClass}>Parsed Transcript</h4>
              <pre className="bg-slate-50 border border-slate-200 rounded-xl p-4 overflow-auto max-h-64 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                {profile.transcript_text}
              </pre>
            </div>
          )}
        </SectionCard>

        {/* ─── Footer ─── */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-400 flex items-center gap-1.5">
            <Shield size={14} /> Your data is encrypted and private
          </p>
          <Button
            type="submit"
            className="!rounded-xl !px-8 !py-3 !text-sm !font-semibold"
            isLoading={isSaving}
            leftIcon={<Save className="w-4 h-4" />}
            style={{ background: '#6C63FF', color: '#fff', border: 'none', boxShadow: '0 4px 14px rgba(108, 99, 255, 0.3)' }}
          >
            Save Profile
          </Button>
        </div>
      </form>
    </div>
  );
};
