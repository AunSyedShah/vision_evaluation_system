import axios from 'axios';

// Create axios instance with base configuration
// Backend URLs from launchSettings.json:
//   HTTP:  http://localhost:5063/api (default)
//   HTTPS: https://localhost:7034/api (alternative)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5063/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log outgoing requests in development
    if (import.meta.env.DEV) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Setup Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors with detailed logging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Detailed error logging for debugging
    console.group('🔴 API Error Details');
    
    if (error.response) {
      // Server responded with error status
      console.error('📡 Response Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers,
        url: error.config?.url,
        method: error.config?.method?.toUpperCase()
      });
      
      // Handle specific status codes
      if (error.response.status === 401) {
        console.warn('🔒 Authentication Error: Token expired or invalid');
        
        // Check if this is an OTP verification error (unverified account)
        const errorMessage = error.response?.data?.message || error.response?.data || '';
        const isOtpVerificationError = 
          typeof errorMessage === 'string' && 
          (errorMessage.toLowerCase().includes('otp') || 
           errorMessage.toLowerCase().includes('verify') ||
           errorMessage.toLowerCase().includes('email verification'));
        
        if (isOtpVerificationError) {
          console.warn('📧 OTP Verification Required: User needs to verify email');
          // Don't redirect - let the Login component handle showing OTP form
          // Just pass the error through
        } else {
          // Only redirect for actual authentication failures (invalid token, expired session)
          console.warn('🔒 Clearing credentials and redirecting to login');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      } else if (error.response.status === 403) {
        console.warn('🚫 Authorization Error: Access forbidden');
      } else if (error.response.status === 404) {
        console.warn('🔍 Not Found: Resource does not exist');
      } else if (error.response.status === 500) {
        console.error('💥 Server Error: Internal server error');
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('📡 Network Error (No Response):', {
        message: error.message,
        request: {
          url: error.config?.url,
          method: error.config?.method?.toUpperCase(),
          baseURL: error.config?.baseURL,
          headers: error.config?.headers
        }
      });
      
      // Check for specific network error types
      if (error.message === 'Network Error') {
        console.error('🌐 NETWORK ERROR DETECTED:');
        console.error('   Possible causes:');
        console.error('   1. ❌ CORS Error - Backend not allowing frontend origin');
        console.error('   2. ❌ Backend not running - Check if dotnet run is active');
        console.error('   3. ❌ Wrong URL - Check VITE_API_URL in .env');
        console.error('   4. ❌ SSL Certificate - Try HTTP instead of HTTPS');
        console.error('   5. ❌ Firewall blocking connection');
        console.error('');
        console.error('   Solutions:');
        console.error('   ✅ Check backend is running: cd VisionManagement && dotnet run');
        console.error('   ✅ Check CORS in Program.cs allows your origin');
        console.error('   ✅ Try HTTP URL: http://localhost:5063/api');
        console.error('   ✅ Check .env: VITE_API_URL=' + (import.meta.env.VITE_API_URL || 'NOT SET'));
      } else if (error.code === 'ECONNREFUSED') {
        console.error('🔌 CONNECTION REFUSED:');
        console.error('   Backend is not running or not accessible');
        console.error('   ✅ Start backend: cd VisionManagement && dotnet run');
      } else if (error.code === 'ETIMEDOUT') {
        console.error('⏱️ CONNECTION TIMEOUT:');
        console.error('   Backend took too long to respond');
      } else if (error.message.includes('ERR_CERT')) {
        console.error('🔒 SSL CERTIFICATE ERROR:');
        console.error('   ✅ Trust certificate: dotnet dev-certs https --trust');
        console.error('   ✅ Or use HTTP: VITE_API_URL=http://localhost:5063/api');
      }
    } else {
      // Something else happened
      console.error('❓ Unknown Error:', error.message);
      console.error('   Stack:', error.stack);
    }
    
    console.groupEnd();
    
    return Promise.reject(error);
  }
);

// Role mapping: Backend -> Frontend
const roleMap = {
  'SuperAdmin': 'superadmin',
  'FSO': 'admin',
  'User': 'evaluator',
};

