// ============================================================================
// 設定定数ファイル
// アプリケーションで使用する設定のデフォルト値と制限値を定義
// ============================================================================

// デフォルト設定値
export const DEFAULT_SETTINGS = {
  isVoiceInputEnabled: true,
  isVoiceOutputEnabled: true,
  isGrammarCheckEnabled: true,
  speakingRate: 1.0,
  voiceInputTimeout: 30
};

// 設定制限値
export const SETTINGS_LIMITS = {
  SPEAKING_RATE: {
    MIN: 0.5,
    MAX: 2.0,
    STEP: 0.1
  },
  VOICE_INPUT_TIMEOUT: {
    MIN: 5,
    MAX: 300,
    DEFAULT: 30
  }
};

// ローカルストレージのキー名
export const STORAGE_KEYS = {
  VOICE_INPUT: 'eikaiwa_voice_input',
  VOICE_OUTPUT: 'eikaiwa_voice_output',
  TRANSLATION_VOICE_OUTPUT: 'eikaiwa_translation_voice_output',
  GRAMMAR_CHECK: 'eikaiwa_grammar_check',
  SPEAKING_RATE: 'eikaiwa_speaking_rate',
  VOICE_TIMEOUT: 'eikaiwa_voice_timeout',
  VOICE_NAME: 'eikaiwa_voice_name'
};