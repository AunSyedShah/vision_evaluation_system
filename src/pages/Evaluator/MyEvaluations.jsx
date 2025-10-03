import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyEvaluations } from '../../utils/api';

const MyEvaluations = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvaluations();
  }, []);

  const loadEvaluations = async () => {
    try {
      setLoading(true);
      const data = await getMyEvaluations();
      
      // Debug: Log raw API response
      console.log('📊 Raw Evaluations Response:', data);
      
      // Handle ReferenceHandler.Preserve format
      let evaluationsArray = data.$values || data;
      
      // Debug: Log extracted array
      console.log('📋 Evaluations Array:', evaluationsArray);
      
      // Ensure it's an array
      if (!Array.isArray(evaluationsArray)) {
        evaluationsArray = [];
      }
      
      // Debug: Log first evaluation structure
      if (evaluationsArray.length > 0) {
        console.log('🔍 First Evaluation Structure:', evaluationsArray[0]);
        console.log('🔢 Scores:', {
          ProblemSignificance: evaluationsArray[0].ProblemSignificance,
          InnovationTechnical: evaluationsArray[0].InnovationTechnical,
          MarketScalability: evaluationsArray[0].MarketScalability,
          TractionImpact: evaluationsArray[0].TractionImpact,
          BusinessModel: evaluationsArray[0].BusinessModel,
          TeamExecution: evaluationsArray[0].TeamExecution,
          EthicsEquity: evaluationsArray[0].EthicsEquity
        });
      }
      
      setEvaluations(evaluationsArray);
    } catch (error) {
      console.error('❌ Failed to load my evaluations:', error);
      setEvaluations([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalScore = (evaluation) => {
    const problemSignificance = evaluation.ProblemSignificance || evaluation.problemSignificance || 0;
    const innovationTechnical = evaluation.InnovationTechnical || evaluation.innovationTechnical || 0;
    const marketScalability = evaluation.MarketScalability || evaluation.marketScalability || 0;
    const tractionImpact = evaluation.TractionImpact || evaluation.tractionImpact || 0;
    const businessModel = evaluation.BusinessModel || evaluation.businessModel || 0;
    const teamExecution = evaluation.TeamExecution || evaluation.teamExecution || 0;
    const ethicsEquity = evaluation.EthicsEquity || evaluation.ethicsEquity || 0;

    return Number(problemSignificance) + Number(innovationTechnical) + 
           Number(marketScalability) + Number(tractionImpact) + 
           Number(businessModel) + Number(teamExecution) + Number(ethicsEquity);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ab509d] mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading your evaluations...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Evaluations</h1>
        <p className="text-gray-600">View all evaluations you have submitted</p>
      </div>

      {evaluations.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Evaluations Yet</h3>
          <p className="text-gray-600 mb-6">You haven't submitted any evaluations yet.</p>
          <Link
            to="/evaluator/projects"
            className="inline-block px-6 py-3 bg-[#ab509d] hover:bg-[#964a8a] text-white font-semibold rounded-lg transition duration-150"
          >
            View Assigned Projects
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {evaluations.map((evaluation) => {
            const evaluationId = evaluation.EvaluationId || evaluation.evaluationId;
            const projectId = evaluation.ProjectId || evaluation.projectId;
            // Backend includes Project object, get StartupName from there
            const project = evaluation.Project || evaluation.project;
            const startupName = project?.StartupName || project?.startupName || evaluation.StartupName || evaluation.startupName || 'Untitled Project';
            const evaluatedAt = evaluation.EvaluatedAt || evaluation.evaluatedAt;
            const totalScore = calculateTotalScore(evaluation);

            return (
              <div key={evaluationId} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{startupName}</h3>
                      {evaluatedAt && (
                        <p className="text-sm text-gray-500">
                          Evaluated on {new Date(evaluatedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-[#ab509d]">{totalScore} / 70</div>
                      <p className="text-sm text-gray-500">Total Score</p>
                    </div>
                  </div>

                  {/* Score Breakdown */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Problem Significance</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {evaluation.ProblemSignificance || evaluation.problemSignificance || 0}/10
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Innovation & Technical</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {evaluation.InnovationTechnical || evaluation.innovationTechnical || 0}/10
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Market & Scalability</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {evaluation.MarketScalability || evaluation.marketScalability || 0}/10
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Traction & Impact</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {evaluation.TractionImpact || evaluation.tractionImpact || 0}/10
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Business Model</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {evaluation.BusinessModel || evaluation.businessModel || 0}/10
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Team & Execution</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {evaluation.TeamExecution || evaluation.teamExecution || 0}/10
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Ethics & Equity</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {evaluation.EthicsEquity || evaluation.ethicsEquity || 0}/10
                      </p>
                    </div>
                  </div>

                  {/* Qualitative Feedback */}
                  <div className="space-y-4">
                    {(evaluation.Strengths || evaluation.strengths) && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">💪 Key Strengths</h4>
                        <p className="text-gray-900 bg-green-50 p-3 rounded-lg">
                          {evaluation.Strengths || evaluation.strengths}
                        </p>
                      </div>
                    )}

                    {(evaluation.Weaknesses || evaluation.weaknesses) && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">⚠️ Areas for Improvement</h4>
                        <p className="text-gray-900 bg-orange-50 p-3 rounded-lg">
                          {evaluation.Weaknesses || evaluation.weaknesses}
                        </p>
                      </div>
                    )}

                    {(evaluation.Recommendation || evaluation.recommendation) && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">🎯 Overall Recommendation</h4>
                        <p className="text-gray-900 bg-blue-50 p-3 rounded-lg">
                          {evaluation.Recommendation || evaluation.recommendation}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <Link
                      to={`/evaluator/projects/${projectId}`}
                      className="text-[#ab509d] hover:text-[#964a8a] font-medium"
                    >
                      View Project Details →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyEvaluations;
