// ============================================================================
// 音声出力機能用カスタムフック
// Text-to-Speech機能を管理します（Google TTS + ブラウザTTSフォールバック）
// ============================================================================

import { useCallback } from 'react';
import { convertTextToSpeech, fallbackTextToSpeech } from '../utils/api';

/**
 * 音声出力機能を管理するカスタムフック
 * @param {boolean} isEnabled - 音声出力が有効かどうか
 * @param {number} speakingRate - 読み上げ速度（0.5〜2.0の範囲）
 * @returns {Object} 音声出力関数
 */
export const useVoiceOutput = (isEnabled, speakingRate = 1.0) => {

  /**
   * テキストを音声で再生する関数
   * Google Cloud TTSを優先し、失敗時はブラウザ内蔵TTSにフォールバック
   * @param {string} text - 音声にするテキスト
   * @returns {Promise<boolean>} 音声再生の成功/失敗
   */
  const speak = useCallback(async (text) => {
    // 音声出力が無効の場合は何もしない
    if (!isEnabled) {
      console.log('Voice output is disabled, skipping TTS');
      return false;
    }

    // 空のテキストは音声にしない
    if (!text || text.trim() === '') {
      console.log('Empty text provided, skipping TTS');
      return false;
    }

    try {
      console.log('Attempting to speak text:', text.substring(0, 50) + '...', 'at rate:', speakingRate);
      
      // Google Cloud TTSを試行（読み上げ速度を含める）
      const audioElement = await convertTextToSpeech(text, speakingRate);
      
      if (audioElement) {
        // Google TTSが成功した場合
        console.log('Using Google Cloud TTS');
        
        return new Promise((resolve) => {
          audioElement.onended = () => {
            console.log('Google TTS playback completed');
            resolve(true);
          };
          
          audioElement.onerror = (error) => {
            console.error('Google TTS playback error:', error);
            // フォールバックを実行
            console.log('Falling back to browser TTS');
            fallbackTextToSpeech(text);
            resolve(false);
          };
          
          audioElement.play();
        });
      } else {
        // Google TTSが失敗した場合はブラウザTTSにフォールバック
        console.log('Google TTS failed, using browser TTS fallback');
        fallbackTextToSpeech(text, speakingRate);
        return true; // ブラウザTTSは同期的なので即座にtrueを返す
      }
      
    } catch (error) {
      console.error('TTS Error:', error);
      
      // 全てが失敗した場合もブラウザTTSを試行
      console.log('All TTS methods failed, attempting final browser TTS fallback');
      fallbackTextToSpeech(text, speakingRate);
      return false;
    }
  }, [isEnabled, speakingRate]);

  /**
   * 音声出力が利用可能かチェックする関数
   * @returns {boolean} 音声出力が利用可能かどうか
   */
  const isAvailable = useCallback(() => {
    // 最低限ブラウザTTSがサポートされているかチェック
    return 'speechSynthesis' in window;
  }, []);

  /**
   * 現在再生中の音声を停止する関数
   */
  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      console.log('Stopped current speech synthesis');
    }
  }, []);

  /**
   * 音声が現在再生中かチェックする関数
   * @returns {boolean} 音声が再生中かどうか
   */
  const isSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      return speechSynthesis.speaking;
    }
    return false;
  }, []);

  return {
    // 主要機能
    speak,
    
    // 制御機能
    stopSpeaking,
    
    // 状態確認
    isAvailable: isAvailable(),
    isSpeaking,
    isEnabled
  };
};
