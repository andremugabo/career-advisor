import { useState, useEffect } from 'react';
import { Card, Button } from '../../components';
import { studentService } from '../../services';
import { notify } from '../../lib/toast';
import { Brain, Briefcase, GraduationCap, Award, TrendingUp } from 'lucide-react';

export const CareerVisualization = () => {
  const [pathData, setPathData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPath();
  }, []);

  const fetchPath = async () => {
    setIsLoading(true);
    try {
      // In a real app, the backend would return complex DAGs or timelines.
      // We assume a linear progression for this visualization.
      const response = await studentService.getCareerPathVisualization();
      
      // If backend returns nothing specific yet, we provide a structured mock based on their primary recommendation
      if (!response || Object.keys(response).length === 0) {
        const recs = await studentService.getRecommendations();
        const topRec = (recs.results || recs)[0];
        
        if (topRec) {
          setPathData({
            title: topRec.title,
            nodes: [
              { type: 'education', title: 'Academic Foundation', desc: topRec.required_education || 'BSc Degree', icon: GraduationCap, color: 'text-sky-600', bg: 'bg-sky-100', border: 'border-sky-200' },
              { type: 'entry', title: 'Entry Level Role', desc: `Junior ${topRec.title}`, icon: Briefcase, color: 'text-emerald-600', bg: 'bg-emerald-100', border: 'border-emerald-200' },
              { type: 'cert', title: 'Professional Certification', desc: topRec.recommended_certs?.[0]?.name || 'Industry Standard Cert', icon: Award, color: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-200' },
              { type: 'senior', title: 'Senior Position', desc: `Senior ${topRec.title}`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100', border: 'border-purple-200' }
            ]
          });
        }
      } else {
        setPathData(response);
      }
    } catch (error: any) {
      notify.error(error.message || 'Failed to load career path.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-[#19A7CE] animate-pulse">
        <Brain size={48} className="animate-bounce" />
        <span className="text-xl font-bold font-outfit">Mapping your career trajectory...</span>
      </div>
    );
  }

  if (!pathData) {
    return (
      <div className="max-w-4xl mx-auto mt-8 animate-fade-in text-center py-20">
        <h2 className="text-2xl font-bold text-slate-700 mb-2">No Career Path Available</h2>
        <p className="text-slate-500">Please complete the career assessment first.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 animate-fade-in pb-12">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold font-outfit text-[#146C94] flex items-center justify-center gap-3">
          <TrendingUp className="w-8 h-8 text-[#19A7CE]" />
          Career Trajectory: {pathData.title}
        </h2>
        <p className="text-slate-500 mt-2 max-w-xl mx-auto">
          Based on O*NET data and your current skill profile, here is the projected progression path for your top recommended career.
        </p>
      </div>

      <div className="relative max-w-xl mx-auto">
        {/* Continuous Line */}
        <div className="absolute left-1/2 top-8 bottom-8 w-1 bg-slate-100 -translate-x-1/2 z-0 rounded-full" />

        <div className="space-y-6 relative z-10">
          {pathData.nodes.map((node: any, idx: number) => {
            const Icon = node.icon;
            const isEven = idx % 2 === 0;

            return (
              <div key={idx} className="flex items-center w-full group">
                {/* Left Side (Empty or Content) */}
                <div className={`w-1/2 flex ${isEven ? 'justify-end pr-8' : 'justify-start pl-8 order-2'}`}>
                  <Card className={`w-full max-w-sm border-2 ${node.border} shadow-sm hover:shadow-md transition-shadow relative
                    ${isEven ? 'text-right' : 'text-left'}`}>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{node.title}</div>
                    <div className={`text-lg font-bold ${node.color}`}>{node.desc}</div>
                    
                    {/* Connecting dash */}
                    <div className={`absolute top-1/2 -translate-y-1/2 w-8 border-t-2 border-dashed ${node.border} z-0
                      ${isEven ? '-right-8' : '-left-8'}`} />
                  </Card>
                </div>

                {/* Center Node */}
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border-4 border-white shadow-sm z-10 ${node.bg} ${node.color} ${isEven ? 'order-1' : 'order-1'}`}>
                  <Icon size={24} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="mt-16 text-center">
        <Button className="bg-[#146C94] hover:bg-[#19A7CE]">Explore Internships for this Path</Button>
      </div>
    </div>
  );
};
