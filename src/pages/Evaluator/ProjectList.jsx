import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAssignedProjects } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const EvaluatorProjectList = () => {
  const { currentUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadProjects();
    }
  }, [currentUser]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await getAssignedProjects();
      
      // Debug: Log the raw API response
      console.log('📊 Raw API Response:', data);
      
      // Handle ReferenceHandler.Preserve format
      let projectsArray = data.$values || data;
      
      // Debug: Log the extracted array
      console.log('📋 Projects Array:', projectsArray);
      
      // Ensure it's an array
      if (!Array.isArray(projectsArray)) {
        projectsArray = [];
      }
      
      // Debug: Log first project to see structure
      if (projectsArray.length > 0) {
        console.log('🔍 First Project Structure:', projectsArray[0]);
      }
      
      setProjects(projectsArray);
    } catch (error) {
      console.error('❌ Failed to load assigned projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const getEvaluationStatus = (project) => {
    // Check if project has IsEvaluated field from backend
    const isEvaluated = project.IsEvaluated || project.isEvaluated;
    if (isEvaluated) {
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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Assigned Projects</h1>
        <p className="text-gray-600">View and evaluate projects assigned to you</p>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="text-6xl mb-4">📁</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Projects Assigned</h3>
          <p className="text-gray-600">You don't have any projects assigned yet. Check back later!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
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
