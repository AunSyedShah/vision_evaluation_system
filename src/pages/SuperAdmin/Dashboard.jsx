import { useEffect, useState } from 'react';
import { getProjects, getEvaluators, getEvaluations } from '../../utils/localStorage';
import { Link } from 'react-router-dom';

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalEvaluators: 0,
    totalEvaluations: 0,
    pendingEvaluations: 0
  });

  useEffect(() => {
    const projects = getProjects();
    const evaluators = getEvaluators();
    const evaluations = getEvaluations();
    
    // Calculate pending evaluations (assigned but not submitted)
    let pending = 0;
    projects.forEach(project => {
      const assignedCount = project.assignedEvaluators?.length || 0;
      const submittedCount = evaluations.filter(e => e.projectId === project.id).length;
      pending += assignedCount - submittedCount;
    });

    setStats({
      totalProjects: projects.length,
      totalEvaluators: evaluators.length,
      totalEvaluations: evaluations.length,
      pendingEvaluations: pending
    });
  }, []);

  const StatCard = ({ title, value, icon, color, link }) => (
    <Link to={link} className="block">
      <div className={`bg-white rounded-xl shadow-md p-6 border-l-4 ${color} hover:shadow-lg transition duration-200`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
          </div>
          <div className="text-4xl">{icon}</div>
        </div>
      </div>
    </Link>
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Super Admin Dashboard</h1>
        <p className="text-gray-600">Welcome! Here's an overview of the system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Projects"
          value={stats.totalProjects}
          icon="📁"
          color="border-blue-500"
          link="/superadmin/projects"
        />
        <StatCard
          title="Total Evaluators"
          value={stats.totalEvaluators}
          icon="👥"
          color="border-green-500"
          link="/superadmin/evaluators"
        />
        <StatCard
          title="Completed Evaluations"
          value={stats.totalEvaluations}
          icon="✅"
          color="border-purple-500"
          link="/superadmin/projects"
        />
        <StatCard
          title="Pending Evaluations"
          value={stats.pendingEvaluations}
          icon="⏳"
          color="border-orange-500"
          link="/superadmin/projects"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/superadmin/projects/add"
              className="block px-4 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition duration-150 font-medium"
            >
              ➕ Add New Project
            </Link>
            <Link
              to="/superadmin/projects"
              className="block px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition duration-150 font-medium"
            >
              📋 View All Projects
            </Link>
            <Link
              to="/superadmin/evaluators"
              className="block px-4 py-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition duration-150 font-medium"
            >
              👥 Manage Evaluators
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">System Information</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <span className="text-gray-600">Role</span>
              <span className="font-semibold text-purple-600">Super Administrator</span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <span className="text-gray-600">Access Level</span>
              <span className="font-semibold text-gray-900">Full Access</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Permissions</span>
              <span className="font-semibold text-gray-900">All Operations</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
