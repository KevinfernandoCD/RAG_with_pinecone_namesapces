/**
 * ChatInput Component
 * Text input for sending messages to the RAG system
 */
import React, { useState } from 'react';

const ChatInput = ({ onSend, disabled }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="chat-input-form">
      <div className="chat-input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask a question about your documents..."
          disabled={disabled}
          className="chat-input"
        />
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className="send-button"
        >
          {disabled ? '⏳' : '📤'}
        </button>
      </div>
    </form>
  );
};

export default ChatInput;
