import { useEffect, useState } from 'react';
import { getAllProjects } from '../../utils/api';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalEvaluators: 0,
    averageScore: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch only projects (Admin/FSO doesn't have access to getAllUsers)
      let projects = await getAllProjects();
      
      // Handle .NET ReferenceHandler.Preserve format
      if (projects && projects.$values) {
        projects = projects.$values;
      }
      
      // Ensure array
      projects = Array.isArray(projects) ? projects : [];

      setStats({
        totalProjects: projects.length,
        totalEvaluators: 0, // Not accessible for Admin role
        averageScore: 0 // Will be calculated from evaluations
      });
    } catch (err) {
      console.error('Failed to load stats:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, link }) => (
    <Link to={link} className="block">
      <div className={`bg-white rounded-xl shadow-md p-6 border-l-4 ${color} hover:shadow-lg transition duration-200`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">{value}</p>
          </div>
          <div className="text-4xl">{icon}</div>
        </div>
      </div>
    </Link>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ab509d] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p className="font-semibold">Error</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome! Here's an overview of the system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <StatCard
          title="Total Projects"
          value={stats.totalProjects}
          icon="📁"
          color="border-blue-500"
          link="/admin/projects"
        />
        <StatCard
          title="Projects This Month"
          value={stats.totalProjects}
          icon="�"
          color="border-purple-500"
          link="/admin/projects"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/admin/projects/add"
              className="block px-4 py-3 bg-purple-50 hover:bg-purple-100 text-[#ab509d] rounded-lg transition duration-150 font-medium"
            >
              ➕ Add New Project
            </Link>
            <Link
              to="/admin/projects"
              className="block px-4 py-3 bg-purple-50 hover:bg-purple-100 text-[#ab509d] rounded-lg transition duration-150 font-medium"
            >
              📋 View All Projects
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">System Information</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <span className="text-gray-600">Role</span>
              <span className="font-semibold text-[#ab509d]">Administrator</span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <span className="text-gray-600">Access Level</span>
              <span className="font-semibold text-gray-900">View & Upload</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Permissions</span>
              <span className="font-semibold text-gray-900">Read-Only</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
