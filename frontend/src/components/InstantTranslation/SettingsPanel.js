// ============================================================================
// InstantTranslation設定パネルコンポーネント
// 英検レベルと長文モードの選択UI
// ============================================================================

import React, { memo } from 'react';
import PropTypes from 'prop-types';

/**
 * 設定パネルコンポーネント
 * @param {Object} props - コンポーネントのプロパティ
 * @param {boolean} props.showSettings - 設定パネルの表示状態
 * @param {string} props.eikenLevel - 現在の英検レベル
 * @param {Function} props.onEikenLevelChange - 英検レベル変更ハンドラー
 * @param {Function} props.onApplySettings - 設定適用ハンドラー
 */
const SettingsPanel = ({
  showSettings,
  eikenLevel,
  longTextMode,
  onEikenLevelChange,
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
  longTextMode: PropTypes.bool.isRequired,
  onEikenLevelChange: PropTypes.func.isRequired,
  onLongTextModeChange: PropTypes.func.isRequired,
  onApplySettings: PropTypes.func.isRequired
};

export default memo(SettingsPanel);