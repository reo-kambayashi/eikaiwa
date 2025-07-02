// ============================================================================
// 音声関連定数
// 音声認識と音声合成の設定
// ============================================================================

// 音声認識の設定
export const SPEECH_RECOGNITION_CONFIG = {
  // 言語設定
  LANGUAGE: 'en-US',
  
  // 認識オプション
  CONTINUOUS: false,
  INTERIM_RESULTS: true,
  MAX_ALTERNATIVES: 1,
  
  // タイムアウト設定（秒）
  TIMEOUT_OPTIONS: [
    { value: 10, label: '10 seconds (10秒)' },
    { value: 20, label: '20 seconds (20秒)' },
    { value: 30, label: '30 seconds (30秒)' },
    { value: 60, label: '1 minute (1分)' },
    { value: 120, label: '2 minutes (2分)' }
  ],
  
  // デフォルト値
  DEFAULT_TIMEOUT: 30,
  MIN_TIMEOUT: 5,
  MAX_TIMEOUT: 300
};

// TTS（音声合成）の設定
export const TTS_CONFIG = {
  // 音声設定
  VOICE_LANGUAGE: 'en-US',
  VOICE_GENDER: 'female',
  VOICE_NAME: "kore", // Gemini TTS使用時の音声名（女性音声）
  
  // 読み上げ速度の設定
  SPEAKING_RATE: {
    MIN: 0.5,
    MAX: 2.0,
    STEP: 0.05
  },
  
  // デフォルト読み上げ速度
  DEFAULT_SPEAKING_RATE: 1.0,
  
  // レベル別デフォルト読み上げ速度
  DEFAULT_SPEAKING_RATES: {
    beginner: 1.0,     // ゆっくり
    intermediate: 1.3,  // 標準
    advanced: 1.5      // 少し速め
  },
  
  // ピッチとボリューム
  PITCH: 1.0,
  VOLUME: 1.0,
  
  // その他の設定
  LANG: 'en-US',
  LANGUAGE_CODE: 'en-US'
};
