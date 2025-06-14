// ============================================================================
// 音声入力機能用カスタムフック
// Web Speech API を使用した音声認識機能を管理します
// ============================================================================

import { useState, useRef, useEffect, useCallback } from 'react';
import { SPEECH_RECOGNITION_CONFIG, UI_MESSAGES } from '../utils/constants';

/**
 * 音声入力機能を管理するカスタムフック
 * @returns {Object} 音声入力の状態と制御関数
 */
export const useVoiceInput = () => {
  // 音声認識の状態管理
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  // 音声認識オブジェクトの参照
  const recognitionRef = useRef(null);

  /**
   * 音声認識の初期化
   * ブラウザが音声認識をサポートしているかチェックし、設定を行います
   */
  useEffect(() => {
    // ブラウザサポートチェック
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported in this browser');
      return;
    }

    // 音声認識オブジェクトの作成と設定
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = SPEECH_RECOGNITION_CONFIG.CONTINUOUS;
    recognitionRef.current.interimResults = SPEECH_RECOGNITION_CONFIG.INTERIM_RESULTS;
    recognitionRef.current.lang = SPEECH_RECOGNITION_CONFIG.LANGUAGE;

    // 音声認識結果のハンドリング
    recognitionRef.current.onresult = (event) => {
      // 音声認識結果を文字列に変換
      const currentTranscript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');

      setTranscript(currentTranscript);

      // 最終結果の場合はリスニング状態を終了
      if (event.results[event.results.length - 1].isFinal) {
        console.log('Final transcript:', currentTranscript);
        setIsListening(false);
      }
    };

    // エラーハンドリング
    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      
      // エラータイプ別の処理
      switch (event.error) {
        case 'no-speech':
          console.log(UI_MESSAGES.ERRORS.NO_SPEECH);
          break;
        case 'audio-capture':
          alert(UI_MESSAGES.ERRORS.AUDIO_CAPTURE);
          break;
        case 'not-allowed':
          alert(UI_MESSAGES.ERRORS.NOT_ALLOWED);
          break;
        default:
          console.error('Unknown speech recognition error:', event.error);
      }
    };

    // 音声認識開始/終了時の処理
    recognitionRef.current.onstart = () => {
      console.log('Speech recognition started');
      setIsListening(true);
    };

    recognitionRef.current.onend = () => {
      console.log('Speech recognition ended');
      setIsListening(false);
    };

    // クリーンアップ関数
    return () => {
      if (recognitionRef.current && isListening) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.error('Error stopping speech recognition on cleanup:', error);
        }
      }
    };
  }, [isListening]);

  /**
   * 音声入力を開始する関数
   */
  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      alert(UI_MESSAGES.ERRORS.SPEECH_RECOGNITION_NOT_SUPPORTED);
      return false;
    }

    if (isListening) {
      console.log('Already listening, ignoring start request');
      return false;
    }

    try {
      setTranscript(''); // 前回の結果をクリア
      recognitionRef.current.start();
      return true;
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setIsListening(false);
      
      // InvalidStateError の場合は再試行
      if (error.name === 'InvalidStateError') {
        try {
          recognitionRef.current.stop();
          setTimeout(() => {
            if (!isListening) {
              try {
                setTranscript('');
                recognitionRef.current.start();
              } catch (retryError) {
                console.error('Error restarting speech recognition:', retryError);
              }
            }
          }, 200);
        } catch (stopError) {
          console.error('Error stopping recognition for retry:', stopError);
        }
      }
      return false;
    }
  }, [isListening]);

  /**
   * 音声入力を停止する関数
   */
  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isListening) {
      return false;
    }

    try {
      recognitionRef.current.stop();
      return true;
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
      setIsListening(false);
      return false;
    }
  }, [isListening]);

  /**
   * 音声入力の切り替え関数
   */
  const toggleListening = useCallback(() => {
    if (isListening) {
      return stopListening();
    } else {
      return startListening();
    }
  }, [isListening, startListening, stopListening]);

  /**
   * 音声認識がサポートされているかチェック
   */
  const isSupported = useCallback(() => {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }, []);

  /**
   * 現在の音声認識結果をクリア
   */
  const clearTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return {
    // 状態
    isListening,
    transcript,
    
    // 制御関数
    startListening,
    stopListening,
    toggleListening,
    clearTranscript,
    
    // ユーティリティ
    isSupported: isSupported()
  };
};
