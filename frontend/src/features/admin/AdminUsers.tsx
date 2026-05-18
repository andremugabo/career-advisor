import React, { useEffect, useState } from 'react';
import { Card, Button, Pagination } from '../../components';
import { adminService } from '../../services';
import { notify } from '../../lib/toast';
import { Users, ShieldAlert, Trash2, Edit } from 'lucide-react';
import { User } from '../../types';

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  const fetchUsers = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const response = await adminService.getUsers(page);
      setUsers(response.results || response || []);
      setTotalItems(response.count || 0);
    } catch (error: any) {
      notify.error(error.message || 'Failed to fetch users.');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, currentRole: string) => {
    const roles = ['Student', 'Advisor', 'Admin'];
    const currentIndex = roles.indexOf(currentRole);
    const newRole = roles[(currentIndex + 1) % roles.length];

    try {
      await adminService.updateUserRole(userId, newRole);
      notify.success(`User role successfully updated to ${newRole}`);
      fetchUsers(); // Refresh table
    } catch (error: any) {
      notify.error(error.message || 'Failed to update user role.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this user? This cannot be undone.')) return;
    
    try {
      await adminService.deleteUser(userId);
      notify.success('User permanently deleted.');
      fetchUsers(); // Refresh table
    } catch (error: any) {
      notify.error(error.message || 'Failed to delete user.');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold font-outfit text-[#146C94] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#19A7CE]" />
            User Management Directory
          </h3>
          <Button variant="secondary" onClick={() => fetchUsers(currentPage)} isLoading={isLoading}>
            Refresh Users
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="pb-3 text-sm font-semibold text-slate-500">Email Address</th>
                <th className="pb-3 text-sm font-semibold text-slate-500">System Role</th>
                <th className="pb-3 text-sm font-semibold text-slate-500">Status</th>
                <th className="pb-3 text-sm font-semibold text-slate-500">MFA</th>
                <th className="pb-3 text-sm font-semibold text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">Fetching user records...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">No users found.</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="py-4 text-sm font-medium text-[#146C94]">{user.email}</td>
                    <td className="py-4">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${
                        user.role === 'Admin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        user.role === 'Advisor' ? 'bg-[#19A7CE]/10 text-[#146C94] border-[#19A7CE]/20' :
                        'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4">
                      {user.is_active ? (
                        <span className="text-emerald-600 text-xs font-bold flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Active</span>
                      ) : (
                        <span className="text-rose-600 text-xs font-bold flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Inactive</span>
                      )}
                    </td>
                    <td className="py-4">
                      {user.mfa_enabled ? (
                        <ShieldAlert className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <span className="text-xs text-slate-400">Disabled</span>
                      )}
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleRoleChange(user.id, user.role)}
                          className="p-1.5 text-slate-400 hover:text-[#19A7CE] hover:bg-[#19A7CE]/10 rounded-md transition-colors"
                          title="Rotate User Role"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          title="Delete User"
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
