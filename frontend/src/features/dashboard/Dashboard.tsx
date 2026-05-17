import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  GraduationCap, LogOut, CheckCircle, AlertTriangle, BookOpen,
  ArrowUpRight, Award, Brain, Code, AlertCircle
} from 'lucide-react';
import { apiFetch } from '../../api/client';

interface CareerRec {
  career_id: number;
  onet_code: string;
  title: string;
  match_percentage: number;
  missing_skills: string[];
  total_missing: number;
  recommended_certs: { id: string; name: string; provider: string }[];
  required_education: string;
  work_experience: string;
  on_the_job_training: string;
}

interface StudentProfile {
  id: string;
  reg_number: string;
  full_name: string;
  gpa: number;
  program: string;
  current_year: number;
  skills: string[];
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<CareerRec[]>([]);
  const [selectedCareer, setSelectedCareer] = useState<CareerRec | null>(null);
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      setIsLoading(true);
      setError(null);
      try {
        const [profileData, recsData] = await Promise.all([
          apiFetch<StudentProfile>('/profiles/me/'),
          apiFetch<CareerRec[]>('/recommendations/')
        ]);
        setStudent(profileData);
        setRecommendations(recsData);
        if (recsData.length > 0) {
          setSelectedCareer(recsData[0]);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to connect to Emmerence AI services.');
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="app-container animate-pulse" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px' }}>
        <Brain size={48} className="animate-bounce" color="var(--color-indigo)" style={{ animationDuration: '2s' }} />
        <span style={{ fontSize: '1.2rem', color: '#ffffff', fontWeight: 600 }}>Securing AI Vector Channels...</span>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Mapping competency profiles to O*NET databases</span>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="app-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div className="glass-card animate-fade-in" style={{ maxWidth: '500px', width: '100%', padding: '40px', textAlign: 'center', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
          <AlertCircle size={48} color="var(--color-rose)" style={{ marginBottom: '20px', display: 'inline-block' }} />
          <h2 style={{ fontSize: '1.6rem', color: '#ffffff', marginBottom: '8px' }}>Connection Failure</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '24px' }}>{error || 'Student profile could not be loaded.'}</p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button className="btn-primary" onClick={() => window.location.reload()}>Retry Handshake</button>
            <button style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: '#ffffff', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer' }} onClick={handleLogout}>Log Out</button>
          </div>
        </div>
      </div>
    );
  }

  // Recharts visual formatting
  const chartData = recommendations.map(rec => ({
    name: rec.title.length > 22 ? rec.title.substring(0, 20) + "..." : rec.title,
    Compatibility: rec.match_percentage,
    fill: rec.match_percentage > 10 ? '#6366f1' : rec.match_percentage > 5 ? '#a855f7' : '#9ca3af'
  })).reverse();

  return (
    <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation Bar */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 40px',
        borderBottom: '1px solid var(--glass-border)',
        backdropFilter: 'blur(20px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--color-indigo) 0%, var(--color-purple) 100%)',
            padding: '8px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Brain size={24} color="#ffffff" />
          </div>
          <span style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'Outfit', color: '#ffffff' }}>
            Emmerence AI
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#ffffff' }}>{student.full_name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{student.program} • Year {student.current_year}</div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid rgba(244, 63, 94, 0.2)',
              color: 'var(--color-rose)',
              padding: '10px',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease'
            }}
            title="Log Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      {/* Main Layout Grid */}
      <main className="main-content animate-fade-in" style={{ padding: '40px', flex: 1 }}>
        
        {/* Row 1: Profile Summary & Matching Overview Chart */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.5fr',
          gap: '30px',
          marginBottom: '30px'
        }}>
          {/* Student Profile Card */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <span style={{
                  background: 'rgba(99, 102, 241, 0.1)',
                  color: 'var(--color-indigo)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}>Student Profile</span>
                <span style={{ color: 'var(--color-emerald)', fontWeight: 600, fontSize: '0.9rem' }}>{student.gpa}% GPA</span>
              </div>
              <h2 style={{ fontSize: '1.8rem', color: '#ffffff', marginBottom: '4px' }}>{student.full_name}</h2>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>Reg ID: {student.reg_number}</div>
              
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                Verified Competency Skills ({student.skills.length})
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
                {student.skills.map((skill, idx) => (
                  <span key={idx} style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px',
                    padding: '4px 10px',
                    fontSize: '0.8rem',
                    color: '#ffffff'
                  }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(168, 85, 247, 0.05)', border: '1px solid rgba(168, 85, 247, 0.1)', padding: '12px', borderRadius: '12px' }}>
              <Brain size={20} color="var(--color-purple)" />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Matching with O*NET Standard databases compiled across 902 total industrial careers.
              </span>
            </div>
          </div>

          {/* Recharts Recommendation Chart */}
          <div className="glass-card" style={{ minHeight: '320px' }}>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.3rem', color: '#ffffff' }}>AI Compatibility Matching Chart</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Top recommended careers sorted by vector similarity percentages</p>
            </div>
            <div style={{ width: '100%', height: '220px' }}>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30, top: 0, bottom: 0 }}>
                    <XAxis type="number" stroke="var(--text-muted)" fontSize={11} domain={[0, 15]} unit="%" />
                    <YAxis dataKey="name" type="category" stroke="var(--text-muted)" fontSize={11} width={130} />
                    <Tooltip
                      contentStyle={{ background: '#12131a', border: '1px solid var(--glass-border)', borderRadius: '10px', color: '#fff' }}
                      itemStyle={{ color: 'var(--color-indigo)' }}
                    />
                    <Bar dataKey="Compatibility" radius={[0, 6, 6, 0]} barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                  No match vectors resolved. Add more student skills.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Row 2: Selected Career Match In-depth Drill Down */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '30px' }}>
          
          {/* Left List of Careers */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#ffffff', marginBottom: '4px' }}>Top AI Recommended Pathways</h3>
            {recommendations.map((rec) => {
              const isSelected = selectedCareer?.career_id === rec.career_id;
              return (
                <div
                  key={rec.career_id}
                  onClick={() => setSelectedCareer(rec)}
                  className="glass-card"
                  style={{
                    padding: '20px',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(99, 102, 241, 0.08)' : 'var(--glass-bg)',
                    borderColor: isSelected ? 'var(--color-indigo)' : 'var(--glass-border)',
                    boxShadow: isSelected ? 'var(--glow-indigo)' : 'none',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1, paddingRight: '12px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                        {rec.onet_code}
                      </span>
                      <h4 style={{ color: '#ffffff', fontSize: '1.05rem', margin: '4px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {rec.title}
                      </h4>
                    </div>
                    <div style={{
                      background: isSelected ? 'var(--color-indigo)' : 'rgba(255,255,255,0.05)',
                      color: '#ffffff',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      fontWeight: 600
                    }}>
                      {rec.match_percentage}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Career Deep-Dive: Skill Gaps and Courses */}
          {selectedCareer ? (
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--glass-border)', paddingBottom: '20px', marginBottom: '24px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.5rem', color: '#ffffff' }}>{selectedCareer.title}</h3>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>O*NET Code: {selectedCareer.onet_code}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Overall Compatibility</div>
                    <div style={{ fontSize: '1.8rem', color: 'var(--color-indigo)', fontWeight: 700 }}>
                      {selectedCareer.match_percentage}%
                    </div>
                  </div>
                </div>

                {/* Skill Gap Analysis Section */}
                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '1rem', color: '#ffffff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Code size={18} color="var(--color-indigo)" />
                    Skill-Gap & Competency Evaluation
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    {/* Matched Competencies */}
                    <div style={{ background: 'rgba(16, 185, 129, 0.04)', border: '1px solid rgba(16, 185, 129, 0.1)', borderRadius: '12px', padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-emerald)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '12px' }}>
                        <CheckCircle size={16} />
                        Your Matches
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {student.skills.filter(s => !selectedCareer.missing_skills.some(ms => ms.toLowerCase() === s.toLowerCase())).slice(0, 4).map((skill, idx) => (
                          <div key={idx} style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>✓ {skill}</div>
                        ))}
                        {student.skills.filter(s => !selectedCareer.missing_skills.some(ms => ms.toLowerCase() === s.toLowerCase())).length === 0 && (
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No exact skill overlaps resolved.</div>
                        )}
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '4px' }}>+ verified competencies</div>
                      </div>
                    </div>

                    {/* Skill Gaps */}
                    <div style={{ background: 'rgba(244, 63, 94, 0.04)', border: '1px solid rgba(244, 63, 94, 0.1)', borderRadius: '12px', padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-rose)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '12px' }}>
                        <AlertTriangle size={16} />
                        Identified Gaps ({selectedCareer.total_missing} missing)
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {selectedCareer.missing_skills.slice(0, 4).map((skill, idx) => (
                          <div key={idx} style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>⚠ {skill.toLowerCase()}</div>
                        ))}
                        {selectedCareer.missing_skills.length > 4 && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '4px' }}>
                            + {selectedCareer.total_missing - 4} more missing skills
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Industry Prep Metrics (Excel parsed!) */}
                <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '24px', marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '1rem', color: '#ffffff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <GraduationCap size={18} color="var(--color-indigo)" />
                    Industry Standards & Preparation Profile
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.05em' }}>Required Education</div>
                      <div style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 600, lineHeight: 1.3 }}>{selectedCareer.required_education}</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.05em' }}>Work Experience</div>
                      <div style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 600, lineHeight: 1.3 }}>{selectedCareer.work_experience}</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.05em' }}>On-The-Job Training</div>
                      <div style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 600, lineHeight: 1.3 }}>{selectedCareer.on_the_job_training}</div>
                    </div>
                  </div>
                </div>

                {/* Course Recommendation Pathway (FR-07) */}
                <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '24px' }}>
                  <h4 style={{ fontSize: '1rem', color: '#ffffff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Award size={18} color="var(--color-purple)" />
                    Targeted Certification Pathway (FR-07 Bridge)
                  </h4>

                  {selectedCareer.recommended_certs.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {selectedCareer.recommended_certs.map((cert) => (
                        <div key={cert.id} style={{
                          background: 'rgba(168, 85, 247, 0.04)',
                          border: '1px solid rgba(168, 85, 247, 0.15)',
                          borderRadius: '12px',
                          padding: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, paddingRight: '12px' }}>
                            <div style={{
                              background: 'rgba(168, 85, 247, 0.1)',
                              padding: '10px',
                              borderRadius: '10px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <BookOpen size={20} color="var(--color-purple)" />
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#ffffff' }}>{cert.name}</div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Provider: {cert.provider}</div>
                            </div>
                          </div>
                          <a href="#" onClick={(e) => e.preventDefault()} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            color: 'var(--color-purple)',
                            textDecoration: 'none',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            transition: 'opacity 0.2s'
                          }} className="hover-fade">
                            Enroll
                            <ArrowUpRight size={16} />
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px dashed var(--glass-border)',
                      borderRadius: '12px',
                      padding: '24px',
                      textAlign: 'center',
                      color: 'var(--text-secondary)',
                      fontSize: '0.9rem'
                    }}>
                      No target certifications registered for this career cluster. Please consult academic advisors.
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Save Advising Record
                  <ArrowUpRight size={16} />
                </button>
              </div>

            </div>
          ) : (
            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              Select a career cluster to review recommendations.
            </div>
          )}

        </div>

      </main>
    </div>
  );
}
