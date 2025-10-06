import { useEffect, useState } from 'react';
import { getAllEvaluators } from '../../utils/api';
import CreateEvaluatorForm from './CreateEvaluatorForm';
import EditEvaluatorForm from './EditEvaluatorForm';

const EvaluatorsList = () => {
  const [evaluators, setEvaluators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEvaluator, setEditingEvaluator] = useState(null);

  useEffect(() => {
    loadEvaluators();
  }, []);

  const loadEvaluators = async () => {
    try {
      setLoading(true);
      setError('');
      let data = await getAllEvaluators();
      
      console.log('Raw API Response:', data); // Debug
      
      // Handle .NET ReferenceHandler.Preserve format
      // The response structure is: { "$id": "1", "$values": [...] }
      if (data && data.$values) {
        data = data.$values;
      }
      
      console.log('After $values extraction:', data); // Debug
      
      // Now the API returns a clean array structure - just normalize field names
      const normalizedData = Array.isArray(data) 
        ? data.map((evaluator) => {
            console.log('Processing Evaluator:', evaluator); // Debug
            
            // Handle both PascalCase and camelCase field names
            return {
              userId: evaluator.userId || evaluator.UserId,
              username: evaluator.username || evaluator.Username || 'N/A',
              email: evaluator.email || evaluator.Email || 'N/A',
              designation: evaluator.designation || evaluator.Designation || null,
              company: evaluator.company || evaluator.Company || null,
              isOtpVerified: evaluator.isOtpVerified ?? evaluator.IsOtpVerified ?? false,
              roleName: evaluator.roleName || evaluator.RoleName || 'User',
            };
          })
        : [];
      
      console.log('Total Users Found:', normalizedData.length); // Debug
      console.log('Normalized Evaluators:', normalizedData); // Debug
      
      setEvaluators(normalizedData);
    } catch (err) {
      console.error('Failed to load evaluators:', err);
      setError('Failed to load evaluators. Please try again.');
      setEvaluators([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ab509d] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading evaluators...</p>
        </div>
      </div>
    );
  }

  const handleCreateSuccess = (newEvaluator) => {
    console.log('New evaluator created:', newEvaluator);
    // Refresh the evaluators list
    loadEvaluators();
  };

  const handleEditSuccess = (updatedEvaluator) => {
    console.log('Evaluator updated:', updatedEvaluator);
    // Close edit form and refresh list
    setEditingEvaluator(null);
    loadEvaluators();
  };

  const handleCloseForm = () => {
    setShowCreateForm(false);
  };

  const handleCloseEditForm = () => {
    setEditingEvaluator(null);
  };

  const handleEditClick = (evaluator) => {
    setEditingEvaluator(evaluator);
  };

  // Show create form modal
  if (showCreateForm) {
    return (
      <div>
        <div className="mb-6">
          <button
            onClick={handleCloseForm}
            className="flex items-center text-gray-600 hover:text-gray-900 transition duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Evaluators List
          </button>
        </div>
        <CreateEvaluatorForm 
          onSuccess={handleCreateSuccess} 
          onCancel={handleCloseForm} 
        />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Evaluators</h1>
          <p className="text-gray-600">View all registered evaluators in the system</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-6 py-3 bg-[#ab509d] text-white rounded-lg hover:bg-[#8d4180] transition duration-200 font-semibold flex items-center shadow-md"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Evaluator
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <p className="font-semibold">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {evaluators.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Evaluators Yet</h3>
          <p className="text-gray-600">Evaluators will appear here once they register</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Designation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {evaluators.map((evaluator, index) => (
                  <tr key={evaluator.userId || `evaluator-${index}`} className="hover:bg-gray-50 transition duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{evaluator.username || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{evaluator.email || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700">
                        {evaluator.designation || <span className="text-gray-400">—</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700">
                        {evaluator.company || <span className="text-gray-400">—</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        #{evaluator.userId || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
                        evaluator.isOtpVerified 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {evaluator.isOtpVerified ? 'Verified' : 'Pending OTP'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleEditClick(evaluator)}
                        className="text-blue-600 hover:text-blue-900 font-medium flex items-center transition-colors"
                        title="Edit Evaluator"
                      >
                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Evaluator Modal */}
      {editingEvaluator && (
        <EditEvaluatorForm
          evaluator={editingEvaluator}
          onSuccess={handleEditSuccess}
          onCancel={handleCloseEditForm}
        />
      )}
    </div>
  );
};

export default EvaluatorsList;
