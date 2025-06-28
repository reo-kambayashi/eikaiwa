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
  const [difficulty, setDifficulty] = useState('all');
  const [category, setCategory] = useState('all');
  const [eikenLevel, setEikenLevel] = useState('');
  const [longTextMode, setLongTextMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  /**
   * 難易度変更ハンドラー
   * @param {Event} e - イベントオブジェクト
   */
  const handleDifficultyChange = useCallback((e) => {
    setDifficulty(e.target.value);
  }, []);

  /**
   * カテゴリ変更ハンドラー
   * @param {Event} e - イベントオブジェクト
   */
  const handleCategoryChange = useCallback((e) => {
    setCategory(e.target.value);
  }, []);

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
      fetchNewProblem(difficulty, category, eikenLevel, longTextMode);
    }
    setShowSettings(false);
  }, [difficulty, category, eikenLevel, longTextMode, fetchNewProblem]);

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
    setDifficulty('all');
    setCategory('all');
    setEikenLevel('');
    setLongTextMode(false);
  }, []);

  return {
    difficulty,
    category,
    eikenLevel,
    longTextMode,
    showSettings,
    handleDifficultyChange,
    handleCategoryChange,
    handleEikenLevelChange,
    handleLongTextModeChange,
    applySettings,
    toggleSettings,
    closeSettings,
    resetSettings
  };
};