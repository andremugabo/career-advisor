import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Search, GraduationCap, AlertTriangle,
  ArrowUpRight, Award, Brain, Code, X, User, Filter, AlertCircle, Sparkles, Send
} from 'lucide-react';
import { advisorService } from '../../services';
import { Card, Button } from '../../components';
import { notify } from '../../lib/toast';

export default function AdvisorDashboard() {
  const [students, setStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any | null>(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('All');
  const [minGpa, setMinGpa] = useState<number>(0);

  // Modal / Detail state
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [studentRecs, setStudentRecs] = useState<any[]>([]);
  const [selectedCareer, setSelectedCareer] = useState<any | null>(null);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);

  // Intervention Modal state
  const [showInterventionModal, setShowInterventionModal] = useState(false);
  const [interventionStudent, setInterventionStudent] = useState<any | null>(null);
  const [interventionType, setInterventionType] = useState('Academic Counseling');
  const [interventionNotes, setInterventionNotes] = useState('');
  const [isSubmittingIntervention, setIsSubmittingIntervention] = useState(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const studentResponse = await advisorService.getStudents();
        const studentList = studentResponse.results || studentResponse;
        setStudents(studentList);
        setFilteredStudents(studentList);

        // Fetch system-wide analytics from apps/advisors/views.py endpoint
        const analyticsData = await advisorService.getAnalytics();
        setAnalytics(analyticsData);
      } catch (err: any) {
        notify.error('Failed to load dashboard data.');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter logic
  useEffect(() => {
    let result = students;

    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (s) =>
          s.full_name.toLowerCase().includes(term) ||
          s.reg_number.toLowerCase().includes(term)
      );
    }

    if (selectedProgram !== 'All') {
      result = result.filter((s) => s.program === selectedProgram);
    }

    if (minGpa > 0) {
      result = result.filter((s) => s.gpa >= minGpa);
    }

    setFilteredStudents(result);
  }, [searchTerm, selectedProgram, minGpa, students]);

  // Open detail panel / modal
  const handleViewStudentAI = async (student: any) => {
    setSelectedStudent(student);
    setIsLoadingRecs(true);
    setStudentRecs([]);
    setSelectedCareer(null);

    try {
      const recs = await advisorService.getStudentRecommendations(student.id);
      setStudentRecs(recs);
      if (recs && recs.length > 0) {
        setSelectedCareer(recs[0]);
      }
    } catch (err: any) {
      notify.error(`Failed to load AI recommendations for ${student.full_name}`);
    } finally {
      setIsLoadingRecs(false);
    }
  };

  const handleLogInterventionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interventionStudent) return;
    if (!interventionNotes.trim()) {
      notify.error('Please enter guidance notes.');
      return;
    }

    setIsSubmittingIntervention(true);
    try {
      await advisorService.logIntervention({
        student: interventionStudent.id,
        intervention_type: interventionType,
        notes: interventionNotes
      });
      notify.success(`Academic intervention successfully logged for ${interventionStudent.full_name}.`);
      setShowInterventionModal(false);
      setInterventionNotes('');
    } catch (err: any) {
      notify.error(err.message || 'Failed to record intervention.');
    } finally {
      setIsSubmittingIntervention(false);
    }
  };

  // Get distinct programs for dropdown filter
  const distinctPrograms = Array.from(new Set(students.map((s) => s.program).filter(Boolean)));

  // Calculate dynamic fallback stats if backend analytics fails
  const totalStudentsCount = students.length;
  const averageGpa = totalStudentsCount > 0 
    ? (students.reduce((acc, curr) => acc + (curr.gpa || 0), 0) / totalStudentsCount).toFixed(1)
    : '0.0';

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-[#146C94] animate-pulse">
        <Brain size={48} className="animate-bounce" />
        <span className="text-xl font-bold font-outfit">Loading Advisor Channel...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header section */}
      <div>
        <h2 className="text-3xl font-bold text-[#146C94] font-outfit">Advisor Oversight Dashboard</h2>
        <p className="text-slate-500 text-sm mt-1">
          Monitor academic profiles, skills, and AI career compatibility recommendations for all guided students.
        </p>
      </div>

      {/* Metrics Widgets */}
      <div className="grid sm:grid-cols-3 gap-6">
        <Card className="flex items-center gap-5 border-slate-200 shadow-sm p-6 bg-white">
          <div className="p-4 rounded-2xl bg-[#19A7CE]/10 text-[#146C94]">
            <User size={28} />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Students</div>
            <div className="text-3xl font-extrabold text-[#146C94] font-outfit mt-1">
              {analytics?.total_students ?? totalStudentsCount}
            </div>
          </div>
        </Card>

        <Card className="flex items-center gap-5 border-slate-200 shadow-sm p-6 bg-white">
          <div className="p-4 rounded-2xl bg-[#AFD3E2]/20 text-[#146C94]">
            <GraduationCap size={28} />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Average GPA</div>
            <div className="text-3xl font-extrabold text-[#146C94] font-outfit mt-1">
              {analytics ? `${analytics.average_gpa}%` : `${averageGpa}%`}
            </div>
          </div>
        </Card>

        <Card className="flex items-center gap-5 border-slate-200 shadow-sm p-6 bg-white">
          <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-600">
            <Brain size={28} />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">AI Profiles Mapped</div>
            <div className="text-3xl font-extrabold text-emerald-600 font-outfit mt-1">
              {students.filter(s => s.skills?.length > 0).length}
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="border-slate-200 shadow-sm bg-white">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name or Registration ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full glass-input"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-slate-400" />
              <span className="text-sm text-slate-500 font-medium">Program:</span>
              <select
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="glass-input bg-white text-sm py-1.5 focus:outline-none"
              >
                <option value="All">All Programs</option>
                {distinctPrograms.map((prog: any, idx) => (
                  <option key={idx} value={prog}>
                    {prog}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500 font-medium">Min GPA:</span>
              <select
                value={minGpa}
                onChange={(e) => setMinGpa(Number(e.target.value))}
                className="glass-input bg-white text-sm py-1.5 focus:outline-none"
              >
                <option value="0">Any GPA</option>
                <option value="50">50% +</option>
                <option value="70">70% +</option>
                <option value="80">80% +</option>
                <option value="90">90% +</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Two Column Command Center Layout */}
      <div className="grid lg:grid-cols-[2.2fr_1fr] gap-8">
        {/* Left Column: Student List Table */}
        <Card className="border-slate-200 shadow-sm overflow-hidden p-0 bg-white">
          {filteredStudents.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-medium flex flex-col items-center justify-center gap-3">
              <AlertTriangle size={32} className="text-slate-300" />
              No student records match the search parameters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-4 pl-6 text-xs text-slate-400 font-bold uppercase tracking-wider">Student Details</th>
                    <th className="p-4 text-xs text-slate-400 font-bold uppercase tracking-wider">Program</th>
                    <th className="p-4 text-xs text-slate-400 font-bold uppercase tracking-wider">GPA</th>
                    <th className="p-4 text-xs text-slate-400 font-bold uppercase tracking-wider">Top AI Recommendations</th>
                    <th className="p-4 pr-6 text-xs text-slate-400 font-bold uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50/55 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="font-bold text-[#146C94] text-base">{student.full_name}</div>
                        <div className="text-xs text-slate-400 mt-0.5">Reg ID: {student.reg_number}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-medium text-slate-700">{student.program || 'N/A'}</div>
                        <div className="text-xs text-slate-400 mt-0.5">Year: {student.current_year}</div>
                      </td>
                      <td className="p-4">
                        <span className={`text-sm font-bold ${student.gpa >= 80 ? 'text-emerald-600' : student.gpa >= 65 ? 'text-[#19A7CE]' : 'text-amber-600'}`}>
                          {student.gpa || 0}%
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1.5">
                          {student.top_recommendations && student.top_recommendations.length > 0 ? (
                            student.top_recommendations.slice(0, 2).map((rec: any, idx: number) => (
                              <span key={idx} className="bg-[#19A7CE]/10 text-[#146C94] rounded-full px-2.5 py-0.5 text-[11px] font-bold">
                                {rec.title} ({rec.match_percentage}%)
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400 italic">Run analysis</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            onClick={() => handleViewStudentAI(student)}
                            className="bg-[#146C94] hover:bg-[#19A7CE] text-white px-3 py-1.5 text-xs h-auto inline-flex items-center gap-1"
                          >
                            AI Profile <ArrowUpRight size={12} />
                          </Button>
                          <Button
                            onClick={() => {
                              setInterventionStudent(student);
                              setShowInterventionModal(true);
                            }}
                            className="bg-[#AFD3E2]/25 text-[#146C94] hover:bg-[#146C94]/15 px-3 py-1.5 text-xs h-auto inline-flex items-center border border-[#AFD3E2]/50"
                          >
                            Intervene
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Right Column: System-wide Analytics Panel & Gaps */}
        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm bg-white p-6">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-[#146C94] font-outfit flex items-center gap-1.5">
                <Sparkles className="w-5 h-5 text-[#19A7CE]" /> System Skill Gaps
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Most common missing skills among all students</p>
            </div>
            
            {analytics?.top_missing && analytics.top_missing.length > 0 ? (
              <div className="space-y-4 mt-2">
                {analytics.top_missing.map((item: any, idx: number) => {
                  const percentage = analytics.total_students > 0 
                    ? Math.round((item.count / analytics.total_students) * 100) 
                    : 0;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-700 capitalize">{item.name}</span>
                        <span className="text-[#19A7CE]">{item.count} students ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-[#19A7CE] h-full rounded-full transition-all duration-500" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs italic bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                No system-wide gap analytics computed yet. Run AI matching profiles.
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Drill-down student analysis modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#F8F1F1] w-full max-w-5xl rounded-3xl h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in border border-slate-200">
            {/* Modal Header */}
            <div className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <Brain className="w-8 h-8 text-[#19A7CE]" />
                <div>
                  <h3 className="text-xl font-bold text-[#146C94] font-outfit">Student AI Diagnostic Profile</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Student: <span className="font-semibold text-slate-500">{selectedStudent.full_name}</span> | Reg ID: {selectedStudent.reg_number}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {isLoadingRecs ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-[#19A7CE] py-12">
                  <Brain size={42} className="animate-spin" />
                  <span className="text-lg font-bold font-outfit">Triggering AI Engine...</span>
                </div>
              ) : studentRecs.length === 0 ? (
                <div className="text-center py-12 text-slate-400 flex flex-col items-center justify-center gap-3">
                  <AlertCircle size={40} className="text-amber-500" />
                  <div>
                    <h4 className="font-bold text-slate-600">No Student Skills Mapped</h4>
                    <p className="text-sm mt-1">This student has not registered any verified skills yet. Please record student skills in the Admin panel to compute vector compatibility.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Row 1: Brief Profile Card & Similarity Chart */}
                  <div className="grid md:grid-cols-[1fr_1.5fr] gap-6">
                    <Card className="flex flex-col justify-between shadow-sm bg-white border border-slate-200 p-6">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <span className="bg-[#19A7CE]/15 text-[#146C94] px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                            Academic Profile
                          </span>
                          <span className="text-emerald-600 font-bold text-xs">{selectedStudent.gpa}% GPA</span>
                        </div>
                        <h4 className="text-lg font-bold text-[#146C94]">{selectedStudent.full_name}</h4>
                        <div className="text-xs text-slate-400 mt-0.5">Program: {selectedStudent.program} (Year {selectedStudent.current_year})</div>
                        
                        <h5 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-6 mb-2">Verified Student Skills</h5>
                        <div className="flex flex-wrap gap-1">
                          {selectedStudent.skills?.map((skill: string, idx: number) => (
                            <span key={idx} className="bg-slate-100 text-slate-600 border border-slate-200 rounded px-2 py-0.5 text-[10px] font-medium">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mt-6 flex items-center gap-2 bg-[#AFD3E2]/15 p-3.5 rounded-xl">
                        <Brain size={16} className="text-[#19A7CE] shrink-0" />
                        <span className="text-[10px] text-[#146C94] leading-relaxed font-medium">
                          Comparing with 904 industry career clusters compiled from O*NET database.
                        </span>
                      </div>
                    </Card>

                    {/* Compatibility Chart */}
                    <Card className="shadow-sm bg-white border border-slate-200 p-6">
                      <div className="mb-4">
                        <h4 className="text-base font-bold text-[#146C94] font-outfit">AI Vector Compatibility Matrix</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Cosine-similarity mapping percentage</p>
                      </div>
                      <div className="h-[180px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={studentRecs.map(r => ({
                              name: r.title.length > 20 ? r.title.substring(0, 18) + '...' : r.title,
                              Compatibility: r.match_percentage
                            })).reverse()}
                            layout="vertical"
                            margin={{ left: 5, right: 20, top: 0, bottom: 0 }}
                          >
                            <XAxis type="number" stroke="#94a3b8" fontSize={10} domain={[0, 100]} unit="%" />
                            <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={115} />
                            <Tooltip
                              contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: 11 }}
                            />
                            <Bar dataKey="Compatibility" fill="#19A7CE" radius={[0, 4, 4, 0]} barSize={16} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </Card>
                  </div>

                  {/* Row 2: Selected Career Drill Down */}
                  <div className="grid md:grid-cols-[1fr_1.8fr] gap-6">
                    {/* Left Recommendation selection */}
                    <div className="flex flex-col gap-3">
                      <h4 className="text-sm font-bold text-[#146C94] font-outfit">Recommended Careers</h4>
                      {studentRecs.map((rec) => {
                        const isSelected = selectedCareer?.career_id === rec.career_id;
                        return (
                          <div
                            key={rec.career_id}
                            onClick={() => setSelectedCareer(rec)}
                            className={`p-4 rounded-2xl cursor-pointer border transition-all duration-300 ${
                              isSelected
                                ? 'border-[#19A7CE] bg-[#19A7CE]/5 shadow-sm'
                                : 'border-slate-200 bg-white hover:border-[#19A7CE]/50'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <span className="text-[10px] text-slate-400 font-mono">{rec.onet_code}</span>
                                <h5 className="font-bold text-[#146C94] text-sm mt-0.5">{rec.title}</h5>
                              </div>
                              <span className={`px-2 py-1 rounded text-xs font-bold ${
                                isSelected ? 'bg-[#19A7CE] text-white' : 'bg-slate-100 text-slate-500'
                              }`}>
                                {rec.match_percentage}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Right In-depth Drill Down details */}
                    {selectedCareer && (
                      <Card className="shadow-sm bg-white border border-slate-200 p-6 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-4">
                            <div>
                              <h4 className="text-xl font-bold text-[#146C94]">{selectedCareer.title}</h4>
                              <span className="text-xs text-slate-400 mt-0.5">O*NET Code: {selectedCareer.onet_code}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Match</span>
                              <div className="text-2xl font-bold text-[#19A7CE]">{selectedCareer.match_percentage}%</div>
                            </div>
                          </div>

                          {/* Gaps */}
                          <div className="mb-6">
                            <h5 className="text-sm font-bold text-[#146C94] mb-3 flex items-center gap-1.5">
                              <Code size={16} className="text-[#19A7CE]" />
                              Competency Gaps & Skill-Gap Analysis
                            </h5>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3.5">
                                <div className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider mb-2">✓ Matched Skills</div>
                                <div className="space-y-1">
                                  {selectedStudent.skills?.filter((s: string) => !selectedCareer.missing_skills.some((ms: string) => ms.toLowerCase() === s.toLowerCase())).slice(0, 3).map((skill: string, idx: number) => (
                                    <div key={idx} className="text-xs text-emerald-900 font-medium">✓ {skill}</div>
                                  ))}
                                  {selectedStudent.skills?.filter((s: string) => !selectedCareer.missing_skills.some((ms: string) => ms.toLowerCase() === s.toLowerCase())).length === 0 && (
                                    <div className="text-xs text-emerald-600 italic">None matched</div>
                                  )}
                                </div>
                              </div>

                              <div className="bg-rose-50 border border-rose-100 rounded-xl p-3.5">
                                <div className="text-[10px] text-rose-700 font-bold uppercase tracking-wider mb-2">⚠ Gaps ({selectedCareer.total_missing})</div>
                                <div className="space-y-1">
                                  {selectedCareer.missing_skills.slice(0, 3).map((skill: string, idx: number) => (
                                    <div key={idx} className="text-xs text-rose-900 font-medium">⚠ {skill}</div>
                                  ))}
                                  {selectedCareer.missing_skills.length === 0 && (
                                    <div className="text-xs text-rose-600 italic">No missing skills!</div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Industry Metrics */}
                          <div className="border-t border-slate-100 pt-5 mb-6">
                            <h5 className="text-sm font-bold text-[#146C94] mb-3 flex items-center gap-1.5">
                              <GraduationCap size={16} className="text-[#19A7CE]" />
                              O*NET Preparation Standards
                            </h5>
                            <div className="grid grid-cols-3 gap-3">
                              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                                <div className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mb-1">Education</div>
                                <div className="text-[11px] text-slate-600 font-semibold">{selectedCareer.required_education || 'N/A'}</div>
                              </div>
                              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                                <div className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mb-1">Experience</div>
                                <div className="text-[11px] text-slate-600 font-semibold">{selectedCareer.work_experience || 'N/A'}</div>
                              </div>
                              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                                <div className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mb-1">Training</div>
                                <div className="text-[11px] text-slate-600 font-semibold">{selectedCareer.on_the_job_training || 'N/A'}</div>
                              </div>
                            </div>
                          </div>

                          {/* Certs */}
                          <div className="border-t border-slate-100 pt-5">
                            <h5 className="text-sm font-bold text-[#146C94] mb-3 flex items-center gap-1.5">
                              <Award size={16} className="text-[#19A7CE]" />
                              Recommended Certification Pathway
                            </h5>
                            {selectedCareer.recommended_certs && selectedCareer.recommended_certs.length > 0 ? (
                              <div className="space-y-2">
                                {selectedCareer.recommended_certs.slice(0, 2).map((cert: any) => (
                                  <div key={cert.id} className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between text-xs hover:border-[#19A7CE] transition-colors">
                                    <div>
                                      <div className="font-bold text-[#146C94]">{cert.name}</div>
                                      <div className="text-[10px] text-slate-400 mt-0.5">Provider: {cert.provider}</div>
                                    </div>
                                    <span className="text-[10px] text-[#19A7CE] font-bold">Recommended</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-xs text-slate-400 italic bg-slate-50 rounded-xl p-4 text-center border border-dashed border-slate-200">
                                No certifications registered for this career cluster.
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-end mt-6 pt-4 border-t border-slate-100">
                          <Button
                            onClick={() => {
                              notify.success(`Advising report generated for ${selectedStudent.full_name}`);
                              setSelectedStudent(null);
                            }}
                            className="bg-[#146C94] hover:bg-[#19A7CE] text-white flex items-center gap-1 text-sm py-2"
                          >
                            Approve Advising Report <ArrowUpRight size={14} />
                          </Button>
                        </div>
                      </Card>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Interactive Intervention Logging Modal */}
      {showInterventionModal && interventionStudent && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-fade-in">
            {/* Header */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-[#146C94]" />
                <div>
                  <h3 className="text-lg font-bold text-[#146C94] font-outfit">Log Academic Intervention</h3>
                  <p className="text-xs text-slate-400">Student: {interventionStudent.full_name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowInterventionModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleLogInterventionSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Intervention Type
                </label>
                <select
                  value={interventionType}
                  onChange={(e) => setInterventionType(e.target.value)}
                  className="w-full glass-input bg-white text-sm focus:outline-none"
                >
                  <option value="Academic Counseling">Academic Counseling</option>
                  <option value="Skills Training Recommended">Skills Training Recommended</option>
                  <option value="Career Track Updated">Career Track Updated</option>
                  <option value="Email Warning Sent">Email Warning Sent</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Detailed Counselor Notes
                </label>
                <textarea
                  value={interventionNotes}
                  onChange={(e) => setInterventionNotes(e.target.value)}
                  placeholder="Enter specific actions, guidance, recommended courses, or behavioral feedback to guide this student..."
                  rows={5}
                  className="w-full glass-input text-sm p-3 focus:outline-none resize-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  onClick={() => setShowInterventionModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 text-sm h-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={isSubmittingIntervention}
                  className="bg-[#146C94] hover:bg-[#19A7CE] text-white px-4 py-2 text-sm h-auto flex items-center gap-1.5"
                >
                  <Send size={14} /> Record Intervention
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
