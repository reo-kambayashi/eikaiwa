// ============================================================================
// リスニング問題回答入力コンポーネント
// 多肢選択式の回答UIを提供
// ============================================================================

import React from 'react';
import PropTypes from 'prop-types';

/**
 * リスニング問題回答入力コンポーネント
 * @param {Object} props - コンポーネントのプロパティ
 * @param {Array} props.choices - 選択肢配列
 * @param {string} props.selectedChoice - 選択された回答
 * @param {Function} props.onChoiceChange - 選択肢変更ハンドラー
 * @param {Function} props.onSubmit - 回答送信ハンドラー
 * @param {boolean} props.isChecking - チェック中状態
 */
const ListeningAnswer = ({
  choices,
  selectedChoice,
  onChoiceChange,
  onSubmit,
  isChecking
}) => {
  // ============================================================================
  // イベントハンドラー
  // ============================================================================
  
  /**
   * 回答送信処理
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedChoice && !isChecking) {
      onSubmit();
    }
  };

  /**
   * 選択肢クリック処理
   */
  const handleChoiceClick = (choice) => {
    if (!isChecking) {
      onChoiceChange(choice);
    }
  };

  /**
   * キーボード操作対応
   */
  const handleKeyDown = (e, choice) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleChoiceClick(choice);
    }
  };

  // ============================================================================
  // レンダリング
  // ============================================================================
  return (
    <div className="listening-answer">
      <h3 className="listening-answer__title">
        選択肢から正しい答えを選んでください：
      </h3>
      
      {/* 選択肢リスト */}
      <div className="listening-answer__choices">
        {choices.map((choice, index) => (
          <div
            key={`choice-${index}`}
            className={`listening-answer__choice ${
              selectedChoice === choice ? 'selected' : ''
            } ${isChecking ? 'disabled' : ''}`}
            onClick={() => handleChoiceClick(choice)}
            onKeyDown={(e) => handleKeyDown(e, choice)}
            tabIndex={isChecking ? -1 : 0}
            role="button"
            aria-pressed={selectedChoice === choice}
            aria-label={`選択肢 ${index + 1}: ${choice}`}
          >
            <div className="listening-answer__choice-marker">
              {String.fromCharCode(65 + index)}
            </div>
            <div className="listening-answer__choice-text">
              {choice}
            </div>
            {selectedChoice === choice && (
              <div className="listening-answer__choice-check">
                ✓
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 送信ボタン */}
      <form onSubmit={handleSubmit} className="listening-answer__form">
        <button
          type="submit"
          className={`listening-answer__submit ${
            !selectedChoice || isChecking ? 'disabled' : ''
          }`}
          disabled={!selectedChoice || isChecking}
          aria-label="回答を送信"
        >
          {isChecking ? (
            <>🔄 チェック中...</>
          ) : (
            <>✓ 回答する</>
          )}
        </button>
      </form>

      {/* ヒント */}
      <div className="listening-answer__hint">
        💡 選択肢をクリックして選択してから、「回答する」ボタンを押してください。
      </div>
    </div>
  );
};

ListeningAnswer.propTypes = {
  choices: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedChoice: PropTypes.string.isRequired,
  onChoiceChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isChecking: PropTypes.bool.isRequired
};

export default ListeningAnswer;