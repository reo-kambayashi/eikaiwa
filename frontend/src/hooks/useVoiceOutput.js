// ============================================================================
// 音声出力機能用カスタムフック
// Text-to-Speech機能を管理します（Google TTS + ブラウザTTSフォールバック）
// ============================================================================

import { useCallback, useState } from 'react';
import { convertTextToSpeech, fallbackTextToSpeech } from '../utils/api';

/**
 * 音声出力機能を管理するカスタムフック
 * @param {boolean} isEnabled - 音声出力が有効かどうか
 * @param {number} speakingRate - 読み上げ速度（0.5〜2.0の範囲）
 * @param {string} voiceName - 使用する音声名（Gemini TTS用）
 * @returns {Object} 音声出力関数
 */
export const useVoiceOutput = (isEnabled, speakingRate = 1.0, voiceName = "Kore") => {
  const [isSpeechLoading, setIsSpeechLoading] = useState(false);

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

    // 基本的な型チェック（詳細なチェックはapi.jsで実行）
    if (!text || typeof text !== 'string' || !text.trim()) {
      console.log('Invalid text provided for TTS:', typeof text, text?.substring(0, 50));
      return false;
    }

    setIsSpeechLoading(true);

    try {
      console.log('🎵 Attempting to speak text:', text.substring(0, 50) + '...', 'at rate:', speakingRate, 'voice:', voiceName);
      
      // Gemini TTSを試行（読み上げ速度と音声名を含める）
      const audioElement = await convertTextToSpeech(text, speakingRate, voiceName);
      
      if (audioElement) {
        // Gemini TTSが成功した場合
        console.log('Using Gemini 2.5 Flash Preview TTS');
        
        return new Promise((resolve) => {
          let hasResolved = false;
          
          // タイムアウトを設定（音声の読み込みが失敗する場合）
          const timeoutId = setTimeout(() => {
            if (!hasResolved) {
              console.warn('⏰ Audio loading timeout, falling back to browser TTS');
              hasResolved = true;
              fallbackTextToSpeech(text, speakingRate);
              setIsSpeechLoading(false);
              resolve(false);
            }
          }, 10000); // 10秒のタイムアウト
          
          // 音声データの読み込み完了を待つ
          audioElement.addEventListener('loadeddata', () => {
            console.log('✅ Audio data loaded, ready to play');
          });
          
          audioElement.addEventListener('canplaythrough', () => {
            console.log('✅ Audio can play through without buffering');
          });
          
          audioElement.onended = () => {
            if (!hasResolved) {
              console.log('Gemini TTS playback completed');
              clearTimeout(timeoutId);
              hasResolved = true;
              setIsSpeechLoading(false);
              resolve(true);
            }
          };
          
          audioElement.onerror = (error) => {
            if (!hasResolved) {
              console.error('🚨 Google TTS playback error:', error);
              console.error('Audio element error details:', {
                error: audioElement.error,
                src: audioElement.src,
                readyState: audioElement.readyState,
                networkState: audioElement.networkState
              });
              
              // フォールバックを実行
              console.log('Falling back to browser TTS');
              clearTimeout(timeoutId);
              hasResolved = true;
              fallbackTextToSpeech(text, speakingRate);
              setIsSpeechLoading(false);
              resolve(false);
            }
          };
          
          // 音声再生を開始
          audioElement.play().catch(playError => {
            if (!hasResolved) {
              console.error('❌ Failed to play audio:', playError);
              console.error('Play error details:', {
                name: playError.name,
                message: playError.message,
                audioSrc: audioElement.src?.substring(0, 100),
                readyState: audioElement.readyState,
                networkState: audioElement.networkState
              });
              
              // フォールバックを実行
              console.log('Audio play failed, falling back to browser TTS');
              clearTimeout(timeoutId);
              hasResolved = true;
              fallbackTextToSpeech(text, speakingRate);
              setIsSpeechLoading(false);
              resolve(false);
            }
          });
        });
      } else {
        // Google TTSが失敗した場合はブラウザTTSにフォールバック
        console.log('Google TTS failed, using browser TTS fallback');
        const success = await fallbackTextToSpeech(text, speakingRate);
        setIsSpeechLoading(false);
        return success;
      }
      
    } catch (error) {
      console.error('❌ TTS Error:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack?.substring(0, 500),
        isAppError: error instanceof Error
      });
      
      // 全てが失敗した場合もブラウザTTSを試行
      console.log('🔄 All TTS methods failed, attempting final browser TTS fallback');
      try {
        const success = await fallbackTextToSpeech(text, speakingRate);
        setIsSpeechLoading(false);
        if (!success) {
          console.error('❌ Final fallback TTS also failed');
        }
        return success;
      } catch (fallbackError) {
        console.error('❌ Final fallback TTS exception:', fallbackError);
        setIsSpeechLoading(false);
        return false;
      }
    }
  }, [isEnabled, speakingRate, voiceName]);

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
    isSpeechLoading,
    isEnabled
  };
};
