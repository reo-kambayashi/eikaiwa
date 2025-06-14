// ============================================================================
// キーボードショートカット管理用カスタムフック
// グローバルキーボードイベントを管理します
// ============================================================================

import { useEffect } from 'react';
import { KEYBOARD_SHORTCUTS } from '../utils/constants';

/**
 * キーボードショートカットを管理するカスタムフック
 * @param {Object} options - ショートカット設定
 * @param {boolean} options.isVoiceInputEnabled - 音声入力が有効かどうか
 * @param {boolean} options.isListening - 音声認識中かどうか
 * @param {boolean} options.isLoading - ローディング状態
 * @param {Function} options.onVoiceInputStart - 音声入力開始ハンドラー
 */
export const useKeyboardShortcuts = ({
  isVoiceInputEnabled,
  isListening,
  isLoading,
  onVoiceInputStart
}) => {

  useEffect(() => {
    /**
     * グローバルキーボードイベントのハンドラー
     * @param {KeyboardEvent} e - キーボードイベント
     */
    const handleGlobalKeyDown = (e) => {
      // スペースバーによる音声入力開始
      if (e.code === 'Space' && isVoiceInputEnabled) {
        // 入力フィールドにフォーカスがある場合はスキップ
        const inputElement = document.querySelector('.input-area input');
        if (document.activeElement === inputElement) {
          return; // 通常のスペースバー入力を許可
        }
        
        // テキストエリアやその他の入力要素にフォーカスがある場合もスキップ
        const activeElement = document.activeElement;
        if (activeElement && (
          activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.contentEditable === 'true'
        )) {
          return;
        }
        
        // ページスクロールを防ぐ
        e.preventDefault();
        
        // 音声入力を開始（リスニング中でない、かつローディング中でない場合）
        if (!isListening && !isLoading && onVoiceInputStart) {
          console.log('Starting voice input via spacebar shortcut');
          onVoiceInputStart();
        }
      }
    };

    // イベントリスナーを追加
    document.addEventListener('keydown', handleGlobalKeyDown);

    // クリーンアップ関数
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [isVoiceInputEnabled, isListening, isLoading, onVoiceInputStart]);

  /**
   * 現在アクティブなショートカット情報を返す
   * @returns {Array} ショートカット情報の配列
   */
  const getActiveShortcuts = () => {
    const shortcuts = [];
    
    if (isVoiceInputEnabled) {
      shortcuts.push({
        key: KEYBOARD_SHORTCUTS.VOICE_INPUT,
        description: 'Start voice input (音声入力開始)',
        condition: !isListening && !isLoading
      });
    }
    
    shortcuts.push({
      key: KEYBOARD_SHORTCUTS.SEND_MESSAGE,
      description: 'Stop voice input & send message (音声停止＆送信)',
      condition: true
    });
    
    return shortcuts;
  };

  return {
    getActiveShortcuts
  };
};
