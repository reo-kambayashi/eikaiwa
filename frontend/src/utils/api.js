// ============================================================================
// API通信関数（最適化版）
// バックエンドとの通信を管理する関数をここで定義します
// エラーハンドリング、リトライ機能、キャッシングの改善を含む
// ============================================================================

import { API_CONFIG, TTS_CONFIG } from './constants';
import { AppError, ERROR_TYPES, withTimeout, withRetry, logError } from './errorHandling';

// レスポンスキャッシュ（メモリベース）
const responseCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5分

/**
 * PCM音声データをWAVフォーマットに変換する関数
 * @param {Uint8Array} pcmData - PCM音声データ
 * @param {number} sampleRate - サンプルレート（例：24000）
 * @param {number} channels - チャンネル数（1=モノ、2=ステレオ）
 * @param {number} bitsPerSample - サンプルあたりのビット数（16または24）
 * @returns {Uint8Array} WAVフォーマットの音声データ
 */
const convertPCMToWAV = (pcmData, sampleRate = 24000, channels = 1, bitsPerSample = 16) => {
  const bytesPerSample = bitsPerSample / 8;
  const byteRate = sampleRate * channels * bytesPerSample;
  const blockAlign = channels * bytesPerSample;
  const dataSize = pcmData.length;
  const fileSize = 44 + dataSize; // WAVヘッダー(44バイト) + データ

  // WAVファイルヘッダーを作成
  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);
  const uint8Array = new Uint8Array(buffer);

  // RIFFヘッダー
  const writeString = (offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');                    // ChunkID
  view.setUint32(4, fileSize - 8, true);    // ChunkSize
  writeString(8, 'WAVE');                   // Format

  // fmtサブチャンク
  writeString(12, 'fmt ');                  // Subchunk1ID
  view.setUint32(16, 16, true);             // Subchunk1Size (PCMの場合は16)
  view.setUint16(20, 1, true);              // AudioFormat (PCM = 1)
  view.setUint16(22, channels, true);       // NumChannels
  view.setUint32(24, sampleRate, true);     // SampleRate
  view.setUint32(28, byteRate, true);       // ByteRate
  view.setUint16(32, blockAlign, true);     // BlockAlign
  view.setUint16(34, bitsPerSample, true);  // BitsPerSample

  // dataサブチャンク
  writeString(36, 'data');                  // Subchunk2ID
  view.setUint32(40, dataSize, true);       // Subchunk2Size

  // PCMデータをコピー
  uint8Array.set(pcmData, 44);

  return uint8Array;
};

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
 * UTF-8対応のbase64エンコーディングを使用
 */
