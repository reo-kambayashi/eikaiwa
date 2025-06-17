// ============================================================================
// アプリケーション設定関連定数
// 英語レベル、練習タイプなどのユーザー設定
// ============================================================================

// 英語レベルの定義
export const ENGLISH_LEVELS = [
  { value: 'beginner', label: 'Beginner (初級)', description: '基本的な単語と短い文章' },
  { value: 'intermediate', label: 'Intermediate (中級)', description: '日常会話と複雑な文法' },
  { value: 'advanced', label: 'Advanced (上級)', description: '流暢な会話と高度な表現' }
];

// 練習タイプの定義
export const PRACTICE_TYPES = [
  { 
    value: 'conversation', 
    label: 'Conversation (会話)', 
    description: '自然な会話練習',
    icon: '💬'
  },
  { 
    value: 'grammar', 
    label: 'Grammar (文法)', 
    description: '文法ルールの理解と応用',
    icon: '📚'
  },
  { 
    value: 'vocabulary', 
    label: 'Vocabulary (語彙)', 
    description: '新しい単語の学習',
    icon: '📖'
  },
  { 
    value: 'pronunciation', 
    label: 'Pronunciation (発音)', 
    description: '正しい発音の練習',
    icon: '🗣️'
  }
];

// 設定のデフォルト値
export const DEFAULT_SETTINGS = {
  level: 'beginner',
  practiceType: 'conversation',
  isVoiceInputEnabled: true,
  isVoiceOutputEnabled: true,
  isGrammarCheckEnabled: true
};
