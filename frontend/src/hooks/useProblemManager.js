// ============================================================================
// 問題管理カスタムフック
// InstantTranslationモードの問題取得と履歴管理を担当
// ============================================================================

import { useState, useCallback } from 'react';
import { useApi } from './useApi';

/**
 * 問題管理のためのカスタムフック
 * @returns {Object} 問題管理の状態と関数
 */
export const useProblemManager = () => {
  const [currentProblem, setCurrentProblem] = useState(null);
  const [problemHistory, setProblemHistory] = useState([]);
  
  const { get, isLoading } = useApi({ enableCache: true, cacheTimeout: 2 * 60 * 1000 });

  /**
   * 新しい問題を取得する
   * @param {string} difficulty - 難易度設定
   * @param {string} category - カテゴリ設定
   * @param {string} eikenLevel - 英検レベル設定
   */
  const fetchNewProblem = useCallback(async (difficulty = 'all', category = 'all', eikenLevel = '', longTextMode = false) => {
    try {
      // APIリクエストパラメータの構築
      const params = new URLSearchParams();
      if (difficulty !== 'all') params.append('difficulty', difficulty);
      if (category !== 'all') params.append('category', category);
      if (eikenLevel) params.append('eiken_level', eikenLevel);
      if (longTextMode) params.append('long_text_mode', 'true');

      // フォールバック問題を定義
      const fallbackProblem = {
        japanese: '私は毎日英語を勉強しています。',
        english: 'I study English every day.',
        difficulty: 'basic',
        category: 'daily_life'
      };

      // API呼び出し（フォールバック付き）
      const problem = await get(`/api/eiken-translation-problem?${params.toString()}`, {
        fallbackData: fallbackProblem,
        onSuccess: (data) => {
          // 音声出力は無効化済み
        },
        onError: (error) => {
          console.error('問題取得エラー:', error);
          // 音声出力は無効化済み
        }
      });
      
      // 問題設定と履歴更新
      setCurrentProblem(problem);
      setProblemHistory(prev => [...prev, problem]);

    } catch (error) {
      console.error('予期しないエラー:', error);
    }
  }, [get]);

  /**
   * 問題履歴をクリア
   */
  const clearProblemHistory = useCallback(() => {
    setProblemHistory([]);
  }, []);

  /**
   * 現在の問題をリセット
   */
  const resetCurrentProblem = useCallback(() => {
    setCurrentProblem(null);
  }, []);

  return {
    currentProblem,
    problemHistory,
    isLoading,
    fetchNewProblem,
    clearProblemHistory,
    resetCurrentProblem
  };
};