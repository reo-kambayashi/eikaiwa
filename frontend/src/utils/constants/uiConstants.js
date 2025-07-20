// ============================================================================
// UI関連定数
// ユーザーインターフェース、メッセージ、アニメーション設定
// ============================================================================

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
  // ローディング関連
  LOADING_RESPONSE: 'AI is thinking...',
  PROCESSING_VOICE: 'Processing voice input...',
  
  // エラーメッセージ
  ERROR_NETWORK: 'Network error. Please check your connection.',
  ERROR_API: 'Server error. Please try again later.',
  ERROR_VOICE_NOT_SUPPORTED: 'Voice recognition is not supported in this browser.',
  ERROR_MICROPHONE_ACCESS: 'Microphone access denied. Please enable microphone permissions.',
  
  // 成功メッセージ
  SUCCESS_MESSAGE_SENT: 'Message sent successfully!',
  SUCCESS_SETTINGS_SAVED: 'Settings saved!',
  
  // 情報メッセージ
  INFO_VOICE_LISTENING: 'Listening... Speak now',
  INFO_VOICE_STOPPED: 'Voice input stopped',
  INFO_NO_MESSAGES: 'Start a conversation by typing or speaking!',
  
  // プレースホルダー
  PLACEHOLDER_INPUT: 'Type your message here or use voice input...',
  PLACEHOLDER_LISTENING: 'Voice input active... Please speak',
  
  // ボタンテキスト
  BUTTON_SEND: 'Send',
  BUTTON_CLEAR: 'Clear',
  BUTTON_RESET: 'Reset',
  BUTTON_START_VOICE: 'Start Voice',
  BUTTON_STOP_VOICE: 'Stop Voice',
  
  // エラー詳細
  ERRORS: {
    NO_SPEECH: 'No speech detected - user may need to speak louder',
    AUDIO_CAPTURE: 'Microphone access denied. Please allow microphone access to use voice input.',
    NOT_ALLOWED: 'Microphone access not allowed. Please check your browser settings.',
    SPEECH_RECOGNITION_NOT_SUPPORTED: 'Speech recognition is not supported in this browser.',
    SERVER_ERROR: 'Error contacting server'
  },
  
  // プレースホルダーバリエーション
  PLACEHOLDER: {
    DEFAULT: "Type a message",
    VOICE_ENABLED: "Type a message or use voice input",
    LISTENING: "Voice input active..."
  },
  
  // フォールバック
  FALLBACK_WELCOME: "Hello! Welcome to English Communication App! I'm your English practice partner. How are you today?"
};

// アニメーション設定
export const ANIMATION_CONFIG = {
  // 遷移時間（ミリ秒）
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  
  // イージング
  EASING: {
    EASE_OUT: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    EASE_IN_OUT: 'cubic-bezier(0.42, 0, 0.58, 1)',
    BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  }
};

// テキスト処理用正規表現パターン
export const TEXT_PROCESSING = {
  // 音声認識結果のクリーニング用
  REPLACEMENTS: [
    { pattern: /\br\b/gi, replacement: 'are' },          // r → are
    { pattern: /\bu\b/gi, replacement: 'you' },          // u → you  
    { pattern: /\bw\/\b/gi, replacement: 'with' },       // w/ → with
    { pattern: /\bw\b/gi, replacement: 'with' },         // w → with
    { pattern: /&/g, replacement: 'and' },               // & → and
    { pattern: /@/g, replacement: 'at' },                // @ → at
    { pattern: /\+/g, replacement: 'plus' },             // + → plus
    { pattern: /#/g, replacement: 'number' },            // # → number
    { pattern: /\$/g, replacement: 'dollar' },           // $ → dollar
    { pattern: /%/g, replacement: 'percent' }            // % → percent
  ],
  
  // 文字数制限
  MAX_MESSAGE_LENGTH: 500,
  MAX_INPUT_LENGTH: 1000,
  
  // 検証用パターン
  EMPTY_MESSAGE: /^\s*$/,
  VALID_EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
};
