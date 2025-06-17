// ============================================================================
// 設定管理用カスタムフック（最適化版）
// 英語レベル、練習タイプ、音声機能の設定を管理します
// localStorage での永続化、メモ化の改善を含む
// ============================================================================

import { useState, useCallback, useEffect, useMemo } from 'react';
import { TTS_CONFIG, SPEECH_RECOGNITION_CONFIG, DEFAULT_SETTINGS } from '../utils/constants';

// ローカルストレージのキー
const STORAGE_KEYS = {
  LEVEL: 'eikaiwa_level',
  PRACTICE_TYPE: 'eikaiwa_practice_type',
  VOICE_INPUT: 'eikaiwa_voice_input',
  VOICE_OUTPUT: 'eikaiwa_voice_output',
  GRAMMAR_CHECK: 'eikaiwa_grammar_check',
  SPEAKING_RATE: 'eikaiwa_speaking_rate',
  VOICE_TIMEOUT: 'eikaiwa_voice_timeout'
};

/**
 * ローカルストレージから値を取得するヘルパー関数
 */
const getStoredValue = (key, defaultValue) => {
  try {
    const stored = localStorage.getItem(key);
    if (stored === null) return defaultValue;
    
    // ブール値の場合
    if (typeof defaultValue === 'boolean') {
      return stored === 'true';
    }
    
    // 数値の場合
    if (typeof defaultValue === 'number') {
      const parsed = parseFloat(stored);
      return isNaN(parsed) ? defaultValue : parsed;
    }
    
    // 文字列の場合
    return stored;
  } catch (error) {
    console.warn(`Failed to read from localStorage (${key}):`, error);
    return defaultValue;
  }
};

/**
 * ローカルストレージに値を保存するヘルパー関数
 */
const setStoredValue = (key, value) => {
  try {
    localStorage.setItem(key, String(value));
  } catch (error) {
    console.warn(`Failed to write to localStorage (${key}):`, error);
  }
};

/**
 * アプリケーション設定を管理するカスタムフック（最適化版）
 * @returns {Object} 設定状態と設定変更関数
 */
