import { useState, useEffect } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import AdminLayout from '../components/layout/AdminLayout';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/common/Badge';
import {
  getAdminUsers,
  updateAdminUser,
  deleteAdminUser
} from '../api/admin';
import type { User } from '../types';

type AdminUser = User & { created_at?: string };

const UserManagement = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editRole, setEditRole] = useState<'user' | 'admin'>('user');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminUsers();
      setUsers(data as AdminUser[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async (userId: string) => {
    try {
      await updateAdminUser(userId, { role: editRole });
      await loadUsers();
      setEditingUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user role');
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      await deleteAdminUser(userId);
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  const startEditing = (user: User) => {
    setEditingUser(user);
    setEditRole(user.role || 'user');
  };

  const cancelEditing = () => {
    setEditingUser(null);
    setEditRole('user');
  };

  if (loading) {
    return (
      <AdminLayout title="User Management">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="User Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Users ({users.length})</h2>
            <p className="text-gray-600">Manage user accounts and roles</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Users Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {(user.first_name?.[0] || user.email[0]).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.first_name && user.last_name
                              ? `${user.first_name} ${user.last_name}`
                              : 'No name'
                            }
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingUser?.id === user.id ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value as 'user' | 'admin')}
                            className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                          <Button
                            size="sm"
                            onClick={() => handleRoleUpdate(user.id)}
                            className="px-2 py-1 text-xs"
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEditing}
                            className="px-2 py-1 text-xs"
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Badge variant={user.role === 'admin' ? 'primary' : 'secondary'}>
                          {user.role || 'user'}
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEditing(user)}
                          className="p-1"
                          disabled={editingUser?.id === user.id}
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(user.id)}
                          className="p-1 text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No users found.</p>
            </div>
          )}
        </Card>

        {/* User Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">👑</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Admins</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(user => user.role === 'admin').length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">📅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Recent Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(user => {
                    if (!user.created_at) return false;
                    const createdAt = new Date(user.created_at);
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                    return createdAt > thirtyDaysAgo;
                  }).length}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default UserManagement;