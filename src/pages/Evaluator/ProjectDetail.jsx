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
      
      // Validate text fields (only check if not empty)
      if (!values.strengths || values.strengths.trim().length === 0) {
        errors.strengths = 'Please provide your feedback';
      }
      if (!values.weaknesses || values.weaknesses.trim().length === 0) {
        errors.weaknesses = 'Please provide your feedback';
      }
      if (!values.recommendation || values.recommendation.trim().length === 0) {
        errors.recommendation = 'Please provide your recommendation';
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
                {/* Founder Information */}
                {(project.FounderName || project.founderName) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Founder Name</label>
                    <p className="text-gray-900 font-medium">{project.FounderName || project.founderName}</p>
                  </div>
                )}
                {(project.Email || project.email) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                    <p className="text-gray-900 font-medium">{project.Email || project.email}</p>
                  </div>
                )}
                {(project.Phone || project.phone) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                    <p className="text-gray-900 font-medium">{project.Phone || project.phone}</p>
                  </div>
                )}
                {(project.Username || project.username) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Username</label>
                    <p className="text-gray-900 font-medium">{project.Username || project.username}</p>
                  </div>
                )}
                {(project.StartupStatus || project.startupStatus) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Startup Status</label>
                    <p className="text-gray-900 font-medium">{project.StartupStatus || project.startupStatus}</p>
                  </div>
                )}
                {(project.Timestamp || project.timestamp) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Created At</label>
                    <p className="text-gray-900 font-medium">
                      {new Date(project.Timestamp || project.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Links Section */}
              {((project.WebsiteLink || project.websiteLink) || (project.MobileAppLink || project.mobileAppLink)) && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">🔗 Links</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(project.WebsiteLink || project.websiteLink) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Website Link</label>
                        <a 
                          href={project.WebsiteLink || project.websiteLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#ab509d] hover:underline break-all"
                        >
                          {project.WebsiteLink || project.websiteLink}
                        </a>
                      </div>
                    )}
                    {(project.MobileAppLink || project.mobileAppLink) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Mobile App Link</label>
                        <a 
                          href={project.MobileAppLink || project.mobileAppLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#ab509d] hover:underline break-all"
                        >
                          {project.MobileAppLink || project.mobileAppLink}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Spotlight Reason */}
              {(project.SpotlightReason || project.spotlightReason) && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">✨ Spotlight Reason</h3>
                  <p className="text-gray-700 leading-relaxed">{project.SpotlightReason || project.spotlightReason}</p>
                </div>
              )}

              {/* Media Section */}
              <div className="border-t border-gray-200 pt-6 space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📁 Project Media</h3>

                {/* Images Section - All images grouped together */}
                <div className="space-y-6">
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">� Founder Photo</label>
                      <img 
                        src={`http://localhost:5063${project.FounderPhoto || project.founderPhoto}`} 
                        alt="Founder Photo" 
                        className="max-w-xs rounded-lg shadow-md border border-gray-300 bg-white"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
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

                {/* Videos Section - All videos grouped together at the bottom */}
                <div className="space-y-6">
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
                </div>
              </div>
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
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">📊 Evaluation Scores (1-10)</h3>
                  <p className="text-sm text-gray-600 mt-2">Rate each criterion from 1 (Poor) to 10 (Excellent)</p>
                </div>

                {/* Problem Significance */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    1️⃣ Problem Significance & Need
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                      <label key={score} className="inline-flex items-center">
                        <input
                          type="radio"
                          name="problemSignificance"
                          value={score}
                          checked={formik.values.problemSignificance === score}
                          onChange={() => formik.setFieldValue('problemSignificance', score)}
                          disabled={existingEvaluation}
                          className="sr-only peer"
                        />
                        <span className={`px-4 py-2 border-2 rounded-lg cursor-pointer transition-all font-semibold
                          ${existingEvaluation ? 'cursor-not-allowed opacity-50' : 'hover:border-[#ab509d]'}
                          ${formik.values.problemSignificance === score 
                            ? 'bg-[#ab509d] text-white border-[#ab509d]' 
                            : 'bg-white text-gray-700 border-gray-300'}`}
                        >
                          {score}
                        </span>
                      </label>
                    ))}
                  </div>
                  {formik.touched.problemSignificance && formik.errors.problemSignificance && (
                    <div className="text-red-600 text-sm mt-2">{formik.errors.problemSignificance}</div>
                  )}
                </div>

                {/* Innovation & Technical */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    2️⃣ Innovation & Technical Sophistication
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                      <label key={score} className="inline-flex items-center">
                        <input
                          type="radio"
                          name="innovationTechnical"
                          value={score}
                          checked={formik.values.innovationTechnical === score}
                          onChange={() => formik.setFieldValue('innovationTechnical', score)}
                          disabled={existingEvaluation}
                          className="sr-only peer"
                        />
                        <span className={`px-4 py-2 border-2 rounded-lg cursor-pointer transition-all font-semibold
                          ${existingEvaluation ? 'cursor-not-allowed opacity-50' : 'hover:border-[#ab509d]'}
                          ${formik.values.innovationTechnical === score 
                            ? 'bg-[#ab509d] text-white border-[#ab509d]' 
                            : 'bg-white text-gray-700 border-gray-300'}`}
                        >
                          {score}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Market & Scalability */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    3️⃣ Market Opportunity & Scalability
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                      <label key={score} className="inline-flex items-center">
                        <input
                          type="radio"
                          name="marketScalability"
                          value={score}
                          checked={formik.values.marketScalability === score}
                          onChange={() => formik.setFieldValue('marketScalability', score)}
                          disabled={existingEvaluation}
                          className="sr-only peer"
                        />
                        <span className={`px-4 py-2 border-2 rounded-lg cursor-pointer transition-all font-semibold
                          ${existingEvaluation ? 'cursor-not-allowed opacity-50' : 'hover:border-[#ab509d]'}
                          ${formik.values.marketScalability === score 
                            ? 'bg-[#ab509d] text-white border-[#ab509d]' 
                            : 'bg-white text-gray-700 border-gray-300'}`}
                        >
                          {score}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Traction & Impact */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    4️⃣ Traction & Demonstrated Impact
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                      <label key={score} className="inline-flex items-center">
                        <input
                          type="radio"
                          name="tractionImpact"
                          value={score}
                          checked={formik.values.tractionImpact === score}
                          onChange={() => formik.setFieldValue('tractionImpact', score)}
                          disabled={existingEvaluation}
                          className="sr-only peer"
                        />
                        <span className={`px-4 py-2 border-2 rounded-lg cursor-pointer transition-all font-semibold
                          ${existingEvaluation ? 'cursor-not-allowed opacity-50' : 'hover:border-[#ab509d]'}
                          ${formik.values.tractionImpact === score 
                            ? 'bg-[#ab509d] text-white border-[#ab509d]' 
                            : 'bg-white text-gray-700 border-gray-300'}`}
                        >
                          {score}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Business Model */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    5️⃣ Business Model & Revenue Potential
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                      <label key={score} className="inline-flex items-center">
                        <input
                          type="radio"
                          name="businessModel"
                          value={score}
                          checked={formik.values.businessModel === score}
                          onChange={() => formik.setFieldValue('businessModel', score)}
                          disabled={existingEvaluation}
                          className="sr-only peer"
                        />
                        <span className={`px-4 py-2 border-2 rounded-lg cursor-pointer transition-all font-semibold
                          ${existingEvaluation ? 'cursor-not-allowed opacity-50' : 'hover:border-[#ab509d]'}
                          ${formik.values.businessModel === score 
                            ? 'bg-[#ab509d] text-white border-[#ab509d]' 
                            : 'bg-white text-gray-700 border-gray-300'}`}
                        >
                          {score}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Team & Execution */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    6️⃣ Team Competence & Execution Capability
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                      <label key={score} className="inline-flex items-center">
                        <input
                          type="radio"
                          name="teamExecution"
                          value={score}
                          checked={formik.values.teamExecution === score}
                          onChange={() => formik.setFieldValue('teamExecution', score)}
                          disabled={existingEvaluation}
                          className="sr-only peer"
                        />
                        <span className={`px-4 py-2 border-2 rounded-lg cursor-pointer transition-all font-semibold
                          ${existingEvaluation ? 'cursor-not-allowed opacity-50' : 'hover:border-[#ab509d]'}
                          ${formik.values.teamExecution === score 
                            ? 'bg-[#ab509d] text-white border-[#ab509d]' 
                            : 'bg-white text-gray-700 border-gray-300'}`}
                        >
                          {score}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Ethics & Equity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    7️⃣ Ethics & Equity Considerations
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                      <label key={score} className="inline-flex items-center">
                        <input
                          type="radio"
                          name="ethicsEquity"
                          value={score}
                          checked={formik.values.ethicsEquity === score}
                          onChange={() => formik.setFieldValue('ethicsEquity', score)}
                          disabled={existingEvaluation}
                          className="sr-only peer"
                        />
                        <span className={`px-4 py-2 border-2 rounded-lg cursor-pointer transition-all font-semibold
                          ${existingEvaluation ? 'cursor-not-allowed opacity-50' : 'hover:border-[#ab509d]'}
                          ${formik.values.ethicsEquity === score 
                            ? 'bg-[#ab509d] text-white border-[#ab509d]' 
                            : 'bg-white text-gray-700 border-gray-300'}`}
                        >
                          {score}
                        </span>
                      </label>
                    ))}
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
