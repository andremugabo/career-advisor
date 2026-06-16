import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  GraduationCap, CheckCircle, AlertTriangle, BookOpen,
  ArrowUpRight, Award, Brain, Code, AlertCircle
} from 'lucide-react';
import { studentService } from '../../services';
import { Card, Button } from '../../components';

export default function Dashboard() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [selectedCareer, setSelectedCareer] = useState<any | null>(null);
  const [student, setStudent] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingMocks, setIsUsingMocks] = useState(false);

  useEffect(() => {
    async function loadDashboardData() {
      setIsLoading(true);
      setIsUsingMocks(false);
      try {
        const [profileData, recsData] = await Promise.all([
          studentService.getProfile(),
          studentService.getRecommendations()
        ]);
        setStudent(profileData);
        setRecommendations(recsData.results || []);
        if (recsData.results?.length > 0) setSelectedCareer(recsData.results[0]);
      } catch (err: any) {
        setIsUsingMocks(true);
        // Fallback to beautiful mock data to prevent UI crash when endpoints fail
        setStudent({
          full_name: 'Alex Johnson',
          reg_number: '21005',
          gpa: 88,
          program: 'Software Engineering',
          current_year: 3,
          skills: ['Python', 'React', 'SQL', 'Django']
        });
        const mockRecs = [
          {
            career_id: '1', onet_code: '15-1252.00', title: 'Software Developer', match_percentage: 92,
            missing_skills: ['AWS', 'Docker'], total_missing: 2,
            required_education: 'Bachelor’s Degree', work_experience: 'None', on_the_job_training: 'None',
            recommended_certs: [{ id: '1', name: 'AWS Certified Developer', provider: 'Amazon' }]
          },
          {
            career_id: '2', onet_code: '15-1254.00', title: 'Web Developer', match_percentage: 85,
            missing_skills: ['TypeScript', 'Node.js'], total_missing: 2,
            required_education: 'Associate’s Degree', work_experience: 'None', on_the_job_training: 'None',
            recommended_certs: []
          }
        ];
        setRecommendations(mockRecs);
        setSelectedCareer(mockRecs[0]);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-[#146C94] animate-pulse">
        <Brain size={48} className="animate-bounce" />
        <span className="text-xl font-bold font-outfit">Securing AI Vector Channels...</span>
      </div>
    );
  }

  const chartData = recommendations.map(rec => ({
    name: rec.title.length > 22 ? rec.title.substring(0, 20) + "..." : rec.title,
    Compatibility: rec.match_percentage,
  })).reverse();

  return (
    <div className="space-y-8 animate-fade-in">
      {isUsingMocks && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-5 py-4 rounded-2xl flex items-center justify-between shadow-sm animate-fade-in shrink-0">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-amber-600 shrink-0 animate-pulse" size={24} />
            <div className="text-sm">
              <span className="font-bold">Offline Diagnostics Active:</span> The advisory system is currently unable to communicate with the Django AI engine. Displaying simulated local sandbox data.
            </div>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="text-xs font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 transition-colors px-3 py-1.5 rounded-lg border border-amber-300 shadow-sm whitespace-nowrap"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Row 1: Profile Summary & Matching Overview Chart */}
      <div className="grid lg:grid-cols-[1fr_1.5fr] gap-8">
        {/* Student Profile Card */}
        <Card className="flex flex-col justify-between shadow-sm border border-slate-200">
          <div>
            <div className="flex justify-between items-start mb-6">
              <span className="bg-[#19A7CE]/10 text-[#146C94] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Student Profile
              </span>
              <span className="text-emerald-600 font-bold text-sm">{student?.gpa}% GPA</span>
            </div>
            <h2 className="text-2xl font-bold text-[#146C94] mb-1">{student?.full_name}</h2>
            <div className="text-slate-500 text-sm mb-6">Reg ID: {student?.reg_number}</div>
            
            <h4 className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-3">
              Verified Competency Skills ({student?.skills?.length || 0})
            </h4>
            <div className="flex flex-wrap gap-2">
              {student?.skills?.map((skill: any, idx: number) => (
                <span key={idx} className="bg-slate-100 border border-slate-200 text-slate-600 rounded-md px-3 py-1 text-xs font-medium">
                  {typeof skill === 'string' ? skill : skill?.name}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-8 flex items-center gap-3 bg-[#AFD3E2]/20 p-4 rounded-xl">
            <Brain size={20} className="text-[#19A7CE] shrink-0" />
            <span className="text-xs text-[#146C94] font-medium leading-relaxed">
              Matching with O*NET Standard databases compiled across 902 total industrial careers.
            </span>
          </div>
        </Card>

        {/* Recharts Recommendation Chart */}
        <Card className="min-h-[320px] shadow-sm border border-slate-200">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-[#146C94] font-outfit">AI Compatibility Matching Chart</h3>
            <p className="text-slate-500 text-sm mt-1">Top recommended careers sorted by vector similarity percentages</p>
          </div>
          <div className="w-full h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30, top: 0, bottom: 0 }}>
                <XAxis type="number" stroke="#94a3b8" fontSize={11} domain={[0, 100]} unit="%" />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={130} />
                <Tooltip
                  contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#146C94', fontWeight: 'bold' }}
                  itemStyle={{ color: '#19A7CE' }}
                  cursor={{ fill: '#f1f5f9' }}
                />
                <Bar dataKey="Compatibility" fill="#19A7CE" radius={[0, 6, 6, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Row 2: Selected Career Match In-depth Drill Down */}
      <div className="grid lg:grid-cols-[1.2fr_1.8fr] gap-8">
        
        {/* Left List of Careers */}
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-bold text-[#146C94] font-outfit">Top AI Recommended Pathways</h3>
          {recommendations.map((rec) => {
            const isSelected = selectedCareer?.career_id === rec.career_id;
            return (
              <Card
                key={rec.career_id}
                onClick={() => setSelectedCareer(rec)}
                className={`cursor-pointer transition-all duration-300 ${
                  isSelected ? 'border-[#19A7CE] bg-[#19A7CE]/5 shadow-md shadow-[#19A7CE]/10' : 'border-slate-200 hover:border-[#19A7CE]/50 hover:shadow-sm'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1 pr-4">
                    <span className="text-xs text-slate-400 font-mono">{rec.onet_code}</span>
                    <h4 className="text-[#146C94] font-bold mt-1 text-lg">{rec.title}</h4>
                  </div>
                  <div className={`px-3 py-1.5 rounded-lg text-sm font-bold ${
                    isSelected ? 'bg-[#19A7CE] text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {rec.match_percentage}%
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Right Career Deep-Dive: Skill Gaps and Courses */}
        {selectedCareer ? (
          <Card className="flex flex-col justify-between border-slate-200 shadow-sm">
            <div>
              <div className="flex justify-between items-start border-b border-slate-100 pb-6 mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-[#146C94]">{selectedCareer.title}</h3>
                  <span className="text-sm text-slate-500 mt-1 inline-block">O*NET Code: {selectedCareer.onet_code}</span>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Compatibility</div>
                  <div className="text-3xl font-bold text-[#19A7CE] mt-1">{selectedCareer.match_percentage}%</div>
                </div>
              </div>

              {/* Skill Gap Analysis Section */}
              <div className="mb-8">
                <h4 className="text-lg font-bold text-[#146C94] mb-4 flex items-center gap-2">
                  <Code size={20} className="text-[#19A7CE]" />
                  Skill-Gap & Competency Evaluation
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {/* Matched Competencies */}
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5">
                    <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider mb-4">
                      <CheckCircle size={16} /> Your Matches
                    </div>
                    <div className="space-y-2">
                      {student?.skills?.filter((s: any) => {
                      const skillStr = typeof s === 'string' ? s : (s?.name ?? '');
                      return !selectedCareer.missing_skills.some((ms: string) => ms.toLowerCase() === skillStr.toLowerCase());
                    }).slice(0, 4).map((skill: any, idx: number) => (
                      <div key={idx} className="text-sm text-emerald-900 font-medium">✓ {typeof skill === 'string' ? skill : skill?.name}</div>
                    ))}
                    </div>
                  </div>

                  {/* Skill Gaps */}
                  <div className="bg-rose-50 border border-rose-100 rounded-xl p-5">
                    <div className="flex items-center gap-2 text-rose-700 font-bold text-xs uppercase tracking-wider mb-4">
                      <AlertTriangle size={16} /> Identified Gaps ({selectedCareer.total_missing})
                    </div>
                    <div className="space-y-2">
                      {selectedCareer.missing_skills.slice(0, 4).map((skill: string, idx: number) => (
                        <div key={idx} className="text-sm text-rose-900 font-medium flex items-center gap-1.5"><AlertTriangle size={12} /> {skill}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Industry Prep Metrics */}
              <div className="border-t border-slate-100 pt-8 mb-8">
                <h4 className="text-lg font-bold text-[#146C94] mb-4 flex items-center gap-2">
                  <GraduationCap size={20} className="text-[#19A7CE]" />
                  Industry Standards & Preparation Profile
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Education</div>
                    <div className="text-sm text-slate-700 font-semibold">{selectedCareer.required_education}</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Experience</div>
                    <div className="text-sm text-slate-700 font-semibold">{selectedCareer.work_experience}</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Training</div>
                    <div className="text-sm text-slate-700 font-semibold">{selectedCareer.on_the_job_training}</div>
                  </div>
                </div>
              </div>

              {/* Course Recommendation Pathway */}
              <div className="border-t border-slate-100 pt-8">
                <h4 className="text-lg font-bold text-[#146C94] mb-4 flex items-center gap-2">
                  <Award size={20} className="text-[#19A7CE]" />
                  Targeted Certification Pathway
                </h4>

                {selectedCareer.recommended_certs.length > 0 ? (
                  <div className="space-y-3">
                    {selectedCareer.recommended_certs.map((cert: any) => (
                      <div key={cert.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:border-[#19A7CE] transition-colors shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="bg-[#AFD3E2]/30 p-2.5 rounded-lg text-[#146C94]">
                            <BookOpen size={20} />
                          </div>
                          <div>
                            <div className="font-bold text-[#146C94]">{cert.name}</div>
                            <div className="text-xs text-slate-500 mt-0.5">Provider: {cert.provider}</div>
                          </div>
                        </div>
                        <Button variant="secondary" className="border-[#19A7CE] text-[#19A7CE] hover:bg-[#19A7CE] hover:text-white px-4 py-1.5 text-sm h-auto flex items-center gap-1.5">
                          Enroll <ArrowUpRight size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-6 text-center text-sm text-slate-500">
                    No target certifications registered for this career cluster. Please consult academic advisors.
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <Button className="bg-[#146C94] hover:bg-[#19A7CE] text-white flex items-center gap-2">
                Save Advising Record <ArrowUpRight size={16} />
              </Button>
            </div>
          </Card>
        ) : (
          <div className="bg-white border border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 font-medium">
            Select a career cluster to review recommendations.
          </div>
        )}
      </div>
    </div>
  );
}
