// ============================================================================
// 瞬間英作文モード用カスタムフック
// 瞬間英作文機能の状態管理とAPIコミュニケーションを担当
// ============================================================================

import { useState, useCallback } from 'react';
import { API_CONFIG } from '../utils/constants/apiConstants';

/**
 * 瞬間英作文モードの状態管理フック
 * @returns {Object} 瞬間英作文機能の状態と操作関数
 */
export const useInstantTranslation = () => {
  // ============================================================================
  // 状態管理
  // ============================================================================
  
  const [currentProblem, setCurrentProblem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [problemHistory, setProblemHistory] = useState([]);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  // ============================================================================
  // API通信関数
  // ============================================================================
  
  /**
   * 新しい問題を取得する
   * @returns {Promise<Object|null>} 問題データまたはnull
   */
  const fetchProblem = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/instant-translation/problem`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const problemData = await response.json();
      
      // 問題データの検証
      if (!problemData.japanese || !problemData.english) {
        throw new Error('無効な問題データを受信しました');
      }

      setCurrentProblem(problemData);
      return problemData;

    } catch (err) {
      console.error('Problem fetch error:', err);
      setError('問題の取得に失敗しました。しばらくしてから再試行してください。');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 回答をチェックする
   * @param {string} userAnswer - ユーザーの回答
   * @returns {Promise<Object|null>} チェック結果またはnull
   */
  const checkAnswer = useCallback(async (userAnswer) => {
    if (!currentProblem) {
      setError('問題が読み込まれていません。');
      return null;
    }

    if (!userAnswer || typeof userAnswer !== 'string' || !userAnswer.trim()) {
      setError('回答を入力してください。');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/instant-translation/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          japanese: currentProblem.japanese,
          correctAnswer: currentProblem.english,
          userAnswer: userAnswer.trim()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // 結果データの検証
      if (typeof result.isCorrect !== 'boolean' || !result.feedback) {
        throw new Error('無効な結果データを受信しました');
      }

      // スコア更新
      setScore(prevScore => ({
        correct: prevScore.correct + (result.isCorrect ? 1 : 0),
        total: prevScore.total + 1
      }));

      // 問題履歴に追加
      const historyEntry = {
        id: Date.now(),
        japanese: currentProblem.japanese,
        correctAnswer: currentProblem.english,
        userAnswer: userAnswer.trim(),
        isCorrect: result.isCorrect,
        feedback: result.feedback,
        timestamp: new Date().toISOString()
      };

      setProblemHistory(prevHistory => [historyEntry, ...prevHistory]);

      return result;

    } catch (err) {
      console.error('Answer check error:', err);
      setError('回答チェックに失敗しました。しばらくしてから再試行してください。');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [currentProblem]);

  // ============================================================================
  // ユーティリティ関数
  // ============================================================================
  
  /**
   * エラーをクリアする
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * スコアをリセットする
   */
  const resetScore = useCallback(() => {
    setScore({ correct: 0, total: 0 });
  }, []);

  /**
   * 問題履歴をクリアする
   */
  const clearHistory = useCallback(() => {
    setProblemHistory([]);
  }, []);

  /**
   * 統計情報を取得する
   * @returns {Object} 統計情報
   */
  const getStatistics = useCallback(() => {
    const { correct, total } = score;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    
    return {
      correct,
      total,
      accuracy,
      recentHistory: problemHistory.slice(0, 10) // 最新10件
    };
  }, [score, problemHistory]);

  /**
   * 問題の難易度を評価する
   * @param {string} japanese - 日本語の問題文
   * @returns {string} 難易度レベル（'easy', 'medium', 'hard'）
   */
  const estimateDifficulty = useCallback((japanese) => {
    if (!japanese) return 'medium';
    
    const length = japanese.length;
    const complexPatterns = [
      /[させられ]/g, // 使役・受身
      /[という]/g,   // 複文
      /[ので|から]/g, // 理由
      /[ば|たら]/g,  // 条件
    ];
    
    let complexityScore = 0;
    complexPatterns.forEach(pattern => {
      const matches = japanese.match(pattern);
      if (matches) {
        complexityScore += matches.length;
      }
    });

    if (length < 15 && complexityScore === 0) return 'easy';
    if (length > 30 || complexityScore > 2) return 'hard';
    return 'medium';
  }, []);

  // ============================================================================
  // 戻り値
  // ============================================================================
  
  return {
    // 状態
    currentProblem,
    isLoading,
    error,
    problemHistory,
    score,
    
    // 操作関数
    fetchProblem,
    checkAnswer,
    clearError,
    resetScore,
    clearHistory,
    getStatistics,
    estimateDifficulty
  };
};