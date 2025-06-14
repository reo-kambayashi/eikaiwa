// ============================================================================
// API通信関数
// バックエンドとの通信を管理する関数をここで定義します
// ============================================================================

import { API_CONFIG, TTS_CONFIG, UI_MESSAGES } from './constants';

/**
 * ウェルカムメッセージを取得する関数
 * @param {string} level - 英語レベル
 * @param {string} practiceType - 練習タイプ
 * @returns {Promise<string>} ウェルカムメッセージ
 */
export const fetchWelcomeMessage = async (level, practiceType) => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WELCOME}?level=${level}&practice_type=${practiceType}`
    );
    
    if (response.ok) {
      const data = await response.json();
      return data.reply;
    } else {
      // サーバーエラーの場合はフォールバックメッセージを返す
      console.warn('Failed to fetch welcome message from server');
      return generateFallbackWelcomeMessage(level, practiceType);
    }
  } catch (error) {
    console.error('Error fetching welcome message:', error);
    return generateFallbackWelcomeMessage(level, practiceType);
  }
};

/**
 * AIにメッセージを送信して応答を取得する関数
 * @param {string} text - ユーザーのメッセージ
 * @param {string} level - 英語レベル
 * @param {string} practiceType - 練習タイプ
 * @param {Array} conversationHistory - 会話履歴
 * @returns {Promise<string>} AIの応答
 */
export const sendMessageToAI = async (text, level, practiceType, conversationHistory) => {
  try {
    console.log('Sending request to:', `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.RESPOND}`);
    
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.RESPOND}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: text,
        level: level,
        practice_type: practiceType,
        conversation_history: conversationHistory
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.reply;
    
  } catch (error) {
    console.error('Error sending message to AI:', error);
    throw new Error(`${UI_MESSAGES.ERRORS.SERVER_ERROR}: ${error.message}`);
  }
};

/**
 * テキストを音声に変換する関数（Google Cloud TTS）
 * @param {string} text - 音声にするテキスト
 * @returns {Promise<Audio|null>} 音声オブジェクト、またはnull
 */
export const convertTextToSpeech = async (text) => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TTS}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: text,
        voice_name: TTS_CONFIG.VOICE_NAME,
        language_code: TTS_CONFIG.LANGUAGE_CODE,
        speaking_rate: TTS_CONFIG.SPEAKING_RATE
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return new Audio(`data:audio/mpeg;base64,${data.audio_data}`);
    } else {
      console.warn('TTS API failed, falling back to browser TTS');
      return null; // フォールバックは呼び出し元で処理
    }
  } catch (error) {
    console.error('TTS Error:', error);
    return null; // フォールバックは呼び出し元で処理
  }
};

/**
 * ブラウザ内蔵のText-to-Speech機能を使用する関数（フォールバック用）
 * @param {string} text - 音声にするテキスト
 */
export const fallbackTextToSpeech = (text) => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = TTS_CONFIG.LANGUAGE_CODE;
    speechSynthesis.speak(utterance);
  } else {
    console.warn('Speech synthesis not supported in this browser');
  }
};

/**
 * フォールバック用のウェルカムメッセージを生成する関数
 * @param {string} level - 英語レベル
 * @param {string} practiceType - 練習タイプ
 * @returns {string} ウェルカムメッセージ
 */
const generateFallbackWelcomeMessage = (level, practiceType) => {
  return `Hello! Welcome to English Communication App! I'm your ${level} level ${practiceType} practice partner. How are you today?`;
};
