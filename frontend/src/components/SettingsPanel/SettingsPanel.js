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
          <div className="speed-slider-container">
            <div className="speed-slider-labels">
              <span className="speed-label-min">0.5x</span>
              <span className="speed-label-center">1.0x</span>
              <span className="speed-label-max">2.0x</span>
            </div>
            <input
              type="range"
              id="speakingRate"
              min="0.5"
              max="2.0"
              step="0.05"
              value={speakingRate}
              onChange={(e) => onSpeakingRateChange(parseFloat(e.target.value))}
              disabled={isLoading}
              className="speed-slider"
            />
            <div className="speaking-rate-info">
              <div className="current-speed">
                <strong>{speakingRate.toFixed(2)}x</strong>
                <span className="speed-description">
                  {speakingRate <= 0.7 ? ' (Very Slow)' :
                   speakingRate <= 0.9 ? ' (Slow)' :
                   speakingRate <= 1.1 ? ' (Normal)' :
                   speakingRate <= 1.4 ? ' (Fast)' :
                   speakingRate <= 1.7 ? ' (Very Fast)' :
                   ' (Maximum)'}
                </span>
              </div>
              <button
                type="button"
                onClick={onSpeakingRateReset}
                disabled={isLoading}
                className="reset-rate-button"
                title="Reset to default speed for current level"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

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
