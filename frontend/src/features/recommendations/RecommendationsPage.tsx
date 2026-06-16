import { useState, useEffect } from 'react';
import { Card, Button } from '../../components';
import { studentService } from '../../services';
import { notify } from '../../lib/toast';
import { Brain, FileDown, Share2, Sparkles, Star, TrendingUp, AlertCircle, ChevronDown } from 'lucide-react';
import { Recommendation } from '../../types';

export const RecommendationsPage = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [advisors, setAdvisors] = useState<{ id: string; email: string }[]>([]);
  const [selectedAdvisorId, setSelectedAdvisorId] = useState<string>('');
  const [showShareDropdown, setShowShareDropdown] = useState(false);

  useEffect(() => {
    fetchRecommendations();
    fetchAdvisors();
  }, []);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
      const response = await studentService.getRecommendations();
      setRecommendations(response.results || response || []);
    } catch (error: any) {
      notify.error(error.message || 'Failed to load recommendations.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAdvisors = async () => {
    try {
      const data = await studentService.getAdvisors();
      setAdvisors(data || []);
      if (data && data.length > 0) setSelectedAdvisorId(data[0].id);
    } catch {
      // silently fail
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await studentService.exportRecommendationsPdf();
      notify.success('PDF Exported Successfully!');
    } catch (error: any) {
      notify.error(error.message || 'Failed to export PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    if (!selectedAdvisorId) {
      notify.error('Please select an advisor to share with.');
      return;
    }
    setIsSharing(true);
    try {
      const result = await studentService.shareReport(selectedAdvisorId);
      notify.success(result.message || 'Report shared with your advisor!');
      setShowShareDropdown(false);
    } catch (error: any) {
      notify.error(error.message || 'Failed to share report.');
    } finally {
      setIsSharing(false);
    }
  };

  const toggleFavorite = async (careerId: string) => {
    try {
      await studentService.toggleFavoriteCareer(careerId);
      notify.success('Favorites updated!');
      // Optimistic update could go here, but for now we just show a toast.
    } catch (error: any) {
      notify.error(error.message || 'Failed to update favorites.');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#146C94] font-outfit">AI Career Recommendations</h2>
          <p className="text-slate-500 text-sm mt-1">
            Personalized career clusters based on your skills, transcript, and assessments.
          </p>
        </div>
        
        <div className="flex gap-3 items-end">
          {/* Share with Advisor Dropdown */}
          <div className="relative">
            <Button 
              variant="secondary"
              onClick={() => setShowShareDropdown(!showShareDropdown)}
              isLoading={isSharing}
              leftIcon={<Share2 size={16} />}
            >
              Share with Advisor <ChevronDown size={14} className={`ml-1 transition-transform ${showShareDropdown ? 'rotate-180' : ''}`} />
            </Button>
            {showShareDropdown && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl p-4 z-50 animate-fade-in">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Select Advisor</p>
                <select
                  value={selectedAdvisorId}
                  onChange={(e) => setSelectedAdvisorId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 mb-3 focus:outline-none focus:border-[#19A7CE]"
                >
                  {advisors.map((a) => (
                    <option key={a.id} value={a.id}>{a.email}</option>
                  ))}
                </select>
                <Button
                  onClick={handleShare}
                  isLoading={isSharing}
                  className="w-full bg-[#146C94] hover:bg-[#19A7CE] text-sm"
                  leftIcon={<Share2 size={14} />}
                >
                  Share Report
                </Button>
              </div>
            )}
          </div>
          <Button 
            onClick={handleExport}
            isLoading={isExporting}
            className="bg-[#146C94] hover:bg-[#19A7CE]"
            leftIcon={<FileDown size={16} />}
          >
            Export PDF
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4 text-[#19A7CE] animate-pulse">
          <Brain size={48} className="animate-bounce" />
          <span className="text-xl font-bold font-outfit">Analyzing your profile...</span>
        </div>
      ) : recommendations.length === 0 ? (
        <Card className="border border-dashed border-slate-300 bg-transparent shadow-none p-12 text-center flex flex-col items-center justify-center">
          <AlertCircle className="w-12 h-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-bold text-slate-600">No Recommendations Yet</h3>
          <p className="text-slate-500 mt-2 max-w-md">
            Please complete your profile, upload a transcript, or take the career assessment to generate recommendations.
          </p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((rec) => (
            <Card key={rec.career_id} className="flex flex-col border-slate-200 shadow-sm hover:shadow-md transition-shadow group h-full relative">
              <button 
                onClick={() => toggleFavorite(rec.career_id.toString())}
                className="absolute top-4 right-4 text-slate-300 hover:text-amber-400 transition-colors"
              >
                <Star size={20} />
              </button>
              
              <div className="flex-1">
                <div className="flex justify-between items-start mb-4 pr-8">
                  <div className="p-3 bg-[#19A7CE]/10 rounded-xl text-[#146C94]">
                    <Sparkles size={24} />
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-[#146C94] font-outfit mb-1">
                  {rec.title}
                </h3>
                <h4 className="text-sm font-semibold text-slate-500 mb-4 font-mono">O*NET: {rec.onet_code}</h4>
                
                <div className="mb-6">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-sm font-bold text-slate-600">Match Score</span>
                    <span className="text-lg font-bold text-[#19A7CE]">{rec.match_percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#19A7CE] h-full rounded-full transition-all duration-500" 
                      style={{ width: `${rec.match_percentage}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {rec.total_missing > 0 ? (
                    <div className="bg-rose-50 border border-rose-100 rounded-xl p-3">
                      <div className="text-xs text-rose-700 font-bold uppercase tracking-wider mb-2">Skill Gaps ({rec.total_missing})</div>
                      <div className="flex flex-wrap gap-1">
                        {rec.missing_skills.slice(0, 3).map((skill, idx) => (
                          <span key={idx} className="bg-white border border-rose-200 text-rose-600 rounded px-2 py-0.5 text-[10px] font-medium">
                            {skill}
                          </span>
                        ))}
                        {rec.missing_skills.length > 3 && (
                          <span className="text-[10px] text-rose-500 font-medium px-1">+{rec.missing_skills.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
                      <span className="text-xs text-emerald-700 font-bold">Perfect Match! No skill gaps detected.</span>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-2">
                      <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Education</div>
                      <div className="text-xs font-semibold text-slate-600 line-clamp-1">{rec.required_education || 'N/A'}</div>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-2">
                      <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Experience</div>
                      <div className="text-xs font-semibold text-slate-600 line-clamp-1">{rec.work_experience || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end">
                <Button 
                  variant="secondary"
                  className="py-1.5 px-3 text-xs h-auto flex items-center gap-1 w-full justify-center"
                >
                  View Learning Path <TrendingUp size={14} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
