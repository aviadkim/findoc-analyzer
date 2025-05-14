import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function UploadDialog({ isOpen, onClose }) {
  const router = useRouter();
  const [files, setFiles] = useState([]);
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileType, setFileType] = useState('financial'); // Default file type

  // Reset state when dialog is opened
  useEffect(() => {
    if (isOpen) {
      setFiles([]);
      setTitle('');
      setTags('');
      setError(null);
      setSuccess(null);
      setUploadProgress(0);
      setFileType('financial');
    }
  }, [isOpen]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files);
    }
  };

  const handleFileChange = (fileList) => {
    const newFiles = Array.from(fileList);
    const allowedExtensions = ['.pdf', '.docx', '.xlsx', '.csv', '.xls'];
    const filteredFiles = newFiles.filter(file => {
      const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      return allowedExtensions.includes(extension);
    });

    if (filteredFiles.length !== newFiles.length) {
      setError(`Some files were not added. Allowed formats: PDF, DOCX, XLSX, XLS, CSV`);
    }

    if (filteredFiles.length > 0) {
      // Check file sizes (max 10MB per file)
      const maxSize = 10 * 1024 * 1024; // 10MB
      const oversizedFiles = filteredFiles.filter(file => file.size > maxSize);

      if (oversizedFiles.length > 0) {
        setError(`Some files exceed the maximum size of 10MB: ${oversizedFiles.map(f => f.name).join(', ')}`);
        // Remove oversized files
        const validSizeFiles = filteredFiles.filter(file => file.size <= maxSize);
        if (validSizeFiles.length === 0) return;
        setFiles(validSizeFiles);
      } else {
        setFiles(filteredFiles);
      }

      // Auto-fill title from first filename (remove extension)
      const fileName = filteredFiles[0].name.replace(/\.[^/.]+$/, "");
      setTitle(fileName);

      // Clear any previous errors
      setError(null);
    }
  };

  const removeFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);

    if (newFiles.length === 0) {
      setTitle('');
    } else if (index === 0) {
      // If the first file was removed, update title based on the new first file
      const fileName = newFiles[0].name.replace(/\.[^/.]+$/, "");
      setTitle(fileName);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (files.length === 0) {
      setError("Please select at least one file to upload");
      return;
    }

    if (!title.trim() && files.length === 1) {
      setError("Please enter a document title");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    setUploadProgress(0);

    try {
      // Use the deployed API URL or fallback to localhost
      const API_URL = 'https://findoc-deploy.ey.r.appspot.com' || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:24125';
      console.log('Using API URL:', API_URL);

      // Upload each file
      const uploadResults = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', fileType);

        // Add tags if provided
        if (tags.trim()) {
          const tagsArray = tags.split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0);
          formData.append('tags', JSON.stringify(tagsArray));
        }

        // Add title for single file upload
        if (files.length === 1 && title.trim()) {
          formData.append('title', title);
        } else {
          // For multiple files, use the filename as title
          const fileTitle = file.name.replace(/\.[^/.]+$/, "");
          formData.append('title', fileTitle);
        }

        // Add file processing options based on file type
        const fileExt = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
        if (['.xlsx', '.xls', '.csv'].includes(fileExt)) {
          formData.append('processing_options', JSON.stringify({
            extract_tables: true,
            detect_headers: true,
            sheet_names: 'all',
            convert_formulas: true
          }));
        } else if (fileExt === '.pdf') {
          formData.append('processing_options', JSON.stringify({
            ocr_enabled: true,
            extract_tables: true,
            extract_text: true,
            extract_metadata: true
          }));
        }

        // Upload the file with progress tracking
        const xhr = new XMLHttpRequest();

        // Create a promise to handle the XHR request
        const uploadPromise = new Promise((resolve, reject) => {
          xhr.open('POST', `${API_URL}/api/documents/upload`);
          console.log('Uploading to:', `${API_URL}/api/documents/upload`);

          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              // Calculate overall progress based on current file and previous files
              const overallProgress = Math.round(((i + (event.loaded / event.total)) / files.length) * 100);
              setUploadProgress(overallProgress);
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const result = JSON.parse(xhr.responseText);
                resolve(result);
              } catch (e) {
                reject(new Error('Invalid response format'));
              }
            } else {
              reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
            }
          };

          xhr.onerror = () => reject(new Error('Network error during upload'));
          xhr.onabort = () => reject(new Error('Upload aborted'));

          xhr.send(formData);
        });

        try {
          const result = await uploadPromise;
          console.log('Document uploaded:', result);
          uploadResults.push(result);
        } catch (uploadError) {
          throw uploadError;
        }
      }

      // Show success message
      setSuccess(`Successfully uploaded ${files.length} file${files.length > 1 ? 's' : ''}`);

      // Clear form
      setFiles([]);
      setTitle('');
      setTags('');

      // Close dialog after a delay
      setTimeout(() => {
        onClose();
        // Optionally refresh the page or navigate
        router.push('/documents-new');
      }, 2000);

    } catch (error) {
      console.error('Error uploading document:', error);
      setError("Failed to upload document. Please try again.");
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="upload-dialog-overlay">
      <div className="upload-dialog">
        <div className="upload-dialog-header">
          <h2>Upload Document</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="upload-dialog-content">
          <form onSubmit={handleSubmit}>
            {/* File type selection */}
            <div className="form-group">
              <label className="form-label">Document Type</label>
              <div className="file-type-selector">
                <button
                  type="button"
                  className={`file-type-btn ${fileType === 'financial' ? 'active' : ''}`}
                  onClick={() => setFileType('financial')}
                >
                  <span className="file-type-icon">💰</span>
                  <span>Financial</span>
                </button>
                <button
                  type="button"
                  className={`file-type-btn ${fileType === 'report' ? 'active' : ''}`}
                  onClick={() => setFileType('report')}
                >
                  <span className="file-type-icon">📊</span>
                  <span>Report</span>
                </button>
                <button
                  type="button"
                  className={`file-type-btn ${fileType === 'contract' ? 'active' : ''}`}
                  onClick={() => setFileType('contract')}
                >
                  <span className="file-type-icon">📝</span>
                  <span>Contract</span>
                </button>
              </div>
            </div>

            {/* File upload area */}
            <div
              className={`upload-area ${dragActive ? 'drag-active' : ''} ${files.length > 0 ? 'has-file' : ''}`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
            >
              {files.length > 0 ? (
                <div className="files-list">
                  {files.map((file, index) => (
                    <div key={index} className="file-info">
                      <div className="file-icon">📄</div>
                      <div className="file-details">
                        <div className="file-name">{file.name}</div>
                        <div className="file-size">{(file.size / 1024).toFixed(1)} KB</div>
                      </div>
                      <button
                        type="button"
                        className="remove-file-btn"
                        onClick={() => removeFile(index)}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="add-more-files-btn"
                    onClick={() => document.getElementById('file-input-dialog').click()}
                  >
                    + Add More Files
                  </button>
                </div>
              ) : (
                <>
                  <div className="upload-icon">📁</div>
                  <div className="upload-text">
                    <p className="primary-text">Drag & drop your files here</p>
                    <p className="secondary-text">or</p>
                    <label className="browse-btn">
                      Browse files
                      <input
                        id="file-input-dialog"
                        type="file"
                        className="visually-hidden"
                        multiple
                        onChange={(e) => handleFileChange(e.target.files)}
                        accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.csv"
                      />
                    </label>
                  </div>
                  <p className="upload-hint">Supported: PDF, DOCX, XLS, XLSX, CSV (max 10MB)</p>
                </>
              )}
            </div>

            {/* Document info fields */}
            <div className="form-group">
              <label className="form-label" htmlFor="title-dialog">Document Title</label>
              <input
                type="text"
                id="title-dialog"
                className="form-control"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="tags-dialog">Tags (comma separated)</label>
              <input
                type="text"
                id="tags-dialog"
                className="form-control"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="financial, report, quarterly"
              />
            </div>

            {/* Progress bar */}
            {loading && (
              <div className="upload-progress">
                <div className="progress-bar">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <div className="progress-text">{uploadProgress}% Uploaded</div>
              </div>
            )}

            {/* Success message */}
            {success && (
              <div className="alert alert-success">
                {success}
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="alert alert-danger">
                {error}
              </div>
            )}

            {/* Submit button */}
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Uploading...' : 'Upload Document'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .upload-dialog-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .upload-dialog {
          background-color: white;
          border-radius: 8px;
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .upload-dialog-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          border-bottom: 1px solid #e1e5eb;
        }

        .upload-dialog-header h2 {
          margin: 0;
          font-size: 1.25rem;
          color: #2d3748;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #718096;
        }

        .upload-dialog-content {
          padding: 24px;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #4a5568;
        }

        .form-control {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          font-size: 0.9rem;
        }

        .file-type-selector {
          display: flex;
          gap: 10px;
          margin-bottom: 15px;
        }

        .file-type-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 10px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
          flex: 1;
        }

        .file-type-btn:hover {
          border-color: #4299e1;
          background-color: #f7fafc;
        }

        .file-type-btn.active {
          border-color: #4299e1;
          background-color: #ebf8ff;
        }

        .file-type-icon {
          font-size: 1.5rem;
          margin-bottom: 5px;
        }

        .upload-area {
          border: 2px dashed #cbd5e0;
          border-radius: 8px;
          padding: 24px;
          text-align: center;
          margin-bottom: 20px;
          transition: all 0.3s;
        }

        .upload-area.drag-active {
          border-color: #3498db;
          background-color: rgba(52, 152, 219, 0.05);
        }

        .upload-area.has-file {
          border-style: solid;
          border-color: #3498db;
          background-color: rgba(52, 152, 219, 0.05);
        }

        .upload-icon {
          font-size: 2.5rem;
          margin-bottom: 16px;
          color: #a0aec0;
        }

        .primary-text {
          font-size: 1.1rem;
          font-weight: 500;
          margin-bottom: 8px;
          color: #4a5568;
        }

        .secondary-text {
          margin-bottom: 8px;
          color: #718096;
        }

        .browse-btn {
          display: inline-block;
          background-color: #3498db;
          color: white;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        .browse-btn:hover {
          background-color: #2980b9;
        }

        .visually-hidden {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }

        .upload-hint {
          margin-top: 12px;
          font-size: 0.8rem;
          color: #a0aec0;
        }

        .files-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 100%;
        }

        .file-info {
          display: flex;
          align-items: center;
          padding: 8px 12px;
          background-color: white;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
        }

        .file-icon {
          font-size: 1.5rem;
          margin-right: 12px;
          color: #3498db;
        }

        .file-details {
          flex: 1;
          text-align: left;
        }

        .file-name {
          font-weight: 500;
          color: #4a5568;
          margin-bottom: 4px;
        }

        .file-size {
          font-size: 0.8rem;
          color: #718096;
        }

        .remove-file-btn {
          background: none;
          border: none;
          color: #e53e3e;
          font-size: 1.2rem;
          cursor: pointer;
        }

        .add-more-files-btn {
          padding: 8px;
          border: 1px dashed #e2e8f0;
          border-radius: 4px;
          background-color: #f7fafc;
          color: #4299e1;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .add-more-files-btn:hover {
          background-color: #ebf8ff;
          border-color: #4299e1;
        }

        .upload-progress {
          margin: 16px 0;
        }

        .progress-bar {
          height: 8px;
          background-color: #edf2f7;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 4px;
        }

        .progress-bar-fill {
          height: 100%;
          background-color: #4299e1;
          transition: width 0.3s ease;
        }

        .progress-text {
          font-size: 0.8rem;
          color: #718096;
          text-align: right;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 24px;
        }

        .btn {
          padding: 8px 16px;
          border-radius: 4px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-outline {
          background-color: white;
          border: 1px solid #cbd5e0;
          color: #4a5568;
        }

        .btn-outline:hover {
          background-color: #f7fafc;
        }

        .btn-primary {
          background-color: #3498db;
          border: 1px solid #3498db;
          color: white;
        }

        .btn-primary:hover {
          background-color: #2980b9;
        }

        .btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .alert {
          padding: 12px 16px;
          border-radius: 4px;
          margin-bottom: 16px;
        }

        .alert-success {
          background-color: #f0fff4;
          border: 1px solid #c6f6d5;
          color: #2f855a;
        }

        .alert-danger {
          background-color: #fff5f5;
          border: 1px solid #fed7d7;
          color: #e53e3e;
        }
      `}</style>
    </div>
  );
}
