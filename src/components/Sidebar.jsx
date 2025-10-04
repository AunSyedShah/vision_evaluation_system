import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();

  const getSuperAdminLinks = () => [
    { to: '/superadmin/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/superadmin/projects', label: 'Projects', icon: '📁' },
    { to: '/superadmin/projects/add', label: 'Add Project', icon: '➕' },
    { to: '/superadmin/evaluators', label: 'Evaluators', icon: '👥' },
    { to: '/superadmin/results', label: 'All Results', icon: '📈' }
  ];

  const getAdminLinks = () => [
    { to: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/admin/projects', label: 'Projects', icon: '📁' },
    { to: '/admin/projects/add', label: 'Add Project', icon: '➕' }
  ];

  const getEvaluatorLinks = () => [
    { to: '/evaluator/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/evaluator/projects', label: 'My Projects', icon: '📁' },
    { to: '/evaluator/my-evaluations', label: 'My Evaluations', icon: '📝' }
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
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        ></div>
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        bg-[#ab509d] text-white w-64 min-h-screen p-6
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className="lg:hidden absolute top-4 right-4 text-white hover:text-gray-200"
          aria-label="Close menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mb-8 flex justify-center">
          <img src="/vision_logo.png" alt="Vision Logo" className="h-20 w-20 object-contain" />
        </div>
        
        <nav className="space-y-2">
          {getLinks().map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => onClose && onClose()}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition duration-150 ${
                  isActive
                    ? 'bg-white text-[#ab509d] font-semibold'
                    : 'text-white hover:bg-[#964a8a] hover:text-white'
                }`
              }
            >
              <span className="text-xl">{link.icon}</span>
              <span className="font-medium">{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
