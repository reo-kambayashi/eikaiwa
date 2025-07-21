// ============================================================================
// リスニング問題表示コンポーネント
// 問題文と音声再生ボタンを表示
// ============================================================================

import React from 'react';
import PropTypes from 'prop-types';

/**
 * リスニング問題表示コンポーネント
 * @param {Object} props - コンポーネントのプロパティ
 * @param {Object} props.problem - 問題データ
 * @param {boolean} props.isLoading - ローディング状態
 * @param {boolean} props.isSpeechLoading - 音声読み込み状態
 * @param {Function} props.onPlayQuestion - 音声再生ハンドラー
 * @param {boolean} props.showQuestionText - 問題文の表示/非表示
 * @param {Function} props.onToggleQuestionText - 問題文表示切り替えハンドラー
 */
const ListeningProblem = ({
  problem,
  isLoading,
  isSpeechLoading,
  onPlayQuestion,
  showQuestionText = false,
  onToggleQuestionText
}) => {
  // ============================================================================
  // ローディング状態の表示
  // ============================================================================
  if (isLoading) {
    return (
      <div className="listening-problem loading">
        <div className="listening-problem__spinner">
          🔄 問題を読み込み中...
        </div>
      </div>
    );
  }

  // ============================================================================
  // 問題がない場合
  // ============================================================================
  if (!problem) {
    return (
      <div className="listening-problem empty">
        <div className="listening-problem__message">
          問題を取得できませんでした。
        </div>
      </div>
    );
  }

  // ============================================================================
  // メイン表示
  // ============================================================================
  return (
    <div className="listening-problem">
      {/* 問題情報 */}
      <div className="listening-problem__meta">
        <span className="listening-problem__category">
          📂 {problem.category}
        </span>
        <span className="listening-problem__difficulty">
          🎯 {problem.difficulty}
        </span>
      </div>

      {/* 音声再生ボタン */}
      <div className="listening-problem__audio">
        <button
          className={`listening-problem__play-btn ${isSpeechLoading ? 'loading' : ''}`}
          onClick={onPlayQuestion}
          disabled={isSpeechLoading}
          aria-label="問題を音声で再生"
        >
          {isSpeechLoading ? (
            <>🔄 読み込み中...</>
          ) : (
            <>🔊 問題を聞く</>
          )}
        </button>
      </div>

      {/* 問題文表示切り替えボタン */}
      <div className="listening-problem__toggle">
        <button
          className="listening-problem__toggle-btn"
          onClick={onToggleQuestionText}
          aria-label={showQuestionText ? "問題文を隠す" : "問題文を表示"}
        >
          {showQuestionText ? (
            <>👁️ 問題文を隠す</>
          ) : (
            <>👀 問題文を表示</>
          )}
        </button>
      </div>

      {/* 問題文（条件付き表示） */}
      {showQuestionText && (
        <div className="listening-problem__text">
          <h3 className="listening-problem__title">
            Listen and choose the correct answer:
          </h3>
          <div className="listening-problem__question">
            {problem.question}
          </div>
        </div>
      )}

      {/* ヒント */}
      <div className="listening-problem__hint">
        {showQuestionText ? (
          <>💡 問題文を確認して、下から正しい答えを選んでください。</>
        ) : (
          <>💡 音声ボタンを押して問題を聞いてから、下から正しい答えを選んでください。</>
        )}
      </div>
    </div>
  );
};

ListeningProblem.propTypes = {
  problem: PropTypes.shape({
    question: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    difficulty: PropTypes.string.isRequired,
    choices: PropTypes.arrayOf(PropTypes.string).isRequired
  }),
  isLoading: PropTypes.bool.isRequired,
  isSpeechLoading: PropTypes.bool.isRequired,
  onPlayQuestion: PropTypes.func.isRequired,
  showQuestionText: PropTypes.bool,
  onToggleQuestionText: PropTypes.func.isRequired
};

export default ListeningProblem;