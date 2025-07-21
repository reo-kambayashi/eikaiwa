// ============================================================================
// リスニング問題モードメインコンポーネント
// Trivia APIを使用したリスニング練習機能
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import './ListeningMode.css';

// カスタムフック
import { useListeningProblem } from '../../hooks/useListeningProblem';
import { useListeningAnswer } from '../../hooks/useListeningAnswer';
import { useVoiceOutput } from '../../hooks/useVoiceOutput';

// 子コンポーネント
import ListeningProblem from './ListeningProblem';
import ListeningAnswer from './ListeningAnswer';
import ListeningSettings from './ListeningSettings';
import ListeningResult from './ListeningResult';

/**
 * リスニング問題モードのメインコンポーネント
 * @param {Object} props - コンポーネントのプロパティ
 * @param {boolean} props.isVoiceOutputEnabled - 音声出力の有効/無効
 * @param {number} props.speakingRate - 読み上げ速度
 * @param {string} props.voiceName - 音声名
 */
const ListeningMode = ({ 
  isVoiceOutputEnabled = true, 
  speakingRate = 1.0,
  voiceName = 'Kore'
}) => {
  // ============================================================================
  // 状態管理
  // ============================================================================
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedChoice, setSelectedChoice] = useState('');
  const [currentCategory, setCurrentCategory] = useState('any');
  const [currentDifficulty, setCurrentDifficulty] = useState('medium');
  const [showSettings, setShowSettings] = useState(false);

  // カスタムフック
  const { 
    currentProblem, 
    isLoading, 
    error,
    fetchNewProblem,
    resetProblem
  } = useListeningProblem();

  const { 
    feedback, 
    isChecking,
    showResult,
    isCorrect,
    checkAnswer,
    resetAnswer
  } = useListeningAnswer();

  const { speak, isSpeechLoading } = useVoiceOutput(
    isVoiceOutputEnabled, 
    speakingRate, 
    voiceName
  );

  // ============================================================================
  // 初期化
  // ============================================================================
  useEffect(() => {
    // コンポーネントマウント時に最初の問題を取得
    fetchNewProblem(currentCategory, currentDifficulty);
  }, [fetchNewProblem, currentCategory, currentDifficulty]);

  // ============================================================================
  // イベントハンドラー
  // ============================================================================

  /**
   * 新しい問題を取得
   */
  const handleNewProblem = useCallback(() => {
    resetAnswer();
    setUserAnswer('');
    setSelectedChoice('');
    fetchNewProblem(currentCategory, currentDifficulty);
  }, [resetAnswer, fetchNewProblem, currentCategory, currentDifficulty]);

  /**
   * 問題を音声で読み上げ
   */
  const handlePlayQuestion = useCallback(() => {
    if (currentProblem && speak) {
      speak(currentProblem.question);
    }
  }, [currentProblem, speak]);

  /**
   * 選択肢の変更
   */
  const handleChoiceChange = useCallback((choice) => {
    setSelectedChoice(choice);
    setUserAnswer(choice);
  }, []);

  /**
   * 回答送信
   */
  const handleSubmitAnswer = useCallback(() => {
    if (!currentProblem || !userAnswer.trim()) {
      console.warn('問題または回答が不足しています');
      return;
    }

    checkAnswer(currentProblem, userAnswer.trim());
  }, [currentProblem, userAnswer, checkAnswer]);

  /**
   * カテゴリ変更
   */
  const handleCategoryChange = useCallback((category) => {
    setCurrentCategory(category);
    setShowSettings(false);
  }, []);

  /**
   * 難易度変更
   */
  const handleDifficultyChange = useCallback((difficulty) => {
    setCurrentDifficulty(difficulty);
    setShowSettings(false);
  }, []);

  // ============================================================================
  // レンダリング
  // ============================================================================
  return (
    <div className="listening-mode">
      <div className="listening-mode__header">
        <h2 className="listening-mode__title">
          🎧 リスニング問題
        </h2>
        <button
          className="listening-mode__settings-btn"
          onClick={() => setShowSettings(!showSettings)}
          aria-label="設定を表示/非表示"
        >
          ⚙️ 設定
        </button>
      </div>

      {/* 設定パネル */}
      {showSettings && (
        <ListeningSettings
          currentCategory={currentCategory}
          currentDifficulty={currentDifficulty}
          onCategoryChange={handleCategoryChange}
          onDifficultyChange={handleDifficultyChange}
          onClose={() => setShowSettings(false)}
        />
      )}

      <div className="listening-mode__content">
        {/* エラー表示 */}
        {error && (
          <div className="listening-mode__error">
            ⚠️ エラー: {error}
          </div>
        )}

        {/* 問題表示 */}
        <ListeningProblem
          problem={currentProblem}
          isLoading={isLoading}
          isSpeechLoading={isSpeechLoading}
          onPlayQuestion={handlePlayQuestion}
        />

        {/* 回答入力 */}
        {currentProblem && !showResult && (
          <ListeningAnswer
            choices={currentProblem.choices}
            selectedChoice={selectedChoice}
            onChoiceChange={handleChoiceChange}
            onSubmit={handleSubmitAnswer}
            isChecking={isChecking}
          />
        )}

        {/* 結果表示 */}
        {showResult && feedback && (
          <ListeningResult
            feedback={feedback}
            isCorrect={isCorrect}
            correctAnswer={currentProblem?.correct_answer}
            onNextProblem={handleNewProblem}
          />
        )}

        {/* 新しい問題ボタン */}
        {!isLoading && !isChecking && (
          <div className="listening-mode__actions">
            <button
              className="listening-mode__new-problem-btn"
              onClick={handleNewProblem}
              disabled={isLoading || isChecking}
            >
              🔄 新しい問題
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

ListeningMode.propTypes = {
  isVoiceOutputEnabled: PropTypes.bool,
  speakingRate: PropTypes.number,
  voiceName: PropTypes.string
};

export default ListeningMode;