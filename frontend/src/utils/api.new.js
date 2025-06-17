// ============================================================================
// API通信関数（最適化版）
// バックエンドとの通信を管理する関数をここで定義します
// エラーハンドリング、リトライ機能、キャッシングの改善を含む
// ============================================================================

import { API_CONFIG, TTS_CONFIG, UI_MESSAGES } from './constants';
import { AppError, ERROR_TYPES, withTimeout, withRetry, logError } from './errorHandling';

// レスポンスキャッシュ（メモリベース）
const responseCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5分

/**
 * フェッチリクエストのデフォルト設定
 */
const defaultFetchOptions = {
  headers: {
    ...API_CONFIG.HEADERS,
    'User-Agent': 'EikaiwaApp/1.0'
  },
  credentials: 'same-origin',
  cache: 'no-cache'
};

/**
 * レスポンスキャッシュのキーを生成
 */
const getCacheKey = (url, options = {}) => {
  const key = url + JSON.stringify(options);
  return btoa(key).replace(/[^a-zA-Z0-9]/g, '');
};

/**
 * キャッシュからレスポンスを取得
 */
const getCachedResponse = (cacheKey) => {
  const cached = responseCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  responseCache.delete(cacheKey);
  return null;
};

/**
 * レスポンスをキャッシュに保存
 */
const setCachedResponse = (cacheKey, data) => {
  responseCache.set(cacheKey, {
    data,
    timestamp: Date.now()
  });
  
  // キャッシュサイズ制限（100件まで）
  if (responseCache.size > 100) {
    const firstKey = responseCache.keys().next().value;
    responseCache.delete(firstKey);
  }
};

/**
 * 安全なAPIリクエスト実行関数
 */
const safeFetch = async (url, options = {}) => {
  const cacheKey = getCacheKey(url, options);
  
  // キャッシュチェック（GETリクエストのみ）
  if (!options.method || options.method === 'GET') {
    const cached = getCachedResponse(cacheKey);
    if (cached) {
      console.log('📋 Using cached response for:', url);
      return cached;
    }
  }

  try {
    const fetchOptions = { ...defaultFetchOptions, ...options };
    
    // タイムアウト付きでリクエスト実行
    const response = await withTimeout(
      fetch(url, fetchOptions),
      API_CONFIG.TIMEOUT
    );

    if (!response.ok) {
      throw new AppError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status >= 500 ? ERROR_TYPES.API : ERROR_TYPES.NETWORK,
        { status: response.status, url }
      );
    }

    const data = await response.json();
    
    // 成功したレスポンスをキャッシュ（GETリクエストのみ）
    if (!options.method || options.method === 'GET') {
      setCachedResponse(cacheKey, data);
    }

    return data;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    // ネットワークエラーの判定
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new AppError(
        'Network connection failed',
        ERROR_TYPES.NETWORK,
        { originalError: error, url }
      );
    }

    throw new AppError(
      error.message,
      ERROR_TYPES.UNKNOWN,
      { originalError: error, url }
    );
  }
};

/**
 * フォールバックメッセージを生成
 */
const generateFallbackWelcomeMessage = (level, practiceType) => {
  const levelText = {
    beginner: 'beginner level',
    intermediate: 'intermediate level', 
    advanced: 'advanced level'
  };

  const practiceText = {
    conversation: 'conversation practice',
    grammar: 'grammar practice',
    vocabulary: 'vocabulary building',
    pronunciation: 'pronunciation practice'
  };

  return `Hello! Welcome to English Communication App! I'm ready to help you with ${practiceText[practiceType] || 'English practice'} at ${levelText[level] || 'your'} level. How can I assist you today?`;
};

/**
 * 音声出力用のテキストクリーニング
 */
const cleanTextForSpeech = (text) => {
  if (!text) return '';

  let cleaned = text;

  // 絵文字を除去
  cleaned = cleaned.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '');
  
  // マークダウン記法を除去
  cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, '$1'); // **太字**
  cleaned = cleaned.replace(/\*(.*?)\*/g, '$1');     // *斜体*
  cleaned = cleaned.replace(/`(.*?)`/g, '$1');       // `コード`
  cleaned = cleaned.replace(/~~(.*?)~~/g, '$1');     // ~~取り消し線~~
  
  // HTMLタグを除去
  cleaned = cleaned.replace(/<[^>]*>/g, '');
  
  // 余分な空白を整理
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return cleaned;
};

/**
 * ウェルカムメッセージを取得する関数（最適化版）
 * @param {string} level - 英語レベル
 * @param {string} practiceType - 練習タイプ
 * @returns {Promise<string>} ウェルカムメッセージ
 */
