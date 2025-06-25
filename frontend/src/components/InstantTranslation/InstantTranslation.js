// ============================================================================
// 瞬間英作文モードコンポーネント
// 日本語の文章を英語に瞬間翻訳する練習モード
// ============================================================================

import React, { useState, useRef, useEffect } from 'react';
import './InstantTranslation.css';
import { useVoiceInput } from '../../hooks/useVoiceInput';

/**
 * 瞬間英作文モードのメインコンポーネント
 * @param {Object} props - コンポーネントのプロパティ
 * @param {boolean} props.isVoiceOutputEnabled - 音声出力の有効/無効
 * @param {function} props.speak - 音声読み上げ関数
 * @param {boolean} props.isVoiceInputEnabled - 音声入力の有効/無効
 * @param {boolean} props.isVoiceSupported - 音声入力サポート状況
 * @param {number} props.voiceInputTimeout - 音声入力のタイムアウト
 */
const InstantTranslation = ({ 
  isVoiceOutputEnabled, 
  speak, 
  isVoiceInputEnabled, 
  isVoiceSupported, 
  voiceInputTimeout 
}) => {
  // ============================================================================
  // 状態管理
  // ============================================================================
  
  const [currentProblem, setCurrentProblem] = useState(null); // 現在の問題
  const [userAnswer, setUserAnswer] = useState(''); // ユーザーの回答
  const [showAnswer, setShowAnswer] = useState(false); // 正解表示フラグ
  const [feedback, setFeedback] = useState(''); // フィードバック
  const [isLoading, setIsLoading] = useState(false); // ローディング状態
  const [problemHistory, setProblemHistory] = useState([]); // 問題履歴
  const [score, setScore] = useState({ correct: 0, total: 0 }); // スコア

  const inputRef = useRef(null);

  // 音声入力機能
  const {
    isListening,
    transcript,
    toggleListening,
    clearTranscript
  } = useVoiceInput(voiceInputTimeout);

  // ============================================================================
  // 新しい問題を取得する関数
  // ============================================================================
  
  /**
   * 新しい瞬間英作文の問題を取得
   */
  const fetchNewProblem = async () => {
    setIsLoading(true);
    setShowAnswer(false);
    setUserAnswer('');
    setFeedback('');
    
    // 音声入力をクリア
    if (isListening) {
      clearTranscript();
    }

    try {
      const response = await fetch('http://localhost:8000/api/instant-translation/problem');
      
      if (!response.ok) {
        throw new Error('問題の取得に失敗しました');
      }

      const data = await response.json();
      setCurrentProblem(data);
      
      // 瞬間英作文モードでは音声読み上げを無効化
      // if (isVoiceOutputEnabled && speak && data.japanese) {
      //   speak(data.japanese);
      // }
      
    } catch (error) {
      console.error('Error fetching problem:', error);
      setFeedback('問題の取得でエラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================================
  // 回答チェック機能
  // ============================================================================
  
  /**
   * ユーザーの回答をチェック
   */
  const checkAnswer = async () => {
    if (!userAnswer.trim() || !currentProblem) {
      setFeedback('回答を入力してください。');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/instant-translation/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          japanese: currentProblem.japanese,
          correctAnswer: currentProblem.english,
          userAnswer: userAnswer
        })
      });

      if (!response.ok) {
        throw new Error('回答チェックに失敗しました');
      }

      const result = await response.json();
      
      // スコア更新
      setScore(prev => ({
        correct: prev.correct + (result.isCorrect ? 1 : 0),
        total: prev.total + 1
      }));

      // 問題履歴に追加
      setProblemHistory(prev => [...prev, {
        japanese: currentProblem.japanese,
        correctAnswer: currentProblem.english,
        userAnswer: userAnswer,
        isCorrect: result.isCorrect,
        feedback: result.feedback,
        timestamp: new Date().toISOString()
      }]);

      setFeedback(result.feedback);
      setShowAnswer(true);

      // 瞬間英作文モードでは音声読み上げを無効化
      // if (isVoiceOutputEnabled && speak) {
      //   setTimeout(() => {
      //     speak(result.isCorrect ? '正解です！' : '不正解です。');
      //   }, 500);
      // }

    } catch (error) {
      console.error('Error checking answer:', error);
      setFeedback('回答チェックでエラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================================
  // イベントハンドラー
  // ============================================================================
  
  /**
   * 入力フィールドのEnterキー処理
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      if (showAnswer) {
        fetchNewProblem();
      } else {
        checkAnswer();
      }
    }
  };

  /**
   * 音声入力の切り替え処理
   */
  const handleVoiceToggle = () => {
    const success = toggleListening();
    
    if (!success) {
      console.error('Failed to toggle voice input');
    }
  };

  /**
   * 入力値の変更処理
   */
  const handleInputChange = (e) => {
    setUserAnswer(e.target.value);
  };

  /**
   * 正解を音声で読み上げ（瞬間英作文モードでは無効化）
   */
  const speakCorrectAnswer = () => {
    // 瞬間英作文モードでは音声読み上げを無効化
    // if (isVoiceOutputEnabled && speak && currentProblem?.english) {
    //   speak(currentProblem.english);
    // }
  };

  // ============================================================================
  // 初期化
  // ============================================================================
  
  useEffect(() => {
    fetchNewProblem();
  }, []);

  // フォーカス管理
  useEffect(() => {
    if (inputRef.current && !showAnswer) {
      inputRef.current.focus();
    }
  }, [currentProblem, showAnswer]);

  // 音声認識結果の入力への反映
  useEffect(() => {
    if (isListening && transcript) {
      setUserAnswer(transcript);
    }
  }, [transcript, isListening]);

  // ============================================================================
  // UIレンダリング
  // ============================================================================
  
  return (
    <div className="instant-translation">
      {/* ヘッダー部分 */}
      <div className="translation-header">
        <h2>瞬間英作文モード</h2>
        <div className="score-display">
          正解率: {score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}% 
          ({score.correct}/{score.total})
        </div>
      </div>

      {/* 問題表示エリア */}
      <div className="problem-area">
        {isLoading && !currentProblem ? (
          <div className="loading">問題を読み込み中...</div>
        ) : currentProblem ? (
          <>
            <div className="japanese-text">
              <h3>次の日本語を英語に翻訳してください：</h3>
              <p className="problem-text">{currentProblem.japanese}</p>
            </div>

            {/* 入力エリア */}
            <div className="answer-area">
              <div className="input-container">
                <textarea
                  ref={inputRef}
                  value={userAnswer}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="英語で回答してください..."
                  disabled={isLoading || showAnswer}
                  className={`answer-input ${isListening ? 'listening' : ''}`}
                  rows="3"
                />
                
                {/* 音声入力ボタン */}
                {isVoiceInputEnabled && isVoiceSupported && (
                  <button
                    onClick={handleVoiceToggle}
                    disabled={isLoading || showAnswer}
                    className={`voice-button ${isListening ? 'listening' : ''}`}
                    title={isListening ? '音声入力を停止' : '音声入力を開始'}
                  >
                    {isListening ? '🛑' : '🎤'}
                    {isListening && <span className="listening-indicator">●</span>}
                  </button>
                )}
              </div>
              
              <div className="button-group">
                {!showAnswer ? (
                  <button
                    onClick={checkAnswer}
                    disabled={isLoading || !userAnswer.trim()}
                    className="check-button"
                  >
                    {isLoading ? '採点中...' : '回答をチェック'}
                  </button>
                ) : (
                  <button
                    onClick={fetchNewProblem}
                    disabled={isLoading}
                    className="next-button"
                  >
                    {isLoading ? '準備中...' : '次の問題'}
                  </button>
                )}
              </div>
            </div>

            {/* 結果表示エリア */}
            {showAnswer && (
              <div className="result-area">
                <div className="correct-answer">
                  <h4>正解:</h4>
                  <p className="answer-text">{currentProblem.english}</p>
                  {/* 瞬間英作文モードでは音声ボタンを非表示 */}
                  {/* {isVoiceOutputEnabled && (
                    <button
                      onClick={speakCorrectAnswer}
                      className="speak-button"
                      title="正解を読み上げ"
                    >
                      🔊
                    </button>
                  )} */}
                </div>
                
                {feedback && (
                  <div className="feedback">
                    <h4>フィードバック:</h4>
                    <p>{feedback}</p>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="error">問題の読み込みに失敗しました。</div>
        )}
      </div>

      {/* 使い方のヒント */}
      <div className="hints">
        <h4>💡 使い方のヒント:</h4>
        <ul>
          <li>Enterキーで回答チェック、または次の問題に進みます</li>
          <li>🎤ボタンで音声入力が可能です（英語で回答してください）</li>
          <li>完璧な翻訳でなくても、意味が通じれば正解です</li>
          <li>瞬間英作文モードでは、集中力向上のため音声読み上げは無効になっています</li>
        </ul>
      </div>
    </div>
  );
};

export default InstantTranslation;