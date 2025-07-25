// ============================================================================
// 問題表示コンポーネント
// 日本語問題文とレベル・カテゴリバッジを表示
// ============================================================================

import React, { memo } from 'react';
import PropTypes from 'prop-types';

/**
 * 問題表示コンポーネント
 * @param {Object} props - コンポーネントのプロパティ
 * @param {Object} props.currentProblem - 現在の問題データ
 * @param {boolean} props.isLoading - ローディング状態
 */
const ProblemDisplay = ({ currentProblem, isLoading }) => {
  if (isLoading) {
    return (
      <div className="problem-section">
        <div className="loading">
          <p>Loading new problem...</p>
        </div>
      </div>
    );
  }

  if (!currentProblem) {
    return (
      <div className="problem-section">
        <p className="no-problem">Press the "New Problem" button to load a problem.</p>
      </div>
    );
  }

  return (
    <div className="problem-section">
      <h5 className="instruction-text">Translate the following Japanese to English:</h5>
      
      <div className="problem-content">
        <h2 className="japanese-text">{currentProblem.japanese}</h2>
      </div>
    </div>
  );
};


ProblemDisplay.propTypes = {
  currentProblem: PropTypes.shape({
    japanese: PropTypes.string,
    english: PropTypes.string,
    difficulty: PropTypes.string,
    category: PropTypes.string,
    eiken_level: PropTypes.string
  }),
  isLoading: PropTypes.bool.isRequired
};

export default memo(ProblemDisplay);