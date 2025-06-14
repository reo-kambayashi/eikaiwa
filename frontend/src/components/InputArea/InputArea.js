// ============================================================================
// 入力エリアコンポーネント
// テキスト入力、音声入力ボタン、送信ボタンを含むUIです
// ============================================================================

import React, { useState, useEffect } from 'react';
import VoiceControls from '../VoiceControls';
import { UI_MESSAGES } from '../../utils/constants';

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
  // ローカル入力状態（音声認識用）
  const [localValue, setLocalValue] = useState(value);

  // 外部から渡された値が変更されたときにローカル状態を更新
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  /**
   * 入力値変更時の処理
   * @param {Event} e - 入力イベント
   */
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(newValue);
  };

  /**
   * キーボード入力時の処理
   * @param {KeyboardEvent} e - キーボードイベント
   */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      
      if (isListening) {
        // 音声認識中の場合は停止してから送信
        onVoiceToggle();
        // 少し待ってから送信（音声認識の最終結果を待つため）
        setTimeout(() => {
          onSend();
        }, 100);
      } else {
        // 通常のテキスト送信
        onSend();
      }
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
      return UI_MESSAGES.PLACEHOLDER.LISTENING;
    } else if (isVoiceInputEnabled) {
      return UI_MESSAGES.PLACEHOLDER.VOICE_ENABLED;
    } else {
      return UI_MESSAGES.PLACEHOLDER.DEFAULT;
    }
  };

  /**
   * 送信ボタンを無効にする条件
   */
  const isSendDisabled = isLoading || (!localValue.trim() && !isListening);

  return (
    <div className="input-area">
      {/* テキスト入力フィールド */}
      <input
        type="text"
        value={localValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={getPlaceholder()}
        disabled={isLoading || isListening}
        className={`message-input ${isListening ? 'listening' : ''}`}
        aria-label="メッセージを入力"
      />
      
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
        className={`send-button ${isLoading ? 'loading' : ''}`}
        aria-label="メッセージを送信"
      >
        {isLoading ? (
          <>
            <span className="loading-spinner"></span>
            Sending...
          </>
        ) : (
          'Send'
        )}
      </button>
    </div>
  );
};

export default InputArea;
