import { useState, useEffect } from 'react';
import { Card, Button } from '../../components';
import { studentService } from '../../services';
import { notify } from '../../lib/toast';
import { Scale, Check, X } from 'lucide-react';
import { Recommendation } from '../../types';

export const CareerComparison = () => {
  const [careers, setCareers] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // In a real flow, the user would select careers to compare. 
      // We automatically select the top 2 for demonstration.
      const recs = await studentService.getRecommendations();
      const top2 = (recs.results || recs).slice(0, 2);
      
      if (top2.length > 0) {
        // Technically the backend has a /careers/compare/ endpoint that takes ids
        // We'll simulate its output using the recommendation data we already have
        setCareers(top2);
      }
    } catch (error: any) {
      notify.error(error.message || 'Failed to load comparison data.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-[#19A7CE] animate-pulse">
        <Scale size={48} className="animate-bounce" />
        <span className="text-xl font-bold font-outfit">Analyzing career metrics...</span>
      </div>
    );
  }

  if (careers.length < 2) {
    return (
      <div className="max-w-4xl mx-auto mt-8 animate-fade-in text-center py-20">
        <h2 className="text-2xl font-bold text-slate-700 mb-2">Not enough data to compare</h2>
        <p className="text-slate-500">You need at least 2 recommended careers to use the comparison tool.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-8 animate-fade-in pb-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold font-outfit text-[#146C94] flex items-center gap-3">
            <Scale className="w-8 h-8 text-[#19A7CE]" />
            Career Comparison
          </h2>
          <p className="text-slate-500 mt-2">
            Side-by-side analysis of your top AI-recommended pathways.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {careers.map((career, idx) => (
          <Card key={career.career_id} className={`border-2 ${idx === 0 ? 'border-[#19A7CE]/30' : 'border-emerald-500/30'} shadow-md`}>
            {/* Header */}
            <div className={`p-6 -mt-6 -mx-6 mb-6 border-b rounded-t-xl ${idx === 0 ? 'bg-[#19A7CE]/5 border-[#19A7CE]/20' : 'bg-emerald-50 border-emerald-200'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 font-mono tracking-wider">O*NET: {career.onet_code}</span>
                  <h3 className={`text-2xl font-bold font-outfit mt-1 ${idx === 0 ? 'text-[#146C94]' : 'text-emerald-800'}`}>
                    {career.title}
                  </h3>
                </div>
                <div className={`px-3 py-1.5 rounded-lg text-sm font-bold ${idx === 0 ? 'bg-[#19A7CE] text-white' : 'bg-emerald-500 text-white'}`}>
                  {career.match_percentage}% Match
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Requirements */}
              <div>
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 border-b border-slate-100 pb-2">Standards</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Education:</span>
                    <span className="font-semibold text-slate-700 text-right w-1/2">{career.required_education || 'Bachelors'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Experience:</span>
                    <span className="font-semibold text-slate-700 text-right w-1/2">{career.work_experience || 'None'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Training:</span>
                    <span className="font-semibold text-slate-700 text-right w-1/2">{career.on_the_job_training || 'Moderate term'}</span>
                  </div>
                </div>
              </div>

              {/* Skills Analysis */}
              <div>
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 border-b border-slate-100 pb-2">Skill Gaps</h4>
                {career.total_missing === 0 ? (
                  <div className="bg-emerald-50 text-emerald-700 p-3 rounded-lg flex items-center gap-2 text-sm font-medium">
                    <Check size={16} /> Profile fully matches required skills
                  </div>
                ) : (
                  <div>
                    <div className="text-xs text-rose-600 font-bold mb-2">Missing {career.total_missing} Key Skills:</div>
                    <ul className="space-y-2">
                      {career.missing_skills.slice(0, 5).map((skill, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                          <X size={16} className="text-rose-400 shrink-0 mt-0.5" />
                          {skill}
                        </li>
                      ))}
                      {career.missing_skills.length > 5 && (
                        <li className="text-xs text-slate-400 italic pl-6">
                          + {career.missing_skills.length - 5} more...
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              {/* Certifications */}
              <div>
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 border-b border-slate-100 pb-2">Top Certification</h4>
                {career.recommended_certs && career.recommended_certs.length > 0 ? (
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="font-semibold text-[#146C94] text-sm">{career.recommended_certs[0].name}</div>
                    <div className="text-xs text-slate-500 mt-1">{career.recommended_certs[0].provider}</div>
                  </div>
                ) : (
                  <span className="text-sm text-slate-400 italic">No specific certifications required</span>
                )}
              </div>
            </div>
            
            <div className="mt-8 pt-4 border-t border-slate-100">
               <Button className="w-full bg-slate-800 hover:bg-slate-900">View Full Profile</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
