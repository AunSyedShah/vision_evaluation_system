import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllProjects, getEvaluationsByProject, getAllEvaluators } from '../../utils/api';

const AllResults = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [evaluators, setEvaluators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch projects and evaluators
      let allProjects = await getAllProjects();
      let allEvaluators = await getAllEvaluators();
      
      // Handle .NET ReferenceHandler.Preserve format
      if (allProjects && allProjects.$values) allProjects = allProjects.$values;
      if (allEvaluators && allEvaluators.$values) allEvaluators = allEvaluators.$values;
      
      // Ensure arrays
      allProjects = Array.isArray(allProjects) ? allProjects : [];
      allEvaluators = Array.isArray(allEvaluators) ? allEvaluators : [];
      
      // Fetch evaluations for each project
      const allEvaluations = [];
      for (const project of allProjects) {
        try {
          // Use correct field name (Id or id)
          const projectId = project.Id || project.id;
          let projectEvaluations = await getEvaluationsByProject(projectId);
          
          // Handle .NET ReferenceHandler.Preserve format
          if (projectEvaluations && projectEvaluations.$values) {
            projectEvaluations = projectEvaluations.$values;
          }
          
          // Ensure it's an array
          if (!Array.isArray(projectEvaluations)) {
            projectEvaluations = [];
          }
          
          console.log(`📊 Project ${projectId} evaluations:`, projectEvaluations);
          
          // Add project reference to each evaluation
          projectEvaluations.forEach(evaluation => {
            evaluation.projectData = project;
          });
          allEvaluations.push(...projectEvaluations);
        } catch (err) {
          // Project may have no evaluations yet
          console.log(`No evaluations for project ${project.Id || project.id}:`, err.message);
        }
      }
      
      setEvaluators(allEvaluators);
      setEvaluations(allEvaluations);
    } catch (err) {
      console.error('Failed to load results:', err);
      setError('Failed to load evaluation results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getEvaluatorName = (evaluatorId) => {
    const evaluator = evaluators.find(e => 
      (e.userId || e.UserId) === evaluatorId
    );
    return evaluator ? (evaluator.username || evaluator.Username || 'Unknown') : 'Unknown Evaluator';
  };

  const getEvaluatorEmail = (evaluatorId) => {
    const evaluator = evaluators.find(e => 
      (e.userId || e.UserId) === evaluatorId
    );
    return evaluator ? (evaluator.email || evaluator.Email || '') : '';
  };

  // Calculate average score from 7 evaluation metrics (1-10 scale)
  const calculateAverageScore = (evaluation) => {
    const scores = [
      evaluation.ProblemSignificance || evaluation.problemSignificance || 0,
      evaluation.InnovationTechnical || evaluation.innovationTechnical || 0,
      evaluation.MarketScalability || evaluation.marketScalability || 0,
      evaluation.TractionImpact || evaluation.tractionImpact || 0,
      evaluation.BusinessModel || evaluation.businessModel || 0,
      evaluation.TeamExecution || evaluation.teamExecution || 0,
      evaluation.EthicsEquity || evaluation.ethicsEquity || 0
    ];
    const sum = scores.reduce((a, b) => a + b, 0);
    const avg = sum / 7;
    // Convert to percentage (out of 100)
    return (avg / 10) * 100;
  };

  const getScoreColor = (score) => {
    if (!score) return 'text-gray-600';
    if (score >= 80) return 'text-green-600 font-bold';
    if (score >= 60) return 'text-blue-600 font-semibold';
    if (score >= 40) return 'text-yellow-600 font-semibold';
    return 'text-red-600 font-semibold';
  };

  const getScoreBadge = (score) => {
    if (!score) return { text: 'N/A', color: 'bg-gray-100 text-gray-800' };
    if (score >= 80) return { text: 'Excellent', color: 'bg-green-100 text-green-800' };
    if (score >= 60) return { text: 'Good', color: 'bg-blue-100 text-blue-800' };
    if (score >= 40) return { text: 'Average', color: 'bg-yellow-100 text-yellow-800' };
    return { text: 'Poor', color: 'bg-red-100 text-red-800' };
  };

  const filteredAndSortedEvaluations = evaluations
    .filter(evaluation => {
      const projectTitle = (evaluation.projectData?.StartupName || evaluation.projectData?.startupName || '').toLowerCase();
      const userId = evaluation.UserId || evaluation.userId;
      const evaluatorName = getEvaluatorName(userId).toLowerCase();
      const searchLower = searchTerm.toLowerCase();
      
      const strengths = (evaluation.Strengths || evaluation.strengths || '').toLowerCase();
      const weaknesses = (evaluation.Weaknesses || evaluation.weaknesses || '').toLowerCase();
      const recommendation = (evaluation.Recommendation || evaluation.recommendation || '').toLowerCase();
      
      const matchesSearch = projectTitle.includes(searchLower) || 
                           evaluatorName.includes(searchLower) ||
                           strengths.includes(searchLower) ||
                           weaknesses.includes(searchLower) ||
                           recommendation.includes(searchLower);
      
      if (filterStatus === 'all') return matchesSearch;
      
      const score = calculateAverageScore(evaluation);
      if (filterStatus === 'excellent') return matchesSearch && score >= 80;
      if (filterStatus === 'good') return matchesSearch && score >= 60 && score < 80;
      if (filterStatus === 'average') return matchesSearch && score >= 40 && score < 60;
      if (filterStatus === 'poor') return matchesSearch && score < 40;
      
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.EvaluatedAt || a.evaluatedAt);
        const dateB = new Date(b.EvaluatedAt || b.evaluatedAt);
        return dateB - dateA;
      }
      if (sortBy === 'score') {
        return calculateAverageScore(b) - calculateAverageScore(a);
      }
      if (sortBy === 'project') {
        const titleA = a.projectData?.StartupName || a.projectData?.startupName || '';
        const titleB = b.projectData?.StartupName || b.projectData?.startupName || '';
        return titleA.localeCompare(titleB);
      }
      if (sortBy === 'evaluator') {
        const userIdA = a.UserId || a.userId;
        const userIdB = b.UserId || b.userId;
        return getEvaluatorName(userIdA).localeCompare(getEvaluatorName(userIdB));
      }
      return 0;
    });

  const stats = {
    total: evaluations.length,
    excellent: evaluations.filter(e => calculateAverageScore(e) >= 80).length,
    good: evaluations.filter(e => calculateAverageScore(e) >= 60 && calculateAverageScore(e) < 80).length,
    average: evaluations.filter(e => calculateAverageScore(e) >= 40 && calculateAverageScore(e) < 60).length,
    poor: evaluations.filter(e => calculateAverageScore(e) < 40).length,
    avgScore: evaluations.length > 0 
      ? (evaluations.reduce((sum, e) => sum + calculateAverageScore(e), 0) / evaluations.length).toFixed(1)
      : 0
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ab509d] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading evaluation results...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">All Evaluation Results</h1>
        <p className="text-sm sm:text-base text-gray-600">Comprehensive view of all evaluations across all projects</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <p className="font-semibold">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-gray-600 mb-1">Total Results</div>
          <div className="text-xl sm:text-2xl font-bold text-[#ab509d]">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-gray-600 mb-1">Avg Score</div>
          <div className="text-xl sm:text-2xl font-bold text-blue-600">{stats.avgScore}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-gray-600 mb-1">Excellent</div>
          <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.excellent}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-gray-600 mb-1">Good</div>
          <div className="text-xl sm:text-2xl font-bold text-blue-600">{stats.good}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-gray-600 mb-1">Average</div>
          <div className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.average}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-gray-600 mb-1">Poor</div>
          <div className="text-xl sm:text-2xl font-bold text-red-600">{stats.poor}</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Project, evaluator, comments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab509d] focus:border-transparent outline-none text-sm sm:text-base"
            />
          </div>

          {/* Filter by Score */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Score
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab509d] focus:border-transparent outline-none text-sm sm:text-base"
            >
              <option value="all">All Results</option>
              <option value="excellent">Excellent (80+)</option>
              <option value="good">Good (60-79)</option>
              <option value="average">Average (40-59)</option>
              <option value="poor">Poor (&lt;40)</option>
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
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab509d] focus:border-transparent outline-none text-sm sm:text-base"
            >
              <option value="date">Date (Newest First)</option>
              <option value="score">Score (Highest First)</option>
              <option value="project">Project Name</option>
              <option value="evaluator">Evaluator Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredAndSortedEvaluations.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No Results Found</h3>
            <p className="text-sm sm:text-base text-gray-600">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'No evaluations have been submitted yet'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Evaluator
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Date Submitted
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedEvaluations.map((evaluation) => {
                  const avgScore = calculateAverageScore(evaluation);
                  const scoreBadge = getScoreBadge(avgScore);
                  const evaluationId = evaluation.EvaluationId || evaluation.evaluationId;
                  const userId = evaluation.UserId || evaluation.userId;
                  const projectId = evaluation.ProjectId || evaluation.projectId;
                  const evaluatedAt = evaluation.EvaluatedAt || evaluation.evaluatedAt;
                  const projectName = evaluation.projectData?.StartupName || evaluation.projectData?.startupName || 'Unknown Project';
                  
                  return (
                    <tr key={evaluationId} className="hover:bg-gray-50">
                      <td className="px-4 sm:px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {projectName}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {getEvaluatorName(userId)}
                        </div>
                        <div className="text-xs text-gray-500 hidden sm:block">
                          {getEvaluatorEmail(userId)}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className={`text-2xl font-bold ${getScoreColor(avgScore)}`}>
                          {avgScore.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-500">
                          7 metrics avg
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${scoreBadge.color}`}>
                          {scoreBadge.text}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-500 hidden md:table-cell">
                        {new Date(evaluatedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm">
                        <Link
                          to={`/superadmin/projects/${projectId}`}
                          className="text-[#ab509d] hover:text-[#964a8a] font-medium"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Results Count */}
      {filteredAndSortedEvaluations.length > 0 && (
        <div className="mt-4 text-center text-sm text-gray-600">
          Showing {filteredAndSortedEvaluations.length} of {evaluations.length} total results
        </div>
      )}
    </div>
  );
};

export default AllResults;
