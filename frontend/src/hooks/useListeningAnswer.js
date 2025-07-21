// ============================================================================
// リスニング問題回答チェックカスタムフック
// ユーザーの回答をチェックし、フィードバックを提供
// ============================================================================

import { useState, useCallback } from 'react';
import { checkListeningAnswer } from '../utils/api';

/**
 * リスニング問題回答チェックのカスタムフック
 * @returns {Object} 回答チェック機能と状態
 */
export const useListeningAnswer = () => {
  // ============================================================================
  // 状態管理
  // ============================================================================
  const [feedback, setFeedback] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // ============================================================================
  // 回答チェック
  // ============================================================================
  const checkAnswer = useCallback(async (questionData, userAnswer) => {
    if (!questionData || !userAnswer.trim()) {
      console.warn('⚠️ Invalid question data or empty answer');
      return;
    }

    setIsChecking(true);
    setShowResult(false);

    try {
      console.log('🔍 Checking listening answer:', {
        question: questionData.question,
        userAnswer,
        correctAnswer: questionData.correct_answer
      });

      const result = await checkListeningAnswer({
        question: questionData.question,
        user_answer: userAnswer,
        correct_answer: questionData.correct_answer,
        choices: questionData.choices
      });

      if (result) {
        setIsCorrect(result.is_correct);
        setFeedback({
          feedback: result.feedback,
          explanation: result.explanation,
          isCorrect: result.is_correct
        });
        setShowResult(true);
        
        console.log('✅ Answer check completed:', result);
      } else {
        throw new Error('No response from answer check API');
      }
    } catch (err) {
      console.error('❌ Error checking answer:', err);
      
      // フォールバックフィードバック
      const correct = userAnswer.trim().toLowerCase() === questionData.correct_answer.toLowerCase();
      setIsCorrect(correct);
      setFeedback({
        feedback: correct ? '正解です！' : `不正解です。正解は「${questionData.correct_answer}」でした。`,
        explanation: 'システムエラーが発生しましたが、基本的な判定を行いました。',
        isCorrect: correct
      });
      setShowResult(true);
    } finally {
      setIsChecking(false);
    }
  }, []);

  // ============================================================================
  // 結果のリセット
  // ============================================================================
  const resetAnswer = useCallback(() => {
    setFeedback(null);
    setShowResult(false);
    setIsCorrect(false);
  }, []);

  // ============================================================================
  // 戻り値
  // ============================================================================
  return {
    feedback,
    isChecking,
    showResult,
    isCorrect,
    checkAnswer,
    resetAnswer
  };
};