import { createContext, useContext, useState, useEffect } from 'react';
import { 
  getCurrentUser, 
  setCurrentUser as saveCurrentUser, 
  clearCurrentUser,
  authenticateUser,
  addUser,
  initializeStorage
} from '../utils/localStorage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize storage with seed data
    initializeStorage();
    
    // Check if user is already logged in
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    const user = authenticateUser(email, password);
    if (user) {
      setCurrentUser(user);
      saveCurrentUser(user);
      return { success: true, user };
    }
    return { success: false, error: 'Invalid credentials' };
  };

  const register = (userData) => {
    try {
      // Only evaluators can register
      const newUser = addUser({
        ...userData,
        role: 'evaluator'
      });
      return { success: true, user: newUser };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    clearCurrentUser();
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
