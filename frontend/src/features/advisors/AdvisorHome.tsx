import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, TrendingUp, AlertTriangle, BarChart3,
  MessageSquare, ClipboardList, Library, ArrowUpRight, Brain, Sparkles
} from 'lucide-react';
import { advisorService } from '../../services';
import { Card } from '../../components';
import { notify } from '../../lib/toast';

interface AnalyticsData {
  total_students: number;
  average_gpa: number;
  top_missing: Array<{ name: string; count: number }>;
}

export default function AdvisorHome() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [recentInterventions, setRecentInterventions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [analyticsData, interventionsData] = await Promise.all([
          advisorService.getAnalytics(),
          advisorService.getInterventions(),
        ]);
        setAnalytics(analyticsData);
        const interventionsList = interventionsData.results || interventionsData || [];
        setRecentInterventions(interventionsList.slice(0, 5));
      } catch (err: any) {
        notify.error('Failed to load advisor dashboard.');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const quickActions = [
    { label: 'View All Students', icon: Users, path: '/students', color: '#146C94' },
    { label: 'Messages', icon: MessageSquare, path: '/messages', color: '#19A7CE' },
    { label: 'Interventions', icon: ClipboardList, path: '/interventions', color: '#0f766e' },
    { label: 'Resource Library', icon: Library, path: '/advisor/resources', color: '#7c3aed' },
  ];

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto mt-8 animate-fade-in">
        <div className="text-center py-32">
          <Brain className="w-12 h-12 mx-auto text-[#19A7CE] animate-pulse mb-4" />
          <p className="text-slate-500 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto mt-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold font-outfit text-[#146C94] flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-[#19A7CE]" />
          Advisor Dashboard
        </h1>
        <p className="text-slate-500 mt-2">
          Welcome back. Here's an overview of your advisory system.
        </p>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#19A7CE]/5 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-500" />
          <div className="flex items-start justify-between relative">
            <div>
              <p className="text-sm text-slate-500 font-medium mb-1">Total Students</p>
              <p className="text-4xl font-bold font-outfit text-[#146C94]">
                {analytics?.total_students ?? '—'}
              </p>
              <p className="text-xs text-slate-400 mt-2">Under advisory guidance</p>
            </div>
            <div className="bg-[#19A7CE]/10 p-3 rounded-xl">
              <Users className="w-6 h-6 text-[#19A7CE]" />
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-500" />
          <div className="flex items-start justify-between relative">
            <div>
              <p className="text-sm text-slate-500 font-medium mb-1">Average GPA</p>
              <p className="text-4xl font-bold font-outfit text-emerald-600">
                {analytics?.average_gpa?.toFixed(2) ?? '—'}
              </p>
              <p className="text-xs text-slate-400 mt-2">Across all students</p>
            </div>
            <div className="bg-emerald-500/10 p-3 rounded-xl">
              <TrendingUp className="w-6 h-6 text-emerald-500" />
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-500" />
          <div className="flex items-start justify-between relative">
            <div>
              <p className="text-sm text-slate-500 font-medium mb-1">Top Skill Gap</p>
              <p className="text-2xl font-bold font-outfit text-amber-600 truncate max-w-[180px]">
                {analytics?.top_missing?.[0]?.name ?? 'None'}
              </p>
              <p className="text-xs text-slate-400 mt-2">
                {analytics?.top_missing?.[0]
                  ? `Missing in ${analytics.top_missing[0].count} students`
                  : 'No skill gaps detected'}
              </p>
            </div>
            <div className="bg-amber-500/10 p-3 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <h2 className="text-lg font-bold font-outfit text-[#146C94] mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {quickActions.map((action) => (
          <button
            key={action.path}
            onClick={() => navigate(action.path)}
            className="flex flex-col items-center gap-3 p-6 bg-white rounded-2xl border border-slate-200 hover:border-[#19A7CE] hover:shadow-md transition-all duration-300 group"
          >
            <div
              className="p-3 rounded-xl transition-transform duration-300 group-hover:scale-110"
              style={{ backgroundColor: `${action.color}15` }}
            >
              <action.icon className="w-6 h-6" style={{ color: action.color }} />
            </div>
            <span className="text-sm font-semibold text-slate-700 group-hover:text-[#146C94] transition-colors">
              {action.label}
            </span>
          </button>
        ))}
      </div>

      {/* Two-column: Top Missing Skills + Recent Interventions */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Missing Skills */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold font-outfit text-[#146C94] flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#19A7CE]" />
              System-Wide Skill Gaps
            </h3>
          </div>
          {analytics?.top_missing && analytics.top_missing.length > 0 ? (
            <div className="space-y-4">
              {analytics.top_missing.map((skill, idx) => {
                const maxCount = analytics.top_missing[0].count;
                const pct = maxCount > 0 ? (skill.count / maxCount) * 100 : 0;
                const colors = ['#146C94', '#19A7CE', '#0f766e', '#7c3aed', '#f59e0b'];
                return (
                  <div key={skill.name}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-semibold text-slate-700">{skill.name}</span>
                      <span className="text-xs font-bold text-slate-400">{skill.count} students</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: colors[idx % colors.length],
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
                      <p className="text-sm text-slate-600">No skill gap data available.</p>
          )}
        </Card>

        {/* Recent Interventions */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold font-outfit text-[#146C94] flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-[#19A7CE]" />
              Recent Interventions
            </h3>
            <button
              onClick={() => navigate('/interventions')}
              className="flex items-center gap-1 text-sm font-medium text-[#19A7CE] hover:text-[#146C94] transition-colors"
            >
              View All <ArrowUpRight size={14} />
            </button>
          </div>
          {recentInterventions.length > 0 ? (
            <div className="space-y-3">
              {recentInterventions.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-[#19A7CE]/5 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate">
                      {item.student_name}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {item.intervention_type} • {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 rounded-lg bg-[#146C94]/10 text-[#146C94] whitespace-nowrap ml-3">
                    {item.intervention_type}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-sm text-center py-8">No interventions recorded yet.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
