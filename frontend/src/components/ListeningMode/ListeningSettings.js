// ============================================================================
// リスニング問題設定コンポーネント
// カテゴリと難易度の設定UI
// ============================================================================

import React from 'react';
import PropTypes from 'prop-types';

/**
 * リスニング問題設定コンポーネント
 * @param {Object} props - コンポーネントのプロパティ
 * @param {string} props.currentCategory - 現在のカテゴリ
 * @param {string} props.currentDifficulty - 現在の難易度
 * @param {boolean} props.showQuestionText - 問題文表示設定
 * @param {Function} props.onCategoryChange - カテゴリ変更ハンドラー
 * @param {Function} props.onDifficultyChange - 難易度変更ハンドラー
 * @param {Function} props.onQuestionTextToggle - 問題文表示切り替えハンドラー
 * @param {Function} props.onClose - 設定パネル閉じるハンドラー
 */
const ListeningSettings = ({
  currentCategory,
  currentDifficulty,
  showQuestionText,
  onCategoryChange,
  onDifficultyChange,
  onQuestionTextToggle,
  onClose
}) => {
  // ============================================================================
  // 設定オプション定義
  // ============================================================================
  
  const categories = [
    { value: 'any', label: '🎲 すべて', description: 'ランダムなカテゴリ' },
    { value: 'general', label: '📚 一般知識', description: '一般的な知識問題' },
    { value: 'science', label: '🔬 科学', description: '科学・自然に関する問題' },
    { value: 'history', label: '🏛️ 歴史', description: '世界史・歴史的事実' },
    { value: 'geography', label: '🌍 地理', description: '世界の地理・国々' },
    { value: 'sports', label: '⚽ スポーツ', description: 'スポーツ・競技' },
    { value: 'music', label: '🎵 音楽', description: '音楽・アーティスト' },
    { value: 'film', label: '🎬 映画', description: '映画・エンターテイメント' },
    { value: 'books', label: '📖 文学', description: '本・文学作品' },
    { value: 'art', label: '🎨 芸術', description: '美術・芸術' }
  ];

  const difficulties = [
    { value: 'easy', label: '😊 簡単', description: '基本的な問題' },
    { value: 'medium', label: '😐 普通', description: '中程度の難易度' },
    { value: 'hard', label: '😤 難しい', description: '高難易度の問題' }
  ];

  // ============================================================================
  // イベントハンドラー
  // ============================================================================
  
  const handleCategorySelect = (category) => {
    onCategoryChange(category);
  };

  const handleDifficultySelect = (difficulty) => {
    onDifficultyChange(difficulty);
  };

  // ============================================================================
  // レンダリング
  // ============================================================================
  return (
    <div className="listening-settings">
      <div className="listening-settings__overlay" onClick={onClose}></div>
      
      <div className="listening-settings__panel">
        <div className="listening-settings__header">
          <h3 className="listening-settings__title">
            ⚙️ リスニング問題設定
          </h3>
          <button
            className="listening-settings__close"
            onClick={onClose}
            aria-label="設定を閉じる"
          >
            ✕
          </button>
        </div>

        <div className="listening-settings__content">
          {/* カテゴリ設定 */}
          <div className="listening-settings__section">
            <h4 className="listening-settings__section-title">
              📂 カテゴリ
            </h4>
            <div className="listening-settings__options">
              {categories.map((category) => (
                <button
                  key={category.value}
                  className={`listening-settings__option ${
                    currentCategory === category.value ? 'active' : ''
                  }`}
                  onClick={() => handleCategorySelect(category.value)}
                  aria-pressed={currentCategory === category.value}
                >
                  <div className="listening-settings__option-label">
                    {category.label}
                  </div>
                  <div className="listening-settings__option-desc">
                    {category.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 難易度設定 */}
          <div className="listening-settings__section">
            <h4 className="listening-settings__section-title">
              🎯 難易度
            </h4>
            <div className="listening-settings__options">
              {difficulties.map((difficulty) => (
                <button
                  key={difficulty.value}
                  className={`listening-settings__option ${
                    currentDifficulty === difficulty.value ? 'active' : ''
                  }`}
                  onClick={() => handleDifficultySelect(difficulty.value)}
                  aria-pressed={currentDifficulty === difficulty.value}
                >
                  <div className="listening-settings__option-label">
                    {difficulty.label}
                  </div>
                  <div className="listening-settings__option-desc">
                    {difficulty.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 問題文表示設定 */}
          <div className="listening-settings__section">
            <h4 className="listening-settings__section-title">
              👁️ 表示設定
            </h4>
            <div className="listening-settings__toggle-section">
              <div className="listening-settings__toggle-item">
                <div className="listening-settings__toggle-info">
                  <div className="listening-settings__toggle-label">
                    問題文を表示
                  </div>
                  <div className="listening-settings__toggle-desc">
                    音声と一緒に問題文も表示します
                  </div>
                </div>
                <label className="listening-settings__toggle">
                  <input
                    type="checkbox"
                    checked={showQuestionText}
                    onChange={(e) => onQuestionTextToggle(e.target.checked)}
                  />
                  <span className="listening-settings__toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="listening-settings__footer">
          <p className="listening-settings__note">
            💡 設定を変更すると次の問題から反映されます
          </p>
        </div>
      </div>
    </div>
  );
};

ListeningSettings.propTypes = {
  currentCategory: PropTypes.string.isRequired,
  currentDifficulty: PropTypes.string.isRequired,
  showQuestionText: PropTypes.bool.isRequired,
  onCategoryChange: PropTypes.func.isRequired,
  onDifficultyChange: PropTypes.func.isRequired,
  onQuestionTextToggle: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};

export default ListeningSettings;