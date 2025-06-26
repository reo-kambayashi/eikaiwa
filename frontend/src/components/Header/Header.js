// ============================================================================
// ヘッダーコンポーネント
// チャットモードと瞬間英作文モードの切り替えメニューを提供します
// ============================================================================

import React from 'react';
import './Header.css';

/**
 * アプリケーションのヘッダーコンポーネント
 * @param {Object} props - コンポーネントのプロパティ
 * @param {string} props.currentMode - 現在のモード ('chat' または 'translation')
 * @param {function} props.onModeChange - モード変更時のコールバック関数
 */
const Header = ({ currentMode, onModeChange }) => {
  /**
   * モード切り替えボタンのクリックハンドラー
   * @param {string} mode - 切り替え先のモード
   */
  const handleModeClick = (mode) => {
    if (onModeChange) {
      onModeChange(mode);
    }
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <h1 className="app-title">English Communication App</h1>
        
        {/* モード切り替えメニュー */}
        <nav className="mode-navigation">
          <button
            className={`mode-button ${currentMode === 'chat' ? 'active' : ''}`}
            onClick={() => handleModeClick('chat')}
            aria-label="Switch to Chat Mode"
          >
            Chat Mode
          </button>
          <button
            className={`mode-button ${currentMode === 'translation' ? 'active' : ''}`}
            onClick={() => handleModeClick('translation')}
            aria-label="Switch to Instant Translation Mode"
          >
            Instant Translation
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;