// ============================================================================
// -š¢#šp
// ¢×ê±ü·çón-šîhÇÕ©ëÈ$
// ============================================================================

// -šnÇÕ©ëÈ$
export const DEFAULT_SETTINGS = {
  isVoiceInputEnabled: true,
  isVoiceOutputEnabled: true,
  isGrammarCheckEnabled: true,
  speakingRate: 1.0,
  voiceInputTimeout: 30
};

// -šn6P$
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

// -šÝX(níü«ë¹Èìü¸­ü
export const STORAGE_KEYS = {
  VOICE_INPUT: 'eikaiwa_voice_input',
  VOICE_OUTPUT: 'eikaiwa_voice_output',
  GRAMMAR_CHECK: 'eikaiwa_grammar_check',
  SPEAKING_RATE: 'eikaiwa_speaking_rate',
  VOICE_TIMEOUT: 'eikaiwa_voice_timeout'
};