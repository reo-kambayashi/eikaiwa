// ============================================================================
// リスニング問題結果表示コンポーネント
// 回答結果とフィードバックを表示
// ============================================================================

import React from 'react';
import PropTypes from 'prop-types';

/**
 * リスニング問題結果表示コンポーネント
 * @param {Object} props - コンポーネントのプロパティ
 * @param {Object} props.feedback - フィードバックデータ
 * @param {boolean} props.isCorrect - 正解かどうか
 * @param {string} props.correctAnswer - 正解
 * @param {Function} props.onNextProblem - 次の問題へのハンドラー
 */
const ListeningResult = ({
  feedback,
  isCorrect,
  correctAnswer,
  onNextProblem
}) => {
  // ============================================================================
  // レンダリング
  // ============================================================================
  return (
    <div className={`listening-result ${isCorrect ? 'correct' : 'incorrect'}`}>
      {/* 結果アイコンとタイトル */}
      <div className="listening-result__header">
        <div className="listening-result__icon">
          {isCorrect ? '🎉' : '😔'}
        </div>
        <h3 className="listening-result__title">
          {isCorrect ? '正解です！' : '不正解です'}
        </h3>
      </div>

      {/* 正解表示 */}
      <div className="listening-result__answer">
        <div className="listening-result__answer-label">
          正解:
        </div>
        <div className="listening-result__answer-text">
          {correctAnswer}
        </div>
      </div>

      {/* フィードバック */}
      {feedback && (
        <div className="listening-result__feedback">
          <div className="listening-result__feedback-section">
            <h4 className="listening-result__feedback-title">
              💬 フィードバック
            </h4>
            <p className="listening-result__feedback-text">
              {feedback.feedback}
            </p>
          </div>

          {feedback.explanation && (
            <div className="listening-result__explanation-section">
              <h4 className="listening-result__explanation-title">
                📝 解説
              </h4>
              <p className="listening-result__explanation-text">
                {feedback.explanation}
              </p>
            </div>
          )}
        </div>
      )}

      {/* アクションボタン */}
      <div className="listening-result__actions">
        <button
          className="listening-result__next-btn"
          onClick={onNextProblem}
          aria-label="次の問題へ進む"
        >
          {isCorrect ? '🎯 次の問題に挑戦' : '🔄 次の問題で頑張ろう'}
        </button>
      </div>

      {/* 励ましメッセージ */}
      <div className="listening-result__encouragement">
        {isCorrect ? (
          <p>素晴らしいです！リスニング力が向上していますね。🌟</p>
        ) : (
          <p>大丈夫です！間違いから学ぶことが成長につながります。💪</p>
        )}
      </div>
    </div>
  );
};

ListeningResult.propTypes = {
  feedback: PropTypes.shape({
    feedback: PropTypes.string.isRequired,
    explanation: PropTypes.string,
    isCorrect: PropTypes.bool.isRequired
  }),
  isCorrect: PropTypes.bool.isRequired,
  correctAnswer: PropTypes.string.isRequired,
  onNextProblem: PropTypes.func.isRequired
};

export default ListeningResult;