/**
 * FileUpload Component
 * Compact version for the secondary sidebar
 */
import React, { useState } from 'react';
import { uploadDocument } from '../services/api';

const FileUpload = ({ tenantId, onUploadStart, onUploadSuccess, onUploadError }) => {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      setMessage('❌ Select a PDF');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessage('❌ Max 10MB');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setUploading(true);
    setMessage('');
    
    if (onUploadStart) {
      onUploadStart();
    }

    const result = await uploadDocument(tenantId, file);
    setUploading(false);

    if (result.success) {
      if (onUploadSuccess) {
        onUploadSuccess(result.data);
      }
    } else {
      setMessage('❌ Failed');
      if (onUploadError) {
        onUploadError(result.error);
      }
      setTimeout(() => setMessage(''), 5000);
    }

    e.target.value = '';
  };

  return (
    <div className="compact-upload">
      <h4 className="section-title">Add Content</h4>
      <div className="upload-box">
        <label htmlFor="file-upload" className="slack-upload-label">
          <span className="icon">➕</span>
          <span className="text">{uploading ? 'Uploading...' : 'Upload PDF'}</span>
        </label>
        <input
          id="file-upload"
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          disabled={uploading || !tenantId}
          style={{ display: 'none' }}
        />
      </div>
      {message && <div className="upload-mini-msg">{message}</div>}
      <p className="upload-hint">Upload PDFs to train your AI in this workspace.</p>
    </div>
  );
};

export default FileUpload;
