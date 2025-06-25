// ============================================================================
// 定数定義ファイル（メイン）
// アプリケーション全体で使用される定数をここで管理します
// ============================================================================

// API関連の定数
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  ENDPOINTS: {
    WELCOME: '/api/welcome',
    RESPOND: '/api/respond',
    TTS: '/api/tts'
  },
  TIMEOUT: 30000,
  MAX_RETRIES: 3,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// 設定のデフォルト値
export const DEFAULT_SETTINGS = {
  isVoiceInputEnabled: true,
  isVoiceOutputEnabled: true
};

// 音声認識の設定
export const SPEECH_RECOGNITION_CONFIG = {
  LANGUAGE: 'en-US',
  CONTINUOUS: false,
  INTERIM_RESULTS: true,
  MAX_ALTERNATIVES: 1,
  TIMEOUT_OPTIONS: [
    { value: 10, label: '10 seconds (10秒)' },
    { value: 20, label: '20 seconds (20秒)' },
    { value: 30, label: '30 seconds (30秒)' },
    { value: 60, label: '1 minute (1分)' },
    { value: 120, label: '2 minutes (2分)' }
  ],
  DEFAULT_TIMEOUT: 30,
  MIN_TIMEOUT: 5,
  MAX_TIMEOUT: 300
};

// TTS（音声合成）の設定
export const TTS_CONFIG = {
  VOICE_LANGUAGE: 'en-US',
  VOICE_GENDER: 'female',
  SPEAKING_RATE: {
    MIN: 0.5,
    MAX: 2.0,
    STEP: 0.05
  },
  DEFAULT_SPEAKING_RATE: 1.0,
  PITCH: 1.0,
  VOLUME: 1.0,
  LANG: 'en-US',
  VOICE_NAME: null
};

// キーボードショートカット
export const KEYBOARD_SHORTCUTS = {
  SEND_MESSAGE: 'Enter',
  TOGGLE_VOICE_INPUT: 'Ctrl+Space',
  TOGGLE_VOICE_OUTPUT: 'Ctrl+Shift+S',
  CLEAR_CHAT: 'Ctrl+L',
  FOCUS_INPUT: 'Ctrl+I'
};

// UIメッセージ
export const UI_MESSAGES = {
  LOADING_RESPONSE: 'AI is thinking...',
  PROCESSING_VOICE: 'Processing voice input...',
  ERROR_NETWORK: 'Network error. Please check your connection.',
  ERROR_API: 'Server error. Please try again later.',
  ERROR_VOICE_NOT_SUPPORTED: 'Voice recognition is not supported in this browser.',
  ERROR_MICROPHONE_ACCESS: 'Microphone access denied. Please enable microphone permissions.',
  SUCCESS_MESSAGE_SENT: 'Message sent successfully!',
  SUCCESS_SETTINGS_SAVED: 'Settings saved!',
  INFO_VOICE_LISTENING: 'Listening... Speak now',
  INFO_VOICE_STOPPED: 'Voice input stopped',
  INFO_NO_MESSAGES: 'Start a conversation by typing or speaking!',
  PLACEHOLDER_INPUT: 'Type your message here or use voice input...',
  PLACEHOLDER_LISTENING: 'Listening... Please speak',
  BUTTON_SEND: 'Send',
  BUTTON_CLEAR: 'Clear',
  BUTTON_RESET: 'Reset',
  BUTTON_START_VOICE: 'Start Voice',
  BUTTON_STOP_VOICE: 'Stop Voice',
  ERRORS: {
    NO_SPEECH: 'No speech detected - user may need to speak louder',
    AUDIO_CAPTURE: 'Microphone access denied. Please allow microphone access to use voice input.',
    NOT_ALLOWED: 'Microphone access not allowed. Please check your browser settings.',
    SPEECH_RECOGNITION_NOT_SUPPORTED: 'Speech recognition is not supported in this browser.',
    SERVER_ERROR: 'Error contacting server'
  },
  PLACEHOLDER: {
    DEFAULT: "Type a message and press Enter",
    VOICE_ENABLED: "Type a message or press Space to start voice input",
    LISTENING: "Listening... (Press Enter to stop & send)"
  },
  FALLBACK_WELCOME: "Hello! Welcome to English Communication App! I'm your English practice partner. How are you today?"
};

// アニメーション設定
export const ANIMATION_CONFIG = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  EASING: {
    EASE_OUT: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    EASE_IN_OUT: 'cubic-bezier(0.42, 0, 0.58, 1)',
    BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  }
};

// テキスト処理用正規表現パターン
export const TEXT_PROCESSING = {
  REPLACEMENTS: [
    { pattern: /\br\b/gi, replacement: 'are' },
    { pattern: /\bu\b/gi, replacement: 'you' },
    { pattern: /\bw\/\b/gi, replacement: 'with' },
    { pattern: /\bw\b/gi, replacement: 'with' },
    { pattern: /&/g, replacement: 'and' },
    { pattern: /@/g, replacement: 'at' },
    { pattern: /\+/g, replacement: 'plus' },
    { pattern: /#/g, replacement: 'number' },
    { pattern: /\$/g, replacement: 'dollar' },
    { pattern: /%/g, replacement: 'percent' }
  ],
  MAX_MESSAGE_LENGTH: 500,
  MAX_INPUT_LENGTH: 1000,
  EMPTY_MESSAGE: /^\s*$/,
  VALID_EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
};
