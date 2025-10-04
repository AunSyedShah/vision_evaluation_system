import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Topbar = ({ onMenuToggle }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadgeColor = () => {
    switch (currentUser?.role) {
      case 'superadmin':
        return 'bg-[#ab509d] text-white';
      case 'admin':
        return 'bg-purple-100 text-[#ab509d]';
      case 'evaluator':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = () => {
    switch (currentUser?.role) {
      case 'superadmin':
        return 'Super Admin';
      case 'admin':
        return 'Admin';
      case 'evaluator':
        return 'Evaluator';
      default:
        return 'User';
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Hamburger menu for mobile */}
          <button
            onClick={onMenuToggle}
            className="lg:hidden text-gray-600 hover:text-gray-900 focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <img src="/vision_logo.png" alt="Vision Logo" className="h-10 sm:h-12 w-10 sm:w-12 object-contain" />
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-900">{currentUser?.name}</p>
            <span className={`inline-block text-xs font-semibold px-2 py-1 rounded ${getRoleBadgeColor()}`}>
              {getRoleLabel()}
            </span>
          </div>
          
          {/* Mobile: Show badge only */}
          <div className="sm:hidden">
            <span className={`inline-block text-xs font-semibold px-2 py-1 rounded ${getRoleBadgeColor()}`}>
              {getRoleLabel()}
            </span>
          </div>
          
          <button
            onClick={handleLogout}
            className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition duration-150"
          >
            <span className="hidden sm:inline">Logout</span>
            <span className="sm:hidden">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
