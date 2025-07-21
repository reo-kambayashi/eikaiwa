// ============================================================================
// リスニング問題管理カスタムフック
// Trivia APIを使用したリスニング問題の取得と状態管理
// ============================================================================

import { useState, useCallback } from 'react';
import { fetchListeningProblem } from '../utils/api';

/**
 * リスニング問題管理のカスタムフック
 * @returns {Object} 問題データと操作関数
 */
export const useListeningProblem = () => {
  // ============================================================================
  // 状態管理
  // ============================================================================
  const [currentProblem, setCurrentProblem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // ============================================================================
  // 新しい問題の取得
  // ============================================================================
  const fetchNewProblem = useCallback(async (category = 'any', difficulty = 'medium') => {
    setIsLoading(true);
    setError(null);

    try {
      console.log(`🎯 Fetching listening problem: category=${category}, difficulty=${difficulty}`);
      
      const problem = await fetchListeningProblem(category, difficulty);
      
      if (problem) {
        setCurrentProblem(problem);
        console.log('✅ Listening problem fetched successfully:', problem);
      } else {
        throw new Error('No problem data received');
      }
    } catch (err) {
      console.error('❌ Error fetching listening problem:', err);
      
      // エラーメッセージを分類してユーザーフレンドリーに表示
      let userMessage = 'Failed to fetch listening problem';
      
      if (err.message?.includes('Rate limit')) {
        userMessage = '⏳ しばらく待ってから再試行してください（API制限）';
      } else if (err.message?.includes('timeout')) {
        userMessage = '⏱️ 接続がタイムアウトしました。再試行してください';
      } else if (err.message?.includes('Network')) {
        userMessage = '🌐 ネットワーク接続を確認してください';
      }
      
      setError(userMessage);
      
      // フォールバック問題を設定
      setCurrentProblem({
        question: "What is the capital of Japan?",
        choices: ["Tokyo", "Osaka", "Kyoto", "Hiroshima"],
        correct_answer: "Tokyo",
        difficulty: "easy",
        category: "Geography",
        explanation: "Tokyo is the capital and largest city of Japan."
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ============================================================================
  // 問題のリセット
  // ============================================================================
  const resetProblem = useCallback(() => {
    setCurrentProblem(null);
    setError(null);
  }, []);

  // ============================================================================
  // 戻り値
  // ============================================================================
  return {
    currentProblem,
    isLoading,
    error,
    fetchNewProblem,
    resetProblem
  };
};