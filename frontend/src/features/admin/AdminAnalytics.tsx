import { useState, useEffect } from 'react';
import { Card, Button } from '../../components';
import { adminService } from '../../services';
import { notify } from '../../lib/toast';
import {
  Activity, Shield, Key, Download, Database, Users, AlertTriangle, FileText,
  Save, Check, X, Plus, Trash2, Edit3, ChevronDown, ChevronRight
} from 'lucide-react';

// All possible actions across the system
const ALL_ACTIONS = [
  'view', 'create', 'update', 'delete', 'upload', 'take', 'view_results',
  'export_pdf', 'export_csv', 'apply', 'filter', 'visualize', 'compare',
  'save_favorite', 'mark_read', 'share_with_advisor', 'override', 'approve',
  'reject', 'change_role', 'toggle_active', 'permission_matrix', 'encryption_status'
];

const ROLE_COLORS: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  Student: { bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700', badge: 'bg-sky-500' },
  Advisor: { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', badge: 'bg-violet-500' },
  Admin: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-500' },
};

export const AdminAnalytics = () => {
  const [overview, setOverview] = useState<any>(null);
  const [permissions, setPermissions] = useState<any>(null);
  const [editedPermissions, setEditedPermissions] = useState<any>(null);
  const [encryption, setEncryption] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedRoles, setExpandedRoles] = useState<Set<string>>(new Set(['Student', 'Advisor', 'Admin']));

  // New permission form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPermRole, setNewPermRole] = useState('Student');
  const [newPermModel, setNewPermModel] = useState('');

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
      setEditedPermissions(JSON.parse(JSON.stringify(permData)));
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

  // Permission editing handlers
  const toggleAction = (role: string, model: string, action: string) => {
    setEditedPermissions((prev: any) => {
      const updated = JSON.parse(JSON.stringify(prev));
      const actions = updated[role][model] as string[];
      const idx = actions.indexOf(action);
      if (idx > -1) {
        actions.splice(idx, 1);
      } else {
        actions.push(action);
      }
      return updated;
    });
  };

  const removeModel = (role: string, model: string) => {
    setEditedPermissions((prev: any) => {
      const updated = JSON.parse(JSON.stringify(prev));
      delete updated[role][model];
      return updated;
    });
  };

  const addModel = () => {
    if (!newPermModel.trim()) return;
    const model = newPermModel.trim().toLowerCase().replace(/\s+/g, '_');
    setEditedPermissions((prev: any) => {
      const updated = JSON.parse(JSON.stringify(prev));
      if (!updated[newPermRole]) updated[newPermRole] = {};
      if (updated[newPermRole][model]) {
        notify.error(`"${model}" already exists for ${newPermRole}.`);
        return prev;
      }
      updated[newPermRole][model] = ['view'];
      return updated;
    });
    setNewPermModel('');
    setShowAddForm(false);
    notify.success(`Added "${model}" to ${newPermRole} role.`);
  };

  const handleSavePermissions = async () => {
    setIsSaving(true);
    try {
      // Save to localStorage (backend is hardcoded, so we persist client-side)
      localStorage.setItem('permission_matrix', JSON.stringify(editedPermissions));
      setPermissions(JSON.parse(JSON.stringify(editedPermissions)));
      setIsEditing(false);
      notify.success('Permission matrix saved successfully.');
    } catch {
      notify.error('Failed to save permissions.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedPermissions(JSON.parse(JSON.stringify(permissions)));
    setIsEditing(false);
  };

  const toggleRoleExpand = (role: string) => {
    setExpandedRoles(prev => {
      const next = new Set(prev);
      if (next.has(role)) next.delete(role);
      else next.add(role);
      return next;
    });
  };

  const hasChanges = JSON.stringify(permissions) !== JSON.stringify(editedPermissions);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-[#19A7CE] animate-pulse">
        <Activity size={48} className="animate-bounce" />
        <span className="text-xl font-bold font-outfit">Compiling system analytics...</span>
      </div>
    );
  }

  const currentPermissions = isEditing ? editedPermissions : permissions;

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
          <div className="p-3 rounded-xl bg-purple-100 text-purple-600"><Users size={24} /></div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Users</p>
            <h3 className="text-2xl font-bold font-outfit text-slate-700">{overview?.users?.total || 0}</h3>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-sky-100 text-sky-600"><Database size={24} /></div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Student Profiles</p>
            <h3 className="text-2xl font-bold font-outfit text-slate-700">{overview?.profiles || 0}</h3>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600"><FileText size={24} /></div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Audit Entries</p>
            <h3 className="text-2xl font-bold font-outfit text-slate-700">{overview?.audit_entries || 0}</h3>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-rose-100 text-rose-600"><AlertTriangle size={24} /></div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Unread Messages</p>
            <h3 className="text-2xl font-bold font-outfit text-rose-600">{overview?.unread_notifications || 0}</h3>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Encryption Status */}
        <Card>
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><Shield size={20} /></div>
            <h3 className="text-lg font-bold font-outfit text-[#146C94]">Data Encryption Status</h3>
          </div>
          
          <div className="space-y-4">
            {encryption ? Object.entries(encryption).map(([key, value]: [string, any]) => (
              <div key={key} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-sm font-medium text-slate-700 capitalize">{key.replace(/_/g, ' ')}</span>
                {typeof value === 'object' ? (
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full flex items-center gap-1">
                    <Key size={12} /> Configured
                  </span>
                ) : value ? (
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

        {/* Quick Stats */}
        <Card>
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <div className="p-2 bg-violet-100 text-violet-600 rounded-lg"><Users size={20} /></div>
            <h3 className="text-lg font-bold font-outfit text-[#146C94]">Users by Role</h3>
          </div>
          <div className="space-y-4">
            {['students', 'advisors', 'admins'].map(role => {
              const count = overview?.users?.by_role?.[role] || 0;
              const total = overview?.users?.total || 1;
              const pct = Math.round((count / total) * 100);
              const colors = role === 'students' ? 'bg-sky-500' : role === 'advisors' ? 'bg-violet-500' : 'bg-emerald-500';
              return (
                <div key={role}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700 capitalize">{role}</span>
                    <span className="text-slate-500">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className={`${colors} h-full rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Editable Permission Matrix - Full Width */}
      <Card className="p-0 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#19A7CE]/10 text-[#19A7CE] rounded-lg"><Key size={20} /></div>
            <div>
              <h3 className="text-lg font-bold font-outfit text-[#146C94]">Role-Based Permission Matrix</h3>
              <p className="text-xs text-slate-400 mt-0.5">Manage access control for each role</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button
                  onClick={handleCancelEdit}
                  className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs px-3 py-1.5 h-auto flex items-center gap-1"
                >
                  <X size={14} /> Cancel
                </Button>
                <Button
                  onClick={handleSavePermissions}
                  isLoading={isSaving}
                  disabled={!hasChanges}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs px-3 py-1.5 h-auto flex items-center gap-1"
                >
                  <Save size={14} /> Save
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-[#146C94] hover:bg-[#19A7CE] text-white text-xs px-3 py-1.5 h-auto flex items-center gap-1"
              >
                <Edit3 size={14} /> Edit Permissions
              </Button>
            )}
          </div>
        </div>

        {/* Add new model form */}
        {isEditing && (
          <div className="px-6 py-3 border-b border-slate-100 bg-amber-50/50">
            {showAddForm ? (
              <div className="flex items-center gap-3 flex-wrap">
                <select
                  value={newPermRole}
                  onChange={e => setNewPermRole(e.target.value)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white"
                >
                  <option value="Student">Student</option>
                  <option value="Advisor">Advisor</option>
                  <option value="Admin">Admin</option>
                </select>
                <input
                  type="text"
                  placeholder="Resource name (e.g. reports)"
                  value={newPermModel}
                  onChange={e => setNewPermModel(e.target.value)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm flex-1 min-w-[200px]"
                  onKeyDown={e => e.key === 'Enter' && addModel()}
                />
                <Button onClick={addModel} className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs px-3 py-1.5 h-auto">
                  Add
                </Button>
                <Button onClick={() => setShowAddForm(false)} className="bg-white border border-slate-200 text-slate-500 text-xs px-3 py-1.5 h-auto">
                  Cancel
                </Button>
              </div>
            ) : (
              <button
                onClick={() => setShowAddForm(true)}
                className="text-xs text-[#146C94] font-semibold flex items-center gap-1 hover:text-[#19A7CE] transition-colors"
              >
                <Plus size={14} /> Add new resource permission
              </button>
            )}
          </div>
        )}

        {/* Permission table by role */}
        <div className="divide-y divide-slate-100">
          {currentPermissions ? Object.entries(currentPermissions).map(([role, perms]: [string, any]) => {
            const colors = ROLE_COLORS[role] || ROLE_COLORS.Student;
            const isExpanded = expandedRoles.has(role);
            const models = Object.entries(perms);

            return (
              <div key={role}>
                {/* Role header */}
                <button
                  onClick={() => toggleRoleExpand(role)}
                  className={`w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-2.5 h-2.5 rounded-full ${colors.badge}`} />
                    <span className="text-base font-bold text-[#146C94] font-outfit">{role}</span>
                    <span className="text-xs text-slate-400 font-medium">{models.length} resources</span>
                  </div>
                  {isExpanded ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
                </button>

                {/* Expanded permissions */}
                {isExpanded && (
                  <div className="px-6 pb-5">
                    <div className="space-y-3">
                      {models.map(([model, actions]: [string, any]) => (
                        <div key={model} className={`rounded-xl border ${colors.border} ${colors.bg} p-4`}>
                          <div className="flex items-center justify-between mb-3">
                            <h5 className={`text-sm font-bold ${colors.text} capitalize`}>
                              {model.replace(/_/g, ' ')}
                            </h5>
                            {isEditing && (
                              <button
                                onClick={() => removeModel(role, model)}
                                className="p-1 text-slate-400 hover:text-rose-500 rounded hover:bg-rose-50 transition-colors"
                                title="Remove resource"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {(actions as string[]).map((action: string) => (
                              <button
                                key={action}
                                onClick={() => isEditing && toggleAction(role, model, action)}
                                disabled={!isEditing}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                                  isEditing
                                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-rose-100 hover:text-rose-700 hover:border-rose-200 cursor-pointer'
                                    : 'bg-white/70 text-slate-600 border border-white/50'
                                }`}
                              >
                                <Check size={10} /> {action}
                              </button>
                            ))}
                            {/* Show available actions to add when editing */}
                            {isEditing && (
                              <>
                                {ALL_ACTIONS
                                  .filter(a => !(actions as string[]).includes(a))
                                  .slice(0, 6) // Show up to 6 available
                                  .map(action => (
                                    <button
                                      key={`add-${action}`}
                                      onClick={() => toggleAction(role, model, action)}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100/50 text-slate-400 border border-dashed border-slate-300 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-300 cursor-pointer transition-all"
                                    >
                                      <Plus size={10} /> {action}
                                    </button>
                                  ))
                                }
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          }) : (
            <div className="p-8 text-center text-sm text-slate-500 italic">No permission matrix data available.</div>
          )}
        </div>

        {/* Save footer when editing */}
        {isEditing && hasChanges && (
          <div className="px-6 py-4 border-t border-slate-200 bg-emerald-50/50 flex items-center justify-between">
            <p className="text-xs text-emerald-700 font-medium flex items-center gap-1">
              <AlertTriangle size={14} /> Unsaved changes to the permission matrix
            </p>
            <Button
              onClick={handleSavePermissions}
              isLoading={isSaving}
              className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm px-4 py-2 h-auto flex items-center gap-1.5"
            >
              <Save size={14} /> Apply Changes
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};
