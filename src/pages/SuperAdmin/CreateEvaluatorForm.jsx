import { useState } from 'react';
import { createEvaluatorInternal } from '../../utils/api';

const CreateEvaluatorForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    designation: '',
    company: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdEvaluator, setCreatedEvaluator] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.username.trim() || !formData.email.trim()) {
      setError('Username and email are required');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const result = await createEvaluatorInternal(formData);
      
      setCreatedEvaluator(result);
      
      // Call onSuccess callback to refresh the list
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      console.error('Error creating evaluator:', err);
      setError(err.response?.data?.message || 'Failed to create evaluator. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      username: '',
      email: '',
      designation: '',
      company: '',
      password: ''
    });
    setCreatedEvaluator(null);
    setError('');
  };

  // Success modal showing credentials
  if (createdEvaluator) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Evaluator Created Successfully!</h2>
          <p className="text-gray-600">Please share these credentials with the evaluator</p>
        </div>

        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 mb-6">
          <div className="flex items-start mb-4">
            <svg className="w-6 h-6 text-yellow-600 mt-1 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 className="font-semibold text-yellow-800 mb-1">Important: Save These Credentials</h3>
              <p className="text-sm text-yellow-700">
                Share these credentials securely with the evaluator. They can login immediately without OTP verification.
              </p>
            </div>
          </div>

          <div className="space-y-3 bg-white p-4 rounded border border-yellow-300">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-700">Username:</span>
              <code className="bg-gray-100 px-3 py-1 rounded text-sm font-mono">{createdEvaluator.username}</code>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-700">Email:</span>
              <code className="bg-gray-100 px-3 py-1 rounded text-sm font-mono">{createdEvaluator.email}</code>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-700">Password:</span>
              <code className="bg-red-100 px-3 py-1 rounded text-sm font-mono text-red-700 font-bold">
                {createdEvaluator.defaultPassword}
              </code>
            </div>
            {createdEvaluator.designation && (
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">Designation:</span>
                <span className="text-gray-900">{createdEvaluator.designation}</span>
              </div>
            )}
            {createdEvaluator.company && (
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">Company:</span>
                <span className="text-gray-900">{createdEvaluator.company}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="flex-1 px-6 py-3 bg-[#ab509d] text-white rounded-lg hover:bg-[#8d4180] transition duration-200 font-semibold"
          >
            Create Another Evaluator
          </button>
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-200 font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Create form
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create New Evaluator</h2>
        <p className="text-gray-600">Add an evaluator to the system without OTP verification</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <p className="font-semibold">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Username - Required */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab509d] focus:border-transparent"
              placeholder="e.g., john_evaluator"
            />
          </div>

          {/* Email - Required */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab509d] focus:border-transparent"
              placeholder="e.g., john@example.com"
            />
          </div>

          {/* Designation - Optional */}
          <div>
            <label htmlFor="designation" className="block text-sm font-medium text-gray-700 mb-2">
              Designation <span className="text-gray-400 text-xs">(Optional)</span>
            </label>
            <input
              type="text"
              id="designation"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab509d] focus:border-transparent"
              placeholder="e.g., Senior Evaluator"
            />
          </div>

          {/* Company - Optional */}
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
              Company <span className="text-gray-400 text-xs">(Optional)</span>
            </label>
            <input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab509d] focus:border-transparent"
              placeholder="e.g., Tech Ventures Inc"
            />
          </div>
        </div>

        {/* Password - Optional */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password <span className="text-gray-400 text-xs">(Optional - defaults to "Evaluator@123")</span>
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab509d] focus:border-transparent"
            placeholder="Leave empty for default password"
          />
          <p className="text-xs text-gray-500 mt-1">
            If left empty, the default password "Evaluator@123" will be used
          </p>
        </div>

        {/* Info box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-blue-700">
              <p className="font-semibold mb-1">Important Notes:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>The evaluator will be created with verified status (no OTP needed)</li>
                <li>They can login immediately with the provided credentials</li>
                <li>Make sure to securely share the credentials with the evaluator</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-[#ab509d] text-white rounded-lg hover:bg-[#8d4180] transition duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Evaluator
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-200 font-semibold disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEvaluatorForm;
