/**
 * ChatMessage Component
 * Displays individual chat messages in a clean Slack-style row
 */
import React from 'react';

const ChatMessage = ({ message }) => {
  const { role, content, sources } = message;
  const isAssistant = role === 'assistant';

  return (
    <div className={`slack-message-row ${isAssistant ? 'assistant' : 'user'}`}>
      <div className="slack-avatar">
        {isAssistant ? '🤖' : '🧑‍💻'}
      </div>
      <div className="slack-message-content">
        <div className="slack-message-header">
          <span className="slack-author">{isAssistant ? 'RAG Assistant' : 'You'}</span>
          <span className="slack-time">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div className="slack-text">{content}</div>
        
        {sources && sources.length > 0 && (
          <div className="slack-sources">
            <div className="sources-label">Sources from knowledge base:</div>
            <div className="sources-list">
              {sources.map((source, index) => (
                <div key={index} className="slack-source-item" title={source.text}>
                  <span className="source-icon">📄</span>
                  <span className="source-name">
                    {source.metadata?.filename || `Source ${index + 1}`}
                  </span>
                  <span className="source-meta">
                    {(source.score * 100).toFixed(0)}% match
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
