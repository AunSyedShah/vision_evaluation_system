import { useFormik } from 'formik';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const Register = () => {
  const navigate = useNavigate();
  const { register, verifyOTP } = useAuth();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1); // 1 = registration form, 2 = OTP verification
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const formik = useFormik({
    initialValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
    validate: values => {
      const errors = {};
      
      if (!values.username) {
        errors.username = 'Username is required';
      }
      
      if (!values.email) {
        errors.email = 'Email is required';
      } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
        errors.email = 'Invalid email address';
      }
      
      if (!values.password) {
        errors.password = 'Password is required';
      } else if (values.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }
      
      if (!values.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (values.password !== values.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
      
      return errors;
    },
    onSubmit: async (values, { setSubmitting }) => {
      setError('');
      try {
        const result = await register({
          username: values.username,
          email: values.email,
          password: values.password
        });
        
        if (result.success) {
          setRegisteredEmail(values.email);
          setStep(2); // Move to OTP verification step
          setError('');
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError('Registration failed. Please try again.');
      } finally {
        setSubmitting(false);
      }
    }
  });

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setIsVerifying(true);

    try {
      const result = await verifyOTP(registeredEmail, otpCode);
      
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('OTP verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    try {
      const result = await register({
        username: formik.values.username,
        email: registeredEmail,
        password: formik.values.password
      });
      
      if (result.success) {
        setError('');
        toast.success('OTP has been resent to your email!');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-12">
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Evaluator Registration</h1>
          <p className="text-sm sm:text-base text-gray-600">Create your evaluator account</p>
        </div>

        {success ? (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-center">
            <p className="font-semibold mb-1">Verification Successful!</p>
            <p className="text-sm">Redirecting to login...</p>
          </div>
        ) : step === 1 ? (
          <form onSubmit={formik.handleSubmit} className="space-y-4 sm:space-y-5">
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
                placeholder="johndoe"
              />
              {formik.touched.username && formik.errors.username && (
                <div className="text-red-600 text-sm mt-1">{formik.errors.username}</div>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab509d] focus:border-transparent outline-none transition"
                placeholder="evaluator@example.com"
              />
              {formik.touched.email && formik.errors.email && (
                <div className="text-red-600 text-sm mt-1">{formik.errors.email}</div>
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

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.confirmPassword}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab509d] focus:border-transparent outline-none transition"
                placeholder="••••••••"
              />
              {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <div className="text-red-600 text-sm mt-1">{formik.errors.confirmPassword}</div>
              )}
            </div>

            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="w-full bg-[#ab509d] hover:bg-[#964a8a] text-white font-semibold py-3 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {formik.isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>

            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Already have an account? <Link to="/login" className="text-[#ab509d] hover:text-[#964a8a] font-medium">Sign in</Link>
              </p>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4 sm:space-y-5">
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm mb-4">
              <p className="font-semibold mb-1">📧 Check Your Email</p>
              <p>We've sent a 6-digit verification code to <strong>{registeredEmail}</strong></p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

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
                required
              />
              <p className="text-xs text-gray-500 mt-2 text-center">Enter the 6-digit code from your email</p>
            </div>

            <button
              type="submit"
              disabled={isVerifying || otpCode.length !== 6}
              className="w-full bg-[#ab509d] hover:bg-[#964a8a] text-white font-semibold py-3 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifying ? 'Verifying...' : 'Verify Email'}
            </button>

            <div className="text-center pt-4 space-y-2">
              <button
                type="button"
                onClick={handleResendOTP}
                className="text-sm text-[#ab509d] hover:text-[#964a8a] font-medium"
              >
                Resend OTP Code
              </button>
              <p className="text-sm text-gray-600">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setError('');
                    setOtpCode('');
                  }}
                  className="text-[#ab509d] hover:text-[#964a8a] font-medium"
                >
                  ← Back to registration
                </button>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Register;
