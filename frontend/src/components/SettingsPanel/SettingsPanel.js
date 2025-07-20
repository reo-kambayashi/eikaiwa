// ============================================================================
// 設定パネルコンポーネント（リファクタリング版）
// 音声機能の設定UIを提供します
// PropTypes、メモ化、アクセシビリティの改善を含む
// ============================================================================

import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { 
  SPEECH_RECOGNITION_CONFIG
} from '../../utils/constants';
import './SettingsPanel.css';

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
  isSpeechLoading,
  onVoiceInputToggle,
  onVoiceOutputToggle,
  onSpeakingRateChange,
  onSpeakingRateReset,
  onVoiceInputTimeoutChange
}) => {
  // スピード説明テキストを取得（現在未使用）
  // const getSpeedDescription = (rate) => {
  //   if (rate <= 1.2) return 'Normal speed';
  //   if (rate <= 1.4) return 'Slightly fast';
  //   if (rate <= 1.7) return 'Fast';
  //   if (rate <= 1.9) return 'Very fast';
  //   return 'Maximum speed';
  // };

  return (
    <div className="settings-panel" role="form" aria-label="Application Settings">
      {/* パネルヘッダー */}
      <div className="panel-header">
        <h3 className="panel-title">Settings</h3>
      </div>

      {/* 音声コントロールセクション */}
      <div className="settings-section">
        <h4 className="section-title">Voice Features</h4>
        
        {/* 音声入力設定 */}
        {isVoiceSupported && (
          <div className="setting-item">
            <span className="setting-name">Voice Input</span>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={isVoiceInputEnabled}
                onChange={(e) => onVoiceInputToggle(e.target.checked)}
                disabled={isLoading}
              />
              <span className="slider"></span>
            </label>
          </div>
        )}
        
        {/* 音声出力設定 */}
        <div className="setting-item">
          <span className="setting-name">Voice Output</span>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={isVoiceOutputEnabled}
              onChange={(e) => onVoiceOutputToggle(e.target.checked)}
              disabled={isLoading}
            />
            <span className="slider"></span>
          </label>
          {isSpeechLoading && (
            <div className="speech-loading-indicator">
              <span className="speech-loading-text">Speaking...</span>
            </div>
          )}
        </div>

        {/* 音声認識タイムアウト設定 */}
        {isVoiceInputEnabled && isVoiceSupported && (
          <div className="setting-item">
            <span className="setting-name">Timeout</span>
            <select 
              value={voiceInputTimeout} 
              onChange={(e) => onVoiceInputTimeoutChange(parseInt(e.target.value, 10))}
              disabled={isLoading}
              className="compact-select"
            >
              {SPEECH_RECOGNITION_CONFIG.TIMEOUT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 読み上げ速度セクション */}
      {isVoiceOutputEnabled && (
        <div className="settings-section">
          <h4 className="section-title">Speech Rate</h4>
          <div className="speed-controls">
            {[1.0, 1.2, 1.4, 1.6, 1.8, 2.0].map(speed => (
              <button
                key={speed}
                type="button"
                onClick={() => onSpeakingRateChange(speed)}
                disabled={isLoading}
                className={`speed-btn ${speakingRate === speed ? 'active' : ''}`}
                aria-label={`Set speech rate to ${speed}x`}
              >
                {speed.toFixed(1)}x
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 警告メッセージ */}
      {!isVoiceSupported && (
        <div className="warning-section">
          <div className="warning-message">
            Voice input is not available
          </div>
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
  isSpeechLoading: PropTypes.bool.isRequired,
  
  // コールバック関数
  onVoiceInputToggle: PropTypes.func.isRequired,
  onVoiceOutputToggle: PropTypes.func.isRequired,
  onSpeakingRateChange: PropTypes.func.isRequired,
  onSpeakingRateReset: PropTypes.func.isRequired,
  onVoiceInputTimeoutChange: PropTypes.func.isRequired
};

export default SettingsPanel;
