import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getAllEvaluators, updateProjectAssignment, getAssignedUsers, unassignUser, getEvaluationsByProject, getProjectById } from '../utils/api';

const AssignEvaluatorsModal = ({ isOpen, onClose, projectId, projectName, onSuccess }) => {
  const [evaluators, setEvaluators] = useState([]);
  const [selectedEvaluators, setSelectedEvaluators] = useState([]);
  const [initialAssignedEvaluators, setInitialAssignedEvaluators] = useState([]); // Track original assignments
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
      
      // Get assigned evaluators using the new endpoint
      let assignedEvaluatorIds = [];
      
      // Method 1: Use new dedicated endpoint (preferred)
      try {
        const response = await getAssignedUsers(parseInt(projectId));
        console.log('📦 Assigned Users from endpoint (raw):', response);
        console.log('📦 Type of response:', typeof response, Array.isArray(response));
        
        // The backend returns: { $id, project, assignedUsers: {...} }
        // Extract the assignedUsers property first
        let assignedUsersData = response;
        
        // Check if response has assignedUsers property
        if (response && response.assignedUsers) {
          assignedUsersData = response.assignedUsers;
          console.log('📦 Extracted assignedUsers property:', assignedUsersData);
        } else if (response && response.AssignedUsers) {
          assignedUsersData = response.AssignedUsers;
          console.log('📦 Extracted AssignedUsers property:', assignedUsersData);
        }
        
        // Handle .NET ReferenceHandler.Preserve format ($values)
        let usersList = assignedUsersData;
        if (assignedUsersData && assignedUsersData.$values) {
          usersList = assignedUsersData.$values;
          console.log('📦 Extracted $values:', usersList);
        }
        
        // Extract user IDs from the response
        if (Array.isArray(usersList)) {
          assignedEvaluatorIds = usersList.map(user => {
            // If it's already a number, use it directly
            if (typeof user === 'number') {
              return user;
            }
            // If it's an object, extract the ID
            if (typeof user === 'object' && user !== null) {
              return user.userId || user.UserId || user.id || user.Id;
            }
            // Otherwise, try to parse it
            return user;
          }).filter(id => id !== null && id !== undefined);
          
          console.log('✅ Assigned evaluator IDs from dedicated endpoint:', assignedEvaluatorIds);
          console.log('🔍 Types:', assignedEvaluatorIds.map(id => typeof id));
        } else {
          console.log('⚠️ usersList is not an array:', usersList);
        }
      } catch (err) {
        console.log('ℹ️ Could not fetch assigned users from endpoint:', err.message);
        
        // Fallback Method 2: Try project details
        try {
          const projectData = await getProjectById(parseInt(projectId));
          console.log('📦 Project Data (fallback):', projectData);
          
          if (projectData.AssignedEvaluators && Array.isArray(projectData.AssignedEvaluators)) {
            assignedEvaluatorIds = projectData.AssignedEvaluators.map(e => 
              e.UserId || e.userId || e.Id || e.id || e
            ).filter(Boolean);
            console.log('✅ Assigned evaluators from project.AssignedEvaluators:', assignedEvaluatorIds);
          } else if (projectData.assignedEvaluators && Array.isArray(projectData.assignedEvaluators)) {
            assignedEvaluatorIds = projectData.assignedEvaluators.map(e => 
              e.userId || e.UserId || e.id || e.Id || e
            ).filter(Boolean);
            console.log('✅ Assigned evaluators from project.assignedEvaluators:', assignedEvaluatorIds);
          }
        } catch (projectErr) {
          console.log('ℹ️ Could not fetch project details:', projectErr.message);
        }
        
        // Fallback Method 3: Try getting from evaluations (only shows submitted)
        if (assignedEvaluatorIds.length === 0) {
          try {
            const evaluationsData = await getEvaluationsByProject(parseInt(projectId));
            const projectEvaluations = evaluationsData?.$values || evaluationsData || [];
            console.log('📊 Project Evaluations (fallback):', projectEvaluations);
            
            assignedEvaluatorIds = projectEvaluations.map(evaluation => 
              evaluation.UserId || evaluation.userId
            ).filter(Boolean);
            
            console.log('✅ Assigned evaluators from evaluations:', assignedEvaluatorIds);
          } catch (evalErr) {
            console.log('ℹ️ No existing evaluations found:', evalErr.message);
          }
        }
      }
      
      console.log('✅ Final assigned evaluator IDs:', assignedEvaluatorIds);
      console.log('🔍 Type of assigned IDs:', assignedEvaluatorIds.map(id => typeof id));
      
      // Store initial assignments for diff calculation
      setInitialAssignedEvaluators(assignedEvaluatorIds);
      
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
      console.log('🔍 Evaluator IDs extracted from list:', evaluatorsList.map(e => {
        const id = e.userId || e.UserId || e.Id || e.id;
        return { id, type: typeof id };
      }));
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
    try {
      setSubmitting(true);
      setError('');
      
      console.log('📤 Assignment Update Request:', {
        ProjectId: parseInt(projectId),
        Initial: initialAssignedEvaluators,
        Selected: selectedEvaluators,
        InitialCount: initialAssignedEvaluators.length,
        SelectedCount: selectedEvaluators.length
      });

      // Calculate diff: which users to remove and which to add
      const usersToRemove = initialAssignedEvaluators.filter(id => !selectedEvaluators.includes(id));
      const usersToAdd = selectedEvaluators.filter(id => !initialAssignedEvaluators.includes(id));
      
      console.log('🔄 Assignment Diff:', {
        ToRemove: usersToRemove,
        ToAdd: usersToAdd,
        RemoveCount: usersToRemove.length,
        AddCount: usersToAdd.length
      });

      // Step 1: Remove users using DELETE endpoint
      if (usersToRemove.length > 0) {
        console.log('🗑️ Removing users:', usersToRemove);
        for (const userId of usersToRemove) {
          try {
            await unassignUser(parseInt(projectId), userId);
            console.log(`✅ Removed user ${userId}`);
          } catch (removeErr) {
            console.error(`❌ Failed to remove user ${userId}:`, removeErr);
            throw new Error(`Failed to remove evaluator (ID: ${userId})`);
          }
        }
      }

      // Step 2: Add new users using PUT endpoint (if any to add)
      if (usersToAdd.length > 0) {
        console.log('➕ Adding users:', usersToAdd);
        try {
          await updateProjectAssignment({
            ProjectId: parseInt(projectId),
            UserIds: selectedEvaluators // Send complete list to ensure consistency
          });
          console.log('✅ Added new users');
        } catch (addErr) {
          // If PUT fails with "already assigned", it might mean only existing users were selected
          const errorData = addErr.response?.data || '';
          const isAlreadyAssignedError = typeof errorData === 'string' && 
            errorData.toLowerCase().includes('already assigned');
          
          if (!isAlreadyAssignedError) {
            throw addErr; // Re-throw if it's not the "already assigned" error
          }
          console.log('ℹ️ No new users to add (all already assigned)');
        }
      }

      // Success message based on what changed
      if (usersToRemove.length > 0 && usersToAdd.length > 0) {
        toast.success(`Updated assignments: Removed ${usersToRemove.length}, Added ${usersToAdd.length}`);
      } else if (usersToRemove.length > 0) {
        toast.success(`Removed ${usersToRemove.length} evaluator(s) from project`);
      } else if (usersToAdd.length > 0) {
        toast.success(`Added ${usersToAdd.length} evaluator(s) to project`);
      } else {
        toast.success('No changes to assignments');
      }
      
      setSelectedEvaluators([]);
      setInitialAssignedEvaluators([]);
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (err) {
      console.error('❌ Failed to update evaluator assignments:', err);
      console.error('❌ Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      const errorMessage = err.response?.data?.message 
        || err.response?.data?.title
        || (typeof err.response?.data === 'string' ? err.response.data : null)
        || err.message 
        || 'Failed to update evaluator assignments. Please try again.';
      
      setError(errorMessage);
      toast.error(errorMessage);
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
                
                // Debug logging for first render
                if (evaluators.indexOf(evaluator) === 0) {
                  console.log('🔍 Checkbox Comparison Debug:');
                  console.log('  - evaluatorId:', evaluatorId, typeof evaluatorId);
                  console.log('  - selectedEvaluators:', selectedEvaluators);
                  console.log('  - includes result:', isSelected);
                  console.log('  - Comparison:', selectedEvaluators.map(id => ({
                    id,
                    type: typeof id,
                    matches: id === evaluatorId,
                    looseMatches: id == evaluatorId
                  })));
                }

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
            disabled={submitting || loading}
            className="px-6 py-2 bg-[#ab509d] hover:bg-[#964a8a] text-white font-semibold rounded-lg shadow-md transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <span className="inline-block animate-spin mr-2">⏳</span>
                Updating...
              </>
            ) : selectedEvaluators.length === 0 ? (
              <>🗑️ Remove All Evaluators</>
            ) : (
              <>✓ Update Assignments ({selectedEvaluators.length})</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignEvaluatorsModal;
