// ============================================================================
// 音声コントロールコンポーネント
// 音声入力の開始/停止ボタンを提供します
// ============================================================================

import React from 'react';

/**
 * 音声コントロールボタンコンポーネント
 * @param {Object} props - コンポーネントプロパティ
 * @param {boolean} props.isListening - 音声認識中かどうか
 * @param {boolean} props.isEnabled - 音声入力が有効かどうか
 * @param {boolean} props.isSupported - 音声認識がサポートされているか
 * @param {boolean} props.isLoading - ローディング状態
 * @param {Function} props.onToggle - 音声入力切り替えハンドラー
 */
const VoiceControls = ({ 
  isListening, 
  isEnabled, 
  isSupported, 
  isLoading, 
  onToggle 
}) => {
  // 音声認識がサポートされていない、または有効でない場合は表示しない
  if (!isSupported || !isEnabled) {
    return null;
  }

  return (
    <button 
      className={`voice-button ${isListening ? 'listening' : ''} ${isLoading ? 'disabled' : ''}`}
      onClick={onToggle}
      disabled={isLoading}
      title={isListening ? "Stop listening (音声停止)" : "Start voice input (音声入力開始)"}
      aria-label={isListening ? "音声認識を停止" : "音声認識を開始"}
    >
      {/* マイクアイコン - リスニング中は視覚的に区別 */}
      <span className="microphone-icon">
        🎤
      </span>
      
      {/* リスニング状態の視覚的インジケーター */}
      {isListening && (
        <span className="listening-indicator">
          <span className="pulse-dot"></span>
        </span>
      )}
    </button>
  );
};

export default VoiceControls;
