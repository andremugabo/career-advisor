import { useState, useEffect } from 'react';
import { Card } from '../../components';
import { studentService } from '../../services';
import { notify } from '../../lib/toast';
import { Brain, BookOpen, Award, AlertCircle } from 'lucide-react';
import { StudentProfile } from '../../types';

export const SkillsCerts = () => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  if (isLoading || !profile) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-[#146C94] animate-pulse">
        <Brain size={48} className="animate-bounce" />
        <span className="text-xl font-bold font-outfit">Loading your skills matrix...</span>
      </div>
    );
  }

  const hasSkills = profile.skills && profile.skills.length > 0;

  return (
    <div className="space-y-8 animate-fade-in pb-12 max-w-5xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold text-[#146C94] font-outfit">Skills & Certifications</h2>
        <p className="text-slate-500 text-sm mt-1">
          Your verified competency matrix used by our AI to match you with career clusters.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Skills Card */}
        <Card className="border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <div className="p-2.5 rounded-xl bg-[#19A7CE]/10 text-[#146C94]">
              <BookOpen size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#146C94] font-outfit">Verified Skills</h3>
              <p className="text-xs text-slate-400">Mapped academic and professional competencies</p>
            </div>
          </div>

          <div className="flex-1">
            {!hasSkills ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <AlertCircle className="w-12 h-12 text-slate-300 mb-3" />
                <h4 className="text-sm font-bold text-slate-600">No Skills Mapped Yet</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Please speak to your career advisor to map your competencies to your profile for accurate AI recommendations.
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, idx) => (
                  <span 
                    key={idx} 
                    className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium shadow-sm hover:border-[#19A7CE] transition-colors cursor-default"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Certifications Card */}
        <Card className="border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <Award size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#146C94] font-outfit">Certifications</h3>
              <p className="text-xs text-slate-400">Professional industry certifications achieved</p>
            </div>
          </div>

          <div className="flex-1">
            <div className="h-full flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <Award className="w-12 h-12 text-slate-300 mb-3" />
              <h4 className="text-sm font-bold text-slate-600">No Certifications Recorded</h4>
              <p className="text-xs text-slate-500 mt-1">
                You have not registered any external certifications yet. To record a certification, please present your certificate of completion to the administration.
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-8 bg-[#19A7CE]/5 border border-[#19A7CE]/20 rounded-2xl p-6 flex gap-4">
        <Brain className="w-8 h-8 text-[#19A7CE] shrink-0" />
        <div>
          <h4 className="text-sm font-bold text-[#146C94]">How are these used?</h4>
          <p className="text-sm text-slate-600 mt-1 leading-relaxed">
            Emmerence AI calculates cosine-similarity vectors between your <span className="font-semibold">Verified Skills</span> and over 904 industry career clusters from the O*NET database. Keeping your skills up-to-date ensures your career recommendations and internship matches are highly accurate.
          </p>
        </div>
      </div>
    </div>
  );
};
