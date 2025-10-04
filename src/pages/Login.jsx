import { useFormik } from 'formik';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const { login, verifyOTP } = useAuth();
  const [error, setError] = useState('');
  
  // Initialize OTP form state from sessionStorage (persist across accidental reloads)
  const [showOtpForm, setShowOtpForm] = useState(() => {
    return sessionStorage.getItem('showOtpForm') === 'true';
  });
  const [userEmail, setUserEmail] = useState(() => {
    return sessionStorage.getItem('otpUserEmail') || '';
  });
  const [otpCode, setOtpCode] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const showOtpFormRef = useRef(showOtpForm);

  // Keep ref in sync with state and persist to sessionStorage
  useEffect(() => {
    showOtpFormRef.current = showOtpForm;
    sessionStorage.setItem('showOtpForm', showOtpForm.toString());
    console.log('📝 showOtpForm changed to:', showOtpForm); // Debug
  }, [showOtpForm]);

  // Persist userEmail to sessionStorage
  useEffect(() => {
    if (userEmail) {
      sessionStorage.setItem('otpUserEmail', userEmail);
      console.log('📧 userEmail persisted:', userEmail); // Debug
    }
  }, [userEmail]);

  // Debug logging
  console.log('Login component render - showOtpForm:', showOtpForm, 'userEmail:', userEmail ? 'set' : 'empty', 'otpCode length:', otpCode.length);

  const handleVerifyOtp = async () => {
    // Validate email
    if (!userEmail || !userEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Validate OTP
    if (!otpCode || otpCode.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setVerifyingOtp(true);
    try {
      const result = await verifyOTP(userEmail, otpCode);
      if (result.success) {
        toast.success('Email verified successfully! Please login again.');
        // Reset form and hide OTP input
        setShowOtpForm(false);
        setOtpCode('');
        setUserEmail('');
        // Clear sessionStorage
        sessionStorage.removeItem('showOtpForm');
        sessionStorage.removeItem('otpUserEmail');
        console.log('✅ OTP verified, sessionStorage cleared'); // Debug
      } else {
        toast.error(result.error || 'OTP verification failed');
      }
    } catch {
      toast.error('OTP verification failed. Please try again.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      username: '',
      password: ''
    },
    enableReinitialize: false, // Prevent form from reinitializing on state changes
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
      console.log('Form submitted, showOtpForm:', showOtpForm, 'ref:', showOtpFormRef.current); // Debug
      
      // Don't submit if OTP form is already showing (check both state and ref)
      if (showOtpForm || showOtpFormRef.current) {
        console.log('OTP form already showing, blocking submission'); // Debug
        setSubmitting(false);
        return;
      }
      
      setError('');
      
      try {
        const result = await login(values.username, values.password);
        console.log('Login result:', result); // Debug
        
        if (result.success) {
          // Clear any OTP-related sessionStorage on successful login
          sessionStorage.removeItem('showOtpForm');
          sessionStorage.removeItem('otpUserEmail');
          console.log('✅ Login successful, sessionStorage cleared'); // Debug
          
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
          // Check if error is about OTP verification
          const errorMsg = result.error || '';
          console.log('Login error:', errorMsg); // Debug
          
          if (errorMsg.toLowerCase().includes('otp') || errorMsg.toLowerCase().includes('verify')) {
            // User needs to verify OTP - show OTP form
            // Store the username/email for OTP verification
            // Try to get email from result, otherwise use username
            const emailToUse = result.email || values.username;
            console.log('Switching to OTP form for:', emailToUse); // Debug
            console.log('Setting showOtpForm to TRUE'); // Debug
            
            // Set states synchronously
            setUserEmail(emailToUse);
            setShowOtpForm(true);
            setError('');
            
            console.log('After setting showOtpForm, current value:', true); // Debug
            
            // Don't navigate or reset - keep on same page
          } else {
            console.log('Not an OTP error, showing normal error'); // Debug
            setError(result.error);
          }
        }
      } catch {
        console.log('Login exception caught'); // Debug
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
          <div className="flex justify-center mb-4 sm:mb-6">
            <img src="/vision_logo.png" alt="Vision Logo" className="h-24 w-24 sm:h-32 sm:w-32 object-contain" />
          </div>
          <p className="text-sm sm:text-base text-gray-600">
            {showOtpForm ? 'Verify your email' : 'Sign in to your account'}
          </p>
        </div>

        {/* OTP Verification Form */}
        <div className={`space-y-4 sm:space-y-6 ${showOtpForm ? 'block' : 'hidden'}`}>
            <div className="bg-purple-50 border border-purple-200 text-purple-700 px-4 py-3 rounded-lg text-sm">
              <p className="font-semibold mb-1">📧 Email Verification Required</p>
              <p>Your account is not verified. Please enter your email and the 6-digit OTP code sent to your email.</p>
            </div>

            <div>
              <label htmlFor="verifyEmail" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="verifyEmail"
                name="verifyEmail"
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab509d] focus:border-transparent outline-none transition"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="otpCode" className="block text-sm font-medium text-gray-700 mb-2">
                Enter OTP Code
              </label>
              <input
                id="otpCode"
                name="otpCode"
                type="text"
                maxLength="6"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab509d] focus:border-transparent outline-none transition text-center text-2xl tracking-widest font-mono"
                placeholder="000000"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={verifyingOtp || otpCode.length !== 6 || !userEmail.includes('@')}
                className="flex-1 bg-[#ab509d] hover:bg-[#964a8a] text-white font-semibold py-3 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {verifyingOtp ? 'Verifying...' : 'Verify OTP'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowOtpForm(false);
                  setOtpCode('');
                  setUserEmail('');
                  // Clear sessionStorage
                  sessionStorage.removeItem('showOtpForm');
                  sessionStorage.removeItem('otpUserEmail');
                  console.log('❌ OTP form cancelled, sessionStorage cleared'); // Debug
                }}
                className="px-6 py-3 border-2 border-gray-300 hover:border-[#ab509d] text-gray-700 hover:text-[#ab509d] font-semibold rounded-lg transition duration-200"
              >
                Cancel
              </button>
            </div>

            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Didn&apos;t receive the code? Check your spam folder or try registering again.
              </p>
            </div>
        </div>

        {/* Login Form */}
        <form onSubmit={formik.handleSubmit} className={`space-y-4 sm:space-y-6 ${showOtpForm ? 'hidden' : 'block'}`}>
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

        {!showOtpForm && (
          <div className="mt-8 p-4 bg-purple-50 rounded-lg border border-purple-100">
            <p className="text-xs font-semibold text-[#ab509d] mb-2">Demo Credentials:</p>
            <div className="text-xs text-gray-600 space-y-1">
              <p><span className="font-medium">Super Admin:</span> SuperAdmin / SuperAdmin@123</p>
              <p><span className="font-medium">Admin (FSO):</span> FSO / FSO@123</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
