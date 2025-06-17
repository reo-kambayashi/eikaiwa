// ============================================================================
// 設定パネルコンポーネント（リファクタリング版）
// 音声機能の設定UIを提供します
// PropTypes、メモ化、アクセシビリティの改善を含む
// ============================================================================

import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { 
  SPEECH_RECOGNITION_CONFIG,
  UI_MESSAGES
} from '../../utils/constants';

/**
 * 学習設定パネルコンポーネント（最適化版）
 * React.memoでラッピングして不要な再レンダリングを防止
 */
const SettingsPanel = memo(({
  isVoiceInputEnabled,
  isVoiceOutputEnabled,
  speakingRate,
  voiceInputTimeout,
  isVoiceSupported,
  isLoading,
  onVoiceInputToggle,
  onVoiceOutputToggle,
  onSpeakingRateChange,
  onSpeakingRateReset,
  onVoiceInputTimeoutChange
}) => {
  /**
   * スピード説明テキストを取得
   */
  const getSpeedDescription = (rate) => {
    if (rate <= 1.2) return 'Normal speed';
    if (rate <= 1.4) return 'Slightly fast';
    if (rate <= 1.7) return 'Fast';
    if (rate <= 1.9) return 'Very fast';
    return 'Maximum speed';
  };

  return (
    <div className="settings-panel" role="form" aria-label="Application Settings">
      {/* 音声機能設定 */}
      <div className="setting-group">
        <label className="setting-label">Voice Controls</label>
        <div className="voice-controls">
          {/* 音声入力設定（サポートされている場合のみ表示） */}
          {isVoiceSupported && (
            <label className="voice-toggle">
              <input
                type="checkbox"
                checked={isVoiceInputEnabled}
                onChange={(e) => onVoiceInputToggle(e.target.checked)}
                disabled={isLoading}
                aria-describedby="voice-input-description"
              />
              <span className="toggle-text">Voice Input</span>
            </label>
          )}
          
          {/* 音声出力設定 */}
          <label className="voice-toggle">
            <input
              type="checkbox"
              checked={isVoiceOutputEnabled}
              onChange={(e) => onVoiceOutputToggle(e.target.checked)}
              disabled={isLoading}
              aria-describedby="voice-output-description"
            />
            <span className="toggle-text">Voice Output</span>
          </label>
        </div>
      </div>

      {/* 音声認識タイムアウト設定（音声入力が有効な場合のみ） */}
      {isVoiceInputEnabled && isVoiceSupported && (
        <div className="setting-group">
          <label htmlFor="voiceInputTimeout" className="setting-label">
            Voice Input Timeout
          </label>
          <select 
            id="voiceInputTimeout" 
            value={voiceInputTimeout} 
            onChange={(e) => onVoiceInputTimeoutChange(parseInt(e.target.value, 10))}
            disabled={isLoading}
            className="setting-select"
            aria-describedby="timeout-description"
          >
            {SPEECH_RECOGNITION_CONFIG.TIMEOUT_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 読み上げ速度設定（音声出力が有効な場合のみ） */}
      {isVoiceOutputEnabled && (
        <div className="setting-group">
          <label className="setting-label">
            Speaking Speed
          </label>
          <div className="speed-button-container">
            {[1.0, 1.2, 1.4, 1.6, 1.8, 2.0].map(speed => (
              <button
                key={speed}
                type="button"
                onClick={() => onSpeakingRateChange(speed)}
                disabled={isLoading}
                className={`speed-button ${speakingRate === speed ? 'active' : ''}`}
                aria-label={`Set speaking speed to ${speed} times normal speed`}
                aria-pressed={speakingRate === speed}
              >
                {speed.toFixed(1)}x
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 音声認識がサポートされていない場合の警告 */}
      {!isVoiceSupported && (
        <div className="warning-message" role="alert">
          <strong>Voice Input Not Available:</strong> {UI_MESSAGES.ERRORS.SPEECH_RECOGNITION_NOT_SUPPORTED}
        </div>
      )}
    </div>
  );
});

// コンポーネント名を設定（デバッグ用）
SettingsPanel.displayName = 'SettingsPanel';

// PropTypesの定義
SettingsPanel.propTypes = {
  // 設定値
  isVoiceInputEnabled: PropTypes.bool.isRequired,
  isVoiceOutputEnabled: PropTypes.bool.isRequired,
  speakingRate: PropTypes.number.isRequired,
  voiceInputTimeout: PropTypes.number.isRequired,
  
  // システム状態
  isVoiceSupported: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool.isRequired,
  
  // コールバック関数
  onVoiceInputToggle: PropTypes.func.isRequired,
  onVoiceOutputToggle: PropTypes.func.isRequired,
  onSpeakingRateChange: PropTypes.func.isRequired,
  onSpeakingRateReset: PropTypes.func.isRequired,
  onVoiceInputTimeoutChange: PropTypes.func.isRequired
};

export default SettingsPanel;
