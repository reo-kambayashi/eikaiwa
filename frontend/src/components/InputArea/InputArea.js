// ============================================================================
// 入力エリアコンポーネント
// テキスト入力、音声入力ボタン、送信ボタンを含むUIです
// ============================================================================

import React, { useState, useRef, useEffect } from 'react';
import './InputArea.css';

/**
 * メッセージ入力エリアコンポーネント
 * @param {Object} props - コンポーネントプロパティ
 * @param {string} props.value - 現在の入力値
 * @param {boolean} props.isListening - 音声認識中かどうか
 * @param {boolean} props.isLoading - ローディング状態
 * @param {boolean} props.isVoiceInputEnabled - 音声入力が有効かどうか
 * @param {boolean} props.isVoiceSupported - 音声認識がサポートされているか
 * @param {Function} props.onChange - 入力値変更ハンドラー
 * @param {Function} props.onSend - メッセージ送信ハンドラー
 * @param {Function} props.onVoiceToggle - 音声入力切り替えハンドラー
 */
const InputArea = ({
  value,
  isListening,
  isLoading,
  isVoiceInputEnabled,
  isVoiceSupported,
  onChange,
  onSend,
  onVoiceToggle
}) => {
  /**
   * 入力値変更時の処理
   * @param {Event} e - 入力イベント
   */
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    if (newValue.length <= maxChars) {
      onChange(newValue);
    }
  };

  /**
   * キーボード入力時の処理
   * @param {KeyboardEvent} e - キーボードイベント
   */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      
      if (isListening) {
        // 音声認識中の場合は停止してから送信
        onVoiceToggle();
        setTimeout(() => {
          onSend();
        }, 100);
      } else {
        // 通常のテキスト送信
        onSend();
      }
    }
    
    // タブキーで送信ボタンにフォーカスを移す
    if (e.key === 'Tab' && !e.shiftKey) {
      // デフォルトのタブ動作を許可
    }
  };

  /**
   * 送信ボタンクリック時の処理
   */
  const handleSendClick = () => {
    if (isListening) {
      // 音声認識中の場合は停止してから送信
      onVoiceToggle();
      setTimeout(() => {
        onSend();
      }, 100);
    } else {
      onSend();
    }
  };

  /**
   * プレースホルダーテキストを状態に応じて決定
   */
  const getPlaceholder = () => {
    if (isListening) {
      return '🎤 音声を認識中...';
    } else if (isVoiceInputEnabled) {
      return 'メッセージを入力';
    } else {
      return 'メッセージを入力してください';
    }
  };

  /**
   * 入力エリアの状態表示テキスト
   */
  const getStatusText = () => {
    if (isListening) {
      return {
        icon: '🎤',
        text: '音声入力中',
        status: 'active'
      };
    } else if (isLoading) {
      return {
        icon: '⏳',
        text: 'AI応答待ち',
        status: 'loading'
      };
    } else {
      return {
        icon: '✏️',
        text: 'メッセージ入力',
        status: 'ready'
      };
    }
  };

  // 入力フィールドの参照
  const inputRef = useRef(null);
  
  // 文字数状態
  const [charCount, setCharCount] = useState(0);
  const maxChars = 500;

  // 入力値が変更されたときに文字数を更新
  useEffect(() => {
    setCharCount(value.length);
  }, [value]);

  /**
   * 送信ボタンを無効にする条件
   */
  const isSendDisabled = isLoading || (!value.trim() && !isListening);

  return (
    <div className="enhanced-input-area">
      {/* 改善された入力エリアヘッダー */}
      <div className="input-header">
        <div className={`input-status status-${getStatusText().status}`}>
          <span className="status-icon">{getStatusText().icon}</span>
          <span className="status-text">{getStatusText().text}</span>
        </div>
        <div className="input-controls">
          <div className="char-counter">
            <span className={charCount > maxChars * 0.8 ? 'warning' : ''}>
              {charCount}/{maxChars}
            </span>
          </div>
        </div>
      </div>

      {/* 改善されたメイン入力エリア */}
      <div className="main-input-container">
        <div className="input-wrapper">
          {/* テキスト入力フィールド */}
          <textarea
            ref={inputRef}
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={getPlaceholder()}
            disabled={isLoading || isListening}
            maxLength={maxChars}
            rows={2}
            className={`enhanced-message-input ${
              isListening ? 'listening' : ''
            } ${isLoading ? 'loading' : ''}`}
            aria-label="メッセージ入力欄"
          />
          
          {/* 音声認識中のビジュアルフィードバック */}
          {isListening && (
            <div className="voice-feedback">
              <div className="voice-animation">
                <div className="voice-wave"></div>
                <div className="voice-wave"></div>
                <div className="voice-wave"></div>
              </div>
            </div>
          )}
        </div>

        {/* 改善されたボタン群 */}
        <div className="input-actions">
          {/* 音声入力ボタン */}
          {isVoiceSupported && isVoiceInputEnabled && (
            <button
              type="button"
              onClick={onVoiceToggle}
              disabled={isLoading}
              className={`voice-button ${isListening ? 'active' : ''}`}
              aria-label={isListening ? '音声入力を停止' : '音声入力を開始'}
              title={isListening ? 'Spaceキーまたはクリックで停止' : 'Spaceキーまたはクリックで開始'}
            >
              <span className="voice-icon">
                {isListening ? '🛑' : '🎤'}
              </span>
              <span className="voice-label">
                {isListening ? 'STOP' : 'VOICE'}
              </span>
            </button>
          )}

          {/* 送信ボタン */}
          <button
            type="button"
            onClick={handleSendClick}
            disabled={isSendDisabled}
            className={`send-button ${isSendDisabled ? 'disabled' : 'enabled'}`}
            aria-label="メッセージを送信"
            title="メッセージを送信"
          >
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                <span>送信中...</span>
              </>
            ) : (
              <>
                <span className="send-icon">📤</span>
                <span>送信</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// PropTypesの定義
InputArea.propTypes = {
  value: React.PropTypes?.string || function() {},
  isListening: React.PropTypes?.bool || function() {},
  isLoading: React.PropTypes?.bool || function() {},
  isVoiceInputEnabled: React.PropTypes?.bool || function() {},
  isVoiceSupported: React.PropTypes?.bool || function() {},
  onChange: React.PropTypes?.func || function() {},
  onSend: React.PropTypes?.func || function() {},
  onVoiceToggle: React.PropTypes?.func || function() {}
};

export default InputArea;