export const fetchWelcomeMessage = async (level, practiceType) => {
  const context = `fetchWelcomeMessage(${level}, ${practiceType})`;
  
  try {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WELCOME}`;
    const params = new URLSearchParams({ level, practice_type: practiceType });
    const fullUrl = `${url}?${params}`;

    console.log('🔗 Fetching welcome message from:', fullUrl);

    const data = await withRetry(
      () => safeFetch(fullUrl),
      API_CONFIG.MAX_RETRIES
    );

    console.log('✅ Welcome message received:', data);
    return data.reply || generateFallbackWelcomeMessage(level, practiceType);
    
  } catch (error) {
    logError(error, context);
    return generateFallbackWelcomeMessage(level, practiceType);
  }
};

/**
 * AIにメッセージを送信して応答を取得する関数（最適化版）
 * @param {string} text - ユーザーのメッセージ
 * @param {string} level - 英語レベル
 * @param {string} practiceType - 練習タイプ
 * @param {Array} conversationHistory - 会話履歴
 * @param {boolean} enableGrammarCheck - 文法チェックを有効にするか
 * @returns {Promise<Object>} AI応答オブジェクト
 */
export const sendMessageToAI = async (
  text, 
  level, 
  practiceType, 
  conversationHistory = [], 
  enableGrammarCheck = true
) => {
  const context = `sendMessageToAI(${text.substring(0, 50)}...)`;
  
  if (!text?.trim()) {
    throw new AppError('Message text is required', ERROR_TYPES.VALIDATION);
  }

  try {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.RESPOND}`;
    
    const requestBody = {
      text: text.trim(),
      level,
      practice_type: practiceType,
      conversation_history: conversationHistory.slice(-10), // 最新10件のみ
      enable_grammar_check: enableGrammarCheck,
      timestamp: new Date().toISOString()
    };

    console.log('🔗 Sending message to AI:', { text: text.substring(0, 100), level, practiceType });

    const data = await withRetry(
      () => safeFetch(url, {
        method: 'POST',
        body: JSON.stringify(requestBody)
      }),
      API_CONFIG.MAX_RETRIES
    );

    console.log('✅ AI response received:', data);
    
    return {
      reply: data.reply || 'I apologize, but I cannot respond right now. Please try again.',
      suggestions: data.suggestions || [],
      grammarFeedback: data.grammar_feedback || null,
      confidence: data.confidence || 0,
      processingTime: data.processing_time || 0
    };

  } catch (error) {
    logError(error, context);
    
    // フォールバック応答
    return {
      reply: 'I apologize, but I cannot respond right now due to a technical issue. Please try again later.',
      suggestions: [],
      grammarFeedback: null,
      confidence: 0,
      processingTime: 0,
      error: true
    };
  }
};

/**
 * テキストを音声に変換する関数（最適化版）
 * @param {string} text - 音声化するテキスト
 * @param {string} level - 英語レベル
 * @param {number} speakingRate - 読み上げ速度
 * @returns {Promise<Blob>} 音声データ
 */
export const textToSpeech = async (text, level = 'beginner', speakingRate = 1.0) => {
  const context = `textToSpeech(${text.substring(0, 50)}...)`;
  
  if (!text?.trim()) {
    throw new AppError('Text is required for speech synthesis', ERROR_TYPES.VALIDATION);
  }

  try {
    // テキストをクリーニング
    const cleanedText = cleanTextForSpeech(text);
    
    if (!cleanedText.trim()) {
      throw new AppError('No valid text found for speech synthesis', ERROR_TYPES.VALIDATION);
    }

    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TTS}`;
    
    const requestBody = {
      text: cleanedText,
      voice_config: {
        language_code: TTS_CONFIG.LANG || 'en-US',
        speaking_rate: Math.max(0.5, Math.min(2.0, speakingRate)),
        pitch: TTS_CONFIG.PITCH || 1.0,
        volume: TTS_CONFIG.VOLUME || 1.0
      },
      level
    };

    console.log('🔗 Converting text to speech:', { 
      text: cleanedText.substring(0, 100), 
      speakingRate, 
      level 
    });

    const response = await withTimeout(
      fetch(url, {
        ...defaultFetchOptions,
        method: 'POST',
        body: JSON.stringify(requestBody)
      }),
      API_CONFIG.TIMEOUT * 2 // TTS は時間がかかるので2倍のタイムアウト
    );

    if (!response.ok) {
      throw new AppError(
        `TTS API failed: ${response.status}`,
        ERROR_TYPES.API,
        { status: response.status }
      );
    }

    const audioBlob = await response.blob();
    console.log('✅ Text-to-speech conversion completed');
    
    return audioBlob;

  } catch (error) {
    logError(error, context);
    throw error instanceof AppError ? error : new AppError(
      'Text-to-speech conversion failed',
      ERROR_TYPES.SPEECH_SYNTHESIS,
      { originalError: error }
    );
  }
};

/**
 * API健康状態をチェック
 */
export const checkAPIHealth = async () => {
  try {
    const url = `${API_CONFIG.BASE_URL}/health`;
    const data = await safeFetch(url);
    return data.status === 'healthy';
  } catch (error) {
    logError(error, 'checkAPIHealth');
    return false;
  }
};

/**
 * キャッシュをクリア
 */
export const clearCache = () => {
  responseCache.clear();
  console.log('🗑️ API response cache cleared');
};
