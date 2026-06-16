import { useState, useEffect } from 'react';
import { Card, Pagination, Button } from '../../components';
import { studentService } from '../../services';
import { notify } from '../../lib/toast';
import {
  ClipboardList, Building2, MapPin, Search, ChevronDown, ChevronUp,
  Calendar, Briefcase, Clock, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import { Application } from '../../types';

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const formatScore = (score?: number | null) => {
  if (score === null || score === undefined) return 'N/A';
  return `${Math.round(score * 100)}%`;
};

export const ApplicationsTracker = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications(currentPage);
  }, [currentPage]);

  const fetchApplications = async (page: number) => {
    setIsLoading(true);
    try {
      const response = await studentService.getApplications(page);
      setApplications(response.results || response || []);
      setTotalItems(response.count || 0);
    } catch (error: any) {
      notify.error(error.message || 'Failed to load applications.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredApps = applications.filter(app => {
    const term = searchTerm.toLowerCase();
    return app.internship?.title?.toLowerCase().includes(term) || 
           app.internship?.company?.toLowerCase().includes(term);
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Reviewed': return 'bg-sky-100 text-sky-700 border-sky-200';
      case 'Accepted': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Rejected': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending': return <Clock size={16} className="text-amber-500" />;
      case 'Reviewed': return <AlertCircle size={16} className="text-sky-500" />;
      case 'Accepted': return <CheckCircle size={16} className="text-emerald-500" />;
      case 'Rejected': return <XCircle size={16} className="text-rose-500" />;
      default: return <Clock size={16} className="text-slate-400" />;
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'Pending': return 'Your application has been submitted and is awaiting review by the hiring team.';
      case 'Reviewed': return 'Your application has been reviewed. You may hear back soon about next steps.';
      case 'Accepted': return 'Congratulations! Your application has been accepted. Check your email for further instructions.';
      case 'Rejected': return 'Unfortunately, your application was not successful this time. Keep applying to other opportunities!';
      default: return 'Application status is being processed.';
    }
  };

  // Summary stats
  const statCounts = {
    total: filteredApps.length,
    pending: filteredApps.filter(a => a.status === 'Pending').length,
    accepted: filteredApps.filter(a => a.status === 'Accepted').length,
    rejected: filteredApps.filter(a => a.status === 'Rejected').length,
  };

  return (
    <div className="max-w-6xl mx-auto mt-8 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold font-outfit text-[#146C94] flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-[#19A7CE]" />
            Application Tracker
          </h2>
          <p className="text-slate-500 mt-2">
            Monitor the status of your internship and job applications.
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search applications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full glass-input bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* Summary Stats */}
      {!isLoading && filteredApps.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-white rounded-xl border border-slate-200 text-center">
            <p className="text-2xl font-bold font-outfit text-[#146C94]">{statCounts.total}</p>
            <p className="text-xs text-slate-500 font-medium mt-1">Total Applications</p>
          </div>
          <div className="p-4 bg-white rounded-xl border border-amber-100 text-center">
            <p className="text-2xl font-bold font-outfit text-amber-600">{statCounts.pending}</p>
            <p className="text-xs text-slate-500 font-medium mt-1">Pending</p>
          </div>
          <div className="p-4 bg-white rounded-xl border border-emerald-100 text-center">
            <p className="text-2xl font-bold font-outfit text-emerald-600">{statCounts.accepted}</p>
            <p className="text-xs text-slate-500 font-medium mt-1">Accepted</p>
          </div>
          <div className="p-4 bg-white rounded-xl border border-rose-100 text-center">
            <p className="text-2xl font-bold font-outfit text-rose-600">{statCounts.rejected}</p>
            <p className="text-xs text-slate-500 font-medium mt-1">Rejected</p>
          </div>
        </div>
      )}

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 pl-6 text-xs text-slate-400 font-bold uppercase tracking-wider">Opportunity</th>
                <th className="p-4 text-xs text-slate-400 font-bold uppercase tracking-wider">Date Applied</th>
                <th className="p-4 text-xs text-slate-400 font-bold uppercase tracking-wider">Match Score</th>
                <th className="p-4 text-xs text-slate-400 font-bold uppercase tracking-wider">Status</th>
                <th className="p-4 pr-6 text-xs text-slate-400 font-bold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[#19A7CE] animate-pulse">
                    Loading your applications...
                  </td>
                </tr>
              ) : filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500">
                    <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    No applications found. Start applying from the Internship Board!
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => {
                  const isExpanded = expandedId === app.id;
                  return (
                    <>
                      <tr
                        key={app.id}
                        className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${isExpanded ? 'bg-[#19A7CE]/5' : ''}`}
                        onClick={() => setExpandedId(isExpanded ? null : app.id)}
                      >
                        <td className="p-4 pl-6">
                          <div className="font-bold text-[#146C94] text-base mb-1">{app.internship?.title}</div>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1"><Building2 size={12}/> {app.internship?.company}</span>
                            <span className="flex items-center gap-1"><MapPin size={12}/> {app.internship?.location}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-slate-600">
                          {formatDate(app.date_applied)}
                        </td>
                        <td className="p-4">
                          {app.match_score !== null && app.match_score !== undefined ? (
                            <span className="text-sm font-bold text-emerald-600">{formatScore(app.match_score)}</span>
                          ) : (
                            <span className="text-xs text-slate-400 italic">N/A</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${getStatusColor(app.status)}`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <Button
                            variant="secondary"
                            className="px-3 py-1.5 text-xs h-auto inline-flex items-center gap-1.5"
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation();
                              setExpandedId(isExpanded ? null : app.id);
                            }}
                          >
                            {isExpanded ? (
                              <>Hide <ChevronUp size={14} /></>
                            ) : (
                              <>View Details <ChevronDown size={14} /></>
                            )}
                          </Button>
                        </td>
                      </tr>

                      {/* Expanded Detail Row */}
                      {isExpanded && (
                        <tr key={`${app.id}-detail`} className="bg-slate-50/80">
                          <td colSpan={5} className="p-0">
                            <div className="p-6 animate-fade-in border-t border-[#19A7CE]/10">
                              <div className="grid md:grid-cols-3 gap-6">
                                {/* Application Status Card */}
                                <div className="bg-white rounded-xl border border-slate-100 p-5">
                                  <div className="flex items-center gap-2 mb-3">
                                    {getStatusIcon(app.status)}
                                    <h4 className="text-sm font-bold text-slate-700">Application Status</h4>
                                  </div>
                                  <span className={`inline-block px-3 py-1.5 text-xs font-bold rounded-full border mb-3 ${getStatusColor(app.status)}`}>
                                    {app.status}
                                  </span>
                                  <p className="text-xs text-slate-500 leading-relaxed">
                                    {getStatusMessage(app.status)}
                                  </p>
                                </div>

                                {/* Internship Details Card */}
                                <div className="bg-white rounded-xl border border-slate-100 p-5">
                                  <div className="flex items-center gap-2 mb-3">
                                    <Briefcase size={16} className="text-[#19A7CE]" />
                                    <h4 className="text-sm font-bold text-slate-700">Internship Details</h4>
                                  </div>
                                  <div className="space-y-3">
                                    <div>
                                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Position</p>
                                      <p className="text-sm font-semibold text-[#146C94]">{app.internship?.title || '—'}</p>
                                    </div>
                                    <div>
                                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Company</p>
                                      <p className="text-sm font-medium text-slate-700">{app.internship?.company || '—'}</p>
                                    </div>
                                    <div className="flex gap-4">
                                      <div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Location</p>
                                        <p className="text-xs text-slate-600">{app.internship?.location || '—'}</p>
                                      </div>
                                      <div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Type</p>
                                        <p className="text-xs text-slate-600">{app.internship?.type || '—'}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Timeline Card */}
                                <div className="bg-white rounded-xl border border-slate-100 p-5">
                                  <div className="flex items-center gap-2 mb-3">
                                    <Calendar size={16} className="text-violet-500" />
                                    <h4 className="text-sm font-bold text-slate-700">Timeline</h4>
                                  </div>
                                  <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                      <div className="w-2 h-2 rounded-full bg-[#19A7CE] mt-1.5 shrink-0" />
                                      <div>
                                        <p className="text-xs font-semibold text-slate-700">Applied</p>
                                        <p className="text-xs text-slate-500">{formatDate(app.date_applied)}</p>
                                      </div>
                                    </div>
                                    {app.status !== 'Pending' && (
                                      <div className="flex items-start gap-3">
                                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                                          app.status === 'Accepted' ? 'bg-emerald-500' : 
                                          app.status === 'Rejected' ? 'bg-rose-500' : 'bg-sky-500'
                                        }`} />
                                        <div>
                                          <p className="text-xs font-semibold text-slate-700">{app.status}</p>
                                          <p className="text-xs text-slate-500">Status updated</p>
                                        </div>
                                      </div>
                                    )}
                                    {app.match_score !== null && app.match_score !== undefined && (
                                      <div className="mt-3 pt-3 border-t border-slate-100">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">AI Match Score</p>
                                        <div className="flex items-center gap-2">
                                          <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                                            <div
                                              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                                              style={{ width: `${Math.round(app.match_score * 100)}%` }}
                                            />
                                          </div>
                                          <span className="text-xs font-bold text-emerald-600">{formatScore(app.match_score)}</span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Description */}
                              {app.internship?.description && (
                                <div className="mt-4 bg-white rounded-xl border border-slate-100 p-5">
                                  <h4 className="text-sm font-bold text-slate-700 mb-2">Job Description</h4>
                                  <p className="text-sm text-slate-600 leading-relaxed">{app.internship.description}</p>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {!isLoading && totalItems > 0 && (
          <div className="p-4 border-t border-slate-100">
            <Pagination currentPage={currentPage} totalItems={totalItems} onPageChange={setCurrentPage} />
          </div>
        )}
      </Card>
    </div>
  );
};
