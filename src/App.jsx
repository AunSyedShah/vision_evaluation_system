import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';

// Auth pages
import Login from './pages/Login';
import Register from './pages/Register';
import Unauthorized from './pages/Unauthorized';

// Super Admin pages
import SuperAdminDashboard from './pages/SuperAdmin/Dashboard';
import SuperAdminProjectList from './pages/SuperAdmin/ProjectList';
import SuperAdminProjectForm from './pages/SuperAdmin/ProjectForm';
import SuperAdminProjectDetail from './pages/SuperAdmin/ProjectDetail';
import SuperAdminEvaluatorsList from './pages/SuperAdmin/EvaluatorsList';
import SuperAdminAllResults from './pages/SuperAdmin/AllResults';

// Admin pages
import AdminDashboard from './pages/Admin/Dashboard';
import AdminProjectList from './pages/Admin/ProjectList';
import AdminProjectDetail from './pages/Admin/ProjectDetail';

// Evaluator pages
import EvaluatorDashboard from './pages/Evaluator/Dashboard';
import EvaluatorProjectList from './pages/Evaluator/ProjectList';
import EvaluatorProjectDetail from './pages/Evaluator/ProjectDetail';
import EvaluatorMyEvaluations from './pages/Evaluator/MyEvaluations';

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Super Admin routes */}
          <Route path="/superadmin" element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<SuperAdminDashboard />} />
            <Route path="projects" element={<SuperAdminProjectList />} />
            <Route path="projects/add" element={<SuperAdminProjectForm />} />
            <Route path="projects/edit/:id" element={<SuperAdminProjectForm />} />
            <Route path="projects/:id" element={<SuperAdminProjectDetail />} />
            <Route path="evaluators" element={<SuperAdminEvaluatorsList />} />
            <Route path="results" element={<SuperAdminAllResults />} />
          </Route>

          {/* Admin routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="projects" element={<AdminProjectList />} />
            <Route path="projects/add" element={<SuperAdminProjectForm />} />
            <Route path="projects/:id" element={<AdminProjectDetail />} />
          </Route>

          {/* Evaluator routes */}
          <Route path="/evaluator" element={
            <ProtectedRoute allowedRoles={['evaluator']}>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<EvaluatorDashboard />} />
            <Route path="projects" element={<EvaluatorProjectList />} />
            <Route path="projects/:id" element={<EvaluatorProjectDetail />} />
            <Route path="my-evaluations" element={<EvaluatorMyEvaluations />} />
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
