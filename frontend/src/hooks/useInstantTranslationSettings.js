// ============================================================================
// InstantTranslation設定管理カスタムフック
// 設定値の状態管理と設定変更処理を担当
// ============================================================================

import { useState, useCallback } from 'react';

/**
 * InstantTranslation設定管理のためのカスタムフック
 * @param {Function} fetchNewProblem - 新しい問題を取得する関数
 * @returns {Object} 設定管理の状態と関数
 */
export const useInstantTranslationSettings = (fetchNewProblem) => {
  const [eikenLevel, setEikenLevel] = useState('');
  const [longTextMode, setLongTextMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);


  /**
   * 英検レベル変更ハンドラー
   * @param {Event} e - イベントオブジェクト
   */
  const handleEikenLevelChange = useCallback((e) => {
    setEikenLevel(e.target.value);
  }, []);

  /**
   * 長文モード変更ハンドラー
   * @param {Event} e - イベントオブジェクト
   */
  const handleLongTextModeChange = useCallback((e) => {
    setLongTextMode(e.target.checked);
  }, []);

  /**
   * 設定適用ハンドラー
   * 現在の設定で新しい問題を取得
   */
  const applySettings = useCallback(() => {
    if (fetchNewProblem) {
      fetchNewProblem(undefined, undefined, eikenLevel, longTextMode);
    }
    setShowSettings(false);
  }, [eikenLevel, longTextMode, fetchNewProblem]);

  /**
   * 設定パネルの表示/非表示切り替え
   */
  const toggleSettings = useCallback(() => {
    setShowSettings(prev => !prev);
  }, []);

  /**
   * 設定パネルを閉じる
   */
  const closeSettings = useCallback(() => {
    setShowSettings(false);
  }, []);

  /**
   * 設定をリセット
   */
  const resetSettings = useCallback(() => {
    setEikenLevel('');
    setLongTextMode(false);
  }, []);

  return {
    eikenLevel,
    longTextMode,
    showSettings,
    handleEikenLevelChange,
    handleLongTextModeChange,
    applySettings,
    toggleSettings,
    closeSettings,
    resetSettings
  };
};