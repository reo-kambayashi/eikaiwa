// ============================================================================
// チャットボックスコンポーネント
// メッセージ履歴を表示するUIコンポーネントです
// ============================================================================

import React from 'react';

/**
 * チャット表示エリアコンポーネント
 * @param {Object} props - コンポーネントプロパティ
 * @param {Array} props.messages - メッセージ履歴配列
 * @param {boolean} props.isLoading - ローディング状態
 * @param {Object} props.messagesEndRef - 自動スクロール用参照
 */
const ChatBox = ({ messages, isLoading, messagesEndRef }) => {
  return (
    <div className="chat-box">
      {/* メッセージ履歴の表示 */}
      {messages.map((message, index) => (
        <div 
          key={index} 
          className={`message ${message.sender.toLowerCase().replace(' ', '-')} ${message.isError ? 'error' : ''}`}
        >
          <strong>{message.sender}: </strong>
          <span className="message-text">{message.text}</span>
          {message.timestamp && (
            <small className="timestamp">
              {new Date(message.timestamp).toLocaleTimeString()}
            </small>
          )}
        </div>
      ))}
      
      {/* ローディング表示 */}
      {isLoading && (
        <div className="message ai-tutor loading">
          <strong>AI Tutor: </strong>
          <span className="typing-indicator">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
            Typing...
          </span>
        </div>
      )}
      
      {/* 自動スクロール用の要素 */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatBox;
