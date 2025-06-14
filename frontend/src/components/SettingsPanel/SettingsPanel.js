// ============================================================================
// 設定パネルコンポーネント
// 英語レベル、練習タイプ、音声機能の設定UIを提供します
// ============================================================================

import React from 'react';
import { ENGLISH_LEVELS, PRACTICE_TYPES, KEYBOARD_SHORTCUTS } from '../../utils/constants';

/**
 * 学習設定パネルコンポーネント
 * @param {Object} props - コンポーネントプロパティ
 * @param {string} props.level - 現在の英語レベル
 * @param {string} props.practiceType - 現在の練習タイプ
 * @param {boolean} props.isVoiceInputEnabled - 音声入力の有効状態
 * @param {boolean} props.isVoiceOutputEnabled - 音声出力の有効状態
 * @param {boolean} props.isVoiceSupported - 音声認識のサポート状況
 * @param {boolean} props.isLoading - ローディング状態
 * @param {Function} props.onLevelChange - レベル変更ハンドラー
 * @param {Function} props.onPracticeTypeChange - 練習タイプ変更ハンドラー
 * @param {Function} props.onVoiceInputToggle - 音声入力切り替えハンドラー
 * @param {Function} props.onVoiceOutputToggle - 音声出力切り替えハンドラー
 */
const SettingsPanel = ({
  level,
  practiceType,
  isVoiceInputEnabled,
  isVoiceOutputEnabled,
  isVoiceSupported,
  isLoading,
  onLevelChange,
  onPracticeTypeChange,
  onVoiceInputToggle,
  onVoiceOutputToggle
}) => {
  return (
    <div className="settings-panel">
      {/* 英語レベル設定 */}
      <div className="setting-group">
        <label htmlFor="level">English Level:</label>
        <select 
          id="level" 
          value={level} 
          onChange={(e) => onLevelChange(e.target.value)}
          disabled={isLoading}
        >
          {ENGLISH_LEVELS.map(levelOption => (
            <option key={levelOption.value} value={levelOption.value}>
              {levelOption.label}
            </option>
          ))}
        </select>
      </div>
      
      {/* 練習タイプ設定 */}
      <div className="setting-group">
        <label htmlFor="practiceType">Practice Type:</label>
        <select 
          id="practiceType" 
          value={practiceType} 
          onChange={(e) => onPracticeTypeChange(e.target.value)}
          disabled={isLoading}
        >
          {PRACTICE_TYPES.map(typeOption => (
            <option key={typeOption.value} value={typeOption.value}>
              {typeOption.label}
            </option>
          ))}
        </select>
      </div>

      {/* 音声機能設定 */}
      <div className="setting-group">
        <label>Voice Controls:</label>
        <div className="voice-controls">
          {/* 音声入力設定（サポートされている場合のみ表示） */}
          {isVoiceSupported && (
            <label className="voice-toggle">
              <input
                type="checkbox"
                checked={isVoiceInputEnabled}
                onChange={(e) => onVoiceInputToggle(e.target.checked)}
                disabled={isLoading}
              />
              Voice Input (音声入力)
            </label>
          )}
          
          {/* 音声出力設定 */}
          <label className="voice-toggle">
            <input
              type="checkbox"
              checked={isVoiceOutputEnabled}
              onChange={(e) => onVoiceOutputToggle(e.target.checked)}
              disabled={isLoading}
            />
            Voice Output (音声出力)
          </label>
        </div>
        
        {/* キーボードショートカットの案内（音声入力が有効な場合のみ） */}
        {isVoiceInputEnabled && (
          <div className="keyboard-shortcuts">
            <small>
              📝 <strong>Keyboard Shortcuts:</strong><br/>
              • <kbd>{KEYBOARD_SHORTCUTS.VOICE_INPUT}</kbd> - Start voice input (音声入力開始)<br/>
              • <kbd>{KEYBOARD_SHORTCUTS.SEND_MESSAGE}</kbd> - Stop voice input & send message (音声停止＆送信)
            </small>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPanel;
