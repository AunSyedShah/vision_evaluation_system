import { useFormik } from 'formik';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { addProject, updateProject, getProjectById, bulkImportProjects } from '../../utils/localStorage';

const ProjectForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [uploadMethod, setUploadMethod] = useState('manual'); // 'manual' or 'file'
  const [csvFile, setCsvFile] = useState(null);
  const isEditMode = !!id;

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      budget: '',
      client: '',
      technology: ''
    },
    validate: values => {
      const errors = {};
      if (!values.title) errors.title = 'Title is required';
      if (!values.description) errors.description = 'Description is required';
      if (!values.startDate) errors.startDate = 'Start date is required';
      if (!values.endDate) errors.endDate = 'End date is required';
      if (values.startDate && values.endDate && values.startDate > values.endDate) {
        errors.endDate = 'End date must be after start date';
      }
      return errors;
    },
    onSubmit: values => {
      if (isEditMode) {
        updateProject(id, values);
      } else {
        addProject(values);
      }
      navigate('/superadmin/projects');
    }
  });

  useEffect(() => {
    if (isEditMode) {
      const project = getProjectById(id);
      if (project) {
        formik.setValues({
          title: project.title || '',
          description: project.description || '',
          startDate: project.startDate || '',
          endDate: project.endDate || '',
          budget: project.budget || '',
          client: project.client || '',
          technology: project.technology || ''
        });
      }
    }
  }, [id, isEditMode]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setCsvFile(file);
  };

  const downloadSampleCSV = () => {
    const sampleData = `title,description,startDate,endDate,budget,client,technology
E-commerce Platform,Build a full-featured e-commerce platform,2025-01-01,2025-06-30,50000,ABC Corp,React/Node.js
Mobile App Development,Develop a cross-platform mobile application,2025-02-01,2025-08-31,75000,XYZ Inc,React Native
Data Analytics Dashboard,Create a comprehensive analytics dashboard,2025-03-01,2025-07-31,40000,Tech Solutions,Python/Django`;

    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'project_sample.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleBulkUpload = () => {
    if (!csvFile) {
      alert('Please select a CSV file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const projects = [];
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(',').map(v => v.trim());
          const project = {};
          headers.forEach((header, index) => {
            project[header] = values[index] || '';
          });
          projects.push(project);
        }
      }

      if (projects.length > 0) {
        bulkImportProjects(projects);
        alert(`Successfully imported ${projects.length} projects!`);
        navigate('/superadmin/projects');
      } else {
        alert('No valid projects found in CSV');
      }
    };
    reader.readAsText(csvFile);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isEditMode ? 'Edit Project' : 'Add New Project'}
        </h1>
        <p className="text-gray-600">
          {isEditMode ? 'Update project information' : 'Add a new project manually or upload via CSV'}
        </p>
      </div>

      {!isEditMode && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Method</h2>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setUploadMethod('manual')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition duration-150 ${
                uploadMethod === 'manual'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ✏️ Manual Entry
            </button>
            <button
              type="button"
              onClick={() => setUploadMethod('file')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition duration-150 ${
                uploadMethod === 'file'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📄 CSV/Excel Upload
            </button>
          </div>
        </div>
      )}

      {uploadMethod === 'manual' ? (
        <div className="bg-white rounded-xl shadow-md p-6">
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Project Title *
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.title}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="Enter project title"
                />
                {formik.touched.title && formik.errors.title && (
                  <div className="text-red-600 text-sm mt-1">{formik.errors.title}</div>
                )}
              </div>

              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.description}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="Enter project description"
                />
                {formik.touched.description && formik.errors.description && (
                  <div className="text-red-600 text-sm mt-1">{formik.errors.description}</div>
                )}
              </div>

              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  id="startDate"
                  name="startDate"
                  type="date"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.startDate}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
                {formik.touched.startDate && formik.errors.startDate && (
                  <div className="text-red-600 text-sm mt-1">{formik.errors.startDate}</div>
                )}
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                  End Date *
                </label>
                <input
                  id="endDate"
                  name="endDate"
                  type="date"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.endDate}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
                {formik.touched.endDate && formik.errors.endDate && (
                  <div className="text-red-600 text-sm mt-1">{formik.errors.endDate}</div>
                )}
              </div>

              <div>
                <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                  Budget
                </label>
                <input
                  id="budget"
                  name="budget"
                  type="text"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.budget}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="e.g., $50,000"
                />
              </div>

              <div>
                <label htmlFor="client" className="block text-sm font-medium text-gray-700 mb-2">
                  Client
                </label>
                <input
                  id="client"
                  name="client"
                  type="text"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.client}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="Client name"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="technology" className="block text-sm font-medium text-gray-700 mb-2">
                  Technology Stack
                </label>
                <input
                  id="technology"
                  name="technology"
                  type="text"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.technology}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="e.g., React, Node.js, MongoDB"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition duration-150"
              >
                {isEditMode ? 'Update Project' : 'Add Project'}
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
      ) : (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Bulk Upload via CSV/Excel</h3>
            <p className="text-sm text-gray-600 mb-4">
              Upload multiple projects at once using a CSV file. Download the sample format to see the required structure.
            </p>
            <button
              type="button"
              onClick={downloadSampleCSV}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition duration-150"
            >
              📥 Download Sample CSV
            </button>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="mb-4">
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition duration-150">
                  Choose CSV File
                </span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
            {csvFile && (
              <p className="text-sm text-gray-600 mb-4">
                Selected: <span className="font-medium">{csvFile.name}</span>
              </p>
            )}
            <p className="text-xs text-gray-500">CSV or Excel files only</p>
          </div>

          <div className="flex gap-4 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleBulkUpload}
              disabled={!csvFile}
              className={`px-6 py-3 font-semibold rounded-lg shadow-md transition duration-150 ${
                csvFile
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Upload Projects
            </button>
            <button
              type="button"
              onClick={() => navigate('/superadmin/projects')}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition duration-150"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectForm;
