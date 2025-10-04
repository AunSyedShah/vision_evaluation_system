import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getAllEvaluators, assignProjectToEvaluators, getEvaluationsByProject } from '../utils/api';

const AssignEvaluatorsModal = ({ isOpen, onClose, projectId, projectName, onSuccess }) => {
  const [evaluators, setEvaluators] = useState([]);
  const [selectedEvaluators, setSelectedEvaluators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadEvaluators();
    } else {
      // Reset selected evaluators when modal closes
      setSelectedEvaluators([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, projectId]);

  const loadEvaluators = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch all evaluators
      let allEvaluators = await getAllEvaluators();
      console.log('📋 All Evaluators (raw):', allEvaluators);
      
      // Handle .NET ReferenceHandler.Preserve format
      if (allEvaluators && allEvaluators.$values) {
        allEvaluators = allEvaluators.$values;
      }
      
      console.log('📋 All Evaluators (extracted):', allEvaluators);
      console.log('📋 First user structure:', allEvaluators[0]);
      
      // Fetch existing evaluations for this project to get already assigned evaluators
      let projectEvaluations = [];
      try {
        const evaluationsData = await getEvaluationsByProject(parseInt(projectId));
        projectEvaluations = evaluationsData?.$values || evaluationsData || [];
        console.log('📊 Project Evaluations:', projectEvaluations);
      } catch (evalErr) {
        console.log('ℹ️ No existing evaluations found (or error fetching):', evalErr.message);
        // It's okay if no evaluations exist yet
      }
      
      // Extract user IDs from evaluations
      const assignedEvaluatorIds = projectEvaluations.map(evaluation => 
        evaluation.UserId || evaluation.userId
      ).filter(Boolean);
      
      console.log('✅ Already assigned evaluator IDs:', assignedEvaluatorIds);
      
      // Pre-select already assigned evaluators
      setSelectedEvaluators(assignedEvaluatorIds);
      
      // Filter only verified evaluators with role "User"
      const evaluatorsList = Array.isArray(allEvaluators) 
        ? allEvaluators.filter(user => {
            // Handle Role as object or string
            let roleName = '';
            if (typeof user.role === 'object' && user.role !== null) {
              roleName = user.role.roleName || user.role.RoleName || '';
            } else if (typeof user.Role === 'object' && user.Role !== null) {
              roleName = user.Role.roleName || user.Role.RoleName || '';
            } else {
              roleName = user.Role || user.role || user.RoleName || user.roleName || '';
            }
            
            const isVerified = user.isOtpVerified || user.IsOtpVerified || false;
            const username = user.username || user.Username || user.email || user.Email || 'Unknown';
            
            console.log('👤 User:', username, 'Role:', roleName, 'Verified:', isVerified);
            
            // Must be an evaluator role AND OTP verified
            const isEvaluatorRole = roleName === 'User' || roleName === 'user' || roleName === 'Evaluator' || roleName === 'evaluator';
            return isEvaluatorRole && isVerified;
          })
        : [];
      
      console.log('✅ Filtered verified evaluators:', evaluatorsList);
      setEvaluators(evaluatorsList);
    } catch (err) {
      console.error('❌ Failed to load evaluators:', err);
      setError(err.response?.data?.message || 'Failed to load evaluators.');
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluatorToggle = (evaluatorId) => {
    if (selectedEvaluators.includes(evaluatorId)) {
      setSelectedEvaluators(selectedEvaluators.filter(id => id !== evaluatorId));
    } else {
      setSelectedEvaluators([...selectedEvaluators, evaluatorId]);
    }
  };

  const handleAssign = async () => {
    if (selectedEvaluators.length === 0) {
      toast.warning('Please select at least one evaluator');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      console.log('📤 Assigning evaluators:', {
        ProjectId: parseInt(projectId),
        UserIds: selectedEvaluators
      });

      await assignProjectToEvaluators({
        ProjectId: parseInt(projectId),
        UserIds: selectedEvaluators
      });

      toast.success('Evaluators assigned successfully!');
      setSelectedEvaluators([]);
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (err) {
      console.error('❌ Failed to assign evaluators:', err);
      setError(err.response?.data?.message || 'Failed to assign evaluators. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-[#ab509d] text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">👥 Assign Evaluators</h2>
            <p className="text-sm text-purple-100 mt-1">{projectName}</p>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="text-white hover:text-gray-200 text-2xl font-bold disabled:opacity-50"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="font-semibold">❌ Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
            <p className="text-sm">
              <strong>ℹ️ Note:</strong> You can assign multiple evaluators to this project.
            </p>
            <p className="text-sm mt-1">
              Selected: <strong>{selectedEvaluators.length}</strong> evaluator{selectedEvaluators.length !== 1 ? 's' : ''}
            </p>
            {selectedEvaluators.length > 0 && (
              <p className="text-sm mt-1 text-purple-700">
                ✓ Evaluators with checkmarks are already assigned to this project
              </p>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ab509d] mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading evaluators...</p>
            </div>
          ) : evaluators.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Verified Evaluators Available</h3>
              <p className="text-gray-600">There are no OTP-verified users with the "Evaluator" role in the system.</p>
              <p className="text-sm text-gray-500 mt-2">Evaluators must verify their email/OTP before they can be assigned to projects.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Select evaluators to assign to this project:
              </p>
              
              {evaluators.map((evaluator) => {
                const evaluatorId = evaluator.userId || evaluator.UserId || evaluator.Id || evaluator.id;
                const evaluatorName = evaluator.username || evaluator.Username || evaluator.name || evaluator.Name || evaluator.email || evaluator.Email || 'Unknown';
                const evaluatorEmail = evaluator.email || evaluator.Email || '';
                const isSelected = selectedEvaluators.includes(evaluatorId);

                return (
                  <div
                    key={evaluatorId}
                    className={`border rounded-lg p-4 transition duration-150 cursor-pointer ${
                      isSelected
                        ? 'border-[#ab509d] bg-purple-50'
                        : 'border-gray-200 hover:border-[#ab509d] hover:bg-gray-50'
                    }`}
                    onClick={() => handleEvaluatorToggle(evaluatorId)}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleEvaluatorToggle(evaluatorId)}
                        className="w-5 h-5 text-[#ab509d] border-gray-300 rounded focus:ring-[#ab509d]"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{evaluatorName}</p>
                        {evaluatorEmail && (
                          <p className="text-sm text-gray-500">{evaluatorEmail}</p>
                        )}
                      </div>
                      {isSelected && (
                        <span className="text-[#ab509d] font-semibold">✓</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition duration-150 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={submitting || selectedEvaluators.length === 0 || loading}
            className="px-6 py-2 bg-[#ab509d] hover:bg-[#964a8a] text-white font-semibold rounded-lg shadow-md transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <span className="inline-block animate-spin mr-2">⏳</span>
                Assigning...
              </>
            ) : (
              <>✓ Assign Selected ({selectedEvaluators.length})</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignEvaluatorsModal;
