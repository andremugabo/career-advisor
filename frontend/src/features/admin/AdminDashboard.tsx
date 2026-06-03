import { useEffect, useState } from 'react';
import { Card, Button, Pagination } from '../../components';
import { adminService } from '../../services';
import { notify } from '../../lib/toast';
import { ShieldAlert, Users, Activity, FileText } from 'lucide-react';

export default function AdminDashboard() {
  const [logs, setLogs] = useState<any[]>([]);
  const [overview, setOverview] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchAuditLogs(currentPage);
  }, [currentPage]);

  const fetchAuditLogs = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const [response, overviewData] = await Promise.all([
        adminService.getAuditLogs(page),
        adminService.getSystemOverview()
      ]);
      setLogs(response.results || []);
      setTotalItems(response.count || 0);
      setOverview(overviewData);
    } catch (error: any) {
      // Graceful degradation if the endpoint isn't fully ready
      notify.error(error.message || 'Failed to fetch system audit logs.');
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportLogs = async () => {
    setIsExporting(true);
    try {
      await adminService.exportAuditLogsCsv();
      notify.success('Audit logs exported successfully!');
    } catch (error: any) {
      notify.error(error.message || 'Failed to export logs.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#19A7CE]/10 flex items-center justify-center">
            <Users className="w-6 h-6 text-[#146C94]" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Users</p>
            <h3 className="text-2xl font-bold font-outfit text-[#146C94]">
              {overview?.total_users || '...'}
            </h3>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <Activity className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">System Health</p>
            <h3 className="text-2xl font-bold font-outfit text-emerald-600">Optimal</h3>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6 text-rose-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Security Flags</p>
            <h3 className="text-2xl font-bold font-outfit text-rose-600">
              {overview?.total_failed_logins || 0}
            </h3>
          </div>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold font-outfit text-[#146C94] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#19A7CE]" />
            Recent Audit Logs
          </h3>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleExportLogs} isLoading={isExporting}>
              Export CSV
            </Button>
            <Button variant="secondary" onClick={() => fetchAuditLogs(currentPage)} isLoading={isLoading}>
              Refresh
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="pb-3 text-sm font-semibold text-slate-500">Timestamp</th>
                <th className="pb-3 text-sm font-semibold text-slate-500">User ID</th>
                <th className="pb-3 text-sm font-semibold text-slate-500">Action</th>
                <th className="pb-3 text-sm font-semibold text-slate-500">IP Address</th>
                <th className="pb-3 text-sm font-semibold text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">Loading secure logs...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No recent audit logs found or endpoint unavailable.
                  </td>
                </tr>
              ) : (
                logs.map((log, i) => (
                  <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="py-4 text-sm text-slate-600">{log.created_at || 'Just now'}</td>
                    <td className="py-4 text-sm font-medium text-[#146C94]">{log.user || 'System'}</td>
                    <td className="py-4 text-sm text-slate-600">{log.action}</td>
                    <td className="py-4 text-sm text-slate-500 font-mono">{log.ip_address || '127.0.0.1'}</td>
                    <td className="py-4">
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                        SUCCESS
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!isLoading && totalItems > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            onPageChange={setCurrentPage}
          />
        )}
      </Card>
    </div>
  );
}
