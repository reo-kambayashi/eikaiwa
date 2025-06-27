// ============================================================================
// チャットボックスコンポーネント
// メッセージ履歴を表示するUIコンポーネントです
// ============================================================================

import React, { memo } from 'react';
import PropTypes from 'prop-types';
import './ChatBox.css';

/**
 * チャット表示エリアコンポーネント
 * @param {Object} props - コンポーネントプロパティ
 * @param {Array} props.messages - メッセージ履歴配列
 * @param {boolean} props.isLoading - ローディング状態
 * @param {Object} props.messagesEndRef - 自動スクロール用参照
 */
const ChatBox = ({ messages, isLoading, messagesEndRef }) => {

  /**
   * メッセージ送信者のアバターを取得
   */
  const getSenderAvatar = (sender) => {
    switch (sender.toLowerCase()) {
      case 'you':
        return '';
      case 'ai tutor':
        return '';
      default:
        return '';
    }
  };

  /**
   * メッセージ送信者の表示名を取得
   */
  const getSenderDisplayName = (sender) => {
    switch (sender.toLowerCase()) {
      case 'you':
        return 'You';
      case 'ai tutor':
        return 'AI Tutor';
      default:
        return sender;
    }
  };

  return (
    <div className="enhanced-chat-box">
      {/* チャットヘッダー */}
      <div className="chat-header">
        <h3 className="chat-title">English Conversation</h3>
        <div className="message-count">
          {messages.length} Messages
        </div>
      </div>

      {/* メッセージエリア */}
      <div className="messages-area">
        {messages.length === 0 ? (
          <div className="welcome-message">
            <div className="welcome-icon"></div>
            <h4>Let's start English conversation practice!</h4>
            <p>Type a message to start the conversation</p>
            <small>Start typing a message to begin your English conversation practice</small>
          </div>
        ) : (
          messages.map((message, index) => (
            <div 
              key={`${message.timestamp}-${index}`} 
              className={`enhanced-message ${message.sender.toLowerCase().replace(' ', '-')} ${message.isError ? 'error' : ''}`}
            >
              <div className="message-avatar">
                {getSenderAvatar(message.sender)}
              </div>
              <div className="message-content">
                <div className="message-header">
                  <span className="sender-name">
                    {getSenderDisplayName(message.sender)}
                  </span>
                  {message.timestamp && (
                    <span className="message-time">
                      {new Date(message.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  )}
                </div>
                <div className="message-text">
                  {(() => {
                    // 安全なテキスト表示のための処理
                    if (typeof message.text === 'string') {
                      return message.text;
                    } else if (typeof message.text === 'object' && message.text !== null) {
                      if (message.text.reply && typeof message.text.reply === 'string') {
                        return message.text.reply;
                      }
                      return JSON.stringify(message.text);
                    } else {
                      return String(message.text || 'No message content');
                    }
                  })()}
                </div>
              </div>
            </div>
          ))
        )}
        
        {/* ローディング表示 */}
        {isLoading && (
          <div className="enhanced-message ai-tutor loading">
            <div className="message-avatar">
            </div>
            <div className="message-content">
              <div className="message-header">
                <span className="sender-name">AI Tutor</span>
              </div>
              <div className="typing-indicator">
                <div className="typing-dots">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
                <span className="typing-text">Typing...</span>
              </div>
            </div>
          </div>
        )}
        
        {/* 自動スクロール用の要素 */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

// PropTypesの定義
ChatBox.propTypes = {
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      sender: PropTypes.string.isRequired,
      text: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
      timestamp: PropTypes.string,
      isError: PropTypes.bool,
      suggestions: PropTypes.array,
      grammarFeedback: PropTypes.object,
      confidence: PropTypes.number
    })
  ).isRequired,
  isLoading: PropTypes.bool.isRequired,
  messagesEndRef: PropTypes.object.isRequired
};

// コンポーネント名を設定（デバッグ用）
ChatBox.displayName = 'ChatBox';

export default memo(ChatBox);
