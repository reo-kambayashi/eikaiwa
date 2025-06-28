// ============================================================================
// 瞬間英作文モードコンポーネント
// 日本語の文章を英語に瞬間翻訳する練習モード
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import './InstantTranslation.css';

// カスタムフック
import { useVoiceInput } from '../../hooks/useVoiceInput';
import { useProblemManager } from '../../hooks/useProblemManager';
import { useAnswerChecker } from '../../hooks/useAnswerChecker';
import { useInstantTranslationSettings } from '../../hooks/useInstantTranslationSettings';

// 子コンポーネント
import SettingsPanel from './SettingsPanel';
import ProblemDisplay from './ProblemDisplay';
import AnswerInput from './AnswerInput';
import ResultDisplay from './ResultDisplay';

/**
 * 瞬間英作文モードのメインコンポーネント
 * @param {Object} props - コンポーネントのプロパティ
 * @param {boolean} props.isVoiceOutputEnabled - 瞬間英作文モード用音声出力の有効/無効
 * @param {boolean} props.isVoiceOutputEnabledForChat - チャットモード用音声出力の有効/無効（参考値）
 * @param {Function} props.toggleTranslationVoiceOutput - 瞬間英作文モード音声出力切り替え関数
 * @param {Function} props.speak - 音声読み上げ関数
 * @param {boolean} props.isVoiceInputEnabled - 音声入力の有効/無効
 * @param {boolean} props.isVoiceSupported - 音声入力サポート状況
 * @param {number} props.voiceInputTimeout - 音声入力のタイムアウト
 */
const InstantTranslation = ({ 
  isVoiceOutputEnabled, 
  isVoiceOutputEnabledForChat,
  toggleTranslationVoiceOutput,
  speak, 
  isVoiceInputEnabled, 
  isVoiceSupported, 
  voiceInputTimeout 
}) => {
  // ============================================================================
  // 状態管理
  // ============================================================================
  const [userAnswer, setUserAnswer] = useState('');

  // カスタムフック
  const { 
    currentProblem, 
    isLoading, 
    fetchNewProblem 
  } = useProblemManager(speak, isVoiceOutputEnabled);

  const { 
    feedback, 
    showAnswer, 
    checkAnswer, 
    resetAnswer 
  } = useAnswerChecker(speak, isVoiceOutputEnabled);

  const {
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
    toggleSettings
  } = useInstantTranslationSettings(fetchNewProblem);

  const {
    isListening,
    transcript,
    toggleListening,
    clearTranscript
  } = useVoiceInput(voiceInputTimeout);

  // ============================================================================
  // イベントハンドラー
  // ============================================================================

  /**
   * ユーザー回答の変更ハンドラー
   */
  const handleAnswerChange = useCallback((e) => {
    setUserAnswer(e.target.value);
  }, []);

  /**
   * 回答チェックハンドラー
   */
  const handleCheckAnswer = useCallback(() => {
    if (userAnswer.trim() && currentProblem) {
      checkAnswer(userAnswer, currentProblem);
    }
  }, [userAnswer, currentProblem, checkAnswer]);

  /**
   * 次の問題ハンドラー
   */
  const handleNextProblem = useCallback(() => {
    setUserAnswer('');
    resetAnswer();
    clearTranscript();
    fetchNewProblem(difficulty, category, eikenLevel, longTextMode);
  }, [resetAnswer, clearTranscript, fetchNewProblem, difficulty, category, eikenLevel, longTextMode]);

  /**
   * 新しい問題を開始
   */
  const handleStartNewProblem = useCallback(() => {
    fetchNewProblem(difficulty, category, eikenLevel, longTextMode);
  }, [fetchNewProblem, difficulty, category, eikenLevel, longTextMode]);

  // ============================================================================
  // 初期化
  // ============================================================================
  useEffect(() => {
    // コンポーネントマウント時に最初の問題を取得
    fetchNewProblem();
  }, [fetchNewProblem]);

  // ============================================================================
  // レンダリング
  // ============================================================================
  return (
    <div className="instant-translation-container">
      {/* 左側：設定パネル (20%) */}
      <div className="translation-settings-sidebar">
        <div className="translation-header">
          <h3 className="section-title">設定</h3>
        </div>
        <SettingsPanel
          showSettings={true}  // 常に表示
          eikenLevel={eikenLevel}
          difficulty={difficulty}
          category={category}
          longTextMode={longTextMode}
          onEikenLevelChange={handleEikenLevelChange}
          onDifficultyChange={handleDifficultyChange}
          onCategoryChange={handleCategoryChange}
          onLongTextModeChange={handleLongTextModeChange}
          onApplySettings={applySettings}
        />
        <div className="translation-controls">
          <button 
            className={`voice-output-btn ${isVoiceOutputEnabled ? 'enabled' : 'disabled'}`}
            onClick={() => toggleTranslationVoiceOutput(!isVoiceOutputEnabled)}
            title={isVoiceOutputEnabled ? '音声出力をオフにする' : '音声出力をオンにする'}
          >
            {isVoiceOutputEnabled ? '🔊' : '🔇'} 音声出力
          </button>
          <button 
            className="new-problem-btn"
            onClick={handleStartNewProblem}
            disabled={isLoading}
          >
            新しい問題
          </button>
        </div>
      </div>

      {/* 右側：問題表示と回答入力 (80%) */}
      <div className="translation-main-content">
        <div className="translation-header">
          <h3 className="section-title">瞬間英作文</h3>
        </div>
        <div className="translation-content">
          {/* 問題表示エリア */}
          <div className="problem-area">
            <ProblemDisplay
              currentProblem={currentProblem}
              isLoading={isLoading}
            />
          </div>
          
          {/* 回答入力エリア */}
          <div className="answer-area">
            <AnswerInput
              userAnswer={userAnswer}
              onAnswerChange={handleAnswerChange}
              onCheckAnswer={handleCheckAnswer}
              onNextProblem={handleNextProblem}
              showAnswer={showAnswer}
              isVoiceInputEnabled={isVoiceInputEnabled}
              isVoiceSupported={isVoiceSupported}
              isListening={isListening}
              transcript={transcript}
              onToggleListening={toggleListening}
              onClearTranscript={clearTranscript}
            />
          </div>

          {/* 結果表示エリア */}
          <div className="result-area">
            <ResultDisplay
              showAnswer={showAnswer}
              currentProblem={currentProblem}
              feedback={feedback}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

InstantTranslation.propTypes = {
  isVoiceOutputEnabled: PropTypes.bool.isRequired,
  isVoiceOutputEnabledForChat: PropTypes.bool.isRequired,
  toggleTranslationVoiceOutput: PropTypes.func.isRequired,
  speak: PropTypes.func.isRequired,
  isVoiceInputEnabled: PropTypes.bool.isRequired,
  isVoiceSupported: PropTypes.bool.isRequired,
  voiceInputTimeout: PropTypes.number.isRequired
};

export default InstantTranslation;