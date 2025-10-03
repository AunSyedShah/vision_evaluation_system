import { useEffect, useState } from 'react';
import { getProjectsForEvaluator, getEvaluations } from '../../utils/localStorage';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const EvaluatorDashboard = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    assignedProjects: 0,
    completedEvaluations: 0,
    pendingEvaluations: 0
  });

  useEffect(() => {
    if (currentUser) {
      const projects = getProjectsForEvaluator(currentUser.id);
      const evaluations = getEvaluations();
      const myEvaluations = evaluations.filter(e => e.evaluatorId === currentUser.id);
      
      setStats({
        assignedProjects: projects.length,
        completedEvaluations: myEvaluations.length,
        pendingEvaluations: projects.length - myEvaluations.length
      });
    }
  }, [currentUser]);

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Evaluator Dashboard</h1>
        <p className="text-gray-600">Welcome, {currentUser?.name}! Here's an overview of your assignments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Assigned Projects"
          value={stats.assignedProjects}
          icon="📁"
          color="border-blue-500"
          link="/evaluator/projects"
        />
        <StatCard
          title="Completed Evaluations"
          value={stats.completedEvaluations}
          icon="✅"
          color="border-green-500"
          link="/evaluator/projects"
        />
        <StatCard
          title="Pending Evaluations"
          value={stats.pendingEvaluations}
          icon="⏳"
          color="border-orange-500"
          link="/evaluator/projects"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/evaluator/projects"
              className="block px-4 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition duration-150 font-medium"
            >
              📋 View My Assigned Projects
            </Link>
            {stats.pendingEvaluations > 0 && (
              <div className="px-4 py-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-orange-800 font-medium">
                  You have {stats.pendingEvaluations} pending evaluation{stats.pendingEvaluations > 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">My Information</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <span className="text-gray-600">Name</span>
              <span className="font-semibold text-gray-900">{currentUser?.name}</span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <span className="text-gray-600">Email</span>
              <span className="font-semibold text-gray-900">{currentUser?.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Role</span>
              <span className="font-semibold text-green-600">Evaluator</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvaluatorDashboard;
