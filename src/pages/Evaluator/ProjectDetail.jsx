import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import { 
  getProjectById, 
  getEvaluationByProjectAndEvaluator, 
  addEvaluation,
  updateEvaluation
} from '../../utils/localStorage';
import { useAuth } from '../../context/AuthContext';

const EvaluatorProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [project, setProject] = useState(null);
  const [existingEvaluation, setExistingEvaluation] = useState(null);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    loadProjectData();
  }, [id, currentUser]);

  const loadProjectData = () => {
    const projectData = getProjectById(id);
    setProject(projectData);
    
    if (currentUser) {
      const evaluation = getEvaluationByProjectAndEvaluator(id, currentUser.id);
      setExistingEvaluation(evaluation);
      if (evaluation) {
        formik.setValues({
          score: evaluation.score || '',
          maxScore: evaluation.maxScore || 100,
          comments: evaluation.comments || '',
          strengths: evaluation.strengths || '',
          weaknesses: evaluation.weaknesses || ''
        });
      }
    }
  };

  const formik = useFormik({
    initialValues: {
      score: '',
      maxScore: 100,
      comments: '',
      strengths: '',
      weaknesses: ''
    },
    validate: values => {
      const errors = {};
      if (!values.score) {
        errors.score = 'Score is required';
      } else if (isNaN(values.score)) {
        errors.score = 'Score must be a number';
      } else if (Number(values.score) < 0 || Number(values.score) > Number(values.maxScore)) {
        errors.score = `Score must be between 0 and ${values.maxScore}`;
      }
      if (!values.comments) {
        errors.comments = 'Comments are required';
      }
      return errors;
    },
    onSubmit: values => {
      const evaluationData = {
        projectId: id,
        evaluatorId: currentUser.id,
        score: Number(values.score),
        maxScore: Number(values.maxScore),
        comments: values.comments,
        strengths: values.strengths,
        weaknesses: values.weaknesses
      };

      if (existingEvaluation) {
        updateEvaluation(existingEvaluation.id, evaluationData);
        alert('Evaluation updated successfully!');
      } else {
        addEvaluation(evaluationData);
        alert('Evaluation submitted successfully!');
      }
      navigate('/evaluator/projects');
    }
  });

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Project not found</h2>
        <Link to="/evaluator/projects" className="text-indigo-600 hover:text-indigo-700 mt-4 inline-block">
          Back to Projects
        </Link>
      </div>
    );
  }

  // Check if user is assigned to this project
  if (!project.assignedEvaluators?.includes(currentUser?.id)) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
        <p className="text-gray-600 mt-2">You are not assigned to this project</p>
        <Link to="/evaluator/projects" className="text-indigo-600 hover:text-indigo-700 mt-4 inline-block">
          Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <Link to="/evaluator/projects" className="text-indigo-600 hover:text-indigo-700 mb-4 inline-block">
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
              onClick={() => setActiveTab('evaluate')}
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'evaluate'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {existingEvaluation ? '✏️ Edit Evaluation' : '📝 Submit Evaluation'}
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
              </div>
            </div>
          )}

          {/* Evaluation Tab */}
          {activeTab === 'evaluate' && (
            <form onSubmit={formik.handleSubmit} className="space-y-6">
              {existingEvaluation && (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
                  <p className="font-semibold">You have already submitted an evaluation for this project.</p>
                  <p className="text-sm mt-1">You can update your evaluation below.</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="score" className="block text-sm font-medium text-gray-700 mb-2">
                    Score *
                  </label>
                  <input
                    id="score"
                    name="score"
                    type="number"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.score}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    placeholder="Enter score"
                  />
                  {formik.touched.score && formik.errors.score && (
                    <div className="text-red-600 text-sm mt-1">{formik.errors.score}</div>
                  )}
                </div>

                <div>
                  <label htmlFor="maxScore" className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Score
                  </label>
                  <input
                    id="maxScore"
                    name="maxScore"
                    type="number"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.maxScore}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-2">
                  Overall Comments *
                </label>
                <textarea
                  id="comments"
                  name="comments"
                  rows="4"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.comments}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="Provide your overall assessment of the project..."
                />
                {formik.touched.comments && formik.errors.comments && (
                  <div className="text-red-600 text-sm mt-1">{formik.errors.comments}</div>
                )}
              </div>

              <div>
                <label htmlFor="strengths" className="block text-sm font-medium text-gray-700 mb-2">
                  Strengths
                </label>
                <textarea
                  id="strengths"
                  name="strengths"
                  rows="3"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.strengths}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="What are the project's strengths?..."
                />
              </div>

              <div>
                <label htmlFor="weaknesses" className="block text-sm font-medium text-gray-700 mb-2">
                  Areas for Improvement
                </label>
                <textarea
                  id="weaknesses"
                  name="weaknesses"
                  rows="3"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.weaknesses}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="What could be improved?..."
                />
              </div>

              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition duration-150"
                >
                  {existingEvaluation ? 'Update Evaluation' : 'Submit Evaluation'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/evaluator/projects')}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition duration-150"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EvaluatorProjectDetail;