// Reverse mapping: Frontend -> Backend
const reverseRoleMap = {
  'superadmin': 'SuperAdmin',
  'admin': 'FSO',
  'evaluator': 'User',
};

// Helper function to map backend role to frontend
export const mapBackendRole = (backendRole) => {
  return roleMap[backendRole] || backendRole.toLowerCase();
};

// Helper function to map frontend role to backend
export const mapFrontendRole = (frontendRole) => {
  return reverseRoleMap[frontendRole] || frontendRole;
};

// ============================================
// AUTHENTICATION ENDPOINTS
// ============================================

/**
 * Register new user (evaluator)
 * @param {Object} userData - { username, email, password }
 * @returns {Promise} Success message
 */
export const registerUser = async (userData) => {
  const response = await api.post('/Authentication/register', userData);
  return response.data;
};

/**
 * Verify OTP code sent to email
 * @param {Object} otpData - { email, otpCode }
 * @returns {Promise} Success message
 */
export const verifyOTP = async (otpData) => {
  const response = await api.post('/Authentication/verify-otp', otpData);
  return response.data;
};

/**
 * Login user and get JWT token
 * @param {Object} credentials - { Username, Password }
 * @returns {Promise} { token, username, role }
 */
export const loginUser = async (credentials) => {
  const response = await api.post('/Authentication/login', credentials);
  const data = response.data;
  
  // Map backend role to frontend role
  if (data.role) {
    data.role = mapBackendRole(data.role);
  }
  
  return data;
};

// ============================================
// PROJECT ENDPOINTS
// ============================================

/**
 * Get all projects (FSO, SuperAdmin only)
 * @returns {Promise} Array of projects
 */
export const getAllProjects = async () => {
  const response = await api.get('/Projects');
  return response.data;
};

/**
 * Get project by ID
 * @param {number} id - Project ID
 * @returns {Promise} Project object
 */
export const getProjectById = async (id) => {
  const response = await api.get(`/Projects/${id}`);
  return response.data;
};

/**
 * Create new project with file uploads
 * @param {FormData} formData - Project data with files
 * @returns {Promise} Created project
 */
