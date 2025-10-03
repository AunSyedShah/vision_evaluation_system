import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Unauthorized = () => {
  const { currentUser } = useAuth();

  const getRedirectPath = () => {
    if (!currentUser) return '/login';
    if (currentUser.role === 'superadmin') return '/superadmin/dashboard';
    if (currentUser.role === 'admin') return '/admin/dashboard';
    if (currentUser.role === 'evaluator') return '/evaluator/dashboard';
    return '/login';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">🚫</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page.
        </p>
        <Link
          to={getRedirectPath()}
          className="inline-block px-6 py-3 bg-[#ab509d] hover:bg-[#964a8a] text-white font-semibold rounded-lg shadow-md transition duration-150"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
