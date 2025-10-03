import { useFormik } from 'formik';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState('');

  const formik = useFormik({
    initialValues: {
      username: '',
      password: ''
    },
    validate: values => {
      const errors = {};
      if (!values.username) {
        errors.username = 'Username is required';
      }
      if (!values.password) {
        errors.password = 'Password is required';
      }
      return errors;
    },
    onSubmit: async (values, { setSubmitting }) => {
      setError('');
      try {
        const result = await login(values.username, values.password);
        if (result.success) {
          const { role } = result.user;
          // Role already mapped by api.js: SuperAdmin→superadmin, FSO→admin, User→evaluator
          if (role === 'superadmin') {
            navigate('/superadmin/dashboard');
          } else if (role === 'admin') {
            navigate('/admin/dashboard');
          } else if (role === 'evaluator') {
            navigate('/evaluator/dashboard');
          }
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError('Login failed. Please try again.');
      } finally {
        setSubmitting(false);
      }
    }
  });

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">
      {/* Diagonal split background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-white"></div>
        <div 
          className="absolute inset-0 bg-[#ab509d]" 
          style={{
            clipPath: 'polygon(0 0, 100% 0, 50% 100%, 0 100%)'
          }}
        ></div>
      </div>
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-6 sm:p-8 mx-4">
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex justify-center mb-3 sm:mb-4">
            <img src="/vision_logo.png" alt="Logo" className="h-12 w-12 sm:h-16 sm:w-16 object-contain" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Project Evaluation System</h1>
          <p className="text-sm sm:text-base text-gray-600">Sign in to your account</p>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-4 sm:space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.username}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab509d] focus:border-transparent outline-none transition"
              placeholder="Enter your username"
            />
            {formik.touched.username && formik.errors.username && (
              <div className="text-red-600 text-sm mt-1">{formik.errors.username}</div>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.password}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab509d] focus:border-transparent outline-none transition"
              placeholder="••••••••"
            />
            {formik.touched.password && formik.errors.password && (
              <div className="text-red-600 text-sm mt-1">{formik.errors.password}</div>
            )}
          </div>

          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="w-full bg-[#ab509d] hover:bg-[#964a8a] text-white font-semibold py-3 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {formik.isSubmitting ? 'Signing in...' : 'LOGIN'}
          </button>

          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Evaluator? <Link to="/register" className="text-[#ab509d] hover:text-[#964a8a] font-medium">Create an account</Link>
            </p>
          </div>
        </form>

        <div className="mt-8 p-4 bg-purple-50 rounded-lg border border-purple-100">
          <p className="text-xs font-semibold text-[#ab509d] mb-2">Demo Credentials:</p>
          <div className="text-xs text-gray-600 space-y-1">
            <p><span className="font-medium">Super Admin:</span> SuperAdmin / SuperAdmin@123</p>
            <p><span className="font-medium">Admin (FSO):</span> FSO / FSO@123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
