// ============================================================================
// テーマ管理カスタムフック
// ダークモード・ライトモードの切り替えとローカルストレージ永続化
// ============================================================================

import { useState, useEffect } from 'react';

/**
 * テーマ管理カスタムフック
 * システム設定、ローカルストレージ、ユーザー選択を考慮してテーマを管理
 * @returns {Object} テーマ状態と操作関数
 */
export const useTheme = () => {
  // システムのダークモード設定を取得
  const getSystemTheme = () => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  // 初期テーマの決定
  const getInitialTheme = () => {
    if (typeof window === 'undefined') return 'light';
    
    // ローカルストレージから設定を読み込み
    const storedTheme = localStorage.getItem('eikaiwa-theme');
    
    if (storedTheme && ['light', 'dark', 'auto'].includes(storedTheme)) {
      return storedTheme;
    }
    
    // デフォルトは自動モード
    return 'auto';
  };

  // テーマ設定の状態
  const [themeMode, setThemeMode] = useState(getInitialTheme);
  
  // 実際に適用されるテーマ（light/dark）
  const [appliedTheme, setAppliedTheme] = useState(() => {
    const initial = getInitialTheme();
    return initial === 'auto' ? getSystemTheme() : initial;
  });

  // システムテーマ変更の監視
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e) => {
      if (themeMode === 'auto') {
        const newTheme = e.matches ? 'dark' : 'light';
        setAppliedTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
      }
    };

    // イベントリスナーの追加
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
    } else {
      // 古いブラウザ対応
      mediaQuery.addListener(handleSystemThemeChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleSystemThemeChange);
      } else {
        mediaQuery.removeListener(handleSystemThemeChange);
      }
    };
  }, [themeMode]);

  // テーマ設定の変更
  useEffect(() => {
    let newAppliedTheme;
    
    if (themeMode === 'auto') {
      newAppliedTheme = getSystemTheme();
    } else {
      newAppliedTheme = themeMode;
    }

    setAppliedTheme(newAppliedTheme);
    
    // DOM要素にテーマ属性を設定
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', newAppliedTheme);
      
      // メタテーマカラーの更新（モバイルブラウザ用）
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', 
          newAppliedTheme === 'dark' ? '#0f172a' : '#ffffff'
        );
      }
    }

    // ローカルストレージに保存
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('eikaiwa-theme', themeMode);
    }
  }, [themeMode]);

  /**
   * テーマモードを設定
   * @param {string} mode - 'light', 'dark', 'auto'のいずれか
   */
  const setTheme = (mode) => {
    if (['light', 'dark', 'auto'].includes(mode)) {
      setThemeMode(mode);
    } else {
      console.warn('Invalid theme mode:', mode);
    }
  };

  /**
   * ダークモードとライトモードを切り替え
   */
  const toggleTheme = () => {
    setThemeMode(prevMode => {
      if (prevMode === 'light') return 'dark';
      if (prevMode === 'dark') return 'light';
      // autoモードの場合は現在のシステム設定と逆にする
      return getSystemTheme() === 'dark' ? 'light' : 'dark';
    });
  };

  /**
   * システム設定に従うかどうかを切り替え
   */
  const toggleAutoMode = () => {
    setThemeMode(prevMode => {
      return prevMode === 'auto' ? appliedTheme : 'auto';
    });
  };

  // デバッグ情報
  const debugInfo = {
    themeMode,
    appliedTheme,
    systemTheme: getSystemTheme(),
    isAutoMode: themeMode === 'auto'
  };

  return {
    // 現在のテーマ設定
    themeMode,          // 'light' | 'dark' | 'auto'
    appliedTheme,       // 'light' | 'dark' (実際に適用されているテーマ)
    
    // テーマの状態判定
    isDark: appliedTheme === 'dark',
    isLight: appliedTheme === 'light',
    isAuto: themeMode === 'auto',
    
    // テーマ操作関数
    setTheme,           // 特定のテーマを設定
    toggleTheme,        // ライト/ダークを切り替え
    toggleAutoMode,     // 自動モードのオン/オフ
    
    // システム情報
    systemTheme: getSystemTheme(),
    
    // デバッグ用
    debugInfo
  };
};