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
  INTERIM_RESULTS: true
};

// 音声合成の設定
export const TTS_CONFIG = {
  VOICE_NAME: "en-US-Neural2-D",
  LANGUAGE_CODE: "en-US",
  SPEAKING_RATE: 1.0
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
