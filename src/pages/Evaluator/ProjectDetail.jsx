import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import toast from 'react-hot-toast';
import { 
  getAssignedProjects,
  getMyEvaluations,
  submitEvaluation
} from '../../utils/api';

const EvaluatorProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [existingEvaluation, setExistingEvaluation] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadProjectData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      
      // Evaluators can only access assigned projects
      // Load all assigned projects and find the specific one
      const assignedData = await getAssignedProjects();
      const assignedArray = assignedData.$values || assignedData;
      
      // Find the project by ID (backend uses 'Id' field)
      const projectData = assignedArray.find(
        p => (p.Id || p.id || p.ProjectId || p.projectId) === parseInt(id)
      );
      
      if (!projectData) {
        // Project not found or not assigned to this evaluator
        console.error('⚠️ Project not found or not assigned');
        setProject(null);
        setLoading(false);
        return;
      }
      
      setProject(projectData);
      
      // Check if already evaluated
      const myEvaluations = await getMyEvaluations();
      const evaluationsArray = myEvaluations.$values || myEvaluations;
      const existing = evaluationsArray.find(
        e => (e.ProjectId || e.projectId) === parseInt(id)
      );
      
      if (existing) {
        setExistingEvaluation(existing);
        // Pre-fill form with existing evaluation
        formik.setValues({
          problemSignificance: existing.ProblemSignificance || existing.problemSignificance || 5,
          innovationTechnical: existing.InnovationTechnical || existing.innovationTechnical || 5,
          marketScalability: existing.MarketScalability || existing.marketScalability || 5,
          tractionImpact: existing.TractionImpact || existing.tractionImpact || 5,
          businessModel: existing.BusinessModel || existing.businessModel || 5,
          teamExecution: existing.TeamExecution || existing.teamExecution || 5,
          ethicsEquity: existing.EthicsEquity || existing.ethicsEquity || 5,
          strengths: existing.Strengths || existing.strengths || '',
          weaknesses: existing.Weaknesses || existing.weaknesses || '',
          recommendation: existing.Recommendation || existing.recommendation || ''
        });
      }
    } catch (error) {
      console.error('❌ Failed to load project data:', error);
      setProject(null);
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      problemSignificance: 5,
      innovationTechnical: 5,
      marketScalability: 5,
      tractionImpact: 5,
      businessModel: 5,
      teamExecution: 5,
      ethicsEquity: 5,
      strengths: '',
      weaknesses: '',
      recommendation: ''
    },
    validate: values => {
      const errors = {};
      
      // Validate all scores are between 1-10
      const scoreFields = [
        'problemSignificance', 'innovationTechnical', 'marketScalability',
        'tractionImpact', 'businessModel', 'teamExecution', 'ethicsEquity'
      ];
      
      scoreFields.forEach(field => {
        const value = Number(values[field]);
        if (value < 1 || value > 10) {
          errors[field] = 'Score must be between 1 and 10';
        }
      });
      
      // Validate text fields
      if (!values.strengths || values.strengths.trim().length < 10) {
        errors.strengths = 'Please provide at least 10 characters';
      }
      if (!values.weaknesses || values.weaknesses.trim().length < 10) {
        errors.weaknesses = 'Please provide at least 10 characters';
      }
      if (!values.recommendation || values.recommendation.trim().length < 10) {
        errors.recommendation = 'Please provide at least 10 characters';
      }
      
      return errors;
    },
    onSubmit: async (values) => {
      try {
        setSubmitting(true);
        
        // Backend expects PascalCase field names
        const evaluationData = {
          problemSignificance: Number(values.problemSignificance),
          innovationTechnical: Number(values.innovationTechnical),
          marketScalability: Number(values.marketScalability),
          tractionImpact: Number(values.tractionImpact),
          businessModel: Number(values.businessModel),
          teamExecution: Number(values.teamExecution),
          ethicsEquity: Number(values.ethicsEquity),
          strengths: values.strengths.trim(),
          weaknesses: values.weaknesses.trim(),
          recommendation: values.recommendation.trim()
        };

        await submitEvaluation(id, evaluationData);
        
        toast.success(existingEvaluation 
          ? 'Evaluation updated successfully!' 
          : 'Evaluation submitted successfully!');
        navigate('/evaluator/projects');
      } catch (error) {
        console.error('❌ Failed to submit evaluation:', error);
        toast.error(error.response?.data?.message || 'Failed to submit evaluation. Please try again.');
      } finally {
        setSubmitting(false);
      }
    }
  });

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ab509d] mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading project details...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-md p-12">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Not Accessible</h2>
        <p className="text-gray-600 mb-6">
          This project is not assigned to you or does not exist.
        </p>
        <Link 
          to="/evaluator/projects" 
          className="inline-block px-6 py-3 bg-[#ab509d] hover:bg-[#964a8a] text-white font-semibold rounded-lg transition duration-150"
        >
          ← Back to My Projects
        </Link>
      </div>
    );
  }

  const startupName = project.StartupName || project.startupName || 'Untitled Project';
  const startupDescription = project.StartupDescription || project.startupDescription || 'No description available';
  const startDate = project.StartDate || project.startDate;
  const endDate = project.EndDate || project.endDate;

  return (
    <div>
      <div className="mb-8">
        <Link to="/evaluator/projects" className="text-[#ab509d] hover:text-[#ab509d] mb-4 inline-block">
          ← Back to Projects
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{startupName}</h1>
        <p className="text-gray-600">{startupDescription}</p>
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
              onClick={() => setActiveTab('evaluate')}
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'evaluate'
                  ? 'border-b-2 border-[#ab509d] text-[#ab509d]'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {existingEvaluation ? '✅ View My Evaluation' : '📝 Submit Evaluation'}
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Info Tab */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {startDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Start Date</label>
                    <p className="text-gray-900 font-medium">{new Date(startDate).toLocaleDateString()}</p>
                  </div>
                )}
                {endDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">End Date</label>
                    <p className="text-gray-900 font-medium">{new Date(endDate).toLocaleDateString()}</p>
                  </div>
                )}
                {(project.FounderName || project.founderName) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Founder Name</label>
                    <p className="text-gray-900 font-medium">{project.FounderName || project.founderName}</p>
                  </div>
                )}
                {(project.FounderEmail || project.founderEmail) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Founder Email</label>
                    <p className="text-gray-900 font-medium">{project.FounderEmail || project.founderEmail}</p>
                  </div>
                )}
                {(project.FounderLinkedIn || project.founderLinkedIn) && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-500 mb-1">Founder LinkedIn</label>
                    <a 
                      href={project.FounderLinkedIn || project.founderLinkedIn} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#ab509d] hover:underline"
                    >
                      {project.FounderLinkedIn || project.founderLinkedIn}
                    </a>
                  </div>
                )}
              </div>

              {/* Media Section */}
              {((project.StartupLogo || project.startupLogo) || 
                (project.FounderPhoto || project.founderPhoto) || 
                (project.DefaultVideo || project.defaultVideo) || 
                (project.PitchVideo || project.pitchVideo)) && (
                <div className="mt-8 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">📸 Project Media</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(project.StartupLogo || project.startupLogo) && (
                      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <label className="block text-sm font-medium text-gray-700 mb-2">🏢 Startup Logo</label>
                        <img 
                          src={`http://localhost:5063${project.StartupLogo || project.startupLogo}`} 
                          alt="Startup Logo" 
                          className="max-w-full h-auto rounded-lg shadow-md border border-gray-300 bg-white"
                          onError={(e) => { e.target.src = '/vision_logo.png'; }}
                        />
                      </div>
                    )}
                    
                    {(project.FounderPhoto || project.founderPhoto) && (
                      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <label className="block text-sm font-medium text-gray-700 mb-2">👤 Founder Photo</label>
                        <img 
                          src={`http://localhost:5063${project.FounderPhoto || project.founderPhoto}`} 
                          alt="Founder" 
                          className="max-w-full h-auto rounded-lg shadow-md border border-gray-300 bg-white"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </div>
                    )}
                  </div>

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
                </div>
              )}
            </div>
          )}

          {/* Evaluation Tab */}
          {activeTab === 'evaluate' && (
            <form onSubmit={formik.handleSubmit} className="space-y-8">
              {existingEvaluation && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                  <p className="font-semibold">✅ You have already submitted your evaluation for this project.</p>
                  <p className="text-sm mt-1">Evaluations cannot be edited after submission. Your scores and feedback are shown below.</p>
                </div>
              )}

              {/* Scoring Criteria */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">📊 Evaluation Scores (1-10)</h3>
                <p className="text-sm text-gray-600">Rate each criterion from 1 (Poor) to 10 (Excellent)</p>

                {/* Problem Significance */}
                <div>
                  <label htmlFor="problemSignificance" className="block text-sm font-medium text-gray-700 mb-2">
                    1️⃣ Problem Significance & Need
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      id="problemSignificance"
                      name="problemSignificance"
                      type="range"
                      min="1"
                      max="10"
                      onChange={formik.handleChange}
                      value={formik.values.problemSignificance}
                      disabled={existingEvaluation}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#ab509d] disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <span className="text-2xl font-bold text-[#ab509d] w-12 text-center">
                      {formik.values.problemSignificance}
                    </span>
                  </div>
                  {formik.touched.problemSignificance && formik.errors.problemSignificance && (
                    <div className="text-red-600 text-sm mt-1">{formik.errors.problemSignificance}</div>
                  )}
                </div>

                {/* Innovation & Technical */}
                <div>
                  <label htmlFor="innovationTechnical" className="block text-sm font-medium text-gray-700 mb-2">
                    2️⃣ Innovation & Technical Sophistication
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      id="innovationTechnical"
                      name="innovationTechnical"
                      type="range"
                      min="1"
                      max="10"
                      onChange={formik.handleChange}
                      value={formik.values.innovationTechnical}
                      disabled={existingEvaluation}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#ab509d] disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <span className="text-2xl font-bold text-[#ab509d] w-12 text-center">
                      {formik.values.innovationTechnical}
                    </span>
                  </div>
                </div>

                {/* Market & Scalability */}
                <div>
                  <label htmlFor="marketScalability" className="block text-sm font-medium text-gray-700 mb-2">
                    3️⃣ Market Opportunity & Scalability
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      id="marketScalability"
                      name="marketScalability"
                      type="range"
                      min="1"
                      max="10"
                      onChange={formik.handleChange}
                      value={formik.values.marketScalability}
                      disabled={existingEvaluation}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#ab509d] disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <span className="text-2xl font-bold text-[#ab509d] w-12 text-center">
                      {formik.values.marketScalability}
                    </span>
                  </div>
                </div>

                {/* Traction & Impact */}
                <div>
                  <label htmlFor="tractionImpact" className="block text-sm font-medium text-gray-700 mb-2">
                    4️⃣ Traction & Demonstrated Impact
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      id="tractionImpact"
                      name="tractionImpact"
                      type="range"
                      min="1"
                      max="10"
                      onChange={formik.handleChange}
                      value={formik.values.tractionImpact}
                      disabled={existingEvaluation}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#ab509d] disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <span className="text-2xl font-bold text-[#ab509d] w-12 text-center">
                      {formik.values.tractionImpact}
                    </span>
                  </div>
                </div>

                {/* Business Model */}
                <div>
                  <label htmlFor="businessModel" className="block text-sm font-medium text-gray-700 mb-2">
                    5️⃣ Business Model & Revenue Potential
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      id="businessModel"
                      name="businessModel"
                      type="range"
                      min="1"
                      max="10"
                      onChange={formik.handleChange}
                      value={formik.values.businessModel}
                      disabled={existingEvaluation}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#ab509d] disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <span className="text-2xl font-bold text-[#ab509d] w-12 text-center">
                      {formik.values.businessModel}
                    </span>
                  </div>
                </div>

                {/* Team & Execution */}
                <div>
                  <label htmlFor="teamExecution" className="block text-sm font-medium text-gray-700 mb-2">
                    6️⃣ Team Competence & Execution Capability
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      id="teamExecution"
                      name="teamExecution"
                      type="range"
                      min="1"
                      max="10"
                      onChange={formik.handleChange}
                      value={formik.values.teamExecution}
                      disabled={existingEvaluation}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#ab509d] disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <span className="text-2xl font-bold text-[#ab509d] w-12 text-center">
                      {formik.values.teamExecution}
                    </span>
                  </div>
                </div>

                {/* Ethics & Equity */}
                <div>
                  <label htmlFor="ethicsEquity" className="block text-sm font-medium text-gray-700 mb-2">
                    7️⃣ Ethics & Equity Considerations
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      id="ethicsEquity"
                      name="ethicsEquity"
                      type="range"
                      min="1"
                      max="10"
                      onChange={formik.handleChange}
                      value={formik.values.ethicsEquity}
                      disabled={existingEvaluation}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#ab509d] disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <span className="text-2xl font-bold text-[#ab509d] w-12 text-center">
                      {formik.values.ethicsEquity}
                    </span>
                  </div>
                </div>

                {/* Total Score Display */}
                <div className="bg-[#ab509d] bg-opacity-10 border-2 border-[#ab509d] rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total Score:</span>
                    <span className="text-3xl font-bold text-[#ab509d]">
                      {Number(formik.values.problemSignificance) +
                       Number(formik.values.innovationTechnical) +
                       Number(formik.values.marketScalability) +
                       Number(formik.values.tractionImpact) +
                       Number(formik.values.businessModel) +
                       Number(formik.values.teamExecution) +
                       Number(formik.values.ethicsEquity)} / 70
                    </span>
                  </div>
                </div>
              </div>

              {/* Qualitative Feedback */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">📝 Detailed Feedback</h3>

                <div>
                  <label htmlFor="strengths" className="block text-sm font-medium text-gray-700 mb-2">
                    💪 Key Strengths *
                  </label>
                  <textarea
                    id="strengths"
                    name="strengths"
                    rows="4"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.strengths}
                    disabled={existingEvaluation}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab509d] focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="What are the project's main strengths and competitive advantages?..."
                  />
                  {formik.touched.strengths && formik.errors.strengths && (
                    <div className="text-red-600 text-sm mt-1">{formik.errors.strengths}</div>
                  )}
                </div>

                <div>
                  <label htmlFor="weaknesses" className="block text-sm font-medium text-gray-700 mb-2">
                    ⚠️ Areas for Improvement *
                  </label>
                  <textarea
                    id="weaknesses"
                    name="weaknesses"
                    rows="4"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.weaknesses}
                    disabled={existingEvaluation}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab509d] focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="What are the main weaknesses or risks that need to be addressed?..."
                  />
                  {formik.touched.weaknesses && formik.errors.weaknesses && (
                    <div className="text-red-600 text-sm mt-1">{formik.errors.weaknesses}</div>
                  )}
                </div>

                <div>
                  <label htmlFor="recommendation" className="block text-sm font-medium text-gray-700 mb-2">
                    🎯 Overall Recommendation *
                  </label>
                  <textarea
                    id="recommendation"
                    name="recommendation"
                    rows="4"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.recommendation}
                    disabled={existingEvaluation}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab509d] focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Your overall assessment and recommendation for this project..."
                  />
                  {formik.touched.recommendation && formik.errors.recommendation && (
                    <div className="text-red-600 text-sm mt-1">{formik.errors.recommendation}</div>
                  )}
                </div>
              </div>

              {!existingEvaluation && (
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-[#ab509d] hover:bg-[#964a8a] text-white text-sm sm:text-base font-semibold rounded-lg shadow-md transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Submitting...' : 'Submit Evaluation'}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/evaluator/projects')}
                    disabled={submitting}
                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition duration-150 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              )}
              {existingEvaluation && (
                <div className="pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => navigate('/evaluator/projects')}
                    className="px-6 py-3 bg-[#ab509d] hover:bg-[#964a8a] text-white font-semibold rounded-lg transition duration-150"
                  >
                    ← Back to My Projects
                  </button>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EvaluatorProjectDetail;
