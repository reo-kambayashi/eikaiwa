// ============================================================================
// 設定パネルコンポーネント
// 英語レベル、練習タイプ、音声機能の設定UIを提供します
// ============================================================================

import React from 'react';
import { ENGLISH_LEVELS, PRACTICE_TYPES, KEYBOARD_SHORTCUTS, TTS_CONFIG, SPEECH_RECOGNITION_CONFIG } from '../../utils/constants';

/**
 * 学習設定パネルコンポーネント
 * @param {Object} props - コンポーネントプロパティ
 * @param {string} props.level - 現在の英語レベル
 * @param {string} props.practiceType - 現在の練習タイプ
 * @param {boolean} props.isVoiceInputEnabled - 音声入力の有効状態
 * @param {boolean} props.isVoiceOutputEnabled - 音声出力の有効状態
 * @param {number} props.speakingRate - 現在の読み上げ速度
 * @param {number} props.voiceInputTimeout - 音声認識のタイムアウト時間（秒）
 * @param {boolean} props.isVoiceSupported - 音声認識のサポート状況
 * @param {boolean} props.isLoading - ローディング状態
 * @param {Function} props.onLevelChange - レベル変更ハンドラー
 * @param {Function} props.onPracticeTypeChange - 練習タイプ変更ハンドラー
 * @param {Function} props.onVoiceInputToggle - 音声入力切り替えハンドラー
 * @param {Function} props.onVoiceOutputToggle - 音声出力切り替えハンドラー
 * @param {Function} props.onSpeakingRateChange - 読み上げ速度変更ハンドラー
 * @param {Function} props.onSpeakingRateReset - 読み上げ速度リセットハンドラー
 * @param {Function} props.onVoiceInputTimeoutChange - 音声認識タイムアウト変更ハンドラー
 */
const SettingsPanel = ({
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
  return (
    <div className="settings-panel">
      {/* 学習設定セクション */}
      <div className="settings-section-header">
        <h2>Learning Settings</h2>
        <p>Customize your practice preferences</p>
      </div>
      
      {/* 英語レベル設定 */}
      <div className="setting-group">
        <label htmlFor="level">English Level</label>
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
        <label htmlFor="practiceType">Practice Type</label>
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

      {/* 音声機能設定セクション */}
      <div className="settings-section-header">
        <h2>Voice Features</h2>
        <p>Configure speech recognition and text-to-speech</p>
      </div>

      {/* 音声機能設定 */}
      <div className="setting-group">
        <label>Voice Controls</label>
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
              <span>Voice Input</span>
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
            <span>Voice Output</span>
          </label>
        </div>
      </div>

      {/* 音声認識タイムアウト設定（音声入力が有効な場合のみ） */}
      {isVoiceInputEnabled && isVoiceSupported && (
        <div className="setting-group">
          <label htmlFor="voiceInputTimeout">Voice Input Timeout</label>
          <select 
            id="voiceInputTimeout" 
            value={voiceInputTimeout} 
            onChange={(e) => onVoiceInputTimeoutChange(parseInt(e.target.value, 10))}
            disabled={isLoading}
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
          <label htmlFor="speakingRate">Speaking Speed</label>
          <select
            id="speakingRate"
            value={speakingRate}
            onChange={(e) => onSpeakingRateChange(parseFloat(e.target.value))}
            disabled={isLoading}
          >
            <option value="0.5">0.5x (Very Slow)</option>
            <option value="0.75">0.75x (Slow)</option>
            <option value="1.0">1.0x (Normal)</option>
            <option value="1.25">1.25x (Fast)</option>
            <option value="1.5">1.5x (Very Fast)</option>
            <option value="2.0">2.0x (Maximum)</option>
          </select>
          <div className="speaking-rate-info">
            <small>Current speed: <strong>{speakingRate.toFixed(1)}x</strong></small>
            <button
              type="button"
              onClick={onSpeakingRateReset}
              disabled={isLoading}
              className="reset-rate-button"
              title="Reset to default"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* 学習機能設定セクション */}
      <div className="settings-section-header">
        <h2>Learning Features</h2>
        <p>Enhanced features to improve your learning experience</p>
      </div>

      {/* 文法チェック設定 */}
      <div className="setting-group">
        <label>Grammar Enhancement</label>
        <div className="learning-controls">
          <label className="feature-toggle">
            <input
              type="checkbox"
              checked={isGrammarCheckEnabled}
              onChange={(e) => onGrammarCheckToggle(e.target.checked)}
              disabled={isLoading}
            />
            <span>Grammar Check & Suggestions</span>
          </label>
        </div>
        {isGrammarCheckEnabled && (
          <div className="feature-description">
            <small>
              <strong>Grammar Check:</strong> Provides real-time feedback on your writing with suggestions for improvement.
            </small>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPanel;
