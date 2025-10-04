import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllProjects, getEvaluationsByProject, getAllEvaluators, getAssignedUsers } from '../../utils/api';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const AllResults = () => {
  const [projectsWithEvaluations, setProjectsWithEvaluations] = useState([]);
  const [evaluators, setEvaluators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('projectName');
  const [expandedProjects, setExpandedProjects] = useState(new Set());

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
      const projectsData = [];
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
          
          // Get assigned evaluators count and list using the dedicated endpoint
          let assignedEvaluatorsCount = 0;
          let assignedEvaluatorsList = [];
          try {
            const assignedUsersResponse = await getAssignedUsers(projectId);
            console.log(`📦 Project ${projectId} assigned users:`, assignedUsersResponse);
            
            // Extract assignedUsers from response
            let assignedUsersData = assignedUsersResponse;
            if (assignedUsersResponse && assignedUsersResponse.assignedUsers) {
              assignedUsersData = assignedUsersResponse.assignedUsers;
            } else if (assignedUsersResponse && assignedUsersResponse.AssignedUsers) {
              assignedUsersData = assignedUsersResponse.AssignedUsers;
            }
            
            // Handle .NET $values format
            if (assignedUsersData && assignedUsersData.$values) {
              assignedUsersData = assignedUsersData.$values;
            }
            
            // Extract evaluator IDs and count
            if (Array.isArray(assignedUsersData)) {
              // Extract user IDs from the response (could be userId, UserId, id, or Id)
              assignedEvaluatorsList = assignedUsersData.map(user => 
                user.userId || user.UserId || user.id || user.Id || user
              );
              assignedEvaluatorsCount = assignedEvaluatorsList.length;
              console.log(`✅ Project ${projectId}: ${assignedEvaluatorsCount} evaluators assigned`, assignedEvaluatorsList);
            }
          } catch {
            console.log(`⚠️ Could not fetch assigned users for project ${projectId}, using fallback`);
            
            // Fallback 1: Try project data
            if (project.AssignedEvaluators && Array.isArray(project.AssignedEvaluators)) {
              assignedEvaluatorsList = project.AssignedEvaluators.map(e => e.userId || e.UserId || e.id || e.Id || e);
              assignedEvaluatorsCount = assignedEvaluatorsList.length;
            } else if (project.assignedEvaluators && Array.isArray(project.assignedEvaluators)) {
              assignedEvaluatorsList = project.assignedEvaluators.map(e => e.userId || e.UserId || e.id || e.Id || e);
              assignedEvaluatorsCount = assignedEvaluatorsList.length;
            } else if (project.AssignedEvaluatorsCount !== undefined) {
              assignedEvaluatorsCount = project.AssignedEvaluatorsCount || project.assignedEvaluatorsCount || 0;
              // Can't get list, only count available
            } else {
              // Fallback 2: Extract from submitted evaluations
              const uniqueEvaluatorIds = new Set(
                projectEvaluations.map(e => e.UserId || e.userId).filter(Boolean)
              );
              assignedEvaluatorsList = Array.from(uniqueEvaluatorIds);
              assignedEvaluatorsCount = assignedEvaluatorsList.length;
              console.log(`ℹ️ Project ${projectId}: Using evaluation count as fallback (${assignedEvaluatorsCount})`);
            }
          }
          
          // Add project with its evaluations, assignment count, and evaluator list
          projectsData.push({
            project: project,
            evaluations: projectEvaluations,
            assignedCount: assignedEvaluatorsCount,
            assignedEvaluators: assignedEvaluatorsList
          });
        } catch (err) {
          // Project may have no evaluations yet
          console.log(`No evaluations for project ${project.Id || project.id}:`, err.message);
          projectsData.push({
            project: project,
            evaluations: [],
            assignedCount: 0,
            assignedEvaluators: []
          });
        }
      }
      
      setEvaluators(allEvaluators);
      setProjectsWithEvaluations(projectsData);
    } catch (err) {
      console.error('Failed to load results:', err);
      setError('Failed to load evaluation results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleProject = (projectId) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  const getEvaluatorName = (evaluatorId) => {
    const evaluator = evaluators.find(e => 
      (e.userId || e.UserId) === evaluatorId
    );
    return evaluator ? (evaluator.username || evaluator.Username || 'Unknown') : 'Unknown Evaluator';
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

  // Calculate average score for all evaluations of a project
  const getProjectAverageScore = (evaluations) => {
    if (evaluations.length === 0) return 0;
    const sum = evaluations.reduce((total, e) => total + calculateAverageScore(e), 0);
    return sum / evaluations.length;
  };

  // Calculate average scores for each metric across all evaluators
  const calculateMetricAverages = (evaluations) => {
    if (evaluations.length === 0) return null;

    const totals = {
      problem: 0,
      innovation: 0,
      market: 0,
      traction: 0,
      business: 0,
      team: 0,
      ethics: 0
    };

    evaluations.forEach(evaluation => {
      totals.problem += evaluation.ProblemSignificance || evaluation.problemSignificance || 0;
      totals.innovation += evaluation.InnovationTechnical || evaluation.innovationTechnical || 0;
      totals.market += evaluation.MarketScalability || evaluation.marketScalability || 0;
      totals.traction += evaluation.TractionImpact || evaluation.tractionImpact || 0;
      totals.business += evaluation.BusinessModel || evaluation.businessModel || 0;
      totals.team += evaluation.TeamExecution || evaluation.teamExecution || 0;
      totals.ethics += evaluation.EthicsEquity || evaluation.ethicsEquity || 0;
    });

    const count = evaluations.length;
    return {
      problem: (totals.problem / count).toFixed(1),
      innovation: (totals.innovation / count).toFixed(1),
      market: (totals.market / count).toFixed(1),
      traction: (totals.traction / count).toFixed(1),
      business: (totals.business / count).toFixed(1),
      team: (totals.team / count).toFixed(1),
      ethics: (totals.ethics / count).toFixed(1)
    };
  };

  // Export Functions
  const exportToExcel = (data, filename) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Results');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${filename}.xlsx`);
  };

  const exportToCSV = (data, filename) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${filename}.csv`);
  };

  const prepareAllResultsData = () => {
    const data = [];
    filteredAndSortedProjects.forEach(({ project, evaluations }) => {
      const projectName = project.StartupName || project.startupName || 'N/A';
      const founderName = project.FounderName || project.founderName || 'N/A';
      const status = project.Status || project.status || 'Pending Review';
      
      evaluations.forEach((evaluation) => {
        // Find evaluator name - use same logic as getEvaluatorName
        const evaluatorId = evaluation.UserId || evaluation.userId;
        const evaluator = evaluators.find(e => 
          (e.userId || e.UserId || e.Id || e.id) === evaluatorId
        );
        // Try multiple field variations for evaluator name
        const evaluatorName = evaluator 
          ? (evaluator.username || evaluator.Username || evaluator.email || evaluator.Email || `User ${evaluatorId}`) 
          : (evaluation.EvaluatorName || evaluation.evaluatorName || evaluation.Username || evaluation.username || `User ${evaluatorId}`);
        
        console.log('📊 Export - Evaluator lookup:', { evaluatorId, evaluator, evaluatorName });
        
        const avgScore = calculateAverageScore(evaluation).toFixed(1);
        const badge = getScoreBadge(parseFloat(avgScore));
        
        data.push({
          'Project Name': projectName,
          'Founder Name': founderName,
          'Status': status,
          'Evaluator': evaluatorName,
          'Problem Significance': evaluation.ProblemSignificance || evaluation.problemSignificance || 0,
          'Innovation Technical': evaluation.InnovationTechnical || evaluation.innovationTechnical || 0,
          'Market Scalability': evaluation.MarketScalability || evaluation.marketScalability || 0,
          'Traction Impact': evaluation.TractionImpact || evaluation.tractionImpact || 0,
          'Business Model': evaluation.BusinessModel || evaluation.businessModel || 0,
          'Team Execution': evaluation.TeamExecution || evaluation.teamExecution || 0,
          'Ethics Equity': evaluation.EthicsEquity || evaluation.ethicsEquity || 0,
          'Average Score': avgScore,
          'Rating': badge.text,
          'Comments': evaluation.Comments || evaluation.comments || '',
          'Evaluated At': new Date(evaluation.EvaluatedAt || evaluation.evaluatedAt).toLocaleString()
        });
      });
    });
    return data;
  };

  const prepareProjectSummaryData = () => {
    const data = [];
    filteredAndSortedProjects.forEach(({ project, evaluations, assignedCount }) => {
      const projectName = project.StartupName || project.startupName || 'N/A';
      const founderName = project.FounderName || project.founderName || 'N/A';
      const status = project.Status || project.status || 'Pending Review';
      
      const avgScore = evaluations.length > 0 ? getProjectAverageScore(evaluations).toFixed(1) : 'N/A';
      const badge = evaluations.length > 0 ? getScoreBadge(parseFloat(avgScore)) : { text: 'N/A' };
      
      // Calculate metric averages if 2+ evaluations
      let metricAverages = null;
      if (evaluations.length >= 2) {
        metricAverages = calculateMetricAverages(evaluations);
      }
      
      data.push({
        'Project Name': projectName,
        'Founder Name': founderName,
        'Status': status,
        'Assigned Evaluators': assignedCount,
        'Submitted Evaluations': evaluations.length,
        'Average Score': avgScore,
        'Rating': badge.text,
        'Avg Problem Significance': metricAverages ? metricAverages.problem : 'N/A',
        'Avg Innovation Technical': metricAverages ? metricAverages.innovation : 'N/A',
        'Avg Market Scalability': metricAverages ? metricAverages.market : 'N/A',
        'Avg Traction Impact': metricAverages ? metricAverages.traction : 'N/A',
        'Avg Business Model': metricAverages ? metricAverages.business : 'N/A',
        'Avg Team Execution': metricAverages ? metricAverages.team : 'N/A',
        'Avg Ethics Equity': metricAverages ? metricAverages.ethics : 'N/A'
      });
    });
    return data;
  };

  const prepareConsensusData = () => {
    const data = [];
    filteredAndSortedProjects.forEach(({ project, evaluations }) => {
      if (evaluations.length < 2) return; // Skip projects with less than 2 evaluations
      
      const projectName = project.StartupName || project.startupName || 'N/A';
      const founderName = project.FounderName || project.founderName || 'N/A';
      const status = project.Status || project.status || 'Pending Review';
      const metricAverages = calculateMetricAverages(evaluations);
      const avgScore = getProjectAverageScore(evaluations).toFixed(1);
      const badge = getScoreBadge(parseFloat(avgScore));
      
      data.push({
        'Project Name': projectName,
        'Founder Name': founderName,
        'Status': status,
        'Number of Evaluators': evaluations.length,
        'Consensus Avg Score': avgScore,
        'Rating': badge.text,
        'Consensus Problem Significance': metricAverages.problem,
        'Consensus Innovation Technical': metricAverages.innovation,
        'Consensus Market Scalability': metricAverages.market,
        'Consensus Traction Impact': metricAverages.traction,
        'Consensus Business Model': metricAverages.business,
        'Consensus Team Execution': metricAverages.team,
        'Consensus Ethics Equity': metricAverages.ethics
      });
    });
    return data;
  };

  const handleExportAllResults = (format) => {
    const data = prepareAllResultsData();
    if (data.length === 0) {
      alert('No data to export');
      return;
    }
    const filename = `All_Evaluation_Results_${new Date().toISOString().split('T')[0]}`;
    if (format === 'excel') {
      exportToExcel(data, filename);
    } else {
      exportToCSV(data, filename);
    }
  };

  const handleExportProjectSummary = (format) => {
    const data = prepareProjectSummaryData();
    if (data.length === 0) {
      alert('No data to export');
      return;
    }
    const filename = `Project_Summary_${new Date().toISOString().split('T')[0]}`;
    if (format === 'excel') {
      exportToExcel(data, filename);
    } else {
      exportToCSV(data, filename);
    }
  };

  const handleExportConsensus = (format) => {
    const data = prepareConsensusData();
    if (data.length === 0) {
      alert('No consensus data to export (need projects with 2+ evaluations)');
      return;
    }
    const filename = `Consensus_Results_${new Date().toISOString().split('T')[0]}`;
    if (format === 'excel') {
      exportToExcel(data, filename);
    } else {
      exportToCSV(data, filename);
    }
  };

  const filteredAndSortedProjects = projectsWithEvaluations
    .filter(({ project, evaluations }) => {
      const projectName = (project.StartupName || project.startupName || '').toLowerCase();
      const founderName = (project.FounderName || project.founderName || '').toLowerCase();
      const searchLower = searchTerm.toLowerCase();
      
      const matchesSearch = projectName.includes(searchLower) || founderName.includes(searchLower);
      
      if (filterStatus === 'all') return matchesSearch;
      
      // Filter based on project's average score
      if (evaluations.length === 0) return filterStatus === 'all' && matchesSearch;
      
      const avgScore = getProjectAverageScore(evaluations);
      if (filterStatus === 'excellent') return matchesSearch && avgScore >= 80;
      if (filterStatus === 'good') return matchesSearch && avgScore >= 60 && avgScore < 80;
      if (filterStatus === 'average') return matchesSearch && avgScore >= 40 && avgScore < 60;
      if (filterStatus === 'poor') return matchesSearch && avgScore < 40;
      if (filterStatus === 'no-evaluations') return matchesSearch && evaluations.length === 0;
      
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'projectName') {
        const nameA = a.project.StartupName || a.project.startupName || '';
        const nameB = b.project.StartupName || b.project.startupName || '';
        return nameA.localeCompare(nameB);
      }
      if (sortBy === 'evaluationCount') {
        return b.evaluations.length - a.evaluations.length;
      }
      if (sortBy === 'avgScore') {
        return getProjectAverageScore(b.evaluations) - getProjectAverageScore(a.evaluations);
      }
      return 0;
    });

  // Calculate statistics
  const allEvaluations = projectsWithEvaluations.flatMap(p => p.evaluations);
  const stats = {
    totalProjects: projectsWithEvaluations.length,
    totalEvaluations: allEvaluations.length,
    projectsWithEvals: projectsWithEvaluations.filter(p => p.evaluations.length > 0).length,
    excellent: allEvaluations.filter(e => calculateAverageScore(e) >= 80).length,
    good: allEvaluations.filter(e => calculateAverageScore(e) >= 60 && calculateAverageScore(e) < 80).length,
    average: allEvaluations.filter(e => calculateAverageScore(e) >= 40 && calculateAverageScore(e) < 60).length,
    poor: allEvaluations.filter(e => calculateAverageScore(e) < 40).length,
    avgScore: allEvaluations.length > 0 
      ? (allEvaluations.reduce((sum, e) => sum + calculateAverageScore(e), 0) / allEvaluations.length).toFixed(1)
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-gray-600 mb-1">Projects</div>
          <div className="text-xl sm:text-2xl font-bold text-[#ab509d]">{stats.totalProjects}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-gray-600 mb-1">Evaluations</div>
          <div className="text-xl sm:text-2xl font-bold text-purple-600">{stats.totalEvaluations}</div>
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
              placeholder="Project name or founder..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab509d] focus:border-transparent outline-none text-sm sm:text-base"
            />
          </div>

          {/* Filter by Score */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Avg Score
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab509d] focus:border-transparent outline-none text-sm sm:text-base"
            >
              <option value="all">All Projects</option>
              <option value="excellent">Excellent (80+)</option>
              <option value="good">Good (60-79)</option>
              <option value="average">Average (40-59)</option>
              <option value="poor">Poor (&lt;40)</option>
              <option value="no-evaluations">No Evaluations Yet</option>
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
              <option value="projectName">Project Name</option>
              <option value="evaluationCount">Evaluation Count</option>
              <option value="avgScore">Average Score</option>
            </select>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Export Results</h3>
            <p className="text-sm text-gray-600">Download evaluation data in Excel or CSV format</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Export All Results Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-2 bg-[#ab509d] hover:bg-[#964a8a] text-white px-4 py-2 rounded-lg transition duration-200 shadow-md hover:shadow-lg text-sm font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>All Results</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="hidden group-hover:block absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-10 min-w-[140px]">
                <button
                  onClick={() => handleExportAllResults('excel')}
                  className="w-full text-left px-4 py-2 hover:bg-purple-50 text-sm text-gray-700 hover:text-[#ab509d] flex items-center gap-2 rounded-t-lg transition"
                >
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Excel (.xlsx)
                </button>
                <button
                  onClick={() => handleExportAllResults('csv')}
                  className="w-full text-left px-4 py-2 hover:bg-purple-50 text-sm text-gray-700 hover:text-[#ab509d] flex items-center gap-2 rounded-b-lg transition"
                >
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  CSV (.csv)
                </button>
              </div>
            </div>

            {/* Export Project Summary Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200 shadow-md hover:shadow-lg text-sm font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Project Summary</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="hidden group-hover:block absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-10 min-w-[140px]">
                <button
                  onClick={() => handleExportProjectSummary('excel')}
                  className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm text-gray-700 hover:text-blue-600 flex items-center gap-2 rounded-t-lg transition"
                >
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Excel (.xlsx)
                </button>
                <button
                  onClick={() => handleExportProjectSummary('csv')}
                  className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm text-gray-700 hover:text-blue-600 flex items-center gap-2 rounded-b-lg transition"
                >
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  CSV (.csv)
                </button>
              </div>
            </div>

            {/* Export Consensus Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition duration-200 shadow-md hover:shadow-lg text-sm font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>Consensus Data</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="hidden group-hover:block absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-10 min-w-[140px]">
                <button
                  onClick={() => handleExportConsensus('excel')}
                  className="w-full text-left px-4 py-2 hover:bg-teal-50 text-sm text-gray-700 hover:text-teal-600 flex items-center gap-2 rounded-t-lg transition"
                >
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Excel (.xlsx)
                </button>
                <button
                  onClick={() => handleExportConsensus('csv')}
                  className="w-full text-left px-4 py-2 hover:bg-teal-50 text-sm text-gray-700 hover:text-teal-600 flex items-center gap-2 rounded-b-lg transition"
                >
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  CSV (.csv)
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Export Descriptions */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-600">
            <div className="flex items-start gap-2">
              <span className="text-[#ab509d] font-bold">•</span>
              <span><strong>All Results:</strong> Individual evaluator scores for each project with full details</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span><strong>Project Summary:</strong> Aggregated data per project with average scores</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-teal-600 font-bold">•</span>
              <span><strong>Consensus Data:</strong> Average metrics for projects with 2+ evaluators</span>
            </div>
          </div>
        </div>
      </div>

      {/* Results - Projects with their Evaluations */}
      <div className="space-y-4">
        {filteredAndSortedProjects.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md text-center py-12 px-4">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No Projects Found</h3>
            <p className="text-sm sm:text-base text-gray-600">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'No projects available yet'}
            </p>
          </div>
        ) : (
          filteredAndSortedProjects.map(({ project, evaluations, assignedCount, assignedEvaluators }) => {
            const projectId = project.Id || project.id;
            const projectName = project.StartupName || project.startupName || 'Unnamed Project';
            const founderName = project.FounderName || project.founderName || 'Unknown';
            
            // Get unique evaluators who submitted evaluations (completed submissions)
            const uniqueEvaluatorIds = new Set(
              evaluations.map(e => e.UserId || e.userId).filter(Boolean)
            );
            const submittedCount = uniqueEvaluatorIds.size;
            
            // Determine display status
            // If all assigned evaluators have submitted, show "Evaluation Completed"
            const allEvaluationsCompleted = submittedCount > 0 && assignedCount > 0 && submittedCount === assignedCount;
            
            // Status display logic
            let status, statusStyle;
            if (assignedCount === 0) {
              status = 'No Evaluators Assigned';
              statusStyle = 'bg-gray-100 text-gray-800';
            } else if (submittedCount === 0) {
              status = `Pending Review (0/${assignedCount})`;
              statusStyle = 'bg-orange-100 text-orange-800';
            } else if (allEvaluationsCompleted) {
              status = 'Evaluation Completed';
              statusStyle = 'bg-teal-100 text-teal-800';
            } else {
              status = `Pending Review (${submittedCount}/${assignedCount})`;
              statusStyle = 'bg-yellow-100 text-yellow-800';
            }
            
            const avgScore = evaluations.length > 0 ? getProjectAverageScore(evaluations) : null;
            const scoreBadge = avgScore ? getScoreBadge(avgScore) : null;
            const isExpanded = expandedProjects.has(projectId);

            return (
              <div key={projectId} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Project Header */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 px-4 sm:px-6 py-4 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center flex-wrap gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{projectName}</h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusStyle}`}>
                          {status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">Founder: <span className="font-medium">{founderName}</span></p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {/* Evaluation Progress Badge */}
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#ab509d]">{submittedCount}/{assignedCount}</div>
                        <div className="text-xs text-gray-600">Evaluators</div>
                      </div>

                      {/* Average Score */}
                      {avgScore !== null && (
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${getScoreColor(avgScore)}`}>
                            {avgScore.toFixed(1)}%
                          </div>
                          <div className="text-xs text-gray-600">Avg Score</div>
                        </div>
                      )}

                      {/* Rating Badge */}
                      {scoreBadge && (
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${scoreBadge.color}`}>
                          {scoreBadge.text}
                        </span>
                      )}

                      {/* Expand/Collapse Button */}
                      {evaluations.length > 0 && (
                        <button
                          onClick={() => toggleProject(projectId)}
                          className="px-4 py-2 bg-[#ab509d] text-white rounded-lg hover:bg-[#964a8a] transition-colors text-sm font-medium"
                        >
                          {isExpanded ? 'Hide' : 'Show'} Details
                        </button>
                      )}

                      {/* View Project Link */}
                      <Link
                        to={`/superadmin/projects/${projectId}`}
                        className="px-4 py-2 border border-[#ab509d] text-[#ab509d] rounded-lg hover:bg-purple-50 transition-colors text-sm font-medium"
                      >
                        View Project
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Evaluations Details (Expandable) */}
                {isExpanded && evaluations.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Evaluator
                          </th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Problem
                          </th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Innovation
                          </th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Market
                          </th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Traction
                          </th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Business
                          </th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Team
                          </th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ethics
                          </th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Avg Score
                          </th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {evaluations.map((evaluation) => {
                          const evaluationId = evaluation.EvaluationId || evaluation.evaluationId;
                          const userId = evaluation.UserId || evaluation.userId;
                          const avgScore = calculateAverageScore(evaluation);
                          const evaluatedAt = evaluation.EvaluatedAt || evaluation.evaluatedAt;
                          
                          const problemScore = evaluation.ProblemSignificance || evaluation.problemSignificance || 0;
                          const innovationScore = evaluation.InnovationTechnical || evaluation.innovationTechnical || 0;
                          const marketScore = evaluation.MarketScalability || evaluation.marketScalability || 0;
                          const tractionScore = evaluation.TractionImpact || evaluation.tractionImpact || 0;
                          const businessScore = evaluation.BusinessModel || evaluation.businessModel || 0;
                          const teamScore = evaluation.TeamExecution || evaluation.teamExecution || 0;
                          const ethicsScore = evaluation.EthicsEquity || evaluation.ethicsEquity || 0;

                          return (
                            <tr key={evaluationId} className="hover:bg-gray-50">
                              <td className="px-4 sm:px-6 py-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {getEvaluatorName(userId)}
                                </div>
                              </td>
                              <td className="px-4 sm:px-6 py-4 text-center">
                                <span className={`text-sm font-semibold ${getScoreColor(problemScore * 10)}`}>
                                  {problemScore}/10
                                </span>
                              </td>
                              <td className="px-4 sm:px-6 py-4 text-center">
                                <span className={`text-sm font-semibold ${getScoreColor(innovationScore * 10)}`}>
                                  {innovationScore}/10
                                </span>
                              </td>
                              <td className="px-4 sm:px-6 py-4 text-center">
                                <span className={`text-sm font-semibold ${getScoreColor(marketScore * 10)}`}>
                                  {marketScore}/10
                                </span>
                              </td>
                              <td className="px-4 sm:px-6 py-4 text-center">
                                <span className={`text-sm font-semibold ${getScoreColor(tractionScore * 10)}`}>
                                  {tractionScore}/10
                                </span>
                              </td>
                              <td className="px-4 sm:px-6 py-4 text-center">
                                <span className={`text-sm font-semibold ${getScoreColor(businessScore * 10)}`}>
                                  {businessScore}/10
                                </span>
                              </td>
                              <td className="px-4 sm:px-6 py-4 text-center">
                                <span className={`text-sm font-semibold ${getScoreColor(teamScore * 10)}`}>
                                  {teamScore}/10
                                </span>
                              </td>
                              <td className="px-4 sm:px-6 py-4 text-center">
                                <span className={`text-sm font-semibold ${getScoreColor(ethicsScore * 10)}`}>
                                  {ethicsScore}/10
                                </span>
                              </td>
                              <td className="px-4 sm:px-6 py-4">
                                <div className={`text-lg font-bold ${getScoreColor(avgScore)}`}>
                                  {avgScore.toFixed(1)}%
                                </div>
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getScoreBadge(avgScore).color}`}>
                                  {getScoreBadge(avgScore).text}
                                </span>
                              </td>
                              <td className="px-4 sm:px-6 py-4 text-xs text-gray-500">
                                {new Date(evaluatedAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </td>
                            </tr>
                          );
                        })}
                        
                        {/* Average Row */}
                        {evaluations.length > 1 && (() => {
                          const averages = calculateMetricAverages(evaluations);
                          const overallAvg = getProjectAverageScore(evaluations);
                          
                          return (
                            <tr className="bg-gradient-to-r from-purple-50 to-blue-50 border-t-2 border-[#ab509d]">
                              <td className="px-4 sm:px-6 py-4">
                                <div className="text-sm font-bold text-[#ab509d] flex items-center gap-2">
                                  <span>📊</span>
                                  <span>AVERAGE ({evaluations.length} Evaluators)</span>
                                </div>
                              </td>
                              <td className="px-4 sm:px-6 py-4 text-center">
                                <span className={`text-sm font-bold ${getScoreColor(parseFloat(averages.problem) * 10)}`}>
                                  {averages.problem}/10
                                </span>
                              </td>
                              <td className="px-4 sm:px-6 py-4 text-center">
                                <span className={`text-sm font-bold ${getScoreColor(parseFloat(averages.innovation) * 10)}`}>
                                  {averages.innovation}/10
                                </span>
                              </td>
                              <td className="px-4 sm:px-6 py-4 text-center">
                                <span className={`text-sm font-bold ${getScoreColor(parseFloat(averages.market) * 10)}`}>
                                  {averages.market}/10
                                </span>
                              </td>
                              <td className="px-4 sm:px-6 py-4 text-center">
                                <span className={`text-sm font-bold ${getScoreColor(parseFloat(averages.traction) * 10)}`}>
                                  {averages.traction}/10
                                </span>
                              </td>
                              <td className="px-4 sm:px-6 py-4 text-center">
                                <span className={`text-sm font-bold ${getScoreColor(parseFloat(averages.business) * 10)}`}>
                                  {averages.business}/10
                                </span>
                              </td>
                              <td className="px-4 sm:px-6 py-4 text-center">
                                <span className={`text-sm font-bold ${getScoreColor(parseFloat(averages.team) * 10)}`}>
                                  {averages.team}/10
                                </span>
                              </td>
                              <td className="px-4 sm:px-6 py-4 text-center">
                                <span className={`text-sm font-bold ${getScoreColor(parseFloat(averages.ethics) * 10)}`}>
                                  {averages.ethics}/10
                                </span>
                              </td>
                              <td className="px-4 sm:px-6 py-4">
                                <div className={`text-xl font-bold ${getScoreColor(overallAvg)}`}>
                                  {overallAvg.toFixed(1)}%
                                </div>
                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${getScoreBadge(overallAvg).color}`}>
                                  {getScoreBadge(overallAvg).text}
                                </span>
                              </td>
                              <td className="px-4 sm:px-6 py-4 text-center">
                                <span className="text-xs font-semibold text-[#ab509d]">
                                  CONSENSUS
                                </span>
                              </td>
                            </tr>
                          );
                        })()}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* All Evaluators Section - Show ALL assigned evaluators with their status */}
                {isExpanded && assignedCount > 0 && (
                  <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-gray-50 to-purple-50 border-t border-gray-200">
                    <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <span>👥</span>
                      <span>All Assigned Evaluators ({assignedCount})</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {assignedEvaluators.map(evaluatorId => {
                        const hasSubmitted = evaluations.some(e => 
                          (e.UserId || e.userId || e.Id || e.id) === evaluatorId
                        );
                        const evaluatorName = getEvaluatorName(evaluatorId);
                        
                        return (
                          <div 
                            key={evaluatorId} 
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-sm transition-all duration-200 ${
                              hasSubmitted 
                                ? 'bg-green-50 border-2 border-green-300 hover:shadow-md' 
                                : 'bg-orange-50 border-2 border-orange-300 hover:shadow-md'
                            }`}
                          >
                            <span className="text-2xl">
                              {hasSubmitted ? '✅' : '⏳'}
                            </span>
                            <div className="flex-1">
                              <div className="text-sm font-semibold text-gray-900">
                                {evaluatorName}
                              </div>
                              <div className={`text-xs font-medium ${
                                hasSubmitted ? 'text-green-700' : 'text-orange-700'
                              }`}>
                                {hasSubmitted ? 'Submitted' : 'Pending'}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* No Evaluations Message */}
                {evaluations.length === 0 && (
                  <div className="px-6 py-8 text-center text-gray-500">
                    <div className="text-4xl mb-2">📝</div>
                    <p className="text-sm">No evaluations submitted yet for this project</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Results Count */}
      {filteredAndSortedProjects.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-600">
          Showing {filteredAndSortedProjects.length} of {projectsWithEvaluations.length} total projects
          <span className="mx-2">•</span>
          {stats.totalEvaluations} total evaluations
        </div>
      )}
    </div>
  );
};

export default AllResults;
