// ============================================================================
// テーマ切り替えボタンコンポーネント
// ライト・ダーク・自動モードの切り替えを提供
// ============================================================================

import React, { memo } from 'react';
import PropTypes from 'prop-types';
import './ThemeToggle.css';

/**
 * テーマ切り替えボタンコンポーネント
 * @param {Object} props - コンポーネントプロパティ
 * @param {string} props.themeMode - 現在のテーマモード ('light'|'dark'|'auto')
 * @param {string} props.appliedTheme - 実際に適用されているテーマ ('light'|'dark')
 * @param {Function} props.onThemeChange - テーマ変更ハンドラー
 * @param {string} props.variant - ボタンのスタイル ('icon'|'compact'|'full')
 * @param {boolean} props.showLabel - ラベル表示フラグ
 */
const ThemeToggle = memo(({
  themeMode = 'auto',
  appliedTheme = 'light',
  onThemeChange,
  variant = 'icon',
  showLabel = false
}) => {
  
  /**
   * テーマアイコンを取得
   * @param {string} mode - テーマモード
   * @returns {string} アイコン文字列
   */
  const getThemeIcon = (mode) => {
    switch (mode) {
      case 'light':
        return '☀️';
      case 'dark':
        return '🌙';
      case 'auto':
        return '🌓';
      default:
        return '🌓';
    }
  };

  /**
   * テーマラベルを取得
   * @param {string} mode - テーマモード
   * @returns {string} ラベル文字列
   */
  const getThemeLabel = (mode) => {
    switch (mode) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'auto':
        return 'Auto';
      default:
        return 'Auto';
    }
  };

  /**
   * 次のテーマモードを取得
   * @param {string} currentMode - 現在のモード
   * @returns {string} 次のモード
   */
  const getNextTheme = (currentMode) => {
    switch (currentMode) {
      case 'light':
        return 'dark';
      case 'dark':
        return 'auto';
      case 'auto':
        return 'light';
      default:
        return 'light';
    }
  };

  /**
   * テーマ切り替えハンドラー
   */
  const handleThemeToggle = () => {
    const nextTheme = getNextTheme(themeMode);
    onThemeChange(nextTheme);
  };

  /**
   * キーボードイベントハンドラー
   * @param {KeyboardEvent} e - キーボードイベント
   */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleThemeToggle();
    }
  };

  // アクセシビリティ用の説明テキスト
  const getAriaLabel = () => {
    const current = getThemeLabel(themeMode);
    const next = getThemeLabel(getNextTheme(themeMode));
    return `Current theme: ${current}. Click to switch to ${next} theme.`;
  };

  // バリアント別のクラス名
  const getVariantClass = () => {
    switch (variant) {
      case 'compact':
        return 'theme-toggle-compact';
      case 'full':
        return 'theme-toggle-full';
      case 'icon':
      default:
        return 'theme-toggle-icon';
    }
  };

  return (
    <button
      type="button"
      className={`theme-toggle ${getVariantClass()} ${themeMode}`}
      onClick={handleThemeToggle}
      onKeyDown={handleKeyDown}
      aria-label={getAriaLabel()}
      title={getAriaLabel()}
      data-theme-mode={themeMode}
      data-applied-theme={appliedTheme}
    >
      <span className="theme-icon" role="img" aria-hidden="true">
        {getThemeIcon(themeMode)}
      </span>
      
      {(variant === 'compact' || variant === 'full' || showLabel) && (
        <span className="theme-label">
          {getThemeLabel(themeMode)}
        </span>
      )}
      
      {variant === 'full' && (
        <span className="theme-description">
          {themeMode === 'auto' && `(${appliedTheme})`}
        </span>
      )}
    </button>
  );
});

// コンポーネント名を設定（デバッグ用）
ThemeToggle.displayName = 'ThemeToggle';

// PropTypesの定義
ThemeToggle.propTypes = {
  themeMode: PropTypes.oneOf(['light', 'dark', 'auto']),
  appliedTheme: PropTypes.oneOf(['light', 'dark']),
  onThemeChange: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(['icon', 'compact', 'full']),
  showLabel: PropTypes.bool
};

export default ThemeToggle;