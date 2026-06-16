import React, { useEffect, useState } from 'react';
import { Card, Button, Pagination } from '../../components';
import { adminService } from '../../services';
import { notify } from '../../lib/toast';
import { Briefcase, Trash2, Plus, Users, Building, ExternalLink } from 'lucide-react';

export default function AdminInternships() {
  const [internships, setInternships] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination
  const [internshipsPage, setInternshipsPage] = useState(1);
  const [internshipsTotal, setInternshipsTotal] = useState(0);
  const [appsPage, setAppsPage] = useState(1);
  const [appsTotal, setAppsTotal] = useState(0);
  
  // Form State for new internship
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', company: '', location: '', description: '', url: '' });

  useEffect(() => {
    fetchData();
  }, [internshipsPage, appsPage]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [internData, appData] = await Promise.all([
        adminService.getInternships(internshipsPage),
        adminService.getApplications(appsPage)
      ]);
      setInternships(internData.results || []);
      setInternshipsTotal(internData.count || 0);
      setApplications(appData.results || []);
      setAppsTotal(appData.count || 0);
    } catch (error: any) {
      notify.error(error.message || 'Failed to fetch platform data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteInternship = async (id: string) => {
    if (!window.confirm('Delete this internship posting?')) return;
    try {
      await adminService.deleteInternship(id);
      notify.success('Internship deleted.');
      fetchData();
    } catch (error: any) {
      notify.error(error.message || 'Failed to delete internship.');
    }
  };

  const handleCreateInternship = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminService.createInternship(formData);
      notify.success('New Internship Published!');
      setShowAddForm(false);
      setFormData({ title: '', company: '', location: '', description: '', url: '' });
      fetchData();
    } catch (error: any) {
      notify.error(error.message || 'Failed to publish internship.');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Applications Tracking Section */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold font-outfit text-[#146C94] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#19A7CE]" />
            Global Student Applications
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="pb-3 text-sm font-semibold text-slate-500">Student</th>
                <th className="pb-3 text-sm font-semibold text-slate-500">Internship Applied For</th>
                <th className="pb-3 text-sm font-semibold text-slate-500">Date Applied</th>
                <th className="pb-3 text-sm font-semibold text-slate-500 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={4} className="py-8 text-center text-slate-400">Loading applications...</td></tr>
              ) : applications.length === 0 ? (
                <tr><td colSpan={4} className="py-8 text-center text-slate-400">No applications found in the system.</td></tr>
              ) : (
                applications.map((app: any) => (
                  <tr key={app.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-4 font-medium text-[#146C94]">{app.student_name || 'Unknown Student'}</td>
                    <td className="py-4 text-sm text-slate-600">{app.internship?.title} @ {app.internship?.company}</td>
                    <td className="py-4 text-sm text-slate-500">
                      {app.date_applied || app.created_at
                        ? new Date(app.date_applied || app.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                        : '—'}
                    </td>
                    <td className="py-4 text-right">
                      <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-[#19A7CE]/10 text-[#146C94] border border-[#19A7CE]/20">
                        {app.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!isLoading && appsTotal > 0 && (
          <Pagination
            currentPage={appsPage}
            totalItems={appsTotal}
            onPageChange={setAppsPage}
          />
        )}
      </Card>

      {/* Internships Management Section */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold font-outfit text-[#146C94] flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[#19A7CE]" />
            Active Job & Internship Postings
          </h3>
          <Button onClick={() => setShowAddForm(!showAddForm)} className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Publish New
          </Button>
        </div>

        {showAddForm && (
          <form onSubmit={handleCreateInternship} className="mb-8 bg-slate-50 p-6 rounded-xl border border-slate-200">
            <h4 className="text-lg font-bold text-[#146C94] mb-4">Post a New Opportunity</h4>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <input type="text" placeholder="Job Title" required className="p-2.5 rounded-lg border border-slate-300" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              <input type="text" placeholder="Company Name" required className="p-2.5 rounded-lg border border-slate-300" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
              <input type="text" placeholder="Location" required className="p-2.5 rounded-lg border border-slate-300" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
              <input type="url" placeholder="Application URL" required className="p-2.5 rounded-lg border border-slate-300" value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} />
            </div>
            <textarea placeholder="Description" required className="w-full p-2.5 rounded-lg border border-slate-300 mb-4 h-24" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setShowAddForm(false)}>Cancel</Button>
              <Button type="submit" className="bg-[#146C94] hover:bg-[#19A7CE]">Publish Posting</Button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-2 gap-4">
          {internships.map((intern: any) => (
            <div key={intern.id} className="border border-slate-200 rounded-xl p-4 flex justify-between items-start hover:border-[#19A7CE] transition-colors bg-white">
              <div>
                <h4 className="font-bold text-[#146C94]">{intern.title}</h4>
                <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                  <Building className="w-3.5 h-3.5" /> {intern.company} • {intern.location}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a href={intern.url} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-400 hover:text-[#19A7CE] hover:bg-[#19A7CE]/10 rounded-md transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button onClick={() => handleDeleteInternship(intern.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        {!isLoading && internshipsTotal > 0 && (
          <Pagination
            currentPage={internshipsPage}
            totalItems={internshipsTotal}
            onPageChange={setInternshipsPage}
          />
        )}
      </Card>
    </div>
  );
}
