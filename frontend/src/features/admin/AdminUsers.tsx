import { useEffect, useState } from 'react';
import { Card, Button, Pagination } from '../../components';
import Modal from '../../components/Modal';
import { adminService } from '../../services';
import { notify } from '../../lib/toast';
import {
  Users, ShieldCheck, ShieldOff, Trash2, Edit3,
  UserCheck, UserX, Search, RefreshCw, Crown, GraduationCap, Briefcase
} from 'lucide-react';
import { User } from '../../types';

// ─── helpers ────────────────────────────────────────────────────────────────
const roleConfig: Record<string, { label: string; bg: string; text: string; border: string; icon: JSX.Element }> = {
  Admin:   { label: 'Admin',   bg: 'bg-purple-50',  text: 'text-purple-700', border: 'border-purple-200', icon: <Crown className="w-3 h-3" /> },
  Advisor: { label: 'Advisor', bg: 'bg-sky-50',     text: 'text-sky-700',    border: 'border-sky-200',    icon: <Briefcase className="w-3 h-3" /> },
  Student: { label: 'Student', bg: 'bg-emerald-50', text: 'text-emerald-700',border: 'border-emerald-200',icon: <GraduationCap className="w-3 h-3" /> },
};

function RoleBadge({ role }: { role: string }) {
  const cfg = roleConfig[role] ?? { label: role, bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', icon: null };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {cfg.icon}{cfg.label}
    </span>
  );
}

function Avatar({ email }: { email: string }) {
  const initials = email.slice(0, 2).toUpperCase();
  const hue = email.charCodeAt(0) * 13 % 360;
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm"
      style={{ background: `hsl(${hue},60%,50%)` }}
    >
      {initials}
    </div>
  );
}

