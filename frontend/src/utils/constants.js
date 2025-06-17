// ============================================================================
// 定数定義ファイル
// アプリケーション全体で使用される定数をここで管理します
// ============================================================================

// API関連の定数
export const API_CONFIG = {
  // 基本URL（環境変数から取得、フォールバックあり）
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  
  // APIエンドポイント
  ENDPOINTS: {
    WELCOME: '/api/welcome',
    RESPOND: '/api/respond',
    TTS: '/api/tts'
  }
};

// デバッグ情報をコンソールに出力
console.log('🔧 API Configuration:', {
  BASE_URL: API_CONFIG.BASE_URL,
  REACT_APP_API_URL: process.env.REACT_APP_API_URL,
  ENDPOINTS: API_CONFIG.ENDPOINTS
});

// 英語レベルの定義
export const ENGLISH_LEVELS = [
  { value: 'beginner', label: 'Beginner (初級)' },
  { value: 'intermediate', label: 'Intermediate (中級)' },
  { value: 'advanced', label: 'Advanced (上級)' }
];

// 練習タイプの定義
export const PRACTICE_TYPES = [
  { value: 'conversation', label: 'Conversation (会話)' },
  { value: 'grammar', label: 'Grammar (文法)' },
  { value: 'vocabulary', label: 'Vocabulary (語彙)' },
  { value: 'pronunciation', label: 'Pronunciation (発音)' }
];

// 音声認識の設定
export const SPEECH_RECOGNITION_CONFIG = {
  LANGUAGE: 'en-US',
  CONTINUOUS: false,
  INTERIM_RESULTS: true,
  // タイムアウト設定（秒）
  TIMEOUT_OPTIONS: [
    { value: 10, label: '10 seconds (10秒)' },
    { value: 20, label: '20 seconds (20秒)' },
    { value: 30, label: '30 seconds (30秒)' },
    { value: 60, label: '1 minute (1分)' },
    { value: 120, label: '2 minutes (2分)' }
  ],
  DEFAULT_TIMEOUT: 30  // デフォルトタイムアウト（秒）
};

// 音声合成の設定
export const TTS_CONFIG = {
  VOICE_NAME: "en-US-Neural2-D",
  LANGUAGE_CODE: "en-US",
  // レベル別のデフォルト読み上げ速度
  DEFAULT_SPEAKING_RATES: {
    beginner: 1.0,      // 初級者：標準速度
    intermediate: 1.3,  // 中級者：少し早め
    advanced: 1.6       // 上級者：ネイティブに近い速度
  },
  // 速度調整の範囲
  MIN_SPEAKING_RATE: 1.0,  // 最低速度（標準速度）
  MAX_SPEAKING_RATE: 2.0   // 最高速度（2倍の速度）
};

// 音声出力用テキストクリーニング設定
export const SPEECH_CLEANING_CONFIG = {
  // 除去する絵文字とアイコン（よく使われるもの）
  EMOJI_PATTERNS: [
    /[\u{1F600}-\u{1F64F}]/gu, // 顔文字
    /[\u{1F300}-\u{1F5FF}]/gu, // その他のシンボル
    /[\u{1F680}-\u{1F6FF}]/gu, // 交通機関とマップ
    /[\u{1F700}-\u{1F77F}]/gu, // 錬金術シンボル
    /[\u{1F780}-\u{1F7FF}]/gu, // 幾何学的図形
    /[\u{1F800}-\u{1F8FF}]/gu, // 補助記号
    /[\u{1F900}-\u{1F9FF}]/gu, // 補助シンボル
    /[\u{1FA00}-\u{1FA6F}]/gu, // チェス記号
    /[\u{1FA70}-\u{1FAFF}]/gu, // 拡張シンボル
    /[\u{2600}-\u{26FF}]/gu,   // その他のシンボル
    /[\u{2700}-\u{27BF}]/gu,   // Dingbats
    /💡|📝|🎯|✅|🔄|🚨|📊|🏗️|⚠️|🔧|📋|🎉/g // よく使う絵文字を個別指定
  ],
  
  // 除去するマークダウン記法
  MARKDOWN_PATTERNS: [
    /\*\*(.*?)\*\*/g,      // **太字** → 中身のテキストのみ
    /\*(.*?)\*/g,          // *斜体* → 中身のテキストのみ
    /`(.*?)`/g,            // `コード` → 中身のテキストのみ
    /~~(.*?)~~/g,          // ~~取り消し線~~ → 中身のテキストのみ
    /#{1,6}\s*(.*?)$/gm,   // # 見出し → 中身のテキストのみ
    />\s*(.*?)$/gm,        // > 引用 → 中身のテキストのみ
    /\[(.*?)\]\(.*?\)/g,   // [リンクテキスト](URL) → リンクテキストのみ
    /```[\s\S]*?```/g,     // ```コードブロック``` → 完全除去
    /`([^`]+)`/g           // インラインコード → 中身のテキストのみ
  ],
  
  // 除去するHTMLタグ
  HTML_PATTERNS: [
    /<[^>]*>/g,            // すべてのHTMLタグを除去
    /&[a-zA-Z]+;/g         // HTMLエンティティ（&amp; &lt; など）
  ],
  
  // 音声で不要な記号
  SYMBOL_PATTERNS: [
    /[「」『』【】]/g,       // 日本語の括弧
    /[（）]/g,              // 全角括弧
    /••/g,                  // 箇条書きの点
    /[•·]/g,                // 他の箇条書き記号
    /^\s*[-*+]\s+/gm,       // 箇条書きの記号（行頭）
    /^\s*\d+\.\s+/gm        // 番号付きリスト（行頭）
  ],
  
  // 音声読み上げ用の置換パターン
  REPLACEMENTS: [
    { pattern: /\br\b/gi, replacement: 'are' },          // r → are
    { pattern: /\bu\b/gi, replacement: 'you' },          // u → you  
    { pattern: /\bw\/\b/gi, replacement: 'with' },       // w/ → with
    { pattern: /\bw\b/gi, replacement: 'with' },         // w → with
    { pattern: /\&/g, replacement: 'and' },              // & → and
    { pattern: /\@/g, replacement: 'at' },               // @ → at
    { pattern: /\+/g, replacement: 'plus' },             // + → plus
    { pattern: /\#/g, replacement: 'number' },           // # → number
    { pattern: /\$/g, replacement: 'dollar' },           // $ → dollar
    { pattern: /\%/g, replacement: 'percent' }           // % → percent
  ]
};

// UIメッセージ
export const UI_MESSAGES = {
  PLACEHOLDER: {
    DEFAULT: "Type a message and press Enter",
    VOICE_ENABLED: "Type a message or press Space to start voice input",
    LISTENING: "Listening... (Press Enter to stop & send)"
  },
  
  ERRORS: {
    NO_SPEECH: 'No speech detected - user may need to speak louder',
    AUDIO_CAPTURE: 'Microphone access denied. Please allow microphone access to use voice input.',
    NOT_ALLOWED: 'Microphone access not allowed. Please check your browser settings.',
    SPEECH_RECOGNITION_NOT_SUPPORTED: 'Speech recognition is not supported in this browser.',
    SERVER_ERROR: 'Error contacting server'
  },
  
  FALLBACK_WELCOME: "Hello! Welcome to English Communication App! I'm your English practice partner. How are you today?"
};

// キーボードショートカット
export const KEYBOARD_SHORTCUTS = {
  VOICE_INPUT: 'Space',
  SEND_MESSAGE: 'Enter'
};
