/**
 * ChatInput Component
 * Multi-line text input with Slack-style toolbar and clean border
 */
import React, { useState, useRef, useEffect } from 'react';

const ChatInput = ({ onSend, disabled }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="slack-input-wrapper">
      <div className={`slack-input-container ${disabled ? 'disabled' : ''}`}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Message #general-assistance"
          disabled={disabled}
          className="slack-textarea"
          rows={1}
        />
        <div className="slack-input-toolbar">
          <div className="toolbar-left">
            <button className="toolbar-btn" title="Formatting (Coming soon)" disabled>B</button>
            <button className="toolbar-btn" title="Formatting (Coming soon)" disabled>I</button>
            <button className="toolbar-btn" title="Links (Coming soon)" disabled>🔗</button>
          </div>
          <div className="toolbar-right">
            <button
              onClick={handleSubmit}
              disabled={disabled || !input.trim()}
              className={`slack-send-btn ${input.trim() ? 'active' : ''}`}
              title="Send now"
            >
              <span className="send-icon">➤</span>
            </button>
          </div>
        </div>
      </div>
      <div className="input-footer-hint">
        <b>Enter</b> to send, <b>Shift + Enter</b> for new line
      </div>
    </div>
  );
};

export default ChatInput;
