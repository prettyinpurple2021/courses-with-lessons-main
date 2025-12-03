import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import GlassmorphicCard from '../components/common/GlassmorphicCard';
import GlassmorphicButton from '../components/common/GlassmorphicButton';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  role: string;
  createdAt: string;
  _count: {
    enrollments: number;
    certificates: number;
    activitySubmissions: number;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, searchQuery, roleFilter]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('accessToken');
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(searchQuery && { search: searchQuery }),
        ...(roleFilter && { role: roleFilter }),
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/admin/users?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to fetch users');
      }

      setUsers(data.data);
      setPagination(data.pagination);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to load users'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    fetchUsers();
  };

  const handlePageChange = (newPage: number) => {
    setPagination({ ...pagination, page: newPage });
  };

  if (isLoading && users.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen camo-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-hot-pink mb-2">
            User Management
          </h1>
          <p className="text-steel-grey">
            Manage students, view progress, and control access
          </p>
        </div>

        {/* Search and Filters */}
        <GlassmorphicCard className="p-6 mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full px-4 py-3 rounded-lg glassmorphic-input focus:outline-none focus:ring-2 focus:ring-hot-pink"
                />
              </div>
              <div>
                <select
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                    setPagination({ ...pagination, page: 1 });
                  }}
                  className="w-full px-4 py-3 rounded-lg glassmorphic-input focus:outline-none focus:ring-2 focus:ring-hot-pink"
                >
                  <option value="">All Roles</option>
                  <option value="student">Students</option>
                  <option value="admin">Admins</option>
                </select>
              </div>
            </div>
            <div className="flex gap-4">
              <GlassmorphicButton type="submit" variant="primary">
                Search
              </GlassmorphicButton>
              <GlassmorphicButton
                type="button"
                variant="secondary"
                onClick={() => {
                  setSearchQuery('');
                  setRoleFilter('');
                  setPagination({ ...pagination, page: 1 });
                }}
              >
                Clear Filters
              </GlassmorphicButton>
            </div>
          </form>
        </GlassmorphicCard>

        {/* User List */}
        <GlassmorphicCard className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-glossy-black">
              Users ({pagination.total})
            </h2>
          </div>

          {users.length === 0 ? (
            <div className="text-center py-12 text-steel-grey">
              No users found
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="bg-white/5 p-4 rounded-lg hover:bg-white/10 transition-all cursor-pointer"
                  onClick={() => navigate(`/admin/users/${user.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-hot-pink/20 flex items-center justify-center text-hot-pink font-bold">
                        {user.firstName[0]}
                        {user.lastName[0]}
                      </div>
                      <div>
                        <h3 className="font-semibold text-glossy-black">
                          {user.firstName} {user.lastName}
                        </h3>
                        <p className="text-sm text-steel-grey">{user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-hot-pink">
                          {user._count.enrollments}
                        </p>
                        <p className="text-xs text-steel-grey">Courses</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-success-teal">
                          {user._count.certificates}
                        </p>
                        <p className="text-xs text-steel-grey">Certificates</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-glossy-black">
                          {user._count.activitySubmissions}
                        </p>
                        <p className="text-xs text-steel-grey">Activities</p>
                      </div>
                      <div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.role === 'admin'
                              ? 'bg-hot-pink/20 text-hot-pink'
                              : 'bg-steel-grey/20 text-steel-grey'
                          }`}
                        >
                          {user.role.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-4 py-2 rounded-lg bg-steel-grey/20 text-glossy-black hover:bg-steel-grey/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-glossy-black">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-2 rounded-lg bg-steel-grey/20 text-glossy-black hover:bg-steel-grey/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </GlassmorphicCard>
      </div>
    </div>
  );
};

export default AdminUsersPage;
