import { useEffect, useState } from 'react';
import { getEvaluators, getProjectsForEvaluator } from '../../utils/localStorage';

const EvaluatorsList = () => {
  const [evaluators, setEvaluators] = useState([]);

  useEffect(() => {
    loadEvaluators();
  }, []);

  const loadEvaluators = () => {
    const allEvaluators = getEvaluators();
    setEvaluators(allEvaluators);
  };

  const getEvaluatorStats = (evaluatorId) => {
    const projects = getProjectsForEvaluator(evaluatorId);
    return {
      assignedProjects: projects.length
    };
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Evaluators</h1>
        <p className="text-gray-600">View all registered evaluators in the system</p>
      </div>

      {evaluators.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Evaluators Yet</h3>
          <p className="text-gray-600">Evaluators will appear here once they register</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned Projects
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {evaluators.map((evaluator) => {
                const stats = getEvaluatorStats(evaluator.id);
                return (
                  <tr key={evaluator.id} className="hover:bg-gray-50 transition duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{evaluator.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{evaluator.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {stats.assignedProjects} Projects
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(evaluator.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EvaluatorsList;
