// ============================================================================
// Geminiチャットコンポーネント
// 右側パネルでGeminiとの直接チャットを提供します
// ============================================================================

import React, { useState, useRef, useEffect } from 'react';
import './GeminiChat.css';

const GeminiChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // メッセージの最下部にスクロール
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /**
   * メッセージ送信処理
   */
  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { 
      type: 'user', 
      content: input, 
      timestamp: new Date() 
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: input }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const aiMessage = { 
        type: 'assistant', 
        content: data.reply, 
        timestamp: new Date() 
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Gemini chat error:', error);
      const errorMessage = { 
        type: 'error', 
        content: 'エラーが発生しました。もう一度お試しください。', 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Enterキーでの送信
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="gemini-chat-container">
      {/* ヘッダー */}
      <div className="gemini-header">
        <h3>Gemini Chat</h3>
        <div className="gemini-status">Ready</div>
      </div>

      {/* メッセージエリア */}
      <div className="gemini-messages">
        {messages.length === 0 && (
          <div className="welcome-msg">
            <div className="welcome-icon">🤖</div>
            <p>Hello! I'm Gemini. Ask me anything!</p>
          </div>
        )}
        
        {messages.map((message, index) => (
          <div key={index} className={`msg-wrapper msg-${message.type}`}>
            <div className="msg-bubble">
              {message.content}
            </div>
            <div className="msg-time">
              {message.timestamp.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="msg-wrapper msg-assistant">
            <div className="msg-bubble typing">
              <div className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 入力エリア */}
      <div className="gemini-input">
        <div className="input-wrapper">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading}
            rows={1}
            className="input-field"
          />
          <button 
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className="send-btn"
          >
            ▶
          </button>
        </div>
      </div>
    </div>
  );
};

export default GeminiChat;