const getCacheKey = (url, options = {}) => {
  const key = url + JSON.stringify(options);
  try {
    // UTF-8文字列をbase64エンコード（日本語対応）
    return btoa(encodeURIComponent(key).replace(/%([0-9A-F]{2})/g, (match, p1) => {
      return String.fromCharCode('0x' + p1);
    })).replace(/[^a-zA-Z0-9]/g, '');
  } catch (error) {
    // フォールバック：エラー時はシンプルなハッシュを生成
    console.warn('Cache key generation failed, using fallback hash:', error);
    return Array.from(key).reduce((hash, char) => {
      return hash ^ char.charCodeAt(0);
    }, 0).toString(36);
  }
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
const generateFallbackWelcomeMessage = () => {
  return `Hello! Welcome to English Communication App! I'm your AI English tutor, ready to help you practice and improve your English skills. How can I assist you today?`;
};

/**
 * 音声出力用のテキストクリーニング（改善版）
 */
const cleanTextForSpeech = (text) => {
  // 厳密な入力チェック
  if (!text) {
    return '';
  }
  
  if (typeof text !== 'string') {
    return String(text);
  }

  let cleaned = text;

  // 1. 絵文字を包括的に除去
  // 基本的な絵文字 (U+1F600-U+1F64F)
  cleaned = cleaned.replace(/[\u{1F600}-\u{1F64F}]/gu, '');
  // その他の絵文字・記号 (U+1F300-U+1F5FF)
  cleaned = cleaned.replace(/[\u{1F300}-\u{1F5FF}]/gu, '');
  // 交通機関とマップ (U+1F680-U+1F6FF)
  cleaned = cleaned.replace(/[\u{1F680}-\u{1F6FF}]/gu, '');
  // 補助記号・絵文字 (U+1F700-U+1F77F)
  cleaned = cleaned.replace(/[\u{1F700}-\u{1F77F}]/gu, '');
  // 幾何学図形拡張 (U+1F780-U+1F7FF)
  cleaned = cleaned.replace(/[\u{1F780}-\u{1F7FF}]/gu, '');
  // 補助絵文字 (U+1F800-U+1F8FF)
  cleaned = cleaned.replace(/[\u{1F800}-\u{1F8FF}]/gu, '');
  // 追加の絵文字 (U+1F900-U+1F9FF)
  cleaned = cleaned.replace(/[\u{1F900}-\u{1F9FF}]/gu, '');
  // 追加記号と絵文字 (U+1FA00-U+1FA6F)
  cleaned = cleaned.replace(/[\u{1FA00}-\u{1FA6F}]/gu, '');
  // 旧来の絵文字記号
  cleaned = cleaned.replace(/[\u{2600}-\u{26FF}]/gu, '');
  cleaned = cleaned.replace(/[\u{2700}-\u{27BF}]/gu, '');
  // Variation Selectors (絵文字の変形)
  cleaned = cleaned.replace(/[\u{FE00}-\u{FE0F}]/gu, '');
  // Zero Width Joiner（絵文字の結合文字）
  cleaned = cleaned.replace(/\u{200D}/gu, '');
  // Regional Indicator Symbols（国旗絵文字）
  cleaned = cleaned.replace(/[\u{1F1E6}-\u{1F1FF}]/gu, '');
  
  // 2. マークダウン記法を包括的に除去
  cleaned = cleaned.replace(/#{1,6}\s+/g, '');        // ヘッダー記号 (#, ##, ###...)
  cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, '$1'); // **太字**
  cleaned = cleaned.replace(/\*(.*?)\*/g, '$1');     // *斜体*
  cleaned = cleaned.replace(/_(.*?)_/g, '$1');       // _アンダースコア斜体_
  cleaned = cleaned.replace(/`{3}[\s\S]*?`{3}/g, ''); // ```コードブロック```
  cleaned = cleaned.replace(/`(.*?)`/g, '$1');       // `インラインコード`
  cleaned = cleaned.replace(/~~(.*?)~~/g, '$1');     // ~~取り消し線~~
  cleaned = cleaned.replace(/\[(.*?)\]\(.*?\)/g, '$1'); // [リンクテキスト](URL)
  cleaned = cleaned.replace(/!\[.*?\]\(.*?\)/g, ''); // ![画像](URL)
  cleaned = cleaned.replace(/^>\s+/gm, '');          // > 引用
  cleaned = cleaned.replace(/^[-*+]\s+/gm, '');      // リスト記号
  cleaned = cleaned.replace(/^\d+\.\s+/gm, '');      // 番号付きリスト
  cleaned = cleaned.replace(/^---+$/gm, '');         // 水平線
  cleaned = cleaned.replace(/^\*{3,}$/gm, '');       // アスタリスク水平線
  
  // 3. HTMLタグを除去
  cleaned = cleaned.replace(/<[^>]*>/g, ' ');
  
  // 4. 特殊文字・記号を処理
  cleaned = cleaned.replace(/&[a-zA-Z]+;/g, ' ');    // HTMLエンティティ
  cleaned = cleaned.replace(/[\u{2000}-\u{206F}]/gu, ' '); // 一般句読点
  cleaned = cleaned.replace(/[\u{2E00}-\u{2E7F}]/gu, ' '); // 補助句読点
  
  // 5. 余分な改行・空白を整理
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');     // 3つ以上の改行を2つに
  cleaned = cleaned.replace(/\s{2,}/g, ' ');        // 2つ以上の空白を1つに
  cleaned = cleaned.replace(/^\s+|\s+$/g, '');      // 先頭・末尾の空白を除去
  
  // 6. 最終的な空文字チェック
  if (!cleaned || cleaned.length === 0) {
    return '';
  }

  return cleaned;
};

/**
 * ウェルカムメッセージを取得する関数（最適化版）
 * @returns {Promise<string>} ウェルカムメッセージ
 */
export const fetchWelcomeMessage = async () => {
  const context = 'fetchWelcomeMessage()';
  
  try {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WELCOME}`;

    console.log('🔗 Fetching welcome message from:', url);

    const data = await withRetry(
      () => safeFetch(url),
      API_CONFIG.MAX_RETRIES
    );

    console.log('✅ Welcome message received:', data);
    return data.reply || generateFallbackWelcomeMessage();
    
  } catch (error) {
    logError(error, context);
    return generateFallbackWelcomeMessage();
  }
};

/**
 * AIにメッセージを送信して応答を取得する関数（最適化版）
 * @param {string} text - ユーザーのメッセージ
 * @param {Array} conversationHistory - 会話履歴
 * @param {boolean} enableGrammarCheck - 文法チェックを有効にするか
 * @returns {Promise<Object>} AI応答オブジェクト
 */
export const sendMessageToAI = async (
  text, 
  conversationHistory = [], 
  enableGrammarCheck = true
) => {
  const context = `sendMessageToAI(${text?.substring(0, 50) || 'undefined'}...)`;
  
  // 厳密な入力チェック
  if (!text) {
    throw new AppError('Message text is required', ERROR_TYPES.VALIDATION);
  }
  
  if (typeof text !== 'string') {
    throw new AppError('Message text must be a string', ERROR_TYPES.VALIDATION);
  }
  
  const trimmedText = text.trim();
  if (!trimmedText) {
    throw new AppError('Message text cannot be empty', ERROR_TYPES.VALIDATION);
  }

  try {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.RESPOND}`;
    
    const requestBody = {
      text: trimmedText,
      conversation_history: conversationHistory.slice(-10), // 最新10件のみ
      enable_grammar_check: enableGrammarCheck,
      timestamp: new Date().toISOString()
    };

    console.log('🔗 Sending message to AI:', { text: trimmedText.substring(0, 100) });

    const data = await withRetry(
      () => safeFetch(url, {
        method: 'POST',
        body: JSON.stringify(requestBody)
      }),
      API_CONFIG.MAX_RETRIES
    );

    console.log('✅ AI response received:', data);
    console.log('✅ Data type:', typeof data, 'Keys:', Object.keys(data || {}));
    console.log('✅ Reply field:', data?.reply, 'Type:', typeof data?.reply);
    
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
 * @param {number} speakingRate - 読み上げ速度
 * @param {string} voiceName - 使用する音声名（Gemini TTS用）
 * @returns {Promise<Blob>} 音声データ
 */
export const textToSpeech = async (text, speakingRate = 1.0, voiceName = "Kore") => {
  const context = `textToSpeech(${text?.substring(0, 50) || 'undefined'}...)`;
  
  // 厳密な入力チェック
  if (!text) {
    throw new AppError('Text is required for speech synthesis', ERROR_TYPES.VALIDATION);
  }
  
  if (typeof text !== 'string') {
    throw new AppError('Text must be a string for speech synthesis', ERROR_TYPES.VALIDATION);
  }
  
  const trimmedText = text.trim();
  if (!trimmedText) {
    throw new AppError('Text cannot be empty for speech synthesis', ERROR_TYPES.VALIDATION);
  }

  try {
    // テキストをクリーニング
    const cleanedText = cleanTextForSpeech(trimmedText);
    
    // クリーニング後に有効なテキストがあるかチェック
    if (!cleanedText || !cleanedText.trim()) {
      console.warn('No valid text after cleaning:', trimmedText);
      throw new AppError('No valid text found after cleaning for speech synthesis', ERROR_TYPES.VALIDATION);
    }

    console.log('🧹 Text cleaned for TTS:', {
      original: trimmedText.substring(0, 100),
      cleaned: cleanedText.substring(0, 100),
      originalLength: trimmedText.length,
      cleanedLength: cleanedText.length
    });

    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TTS}`;
    
    console.log('🔗 Converting text to speech:', { 
      text: cleanedText.substring(0, 100), 
      speakingRate,
      voiceName,
      textLength: cleanedText.length
    });

    // バックエンドのレスポンス形式に合わせたリクエストボディ
    const modifiedRequestBody = {
      text: cleanedText,
      voice_name: voiceName || TTS_CONFIG.VOICE_NAME || "Kore",
      language_code: TTS_CONFIG.LANG || 'en-US',
      speaking_rate: Math.max(0.25, Math.min(4.0, speakingRate))
    };

    // リトライ機能付きでTTS APIを呼び出し
    const response = await withRetry(
      () => withTimeout(
        fetch(url, {
          ...defaultFetchOptions,
          method: 'POST',
          body: JSON.stringify(modifiedRequestBody)
        }),
        API_CONFIG.TIMEOUT * 3 // TTS は時間がかかるので3倍のタイムアウト
      ),
      2, // 最大2回リトライ
      1500 // 1.5秒間隔
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new AppError(
        `TTS API failed: ${response.status} - ${errorText}`,
        response.status >= 500 ? ERROR_TYPES.API : ERROR_TYPES.NETWORK,
        { status: response.status, responseText: errorText }
      );
    }

    // バックエンドはJSONレスポンスを返す（Gemini TTSの場合はフォールバック情報も含む）
    const jsonResponse = await response.json();
    
    // Gemini TTSがフォールバックを指示している場合
    if (jsonResponse.use_browser_tts) {
      console.log('⚠️ Backend requests browser TTS fallback');
      throw new AppError('Backend requested browser TTS fallback', ERROR_TYPES.API);
    }
    
    if (!jsonResponse.audio_data) {
      console.warn('❌ No audio data in response:', jsonResponse);
      throw new AppError('No audio data in response', ERROR_TYPES.API);
    }

    // base64デコードしてBlobに変換（エラーハンドリング強化）
    let audioBlob;
    try {
      // Base64データの検証
      const base64Data = jsonResponse.audio_data;
      if (typeof base64Data !== 'string' || base64Data.length === 0) {
        throw new Error(`Invalid base64 data: type=${typeof base64Data}, length=${base64Data?.length || 0}`);
      }
      
      // 有効なbase64文字列かチェック
      const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
      if (!base64Regex.test(base64Data)) {
        throw new Error('Invalid base64 format detected');
      }
      
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // 音声フォーマットを修正 - より一般的なフォーマットを使用
      let contentType = jsonResponse.content_type || 'audio/wav';
      let processedBytes = bytes;
      
      // PCM音声データをWAVフォーマットに変換（ブラウザ互換性向上）
      if (contentType.toLowerCase().includes('l16') || contentType.toLowerCase().includes('pcm')) {
        console.log('🔄 Converting PCM audio to WAV format for browser compatibility');
        
        try {
          // PCMデータをWAVフォーマットに変換
          const wavBytes = convertPCMToWAV(bytes, 24000, 1, 16); // 24kHz, mono, 16-bit
          processedBytes = wavBytes;
          contentType = 'audio/wav';
          
          console.log('✅ PCM to WAV conversion successful:', {
            originalSize: bytes.length,
            wavSize: wavBytes.length,
            sampleRate: 24000,
            channels: 1,
            bitsPerSample: 16
          });
        } catch (conversionError) {
          console.error('❌ PCM to WAV conversion failed:', conversionError);
          // 変換失敗時は元のデータを使用し、フォールバックに期待
          throw new AppError('Audio format conversion failed', ERROR_TYPES.API, {
            conversionError: conversionError.message,
            originalFormat: contentType
          });
        }
      }
      
      audioBlob = new Blob([processedBytes], { type: contentType });
      
      console.log('🔄 Audio blob created:', {
        originalDataLength: base64Data.length,
        binaryStringLength: binaryString.length,
        bytesLength: bytes.length,
        blobSize: audioBlob.size,
        contentType: contentType,
        originalSize: jsonResponse.original_size || 'unknown'
      });
      
    } catch (decodeError) {
      console.error('❌ Base64 decode failed:', decodeError);
      throw new AppError('Failed to decode audio data', ERROR_TYPES.API, { 
        decodeError: decodeError.message,
        dataPreview: jsonResponse.audio_data?.substring(0, 100),
        responseKeys: Object.keys(jsonResponse)
      });
    }
    
    if (audioBlob.size === 0) {
      throw new AppError('Received empty audio data after decoding', ERROR_TYPES.API);
    }

    console.log('✅ Gemini TTS conversion completed', {
      audioSize: audioBlob.size,
      audioType: audioBlob.type
    });
    
    return audioBlob;

  } catch (error) {
    // より詳細なエラーログ
    console.error('❌ TTS conversion failed:', {
      originalText: text?.substring(0, 100),
      speakingRate,
      error: error.message,
      stack: error.stack
    });
    
    logError(error, context);
    
    // エラータイプに応じて適切にラップ
    if (error instanceof AppError) {
      throw error;
    } else {
      throw new AppError(
        'Text-to-speech conversion failed',
        ERROR_TYPES.SPEECH_SYNTHESIS,
        { originalError: error.message, stack: error.stack }
      );
    }
  }
};

/**
 * テキストを音声に変換してHTMLAudioElementを返す関数（従来互換）
 * @param {string} text - 音声化するテキスト  
 * @param {number} speakingRate - 読み上げ速度
 * @param {string} voiceName - 使用する音声名（Gemini TTS用）
 * @returns {Promise<HTMLAudioElement>} 音声要素
 */
export const convertTextToSpeech = async (text, speakingRate = 1.0, voiceName = "Kore") => {
  try {
    const audioBlob = await textToSpeech(text, speakingRate, voiceName);
    const audioUrl = URL.createObjectURL(audioBlob);
    
    console.log('🎵 Creating audio element:', {
      blobSize: audioBlob.size,
      blobType: audioBlob.type,
      urlLength: audioUrl.length
    });
    
    const audioElement = new Audio(audioUrl);
    
    // 音声の基本設定（ブラウザ互換性向上）
    audioElement.preload = 'auto';
    audioElement.volume = 1.0;
    
    // メモリリーク防止のため、再生終了後にURLを開放
    audioElement.addEventListener('ended', () => {
      console.log('🧹 Cleaning up audio URL after playback');
      URL.revokeObjectURL(audioUrl);
    });
    
    // エラーが発生した場合もURLを開放
    audioElement.addEventListener('error', (error) => {
      console.error('🚨 Audio element error:', error);
      URL.revokeObjectURL(audioUrl);
    });
    
    // ロード完了のログ
    audioElement.addEventListener('loadeddata', () => {
      console.log('✅ Audio data loaded successfully:', {
        duration: audioElement.duration,
        readyState: audioElement.readyState
      });
    });
    
    return audioElement;
  } catch (error) {
    console.error('❌ convertTextToSpeech failed:', error.message);
    logError(error, 'convertTextToSpeech');
    return null;
  }
};

// ============================================================================
// リスニング問題API関数
// ============================================================================

/**
 * リスニング問題を取得する関数
 * @param {string} category - 問題のカテゴリ
 * @param {string} difficulty - 難易度
 * @returns {Promise<Object>} リスニング問題データ
 */
export const fetchListeningProblem = async (category = 'any', difficulty = 'medium') => {
  const context = `fetchListeningProblem(${category}, ${difficulty})`;
  
  try {
    const url = `${API_CONFIG.BASE_URL}/api/listening/problem`;
    // タイムスタンプを追加してキャッシュバスティングを実行
    // Add timestamp for cache busting to ensure new problems each time
    const params = new URLSearchParams({ 
      category, 
      difficulty,
      _t: Date.now().toString() // キャッシュバスティング用タイムスタンプ
    });
    
    console.log('🎯 Fetching listening problem:', { category, difficulty });
    
    const data = await withRetry(
      () => safeFetch(`${url}?${params}`, {
        method: 'GET'
      }),
      API_CONFIG.MAX_RETRIES
    );
    
    console.log('✅ Listening problem fetched:', data);
    return data;
  } catch (error) {
    console.error('❌ Error fetching listening problem:', error);
    logError(error, context);
    throw error;
  }
};

/**
 * リスニング問題の回答をチェックする関数
 * @param {Object} answerData - 回答データ
 * @param {string} answerData.question - 問題文
 * @param {string} answerData.user_answer - ユーザーの回答
 * @param {string} answerData.correct_answer - 正解
 * @param {Array} answerData.choices - 選択肢
 * @returns {Promise<Object>} 回答チェック結果
 */
export const checkListeningAnswer = async (answerData) => {
  const context = `checkListeningAnswer`;
  
  if (!answerData || !answerData.question || !answerData.user_answer) {
    throw new AppError('Answer data is incomplete', ERROR_TYPES.VALIDATION);
  }
  
  try {
    const url = `${API_CONFIG.BASE_URL}/api/listening/check`;
    
    console.log('🔍 Checking listening answer:', answerData);
    
    const data = await withRetry(
      () => safeFetch(url, {
        method: 'POST',
        body: JSON.stringify(answerData)
      }),
      API_CONFIG.MAX_RETRIES
    );
    
    console.log('✅ Answer check result:', data);
    return data;
  } catch (error) {
    console.error('❌ Error checking listening answer:', error);
    logError(error, context);
    throw error;
  }
};

/**
 * ブラウザの標準音声合成APIを使用するフォールバック関数
 * @param {string} text - 音声化するテキスト
 * @param {number} rate - 読み上げ速度
 * @returns {Promise<boolean>} 成功したかどうか
 */
export const fallbackTextToSpeech = (text, rate = 1.0) => {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      console.warn('❌ Speech synthesis not supported in this browser');
      resolve(false);
      return;
    }

    // 基本的な入力チェック
    if (!text || typeof text !== 'string') {
      console.warn('❌ fallbackTextToSpeech: Invalid text input:', typeof text);
      resolve(false);
      return;
    }
    
    const trimmedText = text.trim();
    if (!trimmedText) {
      console.warn('❌ fallbackTextToSpeech: Empty text after trim');
      resolve(false);
      return;
    }

    try {
      // テキストをクリーニング（ブラウザTTSでも絵文字・マークアップを除去）
      const cleanedText = cleanTextForSpeech(trimmedText);
      
      if (!cleanedText || !cleanedText.trim()) {
        console.warn('❌ fallbackTextToSpeech: No valid text after cleaning');
        resolve(false);
        return;
      }

      console.log('🧹 Using cleaned text for fallback TTS:', {
        original: trimmedText.substring(0, 50),
        cleaned: cleanedText.substring(0, 50)
      });

      // 既存の音声を停止してから新しい音声を開始
      window.speechSynthesis.cancel();
      
      // 短い待機時間を追加（ブラウザによってはcancel()の完了を待つ必要がある）
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(cleanedText);
        utterance.lang = 'en-US';
        utterance.rate = Math.max(0.1, Math.min(10, rate)); // ブラウザの範囲制限
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        let hasFinished = false;
        
        utterance.onstart = () => {
          console.log('🎵 Browser TTS started');
        };

        utterance.onend = () => {
          if (!hasFinished) {
            console.log('✅ Fallback TTS completed successfully');
            hasFinished = true;
            resolve(true);
          }
        };

        utterance.onerror = (error) => {
          if (!hasFinished) {
            // 'canceled' errors are expected when stopping previous speech
            if (error.error === 'canceled') {
              console.log('🔄 Fallback TTS canceled (expected behavior)');
              hasFinished = true;
              resolve(true);
            } else {
              console.error('❌ Fallback TTS error:', error);
              hasFinished = true;
              resolve(false);
            }
          }
        };

        // エラーが発生した場合のタイムアウト
        const timeoutId = setTimeout(() => {
          if (!hasFinished) {
            console.warn('⏰ Browser TTS timeout');
            window.speechSynthesis.cancel();
            hasFinished = true;
            resolve(false);
          }
        }, 30000); // 30秒のタイムアウト

        utterance.onend = () => {
          if (!hasFinished) {
            clearTimeout(timeoutId);
            console.log('✅ Fallback TTS completed successfully');
            hasFinished = true;
            resolve(true);
          }
        };

        try {
          window.speechSynthesis.speak(utterance);
          console.log('🎵 Browser TTS utterance queued');
        } catch (speakError) {
          clearTimeout(timeoutId);
          console.error('❌ Failed to queue browser TTS:', speakError);
          hasFinished = true;
          resolve(false);
        }
      }, 100); // 100ms の待機時間
      
    } catch (error) {
      console.error('❌ Fallback TTS setup failed:', error);
      resolve(false);
    }
  });
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