// ─── Toggle Switch ───────────────────────────────────────────────────────────
function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200
        ${checked ? 'bg-[#19A7CE]' : 'bg-slate-200'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200
          ${checked ? 'translate-x-4' : 'translate-x-0'}`}
      />
    </button>
  );
}

// ─── Stat card ───────────────────────────────────────────────────────────────
function StatCard({ label, value, color, icon }: { label: string; value: number; color: string; icon: JSX.Element }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-5 py-4 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-xs text-slate-400 font-medium">{label}</p>
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [filtered, setFiltered] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  // Modal state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Delete confirm
  const [deletingId, setDeletingId] = useState<number | string | null>(null);

  useEffect(() => { fetchUsers(currentPage); }, [currentPage]);

  useEffect(() => {
    let result = [...users];
    if (search) result = result.filter(u => u.email.toLowerCase().includes(search.toLowerCase()));
    if (roleFilter !== 'All') result = result.filter(u => u.role === roleFilter);
    setFiltered(result);
  }, [users, search, roleFilter]);

  const fetchUsers = async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await adminService.getUsers(page);
      setUsers(response.results || (response as any) || []);
      setTotalItems(response.count || 0);
    } catch (e: any) {
      notify.error(e.message || 'Failed to fetch users.');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setEditForm({ role: user.role, is_active: user.is_active, mfa_enabled: user.mfa_enabled });
  };

  const handleSave = async () => {
    if (!editingUser) return;
    setIsSaving(true);
    try {
      await adminService.updateUser(editingUser.id, editForm);
      notify.success('User updated successfully.');
      fetchUsers(currentPage);
      setEditingUser(null);
    } catch (e: any) {
      notify.error(e.message || 'Failed to update user.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (userId: number | string) => {
    try {
      await adminService.deleteUser(userId);
      notify.success('User deleted.');
      fetchUsers(currentPage);
    } catch (e: any) {
      notify.error(e.message || 'Failed to delete user.');
    } finally {
      setDeletingId(null);
    }
  };

  // Derived stats
  const total = users.length;
  const admins  = users.filter(u => u.role === 'Admin').length;
  const advisors = users.filter(u => u.role === 'Advisor').length;
  const students = users.filter(u => u.role === 'Student').length;
  const active = users.filter(u => u.is_active).length;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Stats row ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard label="Total Users"   value={total}    color="bg-[#19A7CE]/10 text-[#19A7CE]"    icon={<Users className="w-5 h-5" />} />
        <StatCard label="Active"        value={active}   color="bg-emerald-100 text-emerald-600"   icon={<UserCheck className="w-5 h-5" />} />
        <StatCard label="Admins"        value={admins}   color="bg-purple-100 text-purple-600"     icon={<Crown className="w-5 h-5" />} />
        <StatCard label="Advisors"      value={advisors} color="bg-sky-100 text-sky-600"           icon={<Briefcase className="w-5 h-5" />} />
        <StatCard label="Students"      value={students} color="bg-teal-100 text-teal-600"         icon={<GraduationCap className="w-5 h-5" />} />
      </div>

      {/* ── Table card ────────────────────────────────────────────── */}
      <Card>
        {/* Header */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="flex-1 min-w-48">
            <h3 className="text-xl font-bold font-outfit text-[#146C94] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#19A7CE]" /> User Directory
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">{totalItems} registered accounts</p>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#19A7CE]/30 focus:border-[#19A7CE] transition w-52"
            />
          </div>

          {/* Role filter */}
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#19A7CE]/30 focus:border-[#19A7CE] transition"
          >
            <option value="All">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Advisor">Advisor</option>
            <option value="Student">Student</option>
          </select>

          {/* Refresh */}
          <button
            onClick={() => fetchUsers(currentPage)}
            disabled={isLoading}
            className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-[#19A7CE] hover:border-[#19A7CE]/40 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">User</th>
                <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Role</th>
                <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide text-center">Status</th>
                <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide text-center">MFA</th>
                <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-4 py-3">
                      <div className="h-4 bg-slate-100 rounded animate-pulse w-full" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <UserX className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-400 font-medium">No users match your search</p>
                  </td>
                </tr>
              ) : (
                filtered.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/70 transition-colors group">
                    {/* User */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar email={user.email} />
                        <div>
                          <p className="font-semibold text-[#146C94] group-hover:text-[#19A7CE] transition-colors">{user.email}</p>
                          <p className="text-xs text-slate-400">ID #{user.id}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3">
                      <RoleBadge role={user.role} />
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${
                        user.is_active
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-600 border border-rose-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    {/* MFA */}
                    <td className="px-4 py-3 text-center">
                      {user.mfa_enabled
                        ? <ShieldCheck className="w-4 h-4 text-emerald-500 mx-auto" />
                        : <ShieldOff className="w-4 h-4 text-slate-300 mx-auto" />
                      }
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(user)}
                          className="p-2 rounded-lg text-slate-400 hover:text-[#19A7CE] hover:bg-[#19A7CE]/10 transition-colors"
                          title="Edit user"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingId(user.id)}
                          className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && totalItems > 0 && (
          <div className="mt-4">
            <Pagination currentPage={currentPage} totalItems={totalItems} onPageChange={setCurrentPage} />
          </div>
        )}
      </Card>

      {/* ── Edit Modal ────────────────────────────────────────────── */}
      <Modal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        title="Edit User"
        subtitle={editingUser?.email}
      >
        {editingUser && (
          <div className="space-y-5">
            {/* Avatar + email display */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <Avatar email={editingUser.email} />
              <div>
                <p className="text-sm font-semibold text-slate-700">{editingUser.email}</p>
                <p className="text-xs text-slate-400">Joined account</p>
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">System Role</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Student', 'Advisor', 'Admin'] as const).map(r => {
                  const cfg = roleConfig[r];
                  const selected = (editForm.role ?? editingUser.role) === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setEditForm({ ...editForm, role: r })}
                      className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 text-xs font-semibold transition-all duration-150
                        ${selected ? `${cfg.bg} ${cfg.text} ${cfg.border} shadow-sm scale-105` : 'border-slate-200 text-slate-400 hover:border-slate-300'}`}
                    >
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center ${selected ? cfg.bg : 'bg-slate-100'}`}>
                        {cfg.icon}
                      </span>
                      {r}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-slate-700">Account Active</p>
                  <p className="text-xs text-slate-400 mt-0.5">User can log in and access the system</p>
                </div>
                <Toggle
                  checked={editForm.is_active ?? editingUser.is_active}
                  onChange={v => setEditForm({ ...editForm, is_active: v })}
                />
              </div>
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-slate-700">MFA Enabled</p>
                  <p className="text-xs text-slate-400 mt-0.5">Multi-factor authentication for this account</p>
                </div>
                <Toggle
                  checked={editForm.mfa_enabled ?? editingUser.mfa_enabled}
                  onChange={v => setEditForm({ ...editForm, mfa_enabled: v })}
                />
              </div>
            </div>

            {/* Footer actions */}
            <div className="flex gap-3 pt-1">
              <Button variant="secondary" onClick={() => setEditingUser(null)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSave} isLoading={isSaving} className="flex-1">
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Delete Confirm Modal ──────────────────────────────────── */}
      <Modal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        title="Delete User"
        subtitle="This action cannot be undone"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-xl">
            <Trash2 className="w-5 h-5 text-rose-500 shrink-0" />
            <p className="text-sm text-rose-700">
              You are about to permanently delete this user and all associated data.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setDeletingId(null)} className="flex-1">
              Cancel
            </Button>
            <button
              onClick={() => deletingId && handleDelete(deletingId)}
              className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold transition-colors"
            >
              Yes, Delete
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
