import { useEffect, useState } from 'react';
import { getAssignedProjects, getMyEvaluations } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const EvaluatorDashboard = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    assignedProjects: 0,
    completedEvaluations: 0,
    pendingEvaluations: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);

      // Load assigned projects
      const projectsData = await getAssignedProjects();
      const projectsArray = projectsData.$values || projectsData;
      const assignedCount = Array.isArray(projectsArray) ? projectsArray.length : 0;

      // Load my evaluations
      const evaluationsData = await getMyEvaluations();
      const evaluationsArray = evaluationsData.$values || evaluationsData;
      const completedCount = Array.isArray(evaluationsArray) ? evaluationsArray.length : 0;

      setStats({
        assignedProjects: assignedCount,
        completedEvaluations: completedCount,
        pendingEvaluations: Math.max(0, assignedCount - completedCount)
      });
    } catch (error) {
      console.error('❌ Failed to load dashboard stats:', error);
      setStats({
        assignedProjects: 0,
        completedEvaluations: 0,
        pendingEvaluations: 0
      });
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
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ab509d] mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome, {currentUser?.name}! 👋</h1>
        <p className="text-base text-gray-600">Your Startup Evaluation Portal</p>
      </div>

      {/* Status Overview - Large, Clear Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-md p-6 border border-blue-200">
          <div className="text-center">
            <div className="text-4xl mb-3">📁</div>
            <div className="text-3xl font-bold text-blue-900 mb-2">{stats.assignedProjects}</div>
            <div className="text-base font-semibold text-blue-800">Total Startups Assigned</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-md p-6 border border-green-200">
          <div className="text-center">
            <div className="text-4xl mb-3">✅</div>
            <div className="text-3xl font-bold text-green-900 mb-2">{stats.completedEvaluations}</div>
            <div className="text-base font-semibold text-green-800">Completed Reviews</div>
          </div>
        </div>
      </div>

      {/* Main Action Area */}
      {stats.pendingEvaluations > 0 ? (
        <div className="bg-gradient-to-r from-orange-100 to-orange-50 rounded-xl shadow-lg p-8 mb-8 border border-orange-300">
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">⏳</div>
            <h2 className="text-2xl font-bold text-orange-900 mb-3">
              You have {stats.pendingEvaluations} startup{stats.pendingEvaluations > 1 ? 's' : ''} waiting for your review
            </h2>
            <p className="text-base text-orange-800 mb-6">
              Click below to view and review the startups assigned to you
            </p>
          </div>
          <Link
            to="/evaluator/projects"
            className="block max-w-md mx-auto px-6 py-3 bg-[#ab509d] hover:bg-[#964a8a] text-white text-base font-semibold rounded-lg shadow-md transition duration-200 text-center"
          >
            📋 View Startups to Review
          </Link>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-green-100 to-green-50 rounded-xl shadow-lg p-8 mb-8 border border-green-300">
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-green-900 mb-3">
              Great job! All reviews completed
            </h2>
            <p className="text-base text-green-800 mb-6">
              You've reviewed all assigned startups. Check back later for new assignments.
            </p>
          </div>
          <Link
            to="/evaluator/projects"
            className="block max-w-md mx-auto px-6 py-3 bg-[#ab509d] hover:bg-[#964a8a] text-white text-base font-semibold rounded-lg shadow-md transition duration-200 text-center"
          >
            📋 View All My Startups
          </Link>
        </div>
      )}

      {/* How It Works Section */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 text-center">📖 How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">1️⃣</span>
            </div>
            <h3 className="font-bold text-base mb-2">View Startups</h3>
            <p className="text-gray-600 text-sm">Click "View Startups to Review" to see your assigned startups</p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">2️⃣</span>
            </div>
            <h3 className="font-bold text-base mb-2">Review & Score</h3>
            <p className="text-gray-600 text-sm">Click on any startup to view details and submit your scores</p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">3️⃣</span>
            </div>
            <h3 className="font-bold text-base mb-2">Done!</h3>
            <p className="text-gray-600 text-sm">Your review is submitted. You can edit it anytime before the deadline</p>
          </div>
        </div>
      </div>

      {/* Contact Support */}
      <div className="bg-gray-50 rounded-xl p-6 text-center">
        <p className="text-gray-600">
          <span className="font-semibold">Need help?</span> Contact the administrator or refer to the startup documents for more information.
        </p>
      </div>
    </div>
  );
};

export default EvaluatorDashboard;
