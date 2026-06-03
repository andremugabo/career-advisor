import { useState, useEffect } from 'react';
import { Card, Button } from '../../components';
import { adminService } from '../../services';
import { notify } from '../../lib/toast';
import { Activity, Shield, Key, Download, Database, Users, AlertTriangle, FileText } from 'lucide-react';

export const AdminAnalytics = () => {
  const [overview, setOverview] = useState<any>(null);
  const [permissions, setPermissions] = useState<any>(null);
  const [encryption, setEncryption] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const [overviewData, permData, encData] = await Promise.all([
        adminService.getSystemOverview(),
        adminService.getPermissionMatrix(),
        adminService.getEncryptionStatus()
      ]);
      setOverview(overviewData);
      setPermissions(permData);
      setEncryption(encData);
    } catch (error: any) {
      notify.error(error.message || 'Failed to load system analytics.');
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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-[#19A7CE] animate-pulse">
        <Activity size={48} className="animate-bounce" />
        <span className="text-xl font-bold font-outfit">Compiling system analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#146C94] font-outfit flex items-center gap-3">
            <Activity className="w-8 h-8 text-[#19A7CE]" />
            System Analytics & Security
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Real-time monitoring of system health, security, and usage metrics.
          </p>
        </div>
        <Button 
          onClick={handleExportLogs} 
          isLoading={isExporting}
          className="bg-slate-800 hover:bg-slate-900 flex items-center gap-2"
          leftIcon={<Download size={16} />}
        >
          Export Full Audit CSV
        </Button>
      </div>

      {/* System Overview Widgets */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Users</p>
            <h3 className="text-2xl font-bold font-outfit text-slate-700">{overview?.total_users || 0}</h3>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-sky-100 text-sky-600">
            <Database size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Database Size</p>
            <h3 className="text-2xl font-bold font-outfit text-slate-700">{overview?.database_size || '0 MB'}</h3>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Audit Entries</p>
            <h3 className="text-2xl font-bold font-outfit text-slate-700">{overview?.total_audit_logs || 0}</h3>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-rose-100 text-rose-600">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Failed Logins</p>
            <h3 className="text-2xl font-bold font-outfit text-rose-600">{overview?.total_failed_logins || 0}</h3>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Encryption Status */}
        <Card>
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
              <Shield size={20} />
            </div>
            <h3 className="text-lg font-bold font-outfit text-[#146C94]">Data Encryption Status</h3>
          </div>
          
          <div className="space-y-4">
            {encryption ? Object.entries(encryption).map(([key, value]: [string, any]) => (
              <div key={key} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-sm font-medium text-slate-700 capitalize">{key.replace(/_/g, ' ')}</span>
                {value ? (
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full flex items-center gap-1">
                    <Key size={12} /> Encrypted
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded-full flex items-center gap-1">
                    <AlertTriangle size={12} /> Plaintext
                  </span>
                )}
              </div>
            )) : (
              <div className="text-sm text-slate-500 italic">No encryption data available.</div>
            )}
          </div>
        </Card>

        {/* Permission Matrix */}
        <Card>
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <div className="p-2 bg-[#19A7CE]/10 text-[#19A7CE] rounded-lg">
              <Key size={20} />
            </div>
            <h3 className="text-lg font-bold font-outfit text-[#146C94]">Role-Based Permission Matrix</h3>
          </div>

          <div className="space-y-6">
            {permissions ? Object.entries(permissions).map(([role, perms]: [string, any]) => (
              <div key={role}>
                <h4 className="text-sm font-bold text-slate-700 mb-2 capitalize">{role} Role</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(perms).map(([model, actions]: [string, any]) => (
                    <div key={model} className="bg-white border border-slate-200 rounded-lg p-2 shadow-sm text-xs">
                      <div className="font-bold text-[#146C94] capitalize mb-1">{model}</div>
                      <div className="flex gap-1 flex-wrap">
                        {actions.map((action: string) => (
                          <span key={action} className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded uppercase" style={{fontSize: '9px'}}>
                            {action}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )) : (
              <div className="text-sm text-slate-500 italic">No permission matrix data available.</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