export const useSettings = () => {
  // 設定状態の初期化（ローカルストレージから復元）
  const [level, setLevel] = useState(() => 
    getStoredValue(STORAGE_KEYS.LEVEL, DEFAULT_SETTINGS.level)
  );
  
  const [practiceType, setPracticeType] = useState(() => 
    getStoredValue(STORAGE_KEYS.PRACTICE_TYPE, DEFAULT_SETTINGS.practiceType)
  );
  
  const [isVoiceInputEnabled, setIsVoiceInputEnabled] = useState(() => 
    getStoredValue(STORAGE_KEYS.VOICE_INPUT, DEFAULT_SETTINGS.isVoiceInputEnabled)
  );
  
  const [isVoiceOutputEnabled, setIsVoiceOutputEnabled] = useState(() => 
    getStoredValue(STORAGE_KEYS.VOICE_OUTPUT, DEFAULT_SETTINGS.isVoiceOutputEnabled)
  );

  const [isGrammarCheckEnabled, setIsGrammarCheckEnabled] = useState(() => 
    getStoredValue(STORAGE_KEYS.GRAMMAR_CHECK, DEFAULT_SETTINGS.isGrammarCheckEnabled)
  );

  const [speakingRate, setSpeakingRate] = useState(() => {
    const storedLevel = getStoredValue(STORAGE_KEYS.LEVEL, DEFAULT_SETTINGS.level);
    const storedRate = getStoredValue(STORAGE_KEYS.SPEAKING_RATE, null);
    
    // 保存された速度があればそれを使用、なければレベルのデフォルト値
    return storedRate !== null 
      ? storedRate 
      : TTS_CONFIG.DEFAULT_SPEAKING_RATES[storedLevel] || TTS_CONFIG.DEFAULT_SPEAKING_RATES.beginner;
  });

  const [voiceInputTimeout, setVoiceInputTimeout] = useState(() => 
    getStoredValue(STORAGE_KEYS.VOICE_TIMEOUT, SPEECH_RECOGNITION_CONFIG.DEFAULT_TIMEOUT)
  );

  // レベルに基づくデフォルト読み上げ速度を計算（メモ化）
  const defaultSpeakingRateForLevel = useMemo(() => {
    return TTS_CONFIG.DEFAULT_SPEAKING_RATES[level] || TTS_CONFIG.DEFAULT_SPEAKING_RATES.beginner;
  }, [level]);

  // 設定変更関数（メモ化）
  const updateLevel = useCallback((newLevel) => {
    console.log('English level changed to:', newLevel);
    setLevel(newLevel);
    setStoredValue(STORAGE_KEYS.LEVEL, newLevel);
  }, []);

  const updatePracticeType = useCallback((newType) => {
    console.log('Practice type changed to:', newType);
    setPracticeType(newType);
    setStoredValue(STORAGE_KEYS.PRACTICE_TYPE, newType);
  }, []);

  const toggleVoiceInput = useCallback((enabled) => {
    console.log('Voice input toggled:', enabled);
    setIsVoiceInputEnabled(enabled);
    setStoredValue(STORAGE_KEYS.VOICE_INPUT, enabled);
  }, []);

  const toggleVoiceOutput = useCallback((enabled) => {
    console.log('Voice output toggled:', enabled);
    setIsVoiceOutputEnabled(enabled);
    setStoredValue(STORAGE_KEYS.VOICE_OUTPUT, enabled);
  }, []);

  const toggleGrammarCheck = useCallback((enabled) => {
    console.log('Grammar check toggled:', enabled);
    setIsGrammarCheckEnabled(enabled);
    setStoredValue(STORAGE_KEYS.GRAMMAR_CHECK, enabled);
  }, []);

  const updateSpeakingRate = useCallback((newRate) => {
    // 範囲チェック
    const clampedRate = Math.min(
      Math.max(newRate, TTS_CONFIG.SPEAKING_RATE.MIN), 
      TTS_CONFIG.SPEAKING_RATE.MAX
    );
    
    console.log('Speaking rate changed to:', clampedRate);
    setSpeakingRate(clampedRate);
    setStoredValue(STORAGE_KEYS.SPEAKING_RATE, clampedRate);
  }, []);

  const resetSpeakingRateToDefault = useCallback(() => {
    const defaultRate = defaultSpeakingRateForLevel;
    console.log('Speaking rate reset to default for level:', level, defaultRate);
    setSpeakingRate(defaultRate);
    setStoredValue(STORAGE_KEYS.SPEAKING_RATE, defaultRate);
  }, [level, defaultSpeakingRateForLevel]);

  const updateVoiceInputTimeout = useCallback((newTimeout) => {
    // 範囲チェック
    const clampedTimeout = Math.min(
      Math.max(newTimeout, SPEECH_RECOGNITION_CONFIG.MIN_TIMEOUT || 5), 
      SPEECH_RECOGNITION_CONFIG.MAX_TIMEOUT || 300
    );
    
    console.log('Voice input timeout changed to:', clampedTimeout);
    setVoiceInputTimeout(clampedTimeout);
    setStoredValue(STORAGE_KEYS.VOICE_TIMEOUT, clampedTimeout);
  }, []);

  // デバッグ用：設定値をログ出力（開発環境のみ）
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Settings state:', {
        level,
        practiceType,
        isVoiceInputEnabled,
        isVoiceOutputEnabled,
        isGrammarCheckEnabled,
        speakingRate,
        voiceInputTimeout
      });
    }
  }, [level, practiceType, isVoiceInputEnabled, isVoiceOutputEnabled, isGrammarCheckEnabled, speakingRate, voiceInputTimeout]);

  // 設定を全てリセットする関数
  const resetAllSettings = useCallback(() => {
    console.log('Resetting all settings to defaults');
    
    setLevel(DEFAULT_SETTINGS.level);
    setPracticeType(DEFAULT_SETTINGS.practiceType);
    setIsVoiceInputEnabled(DEFAULT_SETTINGS.isVoiceInputEnabled);
    setIsVoiceOutputEnabled(DEFAULT_SETTINGS.isVoiceOutputEnabled);
    setIsGrammarCheckEnabled(DEFAULT_SETTINGS.isGrammarCheckEnabled);
    setSpeakingRate(TTS_CONFIG.DEFAULT_SPEAKING_RATES[DEFAULT_SETTINGS.level]);
    setVoiceInputTimeout(SPEECH_RECOGNITION_CONFIG.DEFAULT_TIMEOUT);

    // ローカルストレージからも削除
    Object.values(STORAGE_KEYS).forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.warn(`Failed to remove from localStorage (${key}):`, error);
      }
    });
  }, []);

  // 設定エクスポート用オブジェクト（メモ化）
  const settingsExport = useMemo(() => ({
    level,
    practiceType,
    isVoiceInputEnabled,
    isVoiceOutputEnabled,
    isGrammarCheckEnabled,
    speakingRate,
    voiceInputTimeout
  }), [level, practiceType, isVoiceInputEnabled, isVoiceOutputEnabled, isGrammarCheckEnabled, speakingRate, voiceInputTimeout]);

  return {
    // 現在の設定値
    level,
    practiceType,
    isVoiceInputEnabled,
    isVoiceOutputEnabled,
    isGrammarCheckEnabled,
    speakingRate,
    voiceInputTimeout,
    
    // 計算値
    defaultSpeakingRateForLevel,
    
    // 設定更新関数
    updateLevel,
    updatePracticeType,
    toggleVoiceInput,
    toggleVoiceOutput,
    toggleGrammarCheck,
    updateSpeakingRate,
    resetSpeakingRateToDefault,
    updateVoiceInputTimeout,
    
    // ユーティリティ関数
    resetAllSettings,
    settingsExport
  };
};
