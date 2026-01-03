/**
 * API Service for Multi-Tenant RAG Application
 * Handles all backend communication with tenant-specific headers
 */
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Validate tenant ID by checking stats endpoint
 */
export const validateTenant = async (tenantId) => {
  try {
    const response = await apiClient.get('/tenant/stats', {
      headers: { 'X-Tenant-ID': tenantId },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || 'Invalid organization key',
    };
  }
};

/**
 * Upload PDF documents
 */
export const uploadDocument = async (tenantId, files) => {
  try {
    const formData = new FormData();
    
    // Add files to FormData
    if (Array.isArray(files)) {
      files.forEach(file => {
        formData.append('files', file);
      });
    } else {
      formData.append('files', files);
    }
    
    const response = await apiClient.post('/upload-files', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'X-Tenant-ID': tenantId
      },
    });
    
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || 'Failed to upload document',
    };
  }
};

/**
 * Send a query to the RAG system
 */
export const sendQuery = async (tenantId, question, topK = 5) => {
  try {
    const response = await apiClient.post('/query', 
      { question, top_k: topK },
      { headers: { 'X-Tenant-ID': tenantId } }
    );
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || 'Failed to process query',
    };
  }
};

/**
 * Get tenant statistics
 */
export const getTenantStats = async (tenantId) => {
  try {
    const response = await apiClient.get('/tenant/stats', {
      headers: { 'X-Tenant-ID': tenantId }
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || 'Failed to get statistics',
    };
  }
};

/**
 * Get all document names for a tenant
 */
export const getTenantDocuments = async (tenantId) => {
  try {
    const response = await apiClient.get('/tenant/documents', {
      headers: { 'X-Tenant-ID': tenantId }
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || 'Failed to get documents',
    };
  }
};

/**
 * Delete a document by filename
 */
export const deleteTenantDocument = async (tenantId, filename) => {
  try {
    const response = await apiClient.delete(`/tenant/documents/${encodeURIComponent(filename)}`, {
      headers: { 'X-Tenant-ID': tenantId }
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || 'Failed to delete document',
    };
  }
};

/**
 * Health check
 */
export const healthCheck = async () => {
  try {
    const response = await apiClient.get('/health');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: 'API is unavailable' };
  }
};

export default apiClient;
