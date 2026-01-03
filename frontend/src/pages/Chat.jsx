/**
 * Chat Page with Multi-Workspace Support
 * Main chat interface with workspace management
 */
import React, { useState, useEffect, useRef } from 'react';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import FileUpload from '../components/FileUpload';
import WorkspaceSidebar from '../components/WorkspaceSidebar';
import { sendQuery, getTenantStats } from '../services/api';

const Chat = () => {
  // Workspace state
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  
  // Chat state
  const [messages, setMessages] = useState({});
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({});
  
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

  // Load stats when active workspace changes
  useEffect(() => {
    if (activeWorkspace) {
      loadStats(activeWorkspace);
      
      // Add welcome message if no messages exist
      if (!messages[activeWorkspace] || messages[activeWorkspace].length === 0) {
        const welcomeMessage = {
          role: 'assistant',
          content: `👋 Welcome to ${activeWorkspace}! Upload documents to get started, or ask me questions about your knowledge base.`,
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

    // Send query to backend with active workspace tenant ID
    const result = await sendQuery(activeWorkspace, question);

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

  const handleUploadSuccess = () => {
    if (!activeWorkspace) return;
    
    loadStats(activeWorkspace);
    const currentMessages = messages[activeWorkspace] || [];
    const successMessage = {
      role: 'assistant',
      content: '✅ Documents uploaded successfully! You can now ask questions about them.',
    };
    updateMessages(activeWorkspace, [...currentMessages, successMessage]);
  };

  const currentMessages = activeWorkspace ? (messages[activeWorkspace] || []) : [];
  const currentStats = activeWorkspace ? stats[activeWorkspace] : null;

  // Update workspace message counts
  const workspacesWithCounts = workspaces.map(w => ({
    ...w,
    messageCount: messages[w.id]?.length || 0
  }));

  return (
    <div className="chat-container">
      {/* Workspace Sidebar */}
      <WorkspaceSidebar
        workspaces={workspacesWithCounts}
        activeWorkspace={activeWorkspace}
        onWorkspaceChange={handleWorkspaceChange}
        onAddWorkspace={handleAddWorkspace}
        onDeleteWorkspace={handleDeleteWorkspace}
      />

      {/* Main Chat Area */}
      <div className="chat-main-wrapper">
        {/* Header */}
        <div className="chat-header">
          <div className="header-left">
            <h1>🤖 RAG Assistant</h1>
            <div className="tenant-info">
              <span className="tenant-label">Workspace:</span>
              <span className="tenant-id">{activeWorkspace}</span>
            </div>
          </div>
          <div className="header-right">
            {currentStats && (
              <div className="stats-badge">
                📚 {currentStats.document_count} documents
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="chat-main">
          {/* File Upload Sidebar */}
          <div className="chat-sidebar">
            <FileUpload 
              tenantId={activeWorkspace}
              onUploadSuccess={handleUploadSuccess} 
            />
          </div>

          {/* Chat Area */}
          <div className="chat-area">
            <div className="messages-container">
              {currentMessages.map((message, index) => (
                <ChatMessage key={index} message={message} />
              ))}
              {loading && (
                <div className="loading-indicator">
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-wrapper">
              <ChatInput onSend={handleSendMessage} disabled={loading || !activeWorkspace} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
