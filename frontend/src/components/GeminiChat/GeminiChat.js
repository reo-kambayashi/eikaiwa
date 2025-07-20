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
      {/* Geminiチャットヘッダー */}
      <div className="gemini-chat-header">
        <h3 className="gemini-chat-title">Gemini Chat</h3>
        <div className="gemini-message-count">
          {messages.length} messages
        </div>
      </div>

      {/* メッセージエリア - ChatBoxと同じスタイル */}
      <div className="chat-box">
        {messages.length === 0 ? (
          <div className="no-messages">
            <p>Geminiとのチャットを開始してください</p>
            <small>Start typing a message to chat with Gemini</small>
          </div>
        ) : (
          messages.map((message, index) => (
            <div 
              key={index} 
              className={`message ${message.type === 'user' ? 'you' : message.type === 'assistant' ? 'ai-tutor' : 'error'}`}
            >
              <strong>{message.type === 'user' ? 'You' : message.type === 'assistant' ? 'Gemini' : 'Error'}: </strong>
              <span className="message-text">{message.content}</span>
              <small className="timestamp">
                {message.timestamp.toLocaleTimeString()}
              </small>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="message ai-tutor loading">
            <strong>Gemini: </strong>
            <span className="typing-indicator">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
              Typing...
            </span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 入力エリア - InputAreaと同じスタイル */}
      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Geminiにメッセージを入力してください..."
          disabled={isLoading}
          className="message-input"
        />
        <button 
          onClick={handleSendMessage}
          disabled={!input.trim() || isLoading}
          className={`send-button ${isLoading ? 'loading' : ''}`}
        >
          {isLoading ? (
            <div className="loading-spinner"></div>
          ) : (
            '送信'
          )}
        </button>
      </div>
    </div>
  );
};

export default GeminiChat;