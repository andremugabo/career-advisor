import { useState, useEffect } from 'react';
import { Card, Pagination, Button } from '../../components';
import { studentService } from '../../services';
import { notify } from '../../lib/toast';
import { ClipboardList, Building2, MapPin, Search } from 'lucide-react';
import { Application } from '../../types';

export const ApplicationsTracker = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

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
                filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="font-bold text-[#146C94] text-base mb-1">{app.internship?.title}</div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Building2 size={12}/> {app.internship?.company}</span>
                        <span className="flex items-center gap-1"><MapPin size={12}/> {app.internship?.location}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      {new Date(app.applied_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="p-4">
                      {app.internship?.match_percentage ? (
                        <span className="text-sm font-bold text-emerald-600">{app.internship.match_percentage}%</span>
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
                      <Button variant="secondary" className="px-3 py-1.5 text-xs h-auto">View Details</Button>
                    </td>
                  </tr>
                ))
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
