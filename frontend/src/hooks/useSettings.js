// ============================================================================
// 設定管理用カスタムフック
// 英語レベル、練習タイプ、音声機能の設定を管理します
// ============================================================================

import { useState } from 'react';

/**
 * アプリケーション設定を管理するカスタムフック
 * @returns {Object} 設定状態と設定変更関数
 */
export const useSettings = () => {
  // 英語レベルの状態管理
  const [level, setLevel] = useState('beginner');
  
  // 練習タイプの状態管理
  const [practiceType, setPracticeType] = useState('conversation');
  
  // 音声入力機能の有効/無効状態
  const [isVoiceInputEnabled, setIsVoiceInputEnabled] = useState(false);
  
  // 音声出力機能の有効/無効状態
  const [isVoiceOutputEnabled, setIsVoiceOutputEnabled] = useState(false);

  /**
   * 英語レベルを変更する関数
   * @param {string} newLevel - 新しい英語レベル
   */
  const updateLevel = (newLevel) => {
    console.log('English level changed to:', newLevel);
    setLevel(newLevel);
  };

  /**
   * 練習タイプを変更する関数
   * @param {string} newPracticeType - 新しい練習タイプ
   */
  const updatePracticeType = (newPracticeType) => {
    console.log('Practice type changed to:', newPracticeType);
    setPracticeType(newPracticeType);
  };

  /**
   * 音声入力設定を切り替える関数
   * @param {boolean} enabled - 音声入力を有効にするかどうか
   */
  const toggleVoiceInput = (enabled) => {
    console.log('Voice input toggled:', enabled);
    setIsVoiceInputEnabled(enabled);
  };

  /**
   * 音声出力設定を切り替える関数
   * @param {boolean} enabled - 音声出力を有効にするかどうか
   */
  const toggleVoiceOutput = (enabled) => {
    console.log('Voice output toggled:', enabled);
    setIsVoiceOutputEnabled(enabled);
  };

  // 設定が変更されたかどうかを判定する関数
  const hasSettingsChanged = (prevLevel, prevPracticeType) => {
    return level !== prevLevel || practiceType !== prevPracticeType;
  };

  return {
    // 現在の設定値
    level,
    practiceType,
    isVoiceInputEnabled,
    isVoiceOutputEnabled,
    
    // 設定変更関数
    updateLevel,
    updatePracticeType,
    toggleVoiceInput,
    toggleVoiceOutput,
    
    // ユーティリティ関数
    hasSettingsChanged
  };
};
