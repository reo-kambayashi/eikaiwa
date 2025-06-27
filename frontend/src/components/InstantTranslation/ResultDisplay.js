// ============================================================================
// 結果表示コンポーネント
// 正解の英文とAIフィードバックを表示
// ============================================================================

import React, { memo } from 'react';
import PropTypes from 'prop-types';

/**
 * 結果表示コンポーネント
 * @param {Object} props - コンポーネントのプロパティ
 * @param {boolean} props.showAnswer - 正解表示状態
 * @param {Object} props.currentProblem - 現在の問題データ
 * @param {string} props.feedback - AIフィードバック
 */
const ResultDisplay = ({ showAnswer, currentProblem, feedback }) => {
  if (!showAnswer || !currentProblem) {
    return null;
  }

  return (
    <div className="result-section">
      {/* 正解表示 */}
      <div className="correct-answer">
        <h3>Correct Answer:</h3>
        <p className="english-text">{currentProblem.english}</p>
      </div>

      {/* フィードバック表示 */}
      {feedback && (
        <div className="feedback">
          <h4>Feedback:</h4>
          <p className="feedback-text">{feedback}</p>
        </div>
      )}
    </div>
  );
};

ResultDisplay.propTypes = {
  showAnswer: PropTypes.bool.isRequired,
  currentProblem: PropTypes.shape({
    japanese: PropTypes.string,
    english: PropTypes.string,
    difficulty: PropTypes.string,
    category: PropTypes.string,
    eiken_level: PropTypes.string
  }),
  feedback: PropTypes.string
};

export default memo(ResultDisplay);