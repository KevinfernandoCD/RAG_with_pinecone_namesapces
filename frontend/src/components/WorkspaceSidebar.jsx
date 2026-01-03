/**
 * Workspace Sidebar Component
 * Manages multiple organization workspaces (Slack-style Rail)
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

  const getInitials = (id) => {
    return id.substring(0, 2).toUpperCase();
  };

  return (
    <>
      <div className="workspace-rail">
        <div className="rail-top">
          {workspaces.map((workspace) => (
            <div
              key={workspace.id}
              className={`rail-item ${activeWorkspace === workspace.id ? 'active' : ''}`}
              onClick={() => onWorkspaceChange(workspace.id)}
              title={workspace.id}
            >
              <div className="rail-icon">
                {getInitials(workspace.id)}
              </div>
              <div className="rail-active-indicator"></div>
            </div>
          ))}
        </div>

        <div className="rail-bottom">
          <button 
            className="rail-action-btn add" 
            onClick={() => setShowModal(true)}
            title="Add Workspace"
          >
            +
          </button>
        </div>
      </div>

      {/* Add Workspace Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create a Workspace</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <p className="modal-desc">Enter your organization's key to join or create a workspace.</p>
              <label htmlFor="workspace-key">Workspace Key</label>
              <input
                id="workspace-key"
                type="text"
                value={newWorkspaceKey}
                onChange={(e) => setNewWorkspaceKey(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddWorkspace()}
                placeholder="e.g., acme-inc"
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
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WorkspaceSidebar;
