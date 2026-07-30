import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { Users, Edit2, Trash2, Shield, Building, User, Mail, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export const UserManagement = () => {
  const queryClient = useQueryClient();
  const [editingUser, setEditingUser] = useState<any>(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await api.get('/auth/users');
      return res.data.data;
    }
  });

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const res = await api.get('/departments');
      return res.data.data;
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.patch(`/auth/users/${data.id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setEditingUser(null);
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/auth/users/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });

  const handleEdit = (user: any) => {
    setEditingUser({ ...user });
  };

  const handleSave = () => {
    updateUserMutation.mutate({
      id: editingUser.id,
      fullName: editingUser.fullName,
      email: editingUser.email,
      roleName: editingUser.role,
      departmentId: editingUser.department?.id || editingUser.departmentId
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this user? This may fail if they have active complaints.')) {
      deleteUserMutation.mutate(id);
    }
  };

  if (isLoading) return <div className="p-8 text-primary-500 animate-pulse text-center font-semibold">Loading Users...</div>;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">User Management</h1>
          <p className="text-gray-500 mt-1">View, edit, and delete active users in the system.</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200">
          <Users className="w-5 h-5 text-primary-500" />
          <span className="font-semibold text-gray-700">{users?.length || 0} Active Users</span>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users?.map((user: any) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold">
                        {user.fullName.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{user.fullName}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-1"><Mail className="w-3 h-3" /> {user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                      user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                      user.role === 'OFFICER' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    {user.department ? (
                      <span className="text-sm text-gray-600 flex items-center gap-1">
                        <Building className="w-4 h-4 text-gray-400" /> {user.department.name}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400 italic">None</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(user)}
                        className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                        title="Edit User"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {users?.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No users found.
            </div>
          )}
        </div>
      </div>

      {editingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Edit User</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={editingUser.fullName}
                  onChange={e => setEditingUser({...editingUser, fullName: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  value={editingUser.email}
                  onChange={e => setEditingUser({...editingUser, email: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Role</label>
                <select 
                  value={editingUser.role}
                  onChange={e => setEditingUser({...editingUser, role: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option value="CITIZEN">CITIZEN</option>
                  <option value="OFFICER">OFFICER</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="OFFICIAL">OFFICIAL</option>
                </select>
              </div>
              {editingUser.role === 'OFFICER' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Department</label>
                  <select 
                    value={editingUser.departmentId || ''}
                    onChange={e => setEditingUser({...editingUser, departmentId: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value="">-- None --</option>
                    {departments?.map((d: any) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => setEditingUser(null)} className="px-4 py-2 text-gray-500 font-semibold hover:bg-gray-100 rounded-lg transition-colors">
                Cancel
              </button>
              <button 
                onClick={handleSave} 
                disabled={updateUserMutation.isPending}
                className="px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors shadow-md"
              >
                {updateUserMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
