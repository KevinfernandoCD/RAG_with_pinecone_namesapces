/**
 * Chat Page with Multi-Workspace Support
 * Main chat interface with Slack-style triple-column layout
 */
import React, { useState, useEffect, useRef } from 'react';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import FileUpload from '../components/FileUpload';
import WorkspaceSidebar from '../components/WorkspaceSidebar';
import { 
  sendQuery, 
  getTenantStats, 
  getTenantDocuments, 
  deleteTenantDocument 
} from '../services/api';

const Chat = () => {
  // Workspace state
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  
  // Chat state
  const [messages, setMessages] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [stats, setStats] = useState({});
  const [documents, setDocuments] = useState({});
  
  const messagesEndRef = useRef(null);

  // Initialize workspaces from localStorage
  useEffect(() => {
    const savedWorkspaces = localStorage.getItem('workspaces');
    const savedActive = localStorage.getItem('activeWorkspace');
    const savedMessages = localStorage.getItem('chatHistory');

    if (savedWorkspaces) {
      const parsedWorkspaces = JSON.parse(savedWorkspaces);
      setWorkspaces(parsedWorkspaces);
      
      if (savedActive && parsedWorkspaces.some(w => w.id === savedActive)) {
        setActiveWorkspace(savedActive);
      } else if (parsedWorkspaces.length > 0) {
        setActiveWorkspace(parsedWorkspaces[0].id);
      }
    } else {
      // Create default workspace
      const defaultWorkspace = {
        id: 'default-org',
        createdAt: new Date().toISOString()
      };
      setWorkspaces([defaultWorkspace]);
      setActiveWorkspace('default-org');
      localStorage.setItem('workspaces', JSON.stringify([defaultWorkspace]));
      localStorage.setItem('activeWorkspace', 'default-org');
    }

    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, []);

  // Load stats and documents when active workspace changes
  useEffect(() => {
    if (activeWorkspace) {
      loadStats(activeWorkspace);
      loadDocuments(activeWorkspace);
      
      // Add welcome message if no messages exist
      if (!messages[activeWorkspace] || messages[activeWorkspace].length === 0) {
        const welcomeMessage = {
          role: 'assistant',
          content: `👋 Welcome to the **#${activeWorkspace}** workspace! \n\nI can help you analyze your documents. To get started, upload a PDF in the sidebar on the left.`,
        };
        updateMessages(activeWorkspace, [welcomeMessage]);
      }
    }
  }, [activeWorkspace]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages, activeWorkspace]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadStats = async (workspaceId) => {
    const result = await getTenantStats(workspaceId);
    if (result.success) {
      setStats(prev => ({ ...prev, [workspaceId]: result.data }));
    }
  };

  const loadDocuments = async (workspaceId) => {
    const result = await getTenantDocuments(workspaceId);
    if (result.success) {
      setDocuments(prev => ({ ...prev, [workspaceId]: result.data.documents }));
    }
  };

  const handleDeleteDocument = async (filename) => {
    if (!activeWorkspace || !window.confirm(`Delete "${filename}" from knowledge base?`)) return;
    
    const result = await deleteTenantDocument(activeWorkspace, filename);
    if (result.success) {
      loadStats(activeWorkspace);
      loadDocuments(activeWorkspace);
    } else {
      alert(`Failed to delete document: ${result.error}`);
    }
  };

  const updateMessages = (workspaceId, newMessages) => {
    setMessages(prev => {
      const updated = { ...prev, [workspaceId]: newMessages };
      localStorage.setItem('chatHistory', JSON.stringify(updated));
      return updated;
    });
  };

  const handleAddWorkspace = (workspaceKey) => {
    const newWorkspace = {
      id: workspaceKey,
      createdAt: new Date().toISOString()
    };
    
    const updatedWorkspaces = [...workspaces, newWorkspace];
    setWorkspaces(updatedWorkspaces);
    setActiveWorkspace(workspaceKey);
    
    localStorage.setItem('workspaces', JSON.stringify(updatedWorkspaces));
    localStorage.setItem('activeWorkspace', workspaceKey);
  };

  const handleDeleteWorkspace = (workspaceId) => {
    const updatedWorkspaces = workspaces.filter(w => w.id !== workspaceId);
    setWorkspaces(updatedWorkspaces);
    
    // Remove messages for deleted workspace
    const updatedMessages = { ...messages };
    delete updatedMessages[workspaceId];
    setMessages(updatedMessages);
    localStorage.setItem('chatHistory', JSON.stringify(updatedMessages));
    
    // Switch to another workspace if deleting active one
    if (activeWorkspace === workspaceId && updatedWorkspaces.length > 0) {
      setActiveWorkspace(updatedWorkspaces[0].id);
      localStorage.setItem('activeWorkspace', updatedWorkspaces[0].id);
    }
    
    localStorage.setItem('workspaces', JSON.stringify(updatedWorkspaces));
  };

  const handleWorkspaceChange = (workspaceId) => {
    setActiveWorkspace(workspaceId);
    localStorage.setItem('activeWorkspace', workspaceId);
  };

  const handleSendMessage = async (question) => {
    if (!activeWorkspace) return;

    const currentMessages = messages[activeWorkspace] || [];
    
    // Add user message
    const userMessage = { role: 'user', content: question };
    updateMessages(activeWorkspace, [...currentMessages, userMessage]);

    setLoading(true);

    // Send query to backend with active workspace tenant ID and top_k=10
    const result = await sendQuery(activeWorkspace, question, 10);

    if (result.success) {
      const assistantMessage = {
        role: 'assistant',
        content: result.data.answer,
        sources: result.data.sources,
      };
      updateMessages(activeWorkspace, [...currentMessages, userMessage, assistantMessage]);
    } else {
      const errorMessage = {
        role: 'assistant',
        content: `❌ Error: ${result.error}`,
      };
      updateMessages(activeWorkspace, [...currentMessages, userMessage, errorMessage]);
    }

    setLoading(false);
  };

  const handleUploadStart = () => {
    setUploading(true);
  };

  const handleUploadSuccess = (data) => {
    if (!activeWorkspace) return;
    
    setUploading(false);
    loadStats(activeWorkspace);
    loadDocuments(activeWorkspace);
    
    const currentMessages = messages[activeWorkspace] || [];
    const successMessage = {
      role: 'assistant',
      content: `✅ Successfully uploaded **${data.files_processed}** file(s). I've indexed **${data.total_chunks}** chunks in your knowledge base.`,
    };
    updateMessages(activeWorkspace, [...currentMessages, successMessage]);
  };

  const handleUploadError = (error) => {
    setUploading(false);
    const currentMessages = messages[activeWorkspace] || [];
    const errorMessage = {
      role: 'assistant',
      content: `❌ Upload failed: ${error}`,
    };
    updateMessages(activeWorkspace, [...currentMessages, errorMessage]);
  };

  const currentMessages = activeWorkspace ? (messages[activeWorkspace] || []) : [];
  const currentStats = activeWorkspace ? stats[activeWorkspace] : null;
  const currentDocuments = activeWorkspace ? (documents[activeWorkspace] || []) : [];

  return (
    <div className="layout-root">
      {/* Column 1: Workspace Rail */}
      <WorkspaceSidebar
        workspaces={workspaces}
        activeWorkspace={activeWorkspace}
        onWorkspaceChange={handleWorkspaceChange}
        onAddWorkspace={handleAddWorkspace}
        onDeleteWorkspace={handleDeleteWorkspace}
      />

      {/* Main Content Area (Column 2 + 3) */}
      <div className="main-content-area">
        
        {/* Column 2: Secondary Sidebar (Context/Docs) */}
        <div className="secondary-sidebar">
          <div className="sidebar-header">
            <h2>{activeWorkspace}</h2>
          </div>
          
          <div className="sidebar-section">
            <h4 className="section-title">Knowledge Base</h4>
            {currentStats && (
              <div className="kb-stats">
                <div className="stat-item">
                  <span className="stat-label">Documents</span>
                  <span className="stat-value">{currentStats.document_count || 0}</span>
                </div>
              </div>
            )}
          </div>

          <div className="sidebar-divider"></div>

          <div className="sidebar-section scrollable">
            <h4 className="section-title">Manage Files</h4>
            <div className="doc-list">
              {currentDocuments.length === 0 ? (
                <div className="no-docs-hint">No documents uploaded yet.</div>
              ) : (
                currentDocuments.map((doc, idx) => (
                  <div key={idx} className="doc-list-item">
                    <span className="doc-name" title={doc}>📄 {doc}</span>
                    <button 
                      className="doc-delete-btn" 
                      onClick={() => handleDeleteDocument(doc)}
                      title="Delete document"
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="sidebar-divider"></div>

          <div className="sidebar-section">
            <FileUpload 
              tenantId={activeWorkspace}
              onUploadStart={handleUploadStart}
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
            />
          </div>

          <div className="sidebar-footer">
             <button 
                className="btn-danger-text" 
                onClick={() => handleDeleteWorkspace(activeWorkspace)}
              >
                Delete Workspace
             </button>
          </div>
        </div>

        {/* Column 3: Main Chat View */}
        <div className="chat-view">
          <div className="chat-view-header">
            <div className="header-channel-info">
              <span className="hash">#</span>
              <span className="channel-name">general-assistance</span>
            </div>
            <div className="header-actions">
               {/* Add more actions here if needed */}
            </div>
          </div>

          <div className="messages-scroll-area">
            <div className="messages-list">
              {currentMessages.map((message, index) => (
                <ChatMessage key={index} message={message} />
              ))}
              {loading && (
                <div className="chat-loading-row">
                   <div className="typing-indicator-slack">
                      <span></span><span></span><span></span>
                   </div>
                   <span className="loading-text">Assistant is thinking...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="chat-input-row">
            <ChatInput onSend={handleSendMessage} disabled={loading || !activeWorkspace} />
          </div>
        </div>
      </div>

      {/* Uploading Overlay */}
      {uploading && (
        <div className="slack-overlay">
          <div className="slack-popup">
            <div className="slack-spinner"></div>
            <h3>Processing Documents</h3>
            <p>Indexing your data for the <strong>#{activeWorkspace}</strong> workspace...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
