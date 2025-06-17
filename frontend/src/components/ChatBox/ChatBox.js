// ============================================================================
// チャットボックスコンポーネント
// メッセージ履歴を表示するUIコンポーネントです
// ============================================================================

import React from 'react';
import PropTypes from 'prop-types';

/**
 * チャット表示エリアコンポーネント
 * @param {Object} props - コンポーネントプロパティ
 * @param {Array} props.messages - メッセージ履歴配列
 * @param {boolean} props.isLoading - ローディング状態
 * @param {Object} props.messagesEndRef - 自動スクロール用参照
 */
const ChatBox = ({ messages, isLoading, messagesEndRef }) => {
  // デバッグ用のログ
  console.log('ChatBox rendering with messages:', messages.length, messages);

  return (
    <div className="chat-box">
      {/* メッセージ履歴の表示 */}
      {messages.length === 0 ? (
        <div className="no-messages">
          <p>メッセージを入力してチャットを開始してください</p>
          <small>Start typing a message to begin your English conversation practice</small>
        </div>
      ) : (
        messages.map((message, index) => (
          <div 
            key={`${message.timestamp}-${index}`} 
            className={`message ${message.sender.toLowerCase().replace(' ', '-')} ${message.isError ? 'error' : ''}`}
          >
            <strong>{message.sender}: </strong>
            <span className="message-text">
              {(() => {
                // 安全なテキスト表示のための処理
                if (typeof message.text === 'string') {
                  return message.text;
                } else if (typeof message.text === 'object' && message.text !== null) {
                  // オブジェクトの場合はreplyプロパティを優先
                  if (message.text.reply && typeof message.text.reply === 'string') {
                    return message.text.reply;
                  }
                  // replyがない場合はJSON文字列として表示
                  return JSON.stringify(message.text);
                } else {
                  return String(message.text || 'No message content');
                }
              })()}
            </span>
            {message.timestamp && (
              <small className="timestamp">
                {new Date(message.timestamp).toLocaleTimeString()}
              </small>
            )}
          </div>
        ))
      )}
      
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

export default ChatBox;
