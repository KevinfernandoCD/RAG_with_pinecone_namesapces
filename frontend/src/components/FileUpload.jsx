/**
 * FileUpload Component
 * Handles PDF file upload to the backend
 */
import React, { useState } from 'react';
import { uploadDocument } from '../services/api';

const FileUpload = ({ tenantId, onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      setMessage('❌ Please select a PDF file');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setMessage('❌ File size must be less than 10MB');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (!tenantId) {
      setMessage('❌ No workspace selected');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setUploading(true);
    setMessage('📤 Uploading...');

    const result = await uploadDocument(tenantId, file);

    if (result.success) {
      const data = result.data;
      setMessage(`✅ Uploaded ${data.files_processed} file(s) - ${data.total_chunks} chunks created!`);
      if (onUploadSuccess) {
        onUploadSuccess(result.data);
      }
    } else {
      setMessage(`❌ ${result.error}`);
    }

    setUploading(false);
    e.target.value = ''; // Reset input

    // Clear message after 5 seconds
    setTimeout(() => setMessage(''), 5000);
  };

  return (
    <div className="file-upload-container">
      <div className="file-upload-header">
        <h3>📄 Upload Documents</h3>
        <p>Upload PDF files to add them to your knowledge base</p>
      </div>
      
      <div className="file-upload-input-wrapper">
        <label htmlFor="file-upload" className="file-upload-label">
          {uploading ? '⏳ Uploading...' : '📁 Choose PDF File'}
        </label>
        <input
          id="file-upload"
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          disabled={uploading || !tenantId}
          className="file-upload-input"
        />
      </div>

      {message && (
        <div className={`upload-message ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
