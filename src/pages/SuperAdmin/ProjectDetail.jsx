import { useParams, Link } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { 
  getProjectById,
  getAllEvaluators,
  assignProjectToEvaluators,
  getEvaluationsByProject
} from '../../utils/api';

const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [evaluators, setEvaluators] = useState([]);
  const [selectedEvaluators, setSelectedEvaluators] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProjectData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch project details
      let projectData = await getProjectById(parseInt(id));
      console.log('Project Data:', projectData); // Debug
      
      // Handle .NET ReferenceHandler.Preserve format (single object might have $id)
      // For single objects, no $values but may have $id
      setProject(projectData);
      
      // Fetch all evaluators
      let allEvaluators = await getAllEvaluators();
      console.log('All Evaluators:', allEvaluators); // Debug
      
      // Handle .NET ReferenceHandler.Preserve format
      if (allEvaluators && allEvaluators.$values) {
        allEvaluators = allEvaluators.$values;
      }
      
      // Filter only verified evaluators with role "User"
      const verifiedEvaluators = Array.isArray(allEvaluators)
        ? allEvaluators.filter(user => {
            // Handle Role as object or string
            let roleName = '';
            if (typeof user.role === 'object' && user.role !== null) {
              roleName = user.role.roleName || user.role.RoleName || '';
            } else if (typeof user.Role === 'object' && user.Role !== null) {
              roleName = user.Role.roleName || user.Role.RoleName || '';
            } else {
              roleName = user.Role || user.role || user.RoleName || user.roleName || '';
            }
            
            const isVerified = user.isOtpVerified || user.IsOtpVerified || false;
            const isEvaluatorRole = roleName === 'User' || roleName === 'user' || roleName === 'Evaluator' || roleName === 'evaluator';
            return isEvaluatorRole && isVerified;
          })
        : [];
      
      console.log('Verified Evaluators:', verifiedEvaluators); // Debug
      setEvaluators(verifiedEvaluators);
      
      // Fetch evaluations for this project
      let projectEvaluations = await getEvaluationsByProject(parseInt(id));
      console.log('Project Evaluations:', projectEvaluations); // Debug
      
      // Handle .NET ReferenceHandler.Preserve format
      if (projectEvaluations && projectEvaluations.$values) {
        projectEvaluations = projectEvaluations.$values;
      }
      setEvaluations(Array.isArray(projectEvaluations) ? projectEvaluations : []);
      
    } catch (err) {
      console.error('Failed to load project data:', err);
      console.error('Error details:', err.response); // Debug
      setError(err.response?.data?.message || 'Failed to load project details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProjectData();
  }, [loadProjectData]);

  const handleEvaluatorToggle = (evaluatorId) => {
    if (selectedEvaluators.includes(evaluatorId)) {
      setSelectedEvaluators(selectedEvaluators.filter(id => id !== evaluatorId));
    } else {
      setSelectedEvaluators([...selectedEvaluators, evaluatorId]);
    }
  };

  const handleAssignEvaluators = async () => {
    try {
      await assignProjectToEvaluators({
        ProjectId: parseInt(id),
        UserIds: selectedEvaluators
      });
      toast.success('Evaluators assigned successfully!');
      loadProjectData();
    } catch (err) {
      console.error('Failed to assign evaluators:', err);
      toast.error(err.response?.data?.message || 'Failed to assign evaluators.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ab509d] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg inline-block">
          <p className="font-semibold">Error loading project</p>
          <p className="text-sm">{error}</p>
        </div>
        <br />
        <Link to="/superadmin/projects" className="text-[#ab509d] hover:text-[#ab509d] mt-4 inline-block">
          ← Back to Projects
        </Link>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Project not found</h2>
        <Link to="/superadmin/projects" className="text-[#ab509d] hover:text-[#ab509d] mt-4 inline-block">
          Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <Link to="/superadmin/projects" className="text-[#ab509d] hover:text-[#ab509d] mb-4 inline-block">
          ← Back to Projects
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {project.StartupName || project.startupName || 'Untitled Project'}
        </h1>
        <p className="text-gray-600">
          {project.StartupDescription || project.startupDescription || 'No description available'}
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'info'
                  ? 'border-b-2 border-[#ab509d] text-[#ab509d]'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📋 Project Info
            </button>
            <button
              onClick={() => setActiveTab('evaluators')}
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'evaluators'
                  ? 'border-b-2 border-[#ab509d] text-[#ab509d]'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              👥 Assign Evaluators
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'results'
                  ? 'border-b-2 border-[#ab509d] text-[#ab509d]'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📊 Results ({evaluations.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Info Tab */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Founder Name</label>
                  <p className="text-gray-900 font-medium">{project.FounderName || project.founderName || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                  <p className="text-gray-900 font-medium">{project.Email || project.email || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                  <p className="text-gray-900 font-medium">{project.Phone || project.phone || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Startup Status</label>
                  <p className="text-gray-900 font-medium">{project.StartupStatus || project.startupStatus || 'N/A'}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Website Link</label>
                  <p className="text-gray-900 font-medium">
                    {(project.WebsiteLink || project.websiteLink) ? (
                      <a href={project.WebsiteLink || project.websiteLink} target="_blank" rel="noopener noreferrer" className="text-[#ab509d] hover:underline">
                        {project.WebsiteLink || project.websiteLink}
                      </a>
                    ) : 'N/A'}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Mobile App Link</label>
                  <p className="text-gray-900 font-medium">
                    {(project.MobileAppLink || project.mobileAppLink) ? (
                      <a href={project.MobileAppLink || project.mobileAppLink} target="_blank" rel="noopener noreferrer" className="text-[#ab509d] hover:underline">
                        {project.MobileAppLink || project.mobileAppLink}
                      </a>
                    ) : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Created At</label>
                  <p className="text-gray-900 font-medium">
                    {(project.Timestamp || project.timestamp) ? new Date(project.Timestamp || project.timestamp).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Username</label>
                  <p className="text-gray-900 font-medium">{project.Username || project.username || 'N/A'}</p>
                </div>
              </div>

              {/* Media Section */}
              <div className="mt-8 pt-6 border-t border-gray-200 space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📁 Project Media</h3>

                {/* Startup Logo */}
                {(project.StartupLogo || project.startupLogo) && (
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <label className="block text-sm font-medium text-gray-700 mb-2">🏢 Startup Logo</label>
                    <img 
                      src={`http://localhost:5063${project.StartupLogo || project.startupLogo}`} 
                      alt="Startup Logo" 
                      className="max-w-xs rounded-lg shadow-md border border-gray-300 bg-white"
                      onError={(e) => { e.target.src = '/vision_logo.png'; }}
                    />
                  </div>
                )}

                {/* Founder Photo */}
                {(project.FounderPhoto || project.founderPhoto) && (
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <label className="block text-sm font-medium text-gray-700 mb-2">👤 Founder Photo</label>
                    <img 
                      src={`http://localhost:5063${project.FounderPhoto || project.founderPhoto}`} 
                      alt="Founder Photo" 
                      className="max-w-xs rounded-lg shadow-md border border-gray-300 bg-white"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                )}

                {/* Default Video */}
                {(project.DefaultVideo || project.defaultVideo) && (
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <label className="block text-sm font-medium text-gray-700 mb-2">🎥 Default Video</label>
                    <video 
                      controls 
                      className="max-w-2xl rounded-lg shadow-md border border-gray-300"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    >
                      <source src={`http://localhost:5063${project.DefaultVideo || project.defaultVideo}`} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}

                {/* Pitch Video */}
                {(project.PitchVideo || project.pitchVideo) && (
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <label className="block text-sm font-medium text-gray-700 mb-2">🎬 Pitch Video</label>
                    <video 
                      controls 
                      className="max-w-2xl rounded-lg shadow-md border border-gray-300"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    >
                      <source src={`http://localhost:5063${project.PitchVideo || project.pitchVideo}`} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}

                {/* Project Images */}
                {((project.Image1 || project.image1) || (project.Image2 || project.image2) || (project.Image3 || project.image3)) && (
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <label className="block text-sm font-medium text-gray-700 mb-3">📸 Project Images</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {(project.Image1 || project.image1) && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Image 1</p>
                          <img 
                            src={`http://localhost:5063${project.Image1 || project.image1}`} 
                            alt="Project Image 1" 
                            className="w-full rounded-lg shadow-md border border-gray-300 bg-white"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        </div>
                      )}
                      {(project.Image2 || project.image2) && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Image 2</p>
                          <img 
                            src={`http://localhost:5063${project.Image2 || project.image2}`} 
                            alt="Project Image 2" 
                            className="w-full rounded-lg shadow-md border border-gray-300 bg-white"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        </div>
                      )}
                      {(project.Image3 || project.image3) && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Image 3</p>
                          <img 
                            src={`http://localhost:5063${project.Image3 || project.image3}`} 
                            alt="Project Image 3" 
                            className="w-full rounded-lg shadow-md border border-gray-300 bg-white"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-gray-200">
                <Link
                  to={`/superadmin/projects/edit/${project.Id || project.id}`}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-[#ab509d] hover:bg-[#964a8a] text-white text-sm sm:text-base font-semibold rounded-lg shadow-md transition duration-150"
                >
                  Edit Project
                </Link>
              </div>
            </div>
          )}

          {/* Evaluators Tab */}
          {activeTab === 'evaluators' && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Assign Evaluators</h3>
                <p className="text-sm text-gray-600">Select evaluators to assign to this project. You can select multiple evaluators.</p>
                {selectedEvaluators.length > 0 && (
                  <p className="text-sm text-[#ab509d] font-semibold mt-1">
                    {selectedEvaluators.length} evaluator{selectedEvaluators.length !== 1 ? 's' : ''} selected
                  </p>
                )}
              </div>

              {evaluators.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">No evaluators available</p>
                </div>
              ) : (
                <div className="space-y-3 mb-6">
                  {evaluators.map((evaluator) => {
                    const evaluatorId = evaluator.UserId || evaluator.userId;
                    return (
                    <div
                      key={evaluatorId}
                      className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition duration-150 ${
                        selectedEvaluators.includes(evaluatorId)
                          ? 'border-[#ab509d] bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleEvaluatorToggle(evaluatorId)}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedEvaluators.includes(evaluatorId)}
                          onChange={() => {}}
                          className="h-5 w-5 text-[#ab509d] rounded"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{evaluator.Username || evaluator.username}</p>
                          <p className="text-sm text-gray-600">{evaluator.Email || evaluator.email}</p>
                        </div>
                      </div>
                      {selectedEvaluators.includes(evaluatorId) && (
                        <span className="text-[#ab509d] font-semibold">✓ Selected</span>
                      )}
                    </div>
                    );
                  })}
                </div>
              )}

              <button
                onClick={handleAssignEvaluators}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-[#ab509d] hover:bg-[#964a8a] text-white text-sm sm:text-base font-semibold rounded-lg shadow-md transition duration-150"
              >
                Save Assignment
              </button>
            </div>
          )}

          {/* Results Tab */}
          {activeTab === 'results' && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Evaluation Results</h3>
                <p className="text-sm text-gray-600">View all submitted evaluations for this project</p>
              </div>

              {evaluations.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <div className="text-4xl mb-3">📊</div>
                  <p className="text-gray-600 font-medium">No evaluations submitted yet</p>
                  <p className="text-sm text-gray-500 mt-1">Results will appear once evaluators submit their assessments</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {evaluations.map((evaluation) => {
                    const totalScore = 
                      evaluation.problemSignificance +
                      evaluation.innovationTechnical +
                      evaluation.marketScalability +
                      evaluation.tractionImpact +
                      evaluation.businessModel +
                      evaluation.teamExecution +
                      evaluation.ethicsEquity;
                    
                    return (
                      <div key={evaluation.evaluationId} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="font-semibold text-gray-900">{evaluation.user?.username || 'Unknown Evaluator'}</p>
                            <p className="text-sm text-gray-600">{evaluation.user?.email}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Submitted on</p>
                            <p className="font-medium text-gray-900">
                              {new Date(evaluation.evaluatedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Total Score</label>
                            <div className="flex items-center gap-2">
                              <div className="text-2xl font-bold text-[#ab509d]">{totalScore}</div>
                              <div className="text-sm text-gray-500">/ 70</div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div><span className="text-gray-600">Problem Significance:</span> <span className="font-semibold">{evaluation.problemSignificance}/10</span></div>
                            <div><span className="text-gray-600">Innovation/Technical:</span> <span className="font-semibold">{evaluation.innovationTechnical}/10</span></div>
                            <div><span className="text-gray-600">Market Scalability:</span> <span className="font-semibold">{evaluation.marketScalability}/10</span></div>
                            <div><span className="text-gray-600">Traction/Impact:</span> <span className="font-semibold">{evaluation.tractionImpact}/10</span></div>
                            <div><span className="text-gray-600">Business Model:</span> <span className="font-semibold">{evaluation.businessModel}/10</span></div>
                            <div><span className="text-gray-600">Team/Execution:</span> <span className="font-semibold">{evaluation.teamExecution}/10</span></div>
                            <div><span className="text-gray-600">Ethics/Equity:</span> <span className="font-semibold">{evaluation.ethicsEquity}/10</span></div>
                          </div>
                          
                          {evaluation.strengths && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Strengths</label>
                              <p className="text-gray-900 bg-green-50 p-3 rounded-lg">{evaluation.strengths}</p>
                            </div>
                          )}
                          
                          {evaluation.weaknesses && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Areas for Improvement</label>
                              <p className="text-gray-900 bg-orange-50 p-3 rounded-lg">{evaluation.weaknesses}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
