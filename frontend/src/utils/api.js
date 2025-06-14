// ============================================================================
// API通信関数
// バックエンドとの通信を管理する関数をここで定義します
// ============================================================================

import { API_CONFIG, TTS_CONFIG, UI_MESSAGES, SPEECH_CLEANING_CONFIG } from './constants';

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
 * @param {boolean} enableGrammarCheck - 文法チェックを有効にするか（デフォルト: true）
 * @returns {Promise<string>} AIの応答
 */
export const sendMessageToAI = async (text, level, practiceType, conversationHistory, enableGrammarCheck = true) => {
  try {
    console.log('Sending request to:', `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.RESPOND}`);
    
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.RESPOND}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: text,
        level: level,
        practice_type: practiceType,
        conversation_history: conversationHistory,
        enable_grammar_check: enableGrammarCheck
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
 * @param {number} speakingRate - 読み上げ速度（デフォルト: 1.0）
 * @returns {Promise<Audio|null>} 音声オブジェクト、またはnull
 */
export const convertTextToSpeech = async (text, speakingRate = 1.0) => {
  try {
    // 音声出力用にテキストをクリーニング
    const cleanedText = cleanTextForSpeech(text);
    
    // クリーニング後のテキストが空の場合は処理しない
    if (!cleanedText) {
      console.warn('Text is empty after cleaning, skipping TTS');
      return null;
    }
    
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TTS}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: cleanedText, // クリーニング済みテキストを使用
        voice_name: TTS_CONFIG.VOICE_NAME,
        language_code: TTS_CONFIG.LANGUAGE_CODE,
        speaking_rate: speakingRate
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
 * @param {number} speakingRate - 読み上げ速度（デフォルト: 1.0）
 */
export const fallbackTextToSpeech = (text, speakingRate = 1.0) => {
  if ('speechSynthesis' in window) {
    // 音声出力用にテキストをクリーニング
    const cleanedText = cleanTextForSpeech(text);
    
    // クリーニング後のテキストが空の場合は処理しない
    if (!cleanedText) {
      console.warn('Text is empty after cleaning, skipping browser TTS');
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(cleanedText); // クリーニング済みテキストを使用
    utterance.lang = TTS_CONFIG.LANGUAGE_CODE;
    utterance.rate = speakingRate; // ブラウザTTSにも速度を適用
    speechSynthesis.speak(utterance);
  } else {
    console.warn('Speech synthesis not supported in this browser');
  }
};

/**
 * 音声出力用にテキストをクリーニングする関数
 * 絵文字、マークダウン記法、HTMLタグなどを除去し、音声に適した形式に変換
 * @param {string} text - クリーニングするテキスト
 * @returns {string} クリーニング済みのテキスト
 */
export const cleanTextForSpeech = (text) => {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  let cleanedText = text;
  
  // 1. 絵文字を除去
  SPEECH_CLEANING_CONFIG.EMOJI_PATTERNS.forEach(pattern => {
    cleanedText = cleanedText.replace(pattern, '');
  });
  
  // 2. マークダウン記法を処理（中身のテキストを保持）
  SPEECH_CLEANING_CONFIG.MARKDOWN_PATTERNS.forEach(pattern => {
    cleanedText = cleanedText.replace(pattern, (match, content) => {
      // コードブロックは完全に除去
      if (match.startsWith('```')) {
        return '';
      }
      // その他は中身のテキストのみ保持
      return content || '';
    });
  });
  
  // 3. HTMLタグを除去
  SPEECH_CLEANING_CONFIG.HTML_PATTERNS.forEach(pattern => {
    cleanedText = cleanedText.replace(pattern, '');
  });
  
  // 4. 音声で不要な記号を除去
  SPEECH_CLEANING_CONFIG.SYMBOL_PATTERNS.forEach(pattern => {
    cleanedText = cleanedText.replace(pattern, '');
  });
  
  // 5. 音声読み上げ用の置換
  SPEECH_CLEANING_CONFIG.REPLACEMENTS.forEach(({ pattern, replacement }) => {
    cleanedText = cleanedText.replace(pattern, replacement);
  });
  
  // 6. 複数の空白文字を単一のスペースに統一
  cleanedText = cleanedText.replace(/\s+/g, ' ');
  
  // 7. 前後の空白を除去
  cleanedText = cleanedText.trim();
  
  return cleanedText;
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
