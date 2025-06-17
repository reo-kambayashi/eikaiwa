// ============================================================================
// 設定パネルコンポーネント（リファクタリング版）
// 英語レベル、練習タイプ、音声機能の設定UIを提供します
// PropTypes、メモ化、アクセシビリティの改善を含む
// ============================================================================

import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { 
  ENGLISH_LEVELS, 
  PRACTICE_TYPES, 
  SPEECH_RECOGNITION_CONFIG,
  UI_MESSAGES
} from '../../utils/constants';

/**
 * 学習設定パネルコンポーネント（最適化版）
 * React.memoでラッピングして不要な再レンダリングを防止
 */
const SettingsPanel = memo(({
  level,
  practiceType,
  isVoiceInputEnabled,
  isVoiceOutputEnabled,
  isGrammarCheckEnabled,
  speakingRate,
  voiceInputTimeout,
  isVoiceSupported,
  isLoading,
  onLevelChange,
  onPracticeTypeChange,
  onVoiceInputToggle,
  onVoiceOutputToggle,
  onGrammarCheckToggle,
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
      {/* 英語レベル設定 */}
      <div className="setting-group">
        <label htmlFor="level" className="setting-label">
          English Level
          <span className="setting-description">Choose your current English proficiency</span>
        </label>
        <select 
          id="level" 
          value={level} 
          onChange={(e) => onLevelChange(e.target.value)}
          disabled={isLoading}
          className="setting-select"
          aria-describedby="level-description"
        >
          {ENGLISH_LEVELS.map(levelOption => (
            <option key={levelOption.value} value={levelOption.value}>
              {levelOption.label}
              {levelOption.description && ` - ${levelOption.description}`}
            </option>
          ))}
        </select>
        <div id="level-description" className="setting-help-text">
          This affects the difficulty of conversations and default speaking speed
        </div>
      </div>
      
      {/* 練習タイプ設定 */}
      <div className="setting-group">
        <label htmlFor="practiceType" className="setting-label">
          Practice Type
          <span className="setting-description">Select the type of English practice</span>
        </label>
        <select 
          id="practiceType" 
          value={practiceType} 
          onChange={(e) => onPracticeTypeChange(e.target.value)}
          disabled={isLoading}
          className="setting-select"
          aria-describedby="practice-type-description"
        >
          {PRACTICE_TYPES.map(typeOption => (
            <option key={typeOption.value} value={typeOption.value}>
              {typeOption.icon && `${typeOption.icon} `}
              {typeOption.label}
              {typeOption.description && ` - ${typeOption.description}`}
            </option>
          ))}
        </select>
        <div id="practice-type-description" className="setting-help-text">
          Different practice types provide focused learning experiences
        </div>
      </div>

      {/* 音声機能設定 */}
      <fieldset className="setting-group">
        <legend className="setting-label">Voice Controls</legend>
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
              <span className="toggle-description">Record your speech and convert to text</span>
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
            <span className="toggle-description">AI responses will be read aloud</span>
          </label>
        </div>
      </fieldset>

      {/* 音声認識タイムアウト設定（音声入力が有効な場合のみ） */}
      {isVoiceInputEnabled && isVoiceSupported && (
        <div className="setting-group">
          <label htmlFor="voiceInputTimeout" className="setting-label">
            Voice Input Timeout
            <span className="setting-description">How long to wait for speech</span>
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
          <div id="timeout-description" className="setting-help-text">
            Voice input will automatically stop after this duration
          </div>
        </div>
      )}

      {/* 読み上げ速度設定（音声出力が有効な場合のみ） */}
      {isVoiceOutputEnabled && (
        <div className="setting-group">
          <label htmlFor="speakingRate" className="setting-label">
            Speaking Speed
            <span className="setting-description">Adjust AI voice playback speed</span>
          </label>
          <div className="speaking-speed-control">
            {/* スピード値表示とリセットボタン */}
            <div className="speed-control-header">
              <span 
                className="current-speed-display"
                aria-live="polite"
                aria-label={`Current speed: ${speakingRate.toFixed(2)} times normal speed`}
              >
                {speakingRate.toFixed(2)}x
              </span>
              <button
                type="button"
                onClick={onSpeakingRateReset}
                disabled={isLoading}
                className="speed-reset-btn"
                title="Reset to default speed for your level"
                aria-label="Reset speaking speed to default"
              >
                Reset
              </button>
            </div>
            
            {/* スライダー */}
            <div className="speed-slider-wrapper">
              <input
                type="range"
                id="speakingRate"
                min="1.0"
                max="2.0"
                step="0.05"
                value={speakingRate}
                onChange={(e) => onSpeakingRateChange(parseFloat(e.target.value))}
                disabled={isLoading}
                className="speaking-speed-slider"
                aria-label="Speaking speed control"
                aria-valuemin="1.0"
                aria-valuemax="2.0"
                aria-valuenow={speakingRate}
                aria-valuetext={`${speakingRate.toFixed(2)} times normal speed, ${getSpeedDescription(speakingRate)}`}
              />
              
              {/* 範囲ラベル */}
              <div className="speed-range-labels" aria-hidden="true">
                <span>1.0x</span>
                <span>1.5x</span>
                <span>2.0x</span>
              </div>
              
              {/* スピード説明 */}
              <div 
                className="speed-description-text"
                aria-live="polite"
                id="speed-description"
              >
                {getSpeedDescription(speakingRate)}  
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 文法チェック設定 */}
      <fieldset className="setting-group">
        <legend className="setting-label">Grammar Enhancement</legend>
        <div className="learning-controls">
          <label className="feature-toggle">
            <input
              type="checkbox"
              checked={isGrammarCheckEnabled}
              onChange={(e) => onGrammarCheckToggle(e.target.checked)}
              disabled={isLoading}
              aria-describedby="grammar-check-description"
            />
            <span className="toggle-text">Grammar Check &amp; Suggestions</span>
            <span className="toggle-description">Get feedback on your grammar</span>
          </label>
        </div>
        {isGrammarCheckEnabled && (
          <div className="feature-description" id="grammar-check-description">
            <small>
              <strong>Grammar Check:</strong> Provides real-time feedback on your writing with suggestions for improvement.
            </small>
          </div>
        )}
      </fieldset>

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
  level: PropTypes.oneOf(['beginner', 'intermediate', 'advanced']).isRequired,
  practiceType: PropTypes.oneOf(['conversation', 'grammar', 'vocabulary', 'pronunciation']).isRequired,
  isVoiceInputEnabled: PropTypes.bool.isRequired,
  isVoiceOutputEnabled: PropTypes.bool.isRequired,
  isGrammarCheckEnabled: PropTypes.bool.isRequired,
  speakingRate: PropTypes.number.isRequired,
  voiceInputTimeout: PropTypes.number.isRequired,
  
  // システム状態
  isVoiceSupported: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool.isRequired,
  
  // コールバック関数
  onLevelChange: PropTypes.func.isRequired,
  onPracticeTypeChange: PropTypes.func.isRequired,
  onVoiceInputToggle: PropTypes.func.isRequired,
  onVoiceOutputToggle: PropTypes.func.isRequired,
  onGrammarCheckToggle: PropTypes.func.isRequired,
  onSpeakingRateChange: PropTypes.func.isRequired,
  onSpeakingRateReset: PropTypes.func.isRequired,
  onVoiceInputTimeoutChange: PropTypes.func.isRequired
};

export default SettingsPanel;
