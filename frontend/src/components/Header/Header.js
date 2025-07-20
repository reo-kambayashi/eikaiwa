// ============================================================================
// 改善されたヘッダーコンポーネント
// より直感的なナビゲーションとモード切り替えを提供します
// ============================================================================

import React from 'react';
import './Header.css';

/**
 * アプリケーションのヘッダーコンポーネント（改善版）
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
    if (onModeChange && mode !== currentMode) {
      onModeChange(mode);
    }
  };

  return (
    <header className="app-header">
      <div className="header-container">
        {/* アプリロゴとタイトル */}
        <div className="brand-section">
          <div className="app-logo">🗣️</div>
          <div className="app-title-section">
            <h1 className="app-title">English Communication</h1>
            <p className="app-subtitle">AI-powered conversation practice</p>
          </div>
        </div>
        
        {/* 改善されたモード切り替えメニュー */}
        <nav className="mode-navigation" role="tablist">
          <button
            className={`mode-button ${currentMode === 'chat' ? 'active' : ''}`}
            onClick={() => handleModeClick('chat')}
            aria-label="Switch to Chat Mode - Practice free conversation with AI"
            role="tab"
            aria-selected={currentMode === 'chat'}
          >
            <span className="mode-icon">💬</span>
            <span className="mode-text">
              <span className="mode-title">Chat Mode</span>
              <span className="mode-description">Free conversation</span>
            </span>
          </button>
          
          <button
            className={`mode-button ${currentMode === 'translation' ? 'active' : ''}`}
            onClick={() => handleModeClick('translation')}
            aria-label="Switch to Instant Translation Mode - Practice quick translation exercises"
            role="tab"
            aria-selected={currentMode === 'translation'}
          >
            <span className="mode-icon">⚡</span>
            <span className="mode-text">
              <span className="mode-title">Quick Practice</span>
              <span className="mode-description">Instant translation</span>
            </span>
          </button>
        </nav>

        {/* ヘルプボタン（将来の拡張用） */}
        <div className="header-actions">
          <button 
            className="help-button"
            aria-label="Help"
            title="ヘルプ"
          >
            <span>?</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;