// ============================================================================
// InstantTranslation設定パネルコンポーネント
// 英検レベル、難易度、カテゴリの選択UI
// ============================================================================

import React, { memo } from 'react';
import PropTypes from 'prop-types';

/**
 * 設定パネルコンポーネント
 * @param {Object} props - コンポーネントのプロパティ
 * @param {boolean} props.showSettings - 設定パネルの表示状態
 * @param {string} props.eikenLevel - 現在の英検レベル
 * @param {string} props.difficulty - 現在の難易度
 * @param {string} props.category - 現在のカテゴリ
 * @param {Function} props.onEikenLevelChange - 英検レベル変更ハンドラー
 * @param {Function} props.onDifficultyChange - 難易度変更ハンドラー
 * @param {Function} props.onCategoryChange - カテゴリ変更ハンドラー
 * @param {Function} props.onApplySettings - 設定適用ハンドラー
 */
const SettingsPanel = ({
  showSettings,
  eikenLevel,
  difficulty,
  category,
  longTextMode,
  onEikenLevelChange,
  onDifficultyChange,
  onCategoryChange,
  onLongTextModeChange,
  onApplySettings
}) => {
  if (!showSettings) return null;

  return (
    <div className="settings-panel">
      <h3>Settings</h3>
      
      <div className="setting-group">
        <label htmlFor="eiken-level-select">Eiken Level:</label>
        <select 
          id="eiken-level-select"
          value={eikenLevel} 
          onChange={onEikenLevelChange}
        >
          <option value="">No Preference</option>
          <option value="5">Eiken Level 5</option>
          <option value="4">Eiken Level 4</option>
          <option value="3">Eiken Level 3</option>
          <option value="pre-2">Eiken Pre-2</option>
          <option value="2">Eiken Level 2</option>
          <option value="pre-1">Eiken Pre-1</option>
          <option value="1">Eiken Level 1</option>
        </select>
      </div>

      <div className="setting-group">
        <label htmlFor="difficulty-select">Difficulty:</label>
        <select 
          id="difficulty-select"
          value={difficulty} 
          onChange={onDifficultyChange}
        >
          <option value="all">All</option>
          <option value="basic">Basic</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      <div className="setting-group">
        <label htmlFor="category-select">Category:</label>
        <select 
          id="category-select"
          value={category} 
          onChange={onCategoryChange}
        >
          <option value="all">All</option>
          <option value="daily_life">Daily Life</option>
          <option value="work">Work</option>
          <option value="travel">Travel</option>
          <option value="education">Education</option>
          <option value="technology">Technology</option>
          <option value="health">Health</option>
          <option value="culture">Culture</option>
          <option value="environment">Environment</option>
        </select>
      </div>

      <div className="setting-group">
        <label htmlFor="long-text-mode-checkbox">
          <input
            type="checkbox"
            id="long-text-mode-checkbox"
            checked={longTextMode}
            onChange={onLongTextModeChange}
          />
          Long Text Mode (複数文)
        </label>
      </div>

      <button 
        className="apply-settings-btn"
        onClick={onApplySettings}
      >
        Apply Settings
      </button>
    </div>
  );
};

SettingsPanel.propTypes = {
  showSettings: PropTypes.bool.isRequired,
  eikenLevel: PropTypes.string.isRequired,
  difficulty: PropTypes.string.isRequired,
  category: PropTypes.string.isRequired,
  longTextMode: PropTypes.bool.isRequired,
  onEikenLevelChange: PropTypes.func.isRequired,
  onDifficultyChange: PropTypes.func.isRequired,
  onCategoryChange: PropTypes.func.isRequired,
  onLongTextModeChange: PropTypes.func.isRequired,
  onApplySettings: PropTypes.func.isRequired
};

export default memo(SettingsPanel);