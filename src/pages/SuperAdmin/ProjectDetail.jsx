import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  getProjectById, 
  getEvaluators, 
  assignEvaluatorsToProject, 
  getEvaluationsByProject,
  getUsers 
} from '../../utils/localStorage';

const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [evaluators, setEvaluators] = useState([]);
  const [selectedEvaluators, setSelectedEvaluators] = useState([]);
  const [evaluations, setEvaluations] = useState([]);

  useEffect(() => {
    loadProjectData();
  }, [id]);

  const loadProjectData = () => {
    const projectData = getProjectById(id);
    setProject(projectData);
    
    const allEvaluators = getEvaluators();
    setEvaluators(allEvaluators);
    
    if (projectData?.assignedEvaluators) {
      setSelectedEvaluators(projectData.assignedEvaluators);
    }
    
    const projectEvaluations = getEvaluationsByProject(id);
    setEvaluations(projectEvaluations);
  };

  const handleEvaluatorToggle = (evaluatorId) => {
    if (selectedEvaluators.includes(evaluatorId)) {
      setSelectedEvaluators(selectedEvaluators.filter(id => id !== evaluatorId));
    } else if (selectedEvaluators.length < 2) {
      setSelectedEvaluators([...selectedEvaluators, evaluatorId]);
    } else {
      alert('Maximum 2 evaluators can be assigned per project');
    }
  };

  const handleAssignEvaluators = () => {
    assignEvaluatorsToProject(id, selectedEvaluators);
    alert('Evaluators assigned successfully!');
    loadProjectData();
  };

  const getEvaluatorById = (evaluatorId) => {
    return evaluators.find(e => e.id === evaluatorId);
  };

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Project not found</h2>
        <Link to="/superadmin/projects" className="text-indigo-600 hover:text-indigo-700 mt-4 inline-block">
          Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <Link to="/superadmin/projects" className="text-indigo-600 hover:text-indigo-700 mb-4 inline-block">
          ← Back to Projects
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.title}</h1>
        <p className="text-gray-600">{project.description}</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'info'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📋 Project Info
            </button>
            <button
              onClick={() => setActiveTab('evaluators')}
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'evaluators'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              👥 Assigned Evaluators ({project.assignedEvaluators?.length || 0}/2)
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'results'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
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
                  <label className="block text-sm font-medium text-gray-500 mb-1">Start Date</label>
                  <p className="text-gray-900 font-medium">{project.startDate || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">End Date</label>
                  <p className="text-gray-900 font-medium">{project.endDate || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Budget</label>
                  <p className="text-gray-900 font-medium">{project.budget || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Client</label>
                  <p className="text-gray-900 font-medium">{project.client || 'N/A'}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Technology Stack</label>
                  <p className="text-gray-900 font-medium">{project.technology || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Created At</label>
                  <p className="text-gray-900 font-medium">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Last Updated</label>
                  <p className="text-gray-900 font-medium">
                    {new Date(project.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="pt-6 border-t border-gray-200">
                <Link
                  to={`/superadmin/projects/edit/${project.id}`}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition duration-150"
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
                <p className="text-sm text-gray-600">Select up to 2 evaluators to assign to this project</p>
              </div>

              {evaluators.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">No evaluators available</p>
                </div>
              ) : (
                <div className="space-y-3 mb-6">
                  {evaluators.map((evaluator) => (
                    <div
                      key={evaluator.id}
                      className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition duration-150 ${
                        selectedEvaluators.includes(evaluator.id)
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleEvaluatorToggle(evaluator.id)}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedEvaluators.includes(evaluator.id)}
                          onChange={() => {}}
                          className="h-5 w-5 text-indigo-600 rounded"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{evaluator.name}</p>
                          <p className="text-sm text-gray-600">{evaluator.email}</p>
                        </div>
                      </div>
                      {selectedEvaluators.includes(evaluator.id) && (
                        <span className="text-indigo-600 font-semibold">✓ Selected</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={handleAssignEvaluators}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition duration-150"
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
                    const evaluator = getEvaluatorById(evaluation.evaluatorId);
                    return (
                      <div key={evaluation.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="font-semibold text-gray-900">{evaluator?.name || 'Unknown Evaluator'}</p>
                            <p className="text-sm text-gray-600">{evaluator?.email}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Submitted on</p>
                            <p className="font-medium text-gray-900">
                              {new Date(evaluation.submittedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Score</label>
                            <div className="flex items-center gap-2">
                              <div className="text-2xl font-bold text-indigo-600">{evaluation.score || 'N/A'}</div>
                              <div className="text-sm text-gray-500">/ {evaluation.maxScore || 100}</div>
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
                            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                              {evaluation.comments || 'No comments provided'}
                            </p>
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
