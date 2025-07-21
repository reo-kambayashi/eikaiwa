// ============================================================================
// 設定管理用カスタムフック（最適化版）
// 音声機能の設定を管理します
// localStorage での永続化、メモ化の改善を含む
// ============================================================================

import { useState, useCallback, useEffect, useMemo } from 'react';
import { TTS_CONFIG, SPEECH_RECOGNITION_CONFIG, DEFAULT_SETTINGS, STORAGE_KEYS } from '../utils/constants';

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
  const [isVoiceInputEnabled, setIsVoiceInputEnabled] = useState(() => 
    getStoredValue(STORAGE_KEYS.VOICE_INPUT, DEFAULT_SETTINGS.isVoiceInputEnabled)
  );
  
  const [isVoiceOutputEnabled, setIsVoiceOutputEnabled] = useState(() => 
    getStoredValue(STORAGE_KEYS.VOICE_OUTPUT, DEFAULT_SETTINGS.isVoiceOutputEnabled)
  );

  // 瞬間英作文モード専用の音声出力設定
  const [isTranslationVoiceOutputEnabled, setIsTranslationVoiceOutputEnabled] = useState(() => 
    getStoredValue(STORAGE_KEYS.TRANSLATION_VOICE_OUTPUT, false) // デフォルトはオフ
  );

  // Grammar Check は常にオンに固定
  const isGrammarCheckEnabled = true;

  const [speakingRate, setSpeakingRate] = useState(() => {
    const storedRate = getStoredValue(STORAGE_KEYS.SPEAKING_RATE, null);
    
    // 保存された速度があればそれを使用、なければデフォルト値
    // 数値であることを保証する
    const rate = storedRate !== null 
      ? storedRate 
      : TTS_CONFIG.DEFAULT_SPEAKING_RATE || 1.0;
    
    return Number(rate) || 1.0;
  });

  const [voiceInputTimeout, setVoiceInputTimeout] = useState(() => 
    getStoredValue(STORAGE_KEYS.VOICE_TIMEOUT, SPEECH_RECOGNITION_CONFIG.DEFAULT_TIMEOUT)
  );

  const [voiceName, setVoiceName] = useState(() => 
    getStoredValue(STORAGE_KEYS.VOICE_NAME, TTS_CONFIG.VOICE_NAME)
  );

  // 設定変更関数（メモ化）
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

  const toggleTranslationVoiceOutput = useCallback((enabled) => {
    console.log('Translation voice output toggled:', enabled);
    setIsTranslationVoiceOutputEnabled(enabled);
    setStoredValue(STORAGE_KEYS.TRANSLATION_VOICE_OUTPUT, enabled);
  }, []);

  const updateSpeakingRate = useCallback((newRate) => {
    // 数値であることを保証
    const numRate = Number(newRate);
    if (isNaN(numRate)) {
      console.warn('Invalid speaking rate provided:', newRate);
      return;
    }
    
    // 範囲チェック
    const clampedRate = Math.min(
      Math.max(numRate, TTS_CONFIG.SPEAKING_RATE.MIN), 
      TTS_CONFIG.SPEAKING_RATE.MAX
    );
    
    console.log('Speaking rate changed to:', clampedRate);
    setSpeakingRate(clampedRate);
    setStoredValue(STORAGE_KEYS.SPEAKING_RATE, clampedRate);
  }, []);

  const resetSpeakingRateToDefault = useCallback(() => {
    const defaultRate = TTS_CONFIG.DEFAULT_SPEAKING_RATE || 1.0;
    console.log('Speaking rate reset to default:', defaultRate);
    setSpeakingRate(defaultRate);
    setStoredValue(STORAGE_KEYS.SPEAKING_RATE, defaultRate);
  }, []);

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

  const updateVoiceName = useCallback((newVoiceName) => {
    console.log('Voice name changed to:', newVoiceName);
    setVoiceName(newVoiceName);
    setStoredValue(STORAGE_KEYS.VOICE_NAME, newVoiceName);
  }, []);

  // デバッグ用：設定値をログ出力（開発環境のみ）
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Settings state:', {
        isVoiceInputEnabled,
        isVoiceOutputEnabled,
        isTranslationVoiceOutputEnabled,
        isGrammarCheckEnabled, // 常にtrue
        speakingRate,
        voiceInputTimeout,
        voiceName
      });
    }
  }, [isVoiceInputEnabled, isVoiceOutputEnabled, isTranslationVoiceOutputEnabled, isGrammarCheckEnabled, speakingRate, voiceInputTimeout, voiceName]);

  // 設定を全てリセットする関数
  const resetAllSettings = useCallback(() => {
    console.log('Resetting all settings to defaults');
    
    setIsVoiceInputEnabled(DEFAULT_SETTINGS.isVoiceInputEnabled);
    setIsVoiceOutputEnabled(DEFAULT_SETTINGS.isVoiceOutputEnabled);
    setIsTranslationVoiceOutputEnabled(false); // デフォルトはオフ
    // Grammar Check は常にtrue（リセットなし）
    setSpeakingRate(TTS_CONFIG.DEFAULT_SPEAKING_RATE || 1.0);
    setVoiceInputTimeout(SPEECH_RECOGNITION_CONFIG.DEFAULT_TIMEOUT);
    setVoiceName(TTS_CONFIG.VOICE_NAME);

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
    isVoiceInputEnabled,
    isVoiceOutputEnabled,
    isTranslationVoiceOutputEnabled,
    isGrammarCheckEnabled, // 常にtrue
    speakingRate,
    voiceInputTimeout,
    voiceName
  }), [isVoiceInputEnabled, isVoiceOutputEnabled, isTranslationVoiceOutputEnabled, isGrammarCheckEnabled, speakingRate, voiceInputTimeout, voiceName]);

  return {
    // 現在の設定値
    isVoiceInputEnabled,
    isVoiceOutputEnabled,
    isTranslationVoiceOutputEnabled,
    isGrammarCheckEnabled, // 常にtrue
    speakingRate,
    voiceInputTimeout,
    voiceName,
    
    // 設定更新関数
    toggleVoiceInput,
    toggleVoiceOutput,
    toggleTranslationVoiceOutput,
    updateSpeakingRate,
    resetSpeakingRateToDefault,
    updateVoiceInputTimeout,
    updateVoiceName,
    
    // ユーティリティ関数
    resetAllSettings,
    settingsExport
  };
};
