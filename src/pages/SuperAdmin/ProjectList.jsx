import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getAllProjects, deleteProject as apiDeleteProject, getEvaluationsByProject, getAssignedUsers } from '../../utils/api';
import AssignEvaluatorsModal from '../../components/AssignEvaluatorsModal';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [evaluationsMap, setEvaluationsMap] = useState({}); // Store evaluation counts per project
  const [assignedEvaluatorsMap, setAssignedEvaluatorsMap] = useState({}); // Store assigned evaluators count per project

  useEffect(() => {
    loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAllProjects();
      console.log('📋 API Response:', data);
      
      // Handle both direct array and wrapped response
      let projectsArray = data;
      if (data && data.$values && Array.isArray(data.$values)) {
        // Handle .NET ReferenceHandler.Preserve format
        projectsArray = data.$values;
      } else if (!Array.isArray(data)) {
        // If data is not an array and doesn't have $values, set empty array
        projectsArray = [];
      }
      
      console.log('📋 Projects Array:', projectsArray);
      setProjects(projectsArray);
      
      // Load evaluation counts and assigned evaluators for each project
      await loadEvaluationsCounts(projectsArray);
      await loadAssignedEvaluatorsCounts(projectsArray);
    } catch (err) {
      console.error('❌ Failed to load projects:', err);
      setError(err.response?.data?.message || 'Failed to load projects. Please try again.');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const loadEvaluationsCounts = async (projectsList) => {
    try {
      const countsMap = {};
      
      // Fetch evaluations for each project
      await Promise.all(
        projectsList.map(async (project) => {
          const projectId = project.Id || project.id;
          if (projectId) {
            try {
              const evaluations = await getEvaluationsByProject(projectId);
              let evalArray = evaluations;
              
              // Handle $values wrapper
              if (evaluations && evaluations.$values) {
                evalArray = evaluations.$values;
              }
              
              countsMap[projectId] = Array.isArray(evalArray) ? evalArray.length : 0;
            } catch {
              console.log(`ℹ️ No evaluations for project ${projectId}`);
              countsMap[projectId] = 0;
            }
          }
        })
      );
      
      console.log('📊 Evaluations map:', countsMap);
      setEvaluationsMap(countsMap);
    } catch (error) {
      console.error('❌ Failed to load evaluations counts:', error);
    }
  };

  const loadAssignedEvaluatorsCounts = async (projectsList) => {
    try {
      const assignedMap = {};
      
      // Fetch assigned evaluators for each project
      await Promise.all(
        projectsList.map(async (project) => {
          const projectId = project.Id || project.id;
          if (projectId) {
            try {
              const response = await getAssignedUsers(projectId);
              
              // Extract assignedUsers array from response
              let usersArray = response?.assignedUsers || response;
              
              // Handle $values wrapper
              if (usersArray && usersArray.$values) {
                usersArray = usersArray.$values;
              }
              
              assignedMap[projectId] = Array.isArray(usersArray) ? usersArray.length : 0;
            } catch (error) {
              console.log(`ℹ️ No assigned evaluators for project ${projectId}`, error);
              assignedMap[projectId] = 0;
            }
          }
        })
      );
      
      console.log('👥 Assigned evaluators map:', assignedMap);
      setAssignedEvaluatorsMap(assignedMap);
    } catch (error) {
      console.error('❌ Failed to load assigned evaluators counts:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project? This will also delete all related evaluations.')) {
      try {
        await apiDeleteProject(id);
        await loadProjects();
      } catch (err) {
        console.error('Failed to delete project:', err);
        toast.error(err.response?.data?.message || 'Failed to delete project. Please try again.');
      }
    }
  };

  const handleOpenAssignModal = (project) => {
    setSelectedProject(project);
    setAssignModalOpen(true);
  };

  const handleCloseAssignModal = () => {
    setAssignModalOpen(false);
    setSelectedProject(null);
  };

  const handleAssignSuccess = () => {
    loadProjects(); // Reload projects after assignment
  };

  const filteredProjects = projects.filter(project => {
    const startupName = (project.StartupName || project.startupName || '').toLowerCase();
    const description = (project.StartupDescription || project.startupDescription || '').toLowerCase();
    const founderName = (project.FounderName || project.founderName || '').toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    
    return startupName.includes(searchLower) || 
           description.includes(searchLower) || 
           founderName.includes(searchLower);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ab509d] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p className="font-semibold">Error loading projects</p>
        <p className="text-sm">{error}</p>
        <button
          onClick={loadProjects}
          className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Projects</h1>
          <p className="text-gray-600">Manage all projects in the system</p>
        </div>
        <Link
          to="/superadmin/projects/add"
          className="px-4 sm:px-6 py-2 sm:py-3 bg-[#ab509d] hover:bg-[#964a8a] text-white text-sm sm:text-base font-semibold rounded-lg shadow-md transition duration-150"
        >
          ➕ Add New Project
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search projects by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab509d] focus:border-transparent outline-none"
          />
          <button className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition duration-150">
            Search
          </button>
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="text-6xl mb-4">📁</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Projects Found</h3>
          <p className="text-gray-600 mb-6">Get started by adding your first project</p>
          <Link
            to="/superadmin/projects/add"
            className="inline-block px-6 py-3 bg-[#ab509d] hover:bg-[#964a8a] text-white font-semibold rounded-lg shadow-md transition duration-150"
          >
            Add Project
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Startup Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProjects.map((project) => {
                const projectId = project.Id || project.id;
                const startupName = project.StartupName || project.startupName || 'Untitled';
                const founderName = project.FounderName || project.founderName || 'N/A';
                const description = project.StartupDescription || project.startupDescription || 'No description';
                const status = project.StartupStatus || project.startupStatus || '';
                const assignedCount = assignedEvaluatorsMap[projectId] || 0;
                const evaluationCount = evaluationsMap[projectId] || 0;

                // Get status badge color
                const getStatusBadge = () => {
                  if (!status || status.trim() === '') {
                    return (
                      <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-700">
                        Not Specified
                      </span>
                    );
                  }
                  
                  const statusLower = status.toLowerCase();
                  if (statusLower.includes('idea')) {
                    return (
                      <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                        {status}
                      </span>
                    );
                  } else if (statusLower.includes('early') || statusLower.includes('prototype')) {
                    return (
                      <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {status}
                      </span>
                    );
                  } else if (statusLower.includes('established') || statusLower.includes('growth')) {
                    return (
                      <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {status}
                      </span>
                    );
                  } else {
                    return (
                      <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                        {status}
                      </span>
                    );
                  }
                };

                // Get progress badge (n/m format)
                const getProgressBadge = () => {
                  // No evaluators assigned
                  if (assignedCount === 0) {
                    return (
                      <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-700">
                        🚫 0/0 (No Evaluators)
                      </span>
                    );
                  }
                  
                  // All evaluations completed
                  if (evaluationCount === assignedCount) {
                    return (
                      <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        ✅ {evaluationCount}/{assignedCount} (Complete)
                      </span>
                    );
                  }
                  
                  // Some evaluations completed
                  if (evaluationCount > 0) {
                    return (
                      <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        📝 {evaluationCount}/{assignedCount} (In Progress)
                      </span>
                    );
                  }
                  
                  // No evaluations yet
                  return (
                    <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      ⏳ 0/{assignedCount} (Pending)
                    </span>
                  );
                };

                return (
                  <tr key={projectId} className="hover:bg-gray-50 transition duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{startupName}</div>
                      <div className="text-xs text-gray-500">{founderName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 max-w-xs truncate">{description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getProgressBadge()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Link
                        to={`/superadmin/projects/${projectId}`}
                        className="text-[#ab509d] hover:text-[#964a8a]"
                      >
                        View
                      </Link>
                      <Link
                        to={`/superadmin/projects/edit/${projectId}`}
                        className="text-[#ab509d] hover:text-[#964a8a]"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleOpenAssignModal(project)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Assign Evaluators"
                      >
                        Assign
                      </button>
                      <button
                        onClick={() => handleDelete(projectId)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Assign Evaluators Modal */}
      {selectedProject && (
        <AssignEvaluatorsModal
          isOpen={assignModalOpen}
          onClose={handleCloseAssignModal}
          projectId={selectedProject.id}
          projectName={selectedProject.startupName || 'Untitled Project'}
          onSuccess={handleAssignSuccess}
        />
      )}
    </div>
  );
};

export default ProjectList;
