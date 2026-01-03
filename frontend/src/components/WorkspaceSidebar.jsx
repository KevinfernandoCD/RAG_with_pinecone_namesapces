/**
 * Workspace Sidebar Component
 * Manages multiple organization workspaces
 */
import React, { useState } from 'react';

const WorkspaceSidebar = ({ 
  workspaces, 
  activeWorkspace, 
  onWorkspaceChange, 
  onAddWorkspace, 
  onDeleteWorkspace 
}) => {
  const [showModal, setShowModal] = useState(false);
  const [newWorkspaceKey, setNewWorkspaceKey] = useState('');
  const [error, setError] = useState('');

  const handleAddWorkspace = () => {
    setError('');
    
    if (!newWorkspaceKey.trim()) {
      setError('Organization key cannot be empty');
      return;
    }

    // Check if workspace already exists
    if (workspaces.some(w => w.id === newWorkspaceKey.trim())) {
      setError('Workspace already exists');
      return;
    }

    onAddWorkspace(newWorkspaceKey.trim());
    setNewWorkspaceKey('');
    setShowModal(false);
  };

  const handleDelete = (workspaceId, e) => {
    e.stopPropagation();
    if (workspaces.length === 1) {
      alert('Cannot delete the last workspace');
      return;
    }
    if (confirm(`Delete workspace "${workspaceId}"?`)) {
      onDeleteWorkspace(workspaceId);
    }
  };

  return (
    <>
      <div className="workspace-sidebar">
        <div className="workspace-header">
          <h3>🏢 Workspaces</h3>
        </div>

        <div className="workspace-list">
          {workspaces.map((workspace) => (
            <div
              key={workspace.id}
              className={`workspace-item ${activeWorkspace === workspace.id ? 'active' : ''}`}
              onClick={() => onWorkspaceChange(workspace.id)}
            >
              <div className="workspace-info">
                <div className="workspace-icon">
                  {activeWorkspace === workspace.id ? '✓' : '○'}
                </div>
                <div className="workspace-details">
                  <div className="workspace-name">{workspace.id}</div>
                  <div className="workspace-meta">
                    {workspace.messageCount || 0} messages
                  </div>
                </div>
              </div>
              {workspaces.length > 1 && (
                <button
                  className="workspace-delete"
                  onClick={(e) => handleDelete(workspace.id, e)}
                  title="Delete workspace"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        <button className="add-workspace-btn" onClick={() => setShowModal(true)}>
          + New Workspace
        </button>
      </div>

      {/* Add Workspace Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Workspace</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <label htmlFor="workspace-key">Organization Key</label>
              <input
                id="workspace-key"
                type="text"
                value={newWorkspaceKey}
                onChange={(e) => setNewWorkspaceKey(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddWorkspace()}
                placeholder="e.g., my-organization"
                autoFocus
                className="workspace-input"
              />
              {error && <div className="error-message">{error}</div>}
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleAddWorkspace}>
                Add Workspace
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WorkspaceSidebar;
