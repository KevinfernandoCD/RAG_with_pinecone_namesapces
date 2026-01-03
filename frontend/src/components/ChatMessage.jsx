/**
 * ChatMessage Component
 * Displays individual chat messages with role-based styling
 */
import React from 'react';

const ChatMessage = ({ message }) => {
  const { role, content, sources } = message;
  const isUser = role === 'user';

  return (
    <div className={`message-wrapper ${isUser ? 'user-message-wrapper' : 'assistant-message-wrapper'}`}>
      <div className={`message ${isUser ? 'user-message' : 'assistant-message'}`}>
        <div className="message-role">{isUser ? 'You' : 'Assistant'}</div>
        <div className="message-content">{content}</div>
        
        {sources && sources.length > 0 && (
          <div className="message-sources">
            <div className="sources-header">📚 Sources:</div>
            {sources.map((source, index) => (
              <div key={index} className="source-item">
                <div className="source-text">{source.text}</div>
                <div className="source-score">Relevance: {(source.score * 100).toFixed(1)}%</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
