import { useFormik } from 'formik';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { createProject, updateProject, getProjectById } from '../../utils/api';

const ProjectForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isEditMode = !!id;

  const formik = useFormik({
    initialValues: {
      username: '',
      startupName: '',
      founderName: '',
      email: '',
      phone: '',
      websiteLink: '',
      mobileAppLink: '',
      startupDescription: '',
      startupStatus: '',
      spotlightReason: '',
      // Files
      startupLogo: null,
      founderPhoto: null,
      defaultVideo: null,
      pitchVideo: null,
      image1: null,
      image2: null,
      image3: null
    },
    validate: values => {
      const errors = {};
      if (!values.startupName) errors.startupName = 'Startup name is required';
      if (!values.founderName) errors.founderName = 'Founder name is required';
      if (!values.email) {
        errors.email = 'Email is required';
      } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
        errors.email = 'Invalid email address';
      }
      if (!values.startupDescription) errors.startupDescription = 'Description is required';
      return errors;
    },
    onSubmit: async (values) => {
      await handleSubmit(values);
    }
  });

  useEffect(() => {
    if (isEditMode) {
      loadProject();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditMode]);

  const loadProject = async () => {
    try {
      setLoading(true);
      const project = await getProjectById(parseInt(id));
      if (project) {
        formik.setValues({
          username: project.username || '',
          startupName: project.startupName || '',
          founderName: project.founderName || '',
          email: project.email || '',
          phone: project.phone || '',
          websiteLink: project.websiteLink || '',
          mobileAppLink: project.mobileAppLink || '',
          startupDescription: project.startupDescription || '',
          startupStatus: project.startupStatus || '',
          spotlightReason: project.spotlightReason || '',
          startupLogo: null,
          founderPhoto: null,
          defaultVideo: null,
          pitchVideo: null,
          image1: null,
          image2: null,
          image3: null
        });
      }
    } catch (err) {
      console.error('Failed to load project:', err);
      setError('Failed to load project details.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (fieldName, file) => {
    if (file) {
      formik.setFieldValue(fieldName, file);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      setError('');
      
      // Create FormData for multipart upload
      const formData = new FormData();
      
      // Append required fields (always send, even if empty)
      formData.append('StartupName', values.startupName || '');
      formData.append('FounderName', values.founderName || '');
      formData.append('Email', values.email || '');
      formData.append('StartupDescription', values.startupDescription || '');
      
      // Append optional fields (only if not empty)
      if (values.username) formData.append('Username', values.username);
      if (values.phone) formData.append('Phone', values.phone);
      if (values.websiteLink) formData.append('WebsiteLink', values.websiteLink);
      if (values.mobileAppLink) formData.append('MobileAppLink', values.mobileAppLink);
      if (values.startupStatus) formData.append('StartupStatus', values.startupStatus);
      if (values.spotlightReason) formData.append('SpotlightReason', values.spotlightReason);
      
      // Debug: Log FormData contents
      console.log('FormData being sent:');
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + (pair[1] instanceof File ? pair[1].name : pair[1]));
      }
      
      // Append files if they exist
      if (values.startupLogo) formData.append('StartupLogo', values.startupLogo);
      if (values.founderPhoto) formData.append('FounderPhoto', values.founderPhoto);
      if (values.defaultVideo) formData.append('DefaultVideo', values.defaultVideo);
      if (values.pitchVideo) formData.append('PitchVideo', values.pitchVideo);
      if (values.image1) formData.append('Image1', values.image1);
      if (values.image2) formData.append('Image2', values.image2);
      if (values.image3) formData.append('Image3', values.image3);
      
      if (isEditMode) {
        await updateProject(parseInt(id), formData);
      } else {
        await createProject(formData);
      }
      
      navigate('/superadmin/projects');
    } catch (err) {
      console.error('Failed to save project:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      // Display detailed error message
      let errorMessage = 'Failed to save project. Please try again.';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.errors) {
        // Handle validation errors
        const validationErrors = Object.entries(err.response.data.errors)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join('; ');
        errorMessage = `Validation errors: ${validationErrors}`;
      } else if (err.response?.data) {
        errorMessage = JSON.stringify(err.response.data);
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ab509d] mx-auto"></div>
          <p className="mt-4 text-gray-600">{isEditMode ? 'Loading project...' : 'Saving project...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <Link to="/superadmin/projects" className="text-[#ab509d] hover:text-[#964a8a] mb-4 inline-block">
          ← Back to Projects
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isEditMode ? 'Edit Project' : 'Add New Project'}
        </h1>
        <p className="text-gray-600">
          {isEditMode ? 'Update project information' : 'Fill in the project details below'}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <p className="font-semibold">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md p-6">
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.username}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab509d] focus:border-transparent outline-none"
                placeholder="Enter username"
              />
            </div>

            {/* Startup Name */}
            <div>
              <label htmlFor="startupName" className="block text-sm font-medium text-gray-700 mb-2">
                Startup Name *
              </label>
              <input
                id="startupName"
                name="startupName"
                type="text"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.startupName}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab509d] focus:border-transparent outline-none"
                placeholder="Enter startup name"
              />
              {formik.touched.startupName && formik.errors.startupName && (
                <div className="text-red-600 text-sm mt-1">{formik.errors.startupName}</div>
              )}
            </div>

            {/* Founder Name */}
            <div>
              <label htmlFor="founderName" className="block text-sm font-medium text-gray-700 mb-2">
                Founder Name *
              </label>
              <input
                id="founderName"
                name="founderName"
                type="text"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.founderName}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab509d] focus:border-transparent outline-none"
                placeholder="Enter founder name"
              />
              {formik.touched.founderName && formik.errors.founderName && (
                <div className="text-red-600 text-sm mt-1">{formik.errors.founderName}</div>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab509d] focus:border-transparent outline-none"
                placeholder="Enter email"
              />
              {formik.touched.email && formik.errors.email && (
                <div className="text-red-600 text-sm mt-1">{formik.errors.email}</div>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.phone}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab509d] focus:border-transparent outline-none"
                placeholder="Enter phone number"
              />
            </div>

            {/* Website Link */}
            <div>
              <label htmlFor="websiteLink" className="block text-sm font-medium text-gray-700 mb-2">
                Website Link
              </label>
              <input
                id="websiteLink"
                name="websiteLink"
                type="url"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.websiteLink}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab509d] focus:border-transparent outline-none"
                placeholder="https://example.com"
              />
            </div>

            {/* Mobile App Link */}
            <div>
              <label htmlFor="mobileAppLink" className="block text-sm font-medium text-gray-700 mb-2">
                Mobile App Link
              </label>
              <input
                id="mobileAppLink"
                name="mobileAppLink"
                type="url"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.mobileAppLink}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab509d] focus:border-transparent outline-none"
                placeholder="https://app.example.com"
              />
            </div>

            {/* Startup Status */}
            <div>
              <label htmlFor="startupStatus" className="block text-sm font-medium text-gray-700 mb-2">
                Startup Status
              </label>
              <select
                id="startupStatus"
                name="startupStatus"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.startupStatus}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab509d] focus:border-transparent outline-none"
              >
                <option value="">Select status</option>
                <option value="Active">Idea Stage</option>
                <option value="Inactive">Early Stage</option>
                <option value="Pending">Established</option>
                <option value="Completed">Growth Stage</option>
              </select>
            </div>

            {/* Startup Description */}
            <div className="md:col-span-2">
              <label htmlFor="startupDescription" className="block text-sm font-medium text-gray-700 mb-2">
                Startup Description *
              </label>
              <textarea
                id="startupDescription"
                name="startupDescription"
                rows="4"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.startupDescription}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab509d] focus:border-transparent outline-none"
                placeholder="Describe the startup..."
              />
              {formik.touched.startupDescription && formik.errors.startupDescription && (
                <div className="text-red-600 text-sm mt-1">{formik.errors.startupDescription}</div>
              )}
            </div>

            {/* Spotlight Reason */}
            <div className="md:col-span-2">
              <label htmlFor="spotlightReason" className="block text-sm font-medium text-gray-700 mb-2">
                Spotlight Reason
              </label>
              <textarea
                id="spotlightReason"
                name="spotlightReason"
                rows="3"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.spotlightReason}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab509d] focus:border-transparent outline-none"
                placeholder="Why should this startup be in the spotlight?"
              />
            </div>
          </div>

            {/* File Uploads */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Media Files (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="startupLogo" className="block text-sm font-medium text-gray-700 mb-2">
                    Startup Logo
                  </label>
                  <input
                    id="startupLogo"
                    name="startupLogo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('startupLogo', e.target.files[0])}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab509d] focus:border-transparent outline-none"
                  />
                  {formik.values.startupLogo && (
                    <p className="text-sm text-gray-600 mt-1">Selected: {formik.values.startupLogo.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="founderPhoto" className="block text-sm font-medium text-gray-700 mb-2">
                    Founder Photo
                  </label>
                  <input
                    id="founderPhoto"
                    name="founderPhoto"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('founderPhoto', e.target.files[0])}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab509d] focus:border-transparent outline-none"
                  />
                  {formik.values.founderPhoto && (
                    <p className="text-sm text-gray-600 mt-1">Selected: {formik.values.founderPhoto.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="defaultVideo" className="block text-sm font-medium text-gray-700 mb-2">
                    Default Video
                  </label>
                  <input
                    id="defaultVideo"
                    name="defaultVideo"
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileChange('defaultVideo', e.target.files[0])}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab509d] focus:border-transparent outline-none"
                  />
                  {formik.values.defaultVideo && (
                    <p className="text-sm text-gray-600 mt-1">Selected: {formik.values.defaultVideo.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="pitchVideo" className="block text-sm font-medium text-gray-700 mb-2">
                    Pitch Video
                  </label>
                  <input
                    id="pitchVideo"
                    name="pitchVideo"
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileChange('pitchVideo', e.target.files[0])}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab509d] focus:border-transparent outline-none"
                  />
                  {formik.values.pitchVideo && (
                    <p className="text-sm text-gray-600 mt-1">Selected: {formik.values.pitchVideo.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="image1" className="block text-sm font-medium text-gray-700 mb-2">
                    Image 1
                  </label>
                  <input
                    id="image1"
                    name="image1"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('image1', e.target.files[0])}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab509d] focus:border-transparent outline-none"
                  />
                  {formik.values.image1 && (
                    <p className="text-sm text-gray-600 mt-1">Selected: {formik.values.image1.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="image2" className="block text-sm font-medium text-gray-700 mb-2">
                    Image 2
                  </label>
                  <input
                    id="image2"
                    name="image2"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('image2', e.target.files[0])}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab509d] focus:border-transparent outline-none"
                  />
                  {formik.values.image2 && (
                    <p className="text-sm text-gray-600 mt-1">Selected: {formik.values.image2.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="image3" className="block text-sm font-medium text-gray-700 mb-2">
                    Image 3
                  </label>
                  <input
                    id="image3"
                    name="image3"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('image3', e.target.files[0])}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab509d] focus:border-transparent outline-none"
                  />
                  {formik.values.image3 && (
                    <p className="text-sm text-gray-600 mt-1">Selected: {formik.values.image3.name}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-[#ab509d] hover:bg-[#964a8a] text-white text-sm sm:text-base font-semibold rounded-lg shadow-md transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : isEditMode ? 'Update Project' : 'Add Project'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/superadmin/projects')}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition duration-150"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
    </div>
  );
};

export default ProjectForm;
