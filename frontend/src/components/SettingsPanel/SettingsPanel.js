// ============================================================================
// 最適化された設定パネルコンポーネント（新設計）
// 効率的で直感的な音声機能設定UIを提供
// コンパクトなレイアウト、スマートグルーピング、アクセシビリティを重視
// ============================================================================

import React, { memo, useState } from 'react';
import PropTypes from 'prop-types';
import { 
  SPEECH_RECOGNITION_CONFIG,
  TTS_CONFIG
} from '../../utils/constants';
import './SettingsPanel.css';

/**
 * 最適化された設定パネルコンポーネント
 * 新しいカード形式のレイアウトとスマートなグルーピングを実装
 */
const SettingsPanel = memo(({
  isVoiceInputEnabled,
  isVoiceOutputEnabled,
  speakingRate,
  voiceInputTimeout,
  voiceName,
  isVoiceSupported,
  isLoading,
  isSpeechLoading,
  onVoiceInputToggle,
  onVoiceOutputToggle,
  onSpeakingRateChange,
  onSpeakingRateReset,
  onVoiceInputTimeoutChange,
  onVoiceNameChange
}) => {
  // 展開状態を管理（アドバンス設定）
  const [isAdvancedExpanded, setIsAdvancedExpanded] = useState(false);

  // スピード説明テキストを動的に取得
  const getSpeedDescription = (rate) => {
    const numRate = Number(rate || 1.0);
    if (numRate <= 1.0) return '標準';
    if (numRate <= 1.3) return '少し速い';
    if (numRate <= 1.6) return '速い';
    if (numRate <= 1.9) return 'とても速い';
    return '最高速';
  };

  return (
    <div className="settings-panel-optimized" role="form" aria-label="Voice Settings">
      {/* コンパクトヘッダー */}
      <div className="panel-header-compact">
        <h3 className="panel-title-compact">
          <span className="settings-icon">⚙️</span>
          Settings
        </h3>
      </div>

      <div className="settings-content">
        {/* 主要な音声コントロール - カード形式 */}
        <div className="control-card primary-controls">
          <div className="card-header">
            <h4 className="card-title">
              <span className="voice-icon">🎤</span>
              Voice Controls
            </h4>
          </div>
          
          <div className="controls-grid">
            {/* 音声入力トグル */}
            {isVoiceSupported && (
              <div className="control-item">
                <div className="control-label">
                  <span className="label-text">Voice Input</span>
                  <span className="label-status">
                    {isVoiceInputEnabled ? 'ON' : 'OFF'}
                  </span>
                </div>
                <label className="modern-toggle">
                  <input
                    type="checkbox"
                    checked={isVoiceInputEnabled}
                    onChange={(e) => onVoiceInputToggle(e.target.checked)}
                    disabled={isLoading}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            )}

            {/* 音声出力トグル */}
            <div className="control-item">
              <div className="control-label">
                <span className="label-text">Voice Output</span>
                <span className="label-status">
                  {isVoiceOutputEnabled ? 'ON' : 'OFF'}
                </span>
                {isSpeechLoading && (
                  <span className="speaking-indicator">🔊</span>
                )}
              </div>
              <label className="modern-toggle">
                <input
                  type="checkbox"
                  checked={isVoiceOutputEnabled}
                  onChange={(e) => onVoiceOutputToggle(e.target.checked)}
                  disabled={isLoading}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* 音声出力が有効な場合の速度コントロール */}
        {isVoiceOutputEnabled && (
          <div className="control-card speed-controls-card">
            <div className="card-header">
              <h4 className="card-title">
                <span className="speed-icon">⚡</span>
                Speech Speed
              </h4>
              <span className="current-speed">{getSpeedDescription(speakingRate)}</span>
            </div>
            
            <div className="speed-selector">
              <div className="speed-display">
                <span className="speed-value">{Number(speakingRate || 1.0).toFixed(1)}x</span>
              </div>
              <div className="speed-buttons">
                {[1.0, 1.2, 1.4, 1.6, 1.8, 2.0].map(speed => (
                  <button
                    key={speed}
                    type="button"
                    onClick={() => onSpeakingRateChange(speed)}
                    disabled={isLoading}
                    className={`speed-btn-modern ${speakingRate === speed ? 'active' : ''}`}
                    aria-label={`Set speech rate to ${speed}x`}
                  >
                    {speed.toFixed(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* アドバンス設定 - 折りたたみ可能 */}
        <div className="control-card advanced-controls">
          <button 
            className="advanced-toggle"
            onClick={() => setIsAdvancedExpanded(!isAdvancedExpanded)}
            aria-expanded={isAdvancedExpanded}
          >
            <span className="advanced-icon">🔧</span>
            <span className="advanced-text">Advanced Settings</span>
            <span className={`expand-icon ${isAdvancedExpanded ? 'expanded' : ''}`}>
              ▼
            </span>
          </button>
          
          {isAdvancedExpanded && (
            <div className="advanced-content">
              {/* 音声認識タイムアウト設定 */}
              {isVoiceInputEnabled && isVoiceSupported && (
                <div className="advanced-item">
                  <label className="advanced-label">Recognition Timeout</label>
                  <select 
                    value={voiceInputTimeout} 
                    onChange={(e) => onVoiceInputTimeoutChange(parseInt(e.target.value, 10))}
                    disabled={isLoading}
                    className="advanced-select"
                  >
                    {SPEECH_RECOGNITION_CONFIG.TIMEOUT_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* 音声選択設定 */}
              {isVoiceOutputEnabled && (
                <div className="advanced-item">
                  <label className="advanced-label">Voice Type</label>
                  <select 
                    value={voiceName} 
                    onChange={(e) => onVoiceNameChange(e.target.value)}
                    disabled={isLoading}
                    className="advanced-select"
                  >
                    {TTS_CONFIG.AVAILABLE_VOICES.map(voice => (
                      <option key={voice.value} value={voice.value}>
                        {voice.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 音声サポート警告 */}
        {!isVoiceSupported && (
          <div className="warning-card">
            <div className="warning-content">
              <span className="warning-icon">⚠️</span>
              <div className="warning-text">
                <strong>Voice input unavailable</strong>
                <span className="warning-detail">
                  Please use Chrome, Firefox, or Safari for voice features
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
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
  voiceName: PropTypes.string.isRequired,
  
  // システム状態
  isVoiceSupported: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isSpeechLoading: PropTypes.bool.isRequired,
  
  // コールバック関数
  onVoiceInputToggle: PropTypes.func.isRequired,
  onVoiceOutputToggle: PropTypes.func.isRequired,
  onSpeakingRateChange: PropTypes.func.isRequired,
  onSpeakingRateReset: PropTypes.func.isRequired,
  onVoiceInputTimeoutChange: PropTypes.func.isRequired,
  onVoiceNameChange: PropTypes.func.isRequired
};

export default SettingsPanel;