export const createProject = async (formData) => {
  const response = await api.post('/Projects/create', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Update existing project
 * @param {number} id - Project ID
 * @param {FormData} formData - Updated project data
 * @returns {Promise} Updated project
 */
export const updateProject = async (id, formData) => {
  const response = await api.put(`/Projects/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Delete project
 * @param {number} id - Project ID
 * @returns {Promise} Success message
 */
export const deleteProject = async (id) => {
  const response = await api.delete(`/Projects/${id}`);
  return response.data;
};

/**
 * Bulk upload projects from CSV/Excel
 * @param {FormData} formData - File data
 * @returns {Promise} Upload result
 */
export const bulkUploadProjects = async (formData) => {
  const response = await api.post('/Projects/bulk-upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// ============================================
// SUPER ADMIN ENDPOINTS
// ============================================

/**
 * Get all users with role "User" (evaluators)
 * @returns {Promise} Array of evaluators
 */
export const getAllEvaluators = async () => {
  const response = await api.get('/SuperAdmin/getAllUsers');
  return response.data;
};

/**
 * Assign project to multiple evaluators (SuperAdmin) - Initial assignment
 * @param {Object} assignmentData - { projectId, userIds: [1, 2, 3] }
 * @returns {Promise} Success message
 */
export const assignProjectToEvaluators = async (assignmentData) => {
  const response = await api.post('/SuperAdmin/assignProject', assignmentData);
  return response.data;
};

/**
 * Update project evaluator assignments (SuperAdmin) - Replace existing assignments
 * @param {Object} assignmentData - { projectId, userIds: [1, 2, 3] }
 * @returns {Promise} Success message
 */
export const updateProjectAssignment = async (assignmentData) => {
  const response = await api.put('/SuperAdmin/updateAssignment', assignmentData);
  return response.data;
};

/**
 * Get assigned users for a project (SuperAdmin)
 * @param {number} projectId - Project ID
 * @returns {Promise} Array of assigned user IDs
 */
export const getAssignedUsers = async (projectId) => {
  const response = await api.get(`/SuperAdmin/getAssignedUsers/${projectId}`);
  return response.data;
};

/**
 * Unassign a single user from a project (SuperAdmin)
 * @param {number} projectId - Project ID
 * @param {number} userId - User ID to remove
 * @returns {Promise} Success message
 */
export const unassignUser = async (projectId, userId) => {
  const response = await api.delete(`/SuperAdmin/unassignUser/${projectId}/${userId}`);
  return response.data;
};

// ============================================
// EVALUATION ENDPOINTS (NOW IMPLEMENTED!)
// ============================================

/**
 * Get projects assigned to the current evaluator
 * @returns {Promise} Array of assigned projects
 */
export const getAssignedProjects = async () => {
  const response = await api.get('/Evaluations/assigned');
  return response.data;
};

/**
 * Submit evaluation for a project (Evaluator only)
 * NOTE: Frontend field names need to be mapped to backend field names
 * @param {number} projectId - Project ID
 * @param {Object} evaluationData - Evaluation with frontend field names
 * @returns {Promise} Created evaluation
 */
export const submitEvaluation = async (projectId, evaluationData) => {
  console.log('📥 Received evaluation data from form:', evaluationData);
  
  // Map frontend camelCase field names to backend PascalCase field names
  const backendData = {
    ProblemSignificance: evaluationData.problemSignificance || evaluationData.ProblemSignificance || 0,
    InnovationTechnical: evaluationData.innovationTechnical || evaluationData.InnovationTechnical || 0,
    MarketScalability: evaluationData.marketScalability || evaluationData.MarketScalability || 0,
    TractionImpact: evaluationData.tractionImpact || evaluationData.TractionImpact || 0,
    BusinessModel: evaluationData.businessModel || evaluationData.BusinessModel || 0,
    TeamExecution: evaluationData.teamExecution || evaluationData.TeamExecution || 0,
    EthicsEquity: evaluationData.ethicsEquity || evaluationData.EthicsEquity || 0,
    Strengths: evaluationData.strengths || evaluationData.Strengths || '',
    Weaknesses: evaluationData.weaknesses || evaluationData.Weaknesses || '',
    Recommendation: evaluationData.recommendation || evaluationData.Recommendation || ''
  };
  
  console.log('📤 Sending evaluation data to backend:', backendData);
  
  const response = await api.post(`/Evaluations/${projectId}`, backendData);
  
  console.log('✅ Backend response:', response.data);
  
  return response.data;
};

/**
 * Get all evaluations submitted by current evaluator
 * @returns {Promise} Array of my evaluations
 */
export const getMyEvaluations = async () => {
  const response = await api.get('/Evaluations/my');
  return response.data;
};

/**
 * Get all evaluations for a specific project (SuperAdmin, FSO only)
 * @param {number} projectId - Project ID
 * @returns {Promise} Array of evaluations for the project
 */
export const getEvaluationsByProject = async (projectId) => {
  const response = await api.get(`/Evaluations/project/${projectId}`);
  return response.data;
};

/**
 * Get all evaluations from all projects (SuperAdmin only)
 * Note: Backend doesn't have a dedicated endpoint for this yet.
 * You may need to fetch all projects and then get evaluations for each.
 * @returns {Promise} Array of all evaluations
 */
export const getAllEvaluations = async () => {
  // Backend doesn't have /api/Evaluations endpoint yet
  // Workaround: Get all projects, then get evaluations for each
  console.warn('No dedicated "get all evaluations" endpoint. Consider implementing in backend or fetching per project.');
  
  // Option 1: If you have project IDs, loop through them
  // const projects = await getAllProjects();
  // const allEvaluations = await Promise.all(
  //   projects.map(p => getEvaluationsByProject(p.Id))
  // );
  // return allEvaluations.flat();
  
  // For now, throw error to remind to implement
  throw new Error('getAllEvaluations requires backend endpoint implementation');
};

// ============================================
// FILE SERVING
// ============================================

/**
 * Get full URL for uploaded file
 * @param {string} filePath - Relative file path from backend
 * @returns {string} Full URL to file
 */
export const getFileUrl = (filePath) => {
  if (!filePath) return null;
  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://localhost:7034';
  return `${baseUrl}/${filePath}`;
};

export default api;
