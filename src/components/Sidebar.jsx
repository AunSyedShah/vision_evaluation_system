import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { currentUser } = useAuth();

  const getSuperAdminLinks = () => [
    { to: '/superadmin/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/superadmin/projects', label: 'Projects', icon: '📁' },
    { to: '/superadmin/projects/add', label: 'Add Project', icon: '➕' },
    { to: '/superadmin/evaluators', label: 'Evaluators', icon: '👥' }
  ];

  const getAdminLinks = () => [
    { to: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/admin/projects', label: 'Projects', icon: '📁' },
    { to: '/admin/projects/add', label: 'Add Project', icon: '➕' }
  ];

  const getEvaluatorLinks = () => [
    { to: '/evaluator/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/evaluator/projects', label: 'My Projects', icon: '📁' }
  ];

  const getLinks = () => {
    switch (currentUser?.role) {
      case 'superadmin':
        return getSuperAdminLinks();
      case 'admin':
        return getAdminLinks();
      case 'evaluator':
        return getEvaluatorLinks();
      default:
        return [];
    }
  };

  return (
    <div className="bg-gray-900 text-white w-64 min-h-screen p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">PES</h1>
        <p className="text-xs text-gray-400 mt-1">Project Evaluation System</p>
      </div>
      
      <nav className="space-y-2">
        {getLinks().map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition duration-150 ${
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <span className="text-xl">{link.icon}</span>
            <span className="font-medium">{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
