import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAssignedProjects, getMyEvaluations } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const EvaluatorProjectList = () => {
  const { currentUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    if (currentUser) {
      loadProjects();
    }
  }, [currentUser]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      
      // Fetch assigned projects
      const data = await getAssignedProjects();
      console.log('📊 Raw API Response:', data);
      
      // Handle ReferenceHandler.Preserve format
      let projectsArray = data.$values || data;
      
      // Ensure it's an array
      if (!Array.isArray(projectsArray)) {
        projectsArray = [];
      }
      
      console.log('📋 Projects Array:', projectsArray);
      
      // Fetch user's evaluations
      const evaluationsData = await getMyEvaluations();
      let evaluationsArray = evaluationsData.$values || evaluationsData;
      
      // Ensure it's an array
      if (!Array.isArray(evaluationsArray)) {
        evaluationsArray = [];
      }
      
      console.log('✅ My Evaluations:', evaluationsArray);
      
      setProjects(projectsArray);
      setEvaluations(evaluationsArray);
    } catch (error) {
      console.error('❌ Failed to load data:', error);
      setProjects([]);
      setEvaluations([]);
    } finally {
      setLoading(false);
    }
  };

  const getEvaluationStatus = (project) => {
    // Get project ID
    const projectId = project.Id || project.id || project.ProjectId || project.projectId;
    
    // Check if user has already evaluated this project
    const hasEvaluated = evaluations.some(evaluation => {
      const evalProjectId = evaluation.ProjectId || evaluation.projectId;
      return evalProjectId === projectId;
    });
    
    if (hasEvaluated) {
      return { text: 'Completed', color: 'bg-green-100 text-green-800' };
    }
    return { text: 'Pending', color: 'bg-orange-100 text-orange-800' };
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ab509d] mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading assigned projects...</p>
      </div>
    );
  }

  // Filter and sort projects
  const filteredAndSortedProjects = projects
    .filter(project => {
      // Search filter
      const startupName = (project.StartupName || project.startupName || '').toLowerCase();
      const startupDescription = (project.StartupDescription || project.startupDescription || '').toLowerCase();
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = startupName.includes(searchLower) || startupDescription.includes(searchLower);
      
      // Status filter
      if (filterStatus === 'all') return matchesSearch;
      
      const status = getEvaluationStatus(project);
      if (filterStatus === 'completed') return matchesSearch && status.text === 'Completed';
      if (filterStatus === 'pending') return matchesSearch && status.text === 'Pending';
      
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        const nameA = (a.StartupName || a.startupName || '').toLowerCase();
        const nameB = (b.StartupName || b.startupName || '').toLowerCase();
        return nameA.localeCompare(nameB);
      }
      if (sortBy === 'date') {
        const dateA = new Date(a.StartDate || a.startDate || 0);
        const dateB = new Date(b.StartDate || b.startDate || 0);
        return dateB - dateA;
      }
      if (sortBy === 'status') {
        const statusA = getEvaluationStatus(a).text;
        const statusB = getEvaluationStatus(b).text;
        return statusA.localeCompare(statusB);
      }
      return 0;
    });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Assigned Projects</h1>
        <p className="text-gray-600">View and evaluate projects assigned to you</p>
      </div>

      {/* Filter and Search */}
      {projects.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Projects
              </label>
              <input
                type="text"
                placeholder="Search by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab509d] focus:border-transparent outline-none"
              />
            </div>

            {/* Filter by Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab509d] focus:border-transparent outline-none"
              >
                <option value="all">All Projects</option>
                <option value="pending">Pending Evaluation</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab509d] focus:border-transparent outline-none"
              >
                <option value="date">Start Date (Newest)</option>
                <option value="name">Project Name (A-Z)</option>
                <option value="status">Status</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          {filteredAndSortedProjects.length !== projects.length && (
            <div className="mt-4 text-sm text-gray-600">
              Showing {filteredAndSortedProjects.length} of {projects.length} projects
            </div>
          )}
        </div>
      )}

      {filteredAndSortedProjects.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="text-6xl mb-4">📁</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {projects.length === 0 ? 'No Projects Assigned' : 'No Projects Found'}
          </h3>
          <p className="text-gray-600">
            {projects.length === 0 
              ? "You don't have any projects assigned yet. Check back later!" 
              : 'Try adjusting your search or filters'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedProjects.map((project) => {
            const status = getEvaluationStatus(project);
            // Backend Project model uses 'Id' as primary key
            const projectId = project.Id || project.id || project.ProjectId || project.projectId;
            const startupName = project.StartupName || project.startupName || 'Untitled Project';
            const startupDescription = project.StartupDescription || project.startupDescription || 'No description available';
            const startDate = project.StartDate || project.startDate;
            const endDate = project.EndDate || project.endDate;
            
            // Debug log
            if (!projectId) {
              console.error('⚠️ Project missing ID:', project);
            }
            
            return (
              <div key={projectId || `project-${Math.random()}`} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition duration-200">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">{startupName}</h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}>
                      {status.text}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{startupDescription}</p>
                  
                  <div className="space-y-2 mb-4 text-sm">
                    {startDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Start Date:</span>
                        <span className="font-medium text-gray-900">{new Date(startDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {endDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">End Date:</span>
                        <span className="font-medium text-gray-900">{new Date(endDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  
                  <Link
                    to={`/evaluator/projects/${projectId}`}
                    className="block w-full text-center px-4 py-2 bg-[#ab509d] hover:bg-[#964a8a] text-white font-medium rounded-lg transition duration-150"
                  >
                    {status.text === 'Completed' ? 'View Evaluation' : 'Evaluate Project'}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EvaluatorProjectList;
