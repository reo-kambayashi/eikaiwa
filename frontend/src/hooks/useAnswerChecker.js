// ============================================================================
// 回答チェックカスタムフック
// InstantTranslationモードの回答検証とフィードバック生成を担当
// ============================================================================

import { useState, useCallback } from 'react';
import { useApi } from './useApi';

/**
 * 回答チェックのためのカスタムフック
 * @param {Function} speak - 音声読み上げ関数
 * @param {boolean} isVoiceOutputEnabled - 音声出力の有効/無効
 * @returns {Object} 回答チェックの状態と関数
 */
export const useAnswerChecker = (speak, isVoiceOutputEnabled) => {
  const [feedback, setFeedback] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  
  const { post } = useApi();

  /**
   * ユーザーの回答をチェックする
   * @param {string} userAnswer - ユーザーの回答
   * @param {Object} currentProblem - 現在の問題
   */
  const checkAnswer = useCallback(async (userAnswer, currentProblem) => {
    if (!userAnswer.trim() || !currentProblem) {
      return;
    }

    try {
      // フォールバック処理: 基本的な文字列比較
      const isCorrect = userAnswer.trim().toLowerCase() === currentProblem.english.toLowerCase();
      const fallbackFeedback = isCorrect 
        ? '正解です！素晴らしい回答ですね。'
        : 'もう一度チャレンジしてみましょう。正解を確認して練習を続けてください。';

      // API呼び出しで回答をチェック（フォールバック付き）
      const result = await post('/api/check-instant-translation-answer', {
        japanese: currentProblem.japanese,
        correct_english: currentProblem.english,
        user_answer: userAnswer.trim()
      }, {
        fallbackData: { feedback: fallbackFeedback },
        onSuccess: (data) => {
          // 正解の音声読み上げ
          if (isVoiceOutputEnabled && speak && currentProblem.english) {
            speak(currentProblem.english);
          }
        },
        onError: (error) => {
          console.error('回答チェックエラー:', error);
          // フォールバック時も音声読み上げ
          if (isVoiceOutputEnabled && speak && currentProblem.english) {
            speak(currentProblem.english);
          }
        }
      });
      
      // フィードバック設定
      setFeedback(result.feedback || 'チェック完了しました。');
      setShowAnswer(true);

    } catch (error) {
      console.error('予期しないエラー:', error);
    }
  }, [post, speak, isVoiceOutputEnabled]);

  /**
   * 回答状態をリセット
   */
  const resetAnswer = useCallback(() => {
    setFeedback('');
    setShowAnswer(false);
  }, []);

  /**
   * フィードバックをクリア
   */
  const clearFeedback = useCallback(() => {
    setFeedback('');
  }, []);

  return {
    feedback,
    showAnswer,
    checkAnswer,
    resetAnswer,
    clearFeedback
  };
};