import { useState, useEffect } from 'react';
import { Card, Button } from '../../components';
import { studentService } from '../../services';
import { notify } from '../../lib/toast';
import { Scale, Check, X as XIcon, ExternalLink, ChevronRight, GraduationCap, Briefcase, Award, AlertTriangle, Clock } from 'lucide-react';
import { Recommendation } from '../../types';

export const CareerComparison = () => {
  const [careers, setCareers] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCareer, setExpandedCareer] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const recs = await studentService.getRecommendations();
      const top2 = (recs.results || recs).slice(0, 2);
      if (top2.length > 0) {
        setCareers(top2);
      }
    } catch (error: any) {
      notify.error(error.message || 'Failed to load comparison data.');
    } finally {
      setIsLoading(false);
    }
  };

  const openOnetProfile = (onetCode: string) => {
    window.open(`https://www.onetonline.org/link/summary/${onetCode}`, '_blank', 'noopener,noreferrer');
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
        {careers.map((career, idx) => {
          const isExpanded = expandedCareer === career.career_id;
          const accentColor = idx === 0 ? '#19A7CE' : '#10b981';
          const accentBg = idx === 0 ? 'bg-[#19A7CE]' : 'bg-emerald-500';
          const accentBgLight = idx === 0 ? 'bg-[#19A7CE]/5' : 'bg-emerald-50';
          const accentBorder = idx === 0 ? 'border-[#19A7CE]/30' : 'border-emerald-500/30';
          const accentBorderLight = idx === 0 ? 'border-[#19A7CE]/20' : 'border-emerald-200';
          const accentText = idx === 0 ? 'text-[#146C94]' : 'text-emerald-800';

          return (
            <div key={career.career_id} className="flex flex-col gap-0">
              <Card className={`border-2 ${accentBorder} shadow-md flex flex-col`}>
                {/* Header */}
                <div className={`p-6 -mt-6 -mx-6 mb-6 border-b rounded-t-xl ${accentBgLight} ${accentBorderLight}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 font-mono tracking-wider">O*NET: {career.onet_code}</span>
                      <h3 className={`text-2xl font-bold font-outfit mt-1 ${accentText}`}>
                        {career.title}
                      </h3>
                    </div>
                    <div className={`px-3 py-1.5 rounded-lg text-sm font-bold ${accentBg} text-white`}>
                      {career.match_percentage}% Match
                    </div>
                  </div>
                </div>

                <div className="space-y-6 flex-1">
                  {/* Requirements */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 border-b border-slate-100 pb-2 flex items-center gap-2">
                      <GraduationCap size={14} className="text-slate-400" />
                      Standards
                    </h4>
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
                    <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 border-b border-slate-100 pb-2 flex items-center gap-2">
                      <AlertTriangle size={14} className="text-slate-400" />
                      Skill Gaps
                    </h4>
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
                              <XIcon size={16} className="text-rose-400 shrink-0 mt-0.5" />
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
                    <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 border-b border-slate-100 pb-2 flex items-center gap-2">
                      <Award size={14} className="text-slate-400" />
                      Top Certification
                    </h4>
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

                {/* View Full Profile Button */}
                <div className="mt-8 pt-4 border-t border-slate-100 space-y-3">
                  <Button
                    onClick={() => setExpandedCareer(isExpanded ? null : career.career_id)}
                    variant="secondary"
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <ChevronRight size={16} className={`transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
                    {isExpanded ? 'Hide Details' : 'View Full Profile'}
                  </Button>
                  <button
                    onClick={() => openOnetProfile(career.onet_code)}
                    className="w-full text-xs text-slate-400 hover:text-[#19A7CE] transition-colors flex items-center justify-center gap-1.5 py-1"
                  >
                    <ExternalLink size={12} />
                    Open on O*NET OnLine
                  </button>
                </div>
              </Card>

              {/* Expanded Detail Panel */}
              {isExpanded && (
                <div className={`border-2 border-t-0 ${accentBorder} rounded-b-xl bg-slate-50 p-6 animate-fade-in -mt-2`}>
                  <h4 className="text-sm font-bold text-[#146C94] uppercase tracking-wider mb-4">Full Career Profile</h4>

                  <div className="grid grid-cols-1 gap-4">
                    {/* Education Detail */}
                    <div className="bg-white rounded-xl p-4 border border-slate-100">
                      <div className="flex items-center gap-2 mb-2">
                        <GraduationCap size={16} className="text-sky-500" />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Education Required</span>
                      </div>
                      <p className="text-sm text-slate-700 font-medium">{career.required_education || 'Not specified'}</p>
                    </div>

                    {/* Work Experience */}
                    <div className="bg-white rounded-xl p-4 border border-slate-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Briefcase size={16} className="text-emerald-500" />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Work Experience</span>
                      </div>
                      <p className="text-sm text-slate-700 font-medium">{career.work_experience || 'No prior experience required'}</p>
                    </div>

                    {/* On-the-job Training */}
                    <div className="bg-white rounded-xl p-4 border border-slate-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock size={16} className="text-amber-500" />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">On-the-Job Training</span>
                      </div>
                      <p className="text-sm text-slate-700 font-medium">{career.on_the_job_training || 'Not specified'}</p>
                    </div>

                    {/* All Missing Skills */}
                    {career.missing_skills.length > 0 && (
                      <div className="bg-white rounded-xl p-4 border border-rose-100">
                        <div className="flex items-center gap-2 mb-3">
                          <AlertTriangle size={16} className="text-rose-500" />
                          <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">All Missing Skills ({career.total_missing})</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {career.missing_skills.map((skill, i) => (
                            <span key={i} className="px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-medium">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* All Certifications */}
                    {career.recommended_certs && career.recommended_certs.length > 0 && (
                      <div className="bg-white rounded-xl p-4 border border-slate-100">
                        <div className="flex items-center gap-2 mb-3">
                          <Award size={16} className="text-violet-500" />
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recommended Certifications</span>
                        </div>
                        <div className="space-y-2">
                          {career.recommended_certs.map((cert) => (
                            <div key={cert.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                              <div>
                                <p className="text-sm font-semibold text-[#146C94]">{cert.name}</p>
                                <p className="text-xs text-slate-500">{cert.provider}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Match Breakdown */}
                    <div className="bg-white rounded-xl p-4 border border-slate-100">
                      <div className="flex items-center gap-2 mb-3">
                        <Scale size={16} style={{ color: accentColor }} />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Match Analysis</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-500">Compatibility</span>
                            <span className="font-bold" style={{ color: accentColor }}>{career.match_percentage}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${career.match_percentage}%`, backgroundColor: accentColor }}
                            />
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 mt-3">
                        Based on cosine-similarity analysis between your verified skills vector and the O*NET career skills matrix.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => openOnetProfile(career.onet_code)}
                    className="mt-4 w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90"
                    style={{ backgroundColor: accentColor }}
                  >
                    <ExternalLink size={16} />
                    View Complete O*NET Profile
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
