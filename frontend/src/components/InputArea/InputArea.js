// ============================================================================
// 入力エリアコンポーネント
// テキスト入力、音声入力ボタン、送信ボタンを含むUIです
// ============================================================================

import React, { useState, useRef, useEffect } from 'react';
import VoiceControls from '../VoiceControls';
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
      return 'Please speak...';
    } else if (isVoiceInputEnabled) {
      return 'Enter a message (voice input available)';
    } else {
      return 'Enter a message';
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
      {/* 入力エリアヘッダー */}
      <div className="input-header">
        <div className="input-status">
          {isListening ? (
            <>
              <span>Voice Input Active</span>
            </>
          ) : (
            <>
              <span>Enter Message</span>
            </>
          )}
        </div>
        <div className="char-counter">
          <span className={charCount > maxChars * 0.8 ? 'warning' : ''}>
            {charCount}/{maxChars}
          </span>
        </div>
      </div>

      {/* メイン入力エリア */}
      <div className="main-input-container">
        {/* テキスト入力フィールド */}
        <div className="input-wrapper">
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
            } ${
              charCount > maxChars * 0.8 ? 'near-limit' : ''
            }`}
            aria-label="Enter message"
          />
          
          {/* 入力状態インジケーター */}
          {isListening && (
            <div className="voice-indicator">
              <div className="voice-wave">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
        </div>

        {/* コントロールボタンエリア */}
        <div className="control-buttons">
          {/* 音声入力コントロール */}
          <VoiceControls
            isListening={isListening}
            isEnabled={isVoiceInputEnabled}
            isSupported={isVoiceSupported}
            isLoading={isLoading}
            onToggle={onVoiceToggle}
          />
          
          {/* 送信ボタン */}
          <button 
            onClick={handleSendClick}
            disabled={isSendDisabled}
            className={`enhanced-send-button ${
              isLoading ? 'loading' : ''
            } ${
              !isSendDisabled ? 'ready' : ''
            }`}
            aria-label="Send message"
          >
            {isLoading ? (
              <>
                <div className="button-spinner"></div>
                <span>Sending...</span>
              </>
            ) : (
              <>
                <span>Send</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ヒントテキスト */}
      <div className="input-hints">
        <small>
          {isVoiceInputEnabled && isVoiceSupported ? (
            <span>Tip: Use mic button for voice input, Enter key to send</span>
          ) : (
            <span>Tip: Enter key to send, Shift+Enter for new line</span>
          )}
        </small>
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
