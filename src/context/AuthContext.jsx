import { createContext, useContext, useState, useEffect } from 'react';
import { 
  loginUser as apiLogin,
  registerUser as apiRegister,
  verifyOTP as apiVerifyOTP,
} from '../utils/api';
import { initializeStorage } from '../utils/localStorage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize localStorage with seed data (for backwards compatibility)
    initializeStorage();
    
    // Check if user is already logged in (check for JWT token)
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      // Call backend API
      // Backend expects: { Username, Password } (capital letters)
      const data = await apiLogin({ Username: username, Password: password });
      
      // Store JWT token
      localStorage.setItem('token', data.token);
      
      // Create user object with mapped role
      const user = {
        id: data.userId || data.username, // Backend might not return userId in login
        username: data.username,
        email: data.email,
        role: data.role // Already mapped by api.js (SuperAdmin→superadmin, FSO→admin, User→evaluator)
      };
      
      // Save user to localStorage and state
      localStorage.setItem('user', JSON.stringify(user));
      setCurrentUser(user);
      
      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message 
        || error.response?.data 
        || error.message 
        || 'Login failed. Please check your credentials.';
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      // Call backend API to register (sends OTP email)
      const response = await apiRegister({
        username: userData.username,
        email: userData.email,
        password: userData.password
      });
      
      return { 
        success: true, 
        message: response.message || 'Registration successful! Please check your email for OTP.',
        email: userData.email // Return email for OTP verification step
      };
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message 
        || error.response?.data 
        || error.message 
        || 'Registration failed. Please try again.';
      return { success: false, error: errorMessage };
    }
  };

  const verifyOTP = async (email, otpCode) => {
    try {
      // Call backend API to verify OTP
      // Backend expects: { Email, Otp } (capital letters)
      const response = await apiVerifyOTP({ Email: email, Otp: otpCode });
      
      return { 
        success: true, 
        message: response.message || 'Email verified successfully! You can now login.'
      };
    } catch (error) {
      console.error('OTP verification error:', error);
      const errorMessage = error.response?.data?.message 
        || error.response?.data 
        || error.message 
        || 'OTP verification failed. Please check the code.';
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const isAuthenticated = () => {
    return currentUser !== null;
  };

  const hasRole = (role) => {
    return currentUser?.role === role;
  };

  const isSuperAdmin = () => {
    return currentUser?.role === 'superadmin';
  };

  const isAdmin = () => {
    return currentUser?.role === 'admin';
  };

  const isEvaluator = () => {
    return currentUser?.role === 'evaluator';
  };

  const value = {
    currentUser,
    login,
    register,
    verifyOTP,
    logout,
    isAuthenticated,
    hasRole,
    isSuperAdmin,
    isAdmin,
    isEvaluator,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
