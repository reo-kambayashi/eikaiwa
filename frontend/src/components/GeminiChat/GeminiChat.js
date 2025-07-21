// ============================================================================
// Geminiチャットコンポーネント - 表現相談・辞書機能
// 英語表現や文法について日本語で相談できるチャット機能を提供します
// ============================================================================

import React, { useState, useRef, useEffect } from 'react';
import MarkdownRenderer from '../MarkdownRenderer';
import './GeminiChat.css';

const GeminiChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // 初期メッセージを表示
  useEffect(() => {
    setMessages([{
      type: 'assistant',
      content: 'こんにちは！英語表現や文法について簡潔にお答えします。\n\n例：「〇〇って英語でどう言うの？」',
      timestamp: new Date()
    }]);
  }, []);

  // メッセージの最下部にスクロール
  const scrollToBottom = () => {
    // DOMの更新を待ってからスクロールを実行
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest'
      });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /**
   * メッセージ送信処理 - 日本語相談用APIを使用
   */
  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { 
      type: 'user', 
      content: input, 
      timestamp: new Date() 
    };
    
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      // 会話履歴を準備（最新10件のみ）
      const conversationHistory = messages.slice(-10).map(msg => ({
        sender: msg.type === 'user' ? 'User' : 'Assistant',
        text: msg.content
      }));

      // 日本語相談用APIエンドポイントを使用
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/japanese-consultation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: currentInput,
          conversation_history: conversationHistory
        }),
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
      console.error('Japanese consultation error:', error);
      const errorMessage = { 
        type: 'error', 
        content: '申し訳ありませんが、エラーが発生しました。もう一度お試しください。', 
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
      {/* 相談チャットヘッダー */}
      <div className="gemini-chat-header">
        <h3 className="gemini-chat-title">英語表現相談</h3>
        <div className="gemini-message-count">
          {messages.filter(msg => msg.type === 'user').length} 回の相談 {/* ユーザーメッセージのみをカウント */}
        </div>
      </div>

      {/* メッセージエリア - ChatBoxと同じスタイル */}
      <div className="chat-box">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`message ${message.type === 'user' ? 'you' : message.type === 'assistant' ? 'ai-tutor' : 'error'}`}
          >
            <div className="message-text">
              <MarkdownRenderer 
                content={message.content}
                className="gemini-message-markdown"
              />
            </div>
            <small className="timestamp">
              {message.timestamp.toLocaleTimeString()}
            </small>
          </div>
        ))}
        
        {isLoading && (
          <div className="message ai-tutor loading">
            <span className="typing-indicator">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
              考え中...
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
          placeholder="英語表現や文法について質問してください（日本語でOK）..."
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
            '相談'
          )}
        </button>
      </div>
    </div>
  );
};

export default GeminiChat;