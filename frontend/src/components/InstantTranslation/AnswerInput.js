// ============================================================================
// 回答入力コンポーネント
// テキスト入力、音声入力、チェック/次へボタンを提供
// ============================================================================

import React, { useRef, useEffect, memo, useCallback } from 'react';
import PropTypes from 'prop-types';

/**
 * 回答入力コンポーネント
 * @param {Object} props - コンポーネントのプロパティ
 * @param {string} props.userAnswer - ユーザーの回答
 * @param {Function} props.onAnswerChange - 回答変更ハンドラー
 * @param {Function} props.onCheckAnswer - 回答チェックハンドラー
 * @param {Function} props.onNextProblem - 次の問題ハンドラー
 * @param {boolean} props.showAnswer - 正解表示状態
 * @param {boolean} props.isVoiceInputEnabled - 音声入力の有効/無効
 * @param {boolean} props.isVoiceSupported - 音声入力サポート状況
 * @param {boolean} props.isListening - 音声入力中フラグ
 * @param {string} props.transcript - 音声認識結果
 * @param {Function} props.onToggleListening - 音声入力切り替えハンドラー
 * @param {Function} props.onClearTranscript - 音声認識結果クリアハンドラー
 */
const AnswerInput = ({
  userAnswer,
  onAnswerChange,
  onCheckAnswer,
  onNextProblem,
  showAnswer,
  isVoiceInputEnabled,
  isVoiceSupported,
  isListening,
  transcript,
  onToggleListening,
  onClearTranscript
}) => {
  const inputRef = useRef(null);

  // 音声認識結果を入力フィールドに反映
  useEffect(() => {
    if (transcript) {
      onAnswerChange({ target: { value: transcript } });
    }
  }, [transcript, onAnswerChange]);

  // 入力フィールドにフォーカス
  const focusInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Enterキーでチェック実行
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      if (showAnswer) {
        onNextProblem();
      } else {
        onCheckAnswer();
      }
    }
  }, [showAnswer, onNextProblem, onCheckAnswer]);

  return (
    <div className="answer-section">
      <div className="input-container">
        <textarea
          ref={inputRef}
          className="answer-input"
          value={userAnswer}
          onChange={onAnswerChange}
          onKeyDown={handleKeyPress}
          placeholder="Please enter your English translation here..."
          rows={4}
          disabled={isListening}
        />
        
        {/* 音声入力ボタン */}
        {isVoiceInputEnabled && isVoiceSupported && (
          <div className="voice-input-controls">
            <button
              className={`voice-btn ${isListening ? 'listening' : ''}`}
              onClick={onToggleListening}
              title={isListening ? 'Stop voice input' : 'Start voice input'}
            >
              {isListening ? '' : ''}
            </button>
            
            {transcript && (
              <button
                className="clear-transcript-btn"
                onClick={() => {
                  onClearTranscript();
                  onAnswerChange({ target: { value: '' } });
                }}
                title="Clear voice input"
              >
                
              </button>
            )}
            
            {isListening && (
              <span className="listening-indicator">Voice input active...</span>
            )}
          </div>
        )}
      </div>

      {/* アクションボタン */}
      <div className="action-buttons">
        {showAnswer ? (
          <button 
            className="next-btn"
            onClick={onNextProblem}
          >
            Next Problem (Ctrl+Enter)
          </button>
        ) : (
          <button 
            className="check-btn"
            onClick={onCheckAnswer}
            disabled={!userAnswer.trim()}
          >
            Check (Ctrl+Enter)
          </button>
        )}
        
        <button 
          className="focus-btn"
          onClick={focusInput}
          title="Focus input field"
        >
          
        </button>
      </div>
    </div>
  );
};

AnswerInput.propTypes = {
  userAnswer: PropTypes.string.isRequired,
  onAnswerChange: PropTypes.func.isRequired,
  onCheckAnswer: PropTypes.func.isRequired,
  onNextProblem: PropTypes.func.isRequired,
  showAnswer: PropTypes.bool.isRequired,
  isVoiceInputEnabled: PropTypes.bool.isRequired,
  isVoiceSupported: PropTypes.bool.isRequired,
  isListening: PropTypes.bool.isRequired,
  transcript: PropTypes.string.isRequired,
  onToggleListening: PropTypes.func.isRequired,
  onClearTranscript: PropTypes.func.isRequired
};

export default memo(AnswerInput);