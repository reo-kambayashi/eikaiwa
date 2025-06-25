// ============================================================================
// -��#�p
// �������n-��h�թ��$
// ============================================================================

// -�n�թ��$
export const DEFAULT_SETTINGS = {
  isVoiceInputEnabled: true,
  isVoiceOutputEnabled: true,
  isGrammarCheckEnabled: true,
  speakingRate: 1.0,
  voiceInputTimeout: 30
};

// -�n6P$
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

// -��X(n����������
export const STORAGE_KEYS = {
  VOICE_INPUT: 'eikaiwa_voice_input',
  VOICE_OUTPUT: 'eikaiwa_voice_output',
  GRAMMAR_CHECK: 'eikaiwa_grammar_check',
  SPEAKING_RATE: 'eikaiwa_speaking_rate',
  VOICE_TIMEOUT: 'eikaiwa_voice_timeout'
};