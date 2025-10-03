import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProjectsForEvaluator, getEvaluationByProjectAndEvaluator } from '../../utils/localStorage';
import { useAuth } from '../../context/AuthContext';

const EvaluatorProjectList = () => {
  const { currentUser } = useAuth();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    if (currentUser) {
      loadProjects();
    }
  }, [currentUser]);

  const loadProjects = () => {
    const assignedProjects = getProjectsForEvaluator(currentUser.id);
    setProjects(assignedProjects);
  };

  const getEvaluationStatus = (project) => {
    const evaluation = getEvaluationByProjectAndEvaluator(project.id, currentUser.id);
    if (evaluation) {
      return { text: 'Completed', color: 'bg-green-100 text-green-800' };
    }
    return { text: 'Pending', color: 'bg-orange-100 text-orange-800' };
  };

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
            return (
              <div key={project.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition duration-200">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">{project.title}</h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}>
                      {status.text}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{project.description}</p>
                  
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Start Date:</span>
                      <span className="font-medium text-gray-900">{project.startDate || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">End Date:</span>
                      <span className="font-medium text-gray-900">{project.endDate || 'N/A'}</span>
                    </div>
                    {project.client && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Client:</span>
                        <span className="font-medium text-gray-900">{project.client}</span>
                      </div>
                    )}
                  </div>
                  
                  <Link
                    to={`/evaluator/projects/${project.id}`}
                    className="block w-full text-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition duration-150"
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
