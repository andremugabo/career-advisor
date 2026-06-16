import { useState, useEffect } from 'react';
import { Card } from '../../components';
import { studentService } from '../../services';
import { skillService } from '../../services';
import { notify } from '../../lib/toast';
import { Brain, BookOpen, Award, AlertCircle, Search, Plus, Star, Trash2 } from 'lucide-react';
import { StudentProfile, Skill } from '../../types';

const PROFICIENCY_LEVELS = [
  { value: 'Beginner', label: 'Beginner', color: 'bg-slate-100 text-slate-600 border-slate-200' },
  { value: 'Intermediate', label: 'Intermediate', color: 'bg-sky-100 text-sky-700 border-sky-200' },
  { value: 'Advanced', label: 'Advanced', color: 'bg-violet-100 text-violet-700 border-violet-200' },
  { value: 'Expert', label: 'Expert', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
];

export const SkillsCerts = () => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Manual skill entry state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Skill[]>([]);
  const [selectedSkillId, setSelectedSkillId] = useState<number | null>(null);
  const [proficiency, setProficiency] = useState('Beginner');
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const data = await studentService.getProfile();
      setProfile(data);
    } catch (error: any) {
      notify.error(error.message || 'Failed to load skills matrix.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setIsSearching(true);
    try {
      const results = await skillService.searchSkills(searchTerm);
      setSearchResults(results);
      if (results.length === 0) {
        notify.error('No skills found. Try different keywords.');
      }
    } catch (e) {
      notify.error('Error searching skills');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddSkill = async () => {
    if (!selectedSkillId || !proficiency) return;
    setIsAdding(true);
    try {
      await skillService.addMySkill(selectedSkillId, proficiency);
      notify.success('Skill added to your profile!');
      fetchProfile();
      setSearchTerm('');
      setSearchResults([]);
      setSelectedSkillId(null);
      setProficiency('Beginner');
    } catch (e) {
      notify.error('Failed to add skill');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteSkill = async (skillId: number) => {
    try {
      await skillService.deleteMySkill(skillId);
      notify.success('Skill removed');
      fetchProfile();
    } catch (e) {
      notify.error('Failed to delete skill');
    }
  };

  if (isLoading || !profile) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-[#146C94] animate-pulse">
        <Brain size={48} className="animate-bounce" />
        <span className="text-xl font-bold font-outfit">Loading your skills matrix...</span>
      </div>
    );
  }

  const hasSkills = profile.skills && profile.skills.length > 0;
  const hasVerifiedSkills = profile.verified_competency_skills && profile.verified_competency_skills.length > 0;
  const hasCerts = profile.certifications && profile.certifications.length > 0;

  const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#19A7CE] focus:ring-2 focus:ring-[#19A7CE]/10 transition-all";

  return (
    <div className="space-y-8 animate-fade-in pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-[#19A7CE]/10 flex items-center justify-center">
          <BookOpen className="w-6 h-6 text-[#19A7CE]" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-[#146C94] font-outfit">Skills & Certifications</h2>
          <p className="text-slate-500 text-sm mt-1">
            Your verified competency matrix used by our AI to match you with career clusters.
          </p>
        </div>
      </div>

      {/* Add New Skill Section */}
      <Card className="border-[#19A7CE]/20 bg-gradient-to-br from-white to-sky-50/30">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-xl bg-[#19A7CE]/10">
            <Plus size={20} className="text-[#19A7CE]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#146C94] font-outfit">Add a Skill</h3>
            <p className="text-xs text-slate-400">Search from the global skills database and add it to your profile.</p>
          </div>
        </div>

        {/* Step 1: Search */}
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="e.g. Python, Data Analysis, SQL..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className={`${inputClass} pl-10`}
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching || !searchTerm.trim()}
            className="px-5 py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
            style={{ background: '#19A7CE' }}
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Step 2: Select skill & proficiency */}
        {searchResults.length > 0 && (
          <div className="space-y-4 p-4 bg-white rounded-xl border border-slate-100 animate-fade-in">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Select Skill</label>
                <select
                  value={selectedSkillId ?? ''}
                  onChange={(e) => setSelectedSkillId(Number(e.target.value))}
                  className={inputClass}
                >
                  <option value="">Choose from results...</option>
                  {searchResults.map((skill) => (
                    <option key={skill.id} value={skill.id}>
                      {skill.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Proficiency Level</label>
                <select
                  value={proficiency}
                  onChange={(e) => setProficiency(e.target.value)}
                  className={inputClass}
                >
                  {PROFICIENCY_LEVELS.map((level) => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={handleAddSkill}
              disabled={!selectedSkillId || isAdding}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: '#146C94' }}
            >
              {isAdding ? (
                <span className="animate-pulse">Adding skill...</span>
              ) : (
                <>
                  <Plus size={16} /> Add to My Profile
                </>
              )}
            </button>
          </div>
        )}
      </Card>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Skills Card */}
        <Card className="border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <div className="p-2.5 rounded-xl bg-[#19A7CE]/10 text-[#146C94]">
              <Star size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#146C94] font-outfit">Your Skills</h3>
              <p className="text-xs text-slate-400">Skills added to your profile</p>
            </div>
          </div>

          <div className="flex-1">
            {!hasSkills ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <AlertCircle className="w-12 h-12 text-slate-300 mb-3" />
                <h4 className="text-sm font-bold text-slate-600">No Skills Added</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Use the search above to add skills to your profile.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {profile.skills.map((skill: any) => (
                  <div
                    key={skill.id}
                    className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-[#19A7CE]/30 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#19A7CE]/10 flex items-center justify-center">
                        <Star size={14} className="text-[#19A7CE]" />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-slate-700">{skill.name}</span>
                        {skill.proficiency_level && (
                          <span className="ml-2 text-[10px] font-bold text-slate-400 uppercase">
                            Lv.{skill.proficiency_level}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteSkill(skill.id)}
                      className="text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                      title="Remove skill"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Verified Competencies Card */}
        <Card className="border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <div className="p-2.5 rounded-xl bg-violet-50 text-violet-600">
              <BookOpen size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#146C94] font-outfit">Verified Competencies</h3>
              <p className="text-xs text-slate-400">Academic & professional competencies mapped by your advisor</p>
            </div>
          </div>

          <div className="flex-1">
            {!hasVerifiedSkills ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <AlertCircle className="w-12 h-12 text-slate-300 mb-3" />
                <h4 className="text-sm font-bold text-slate-600">No Verified Skills Mapped</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Please speak to your career advisor to map your competencies for accurate AI recommendations.
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.verified_competency_skills.map((skill: any) => (
                  <span
                    key={skill.id}
                    className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-medium shadow-sm hover:border-violet-300 hover:bg-violet-50 transition-all flex items-center gap-2"
                  >
                    {skill.name}
                    {skill.category && (
                      <span className="ml-1 text-[10px] text-slate-400 font-medium">({skill.category})</span>
                    )}
                  </span>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Certifications Section */}
      <Card className="border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <Award size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#146C94] font-outfit">Certifications</h3>
            <p className="text-xs text-slate-400">Professional industry certifications achieved</p>
          </div>
        </div>

        {!hasCerts ? (
          <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <Award className="w-12 h-12 text-slate-300 mb-3" />
            <h4 className="text-sm font-bold text-slate-600">No Certifications Recorded</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              You have not registered any external certifications yet. To record a certification, please present your certificate of completion to the administration.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {profile.certifications.map((cert: any) => (
              <div
                key={cert.id}
                className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl hover:shadow-sm transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Award size={16} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{cert.name}</p>
                    {cert.issuer && <p className="text-xs text-slate-500 mt-0.5">{cert.issuer}</p>}
                    {cert.status && (
                      <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                        {cert.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* AI Info Banner */}
      <div className="bg-gradient-to-r from-[#19A7CE]/5 to-[#146C94]/5 border border-[#19A7CE]/20 rounded-2xl p-6 flex gap-4">
        <Brain className="w-8 h-8 text-[#19A7CE] shrink-0" />
        <div>
          <h4 className="text-sm font-bold text-[#146C94]">How are these used?</h4>
          <p className="text-sm text-slate-600 mt-1 leading-relaxed">
            Emmerence AI calculates cosine-similarity vectors between your <span className="font-semibold">Skills</span> and over 904 industry career clusters from the O*NET database. Keeping your skills up-to-date ensures your career recommendations and internship matches are highly accurate.
          </p>
        </div>
      </div>
    </div>
  );
};
