// ============================================================================
// 音声クリーニング機能のテストファイル（改善版）
// 新しいクリーニング機能の動作を確認するためのテストコード
// ============================================================================

// cleanTextForSpeech関数を直接インポートできないため、テスト用の実装をコピー
const cleanTextForSpeechTest = (text) => {
  if (!text) return '';
  if (typeof text !== 'string') return String(text);

  let cleaned = text;

  // 1. 絵文字を包括的に除去
  cleaned = cleaned.replace(/[\u{1F600}-\u{1F64F}]/gu, '');
  cleaned = cleaned.replace(/[\u{1F300}-\u{1F5FF}]/gu, '');
  cleaned = cleaned.replace(/[\u{1F680}-\u{1F6FF}]/gu, '');
  cleaned = cleaned.replace(/[\u{1F700}-\u{1F77F}]/gu, '');
  cleaned = cleaned.replace(/[\u{1F780}-\u{1F7FF}]/gu, '');
  cleaned = cleaned.replace(/[\u{1F800}-\u{1F8FF}]/gu, '');
  cleaned = cleaned.replace(/[\u{1F900}-\u{1F9FF}]/gu, '');
  cleaned = cleaned.replace(/[\u{1FA00}-\u{1FA6F}]/gu, '');
  cleaned = cleaned.replace(/[\u{2600}-\u{26FF}]/gu, '');
  cleaned = cleaned.replace(/[\u{2700}-\u{27BF}]/gu, '');
  cleaned = cleaned.replace(/[\u{FE00}-\u{FE0F}]/gu, '');
  cleaned = cleaned.replace(/\u{200D}/gu, '');
  cleaned = cleaned.replace(/[\u{1F1E6}-\u{1F1FF}]/gu, '');
  
  // 2. マークダウン記法を包括的に除去
  cleaned = cleaned.replace(/#{1,6}\s+/g, '');
  cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, '$1');
  cleaned = cleaned.replace(/\*(.*?)\*/g, '$1');
  cleaned = cleaned.replace(/_(.*?)_/g, '$1');
  cleaned = cleaned.replace(/`{3}[\s\S]*?`{3}/g, '');
  cleaned = cleaned.replace(/`(.*?)`/g, '$1');
  cleaned = cleaned.replace(/~~(.*?)~~/g, '$1');
  cleaned = cleaned.replace(/\[(.*?)\]\(.*?\)/g, '$1');
  cleaned = cleaned.replace(/!\[.*?\]\(.*?\)/g, '');
  cleaned = cleaned.replace(/^>\s+/gm, '');
  cleaned = cleaned.replace(/^[-*+]\s+/gm, '');
  cleaned = cleaned.replace(/^\d+\.\s+/gm, '');
  cleaned = cleaned.replace(/^---+$/gm, '');
  cleaned = cleaned.replace(/^\*{3,}$/gm, '');
  
  // 3. HTMLタグを除去
  cleaned = cleaned.replace(/<[^>]*>/g, ' ');
  
  // 4. 特殊文字・記号を処理
  cleaned = cleaned.replace(/&[a-zA-Z]+;/g, ' ');
  cleaned = cleaned.replace(/[\u{2000}-\u{206F}]/gu, ' ');
  cleaned = cleaned.replace(/[\u{2E00}-\u{2E7F}]/gu, ' ');
  
  // 5. 余分な改行・空白を整理
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  cleaned = cleaned.replace(/\s{2,}/g, ' ');
  cleaned = cleaned.replace(/^\s+|\s+$/g, '');
  
  return cleaned;
};

/**
 * 音声クリーニング機能のテストを実行
 */
export const testSpeechCleaning = () => {
  console.log('🧪 音声クリーニング機能のテスト開始（改善版）');
  
  const testCases = [
    {
      name: '基本的な絵文字除去テスト',
      input: 'Hello! 😊 How are you today? 🎉 Great to see you! 💡',
      expected: 'Hello! How are you today? Great to see you!'
    },
    {
      name: '複合絵文字除去テスト',
      input: 'Great job! 👨‍💻 Let\'s go 🏃‍♂️ and celebrate 🥳🎊',
      expected: 'Great job! Let\'s go and celebrate'
    },
    {
      name: '国旗絵文字除去テスト',
      input: 'I love 🇺🇸 America and 🇯🇵 Japan!',
      expected: 'I love America and Japan!'
    },
    {
      name: 'マークダウン記法除去テスト',
      input: '## Heading\nThis is **bold text** and this is *italic text* and `code snippet`.',
      expected: 'Heading This is bold text and this is italic text and code snippet.'
    },
    {
      name: 'リンク除去テスト',
      input: 'Check out [this link](https://example.com) and ![image](image.jpg)',
      expected: 'Check out this link and'
    },
    {
      name: 'コードブロック除去テスト',
      input: 'Here is some code:\n```javascript\nconsole.log("hello");\n```\nAnd this is after.',
      expected: 'Here is some code: And this is after.'
    },
    {
      name: 'HTMLタグ除去テスト',
      input: 'This is <strong>bold</strong> and <em>italic</em> text with <br/> breaks.',
      expected: 'This is bold and italic text with breaks.'
    },
    {
      name: 'リスト記法除去テスト',
      input: '- First item\n+ Second item\n* Third item\n1. Fourth item\n2. Fifth item',
      expected: 'First item Second item Third item Fourth item Fifth item'
    },
    {
      name: '引用記法除去テスト',
      input: '> This is a quote\n> Another line\nNormal text',
      expected: 'This is a quote Another line Normal text'
    },
    {
      name: '水平線除去テスト',
      input: 'Before line\n---\nAfter line\n***\nFinal text',
      expected: 'Before line After line Final text'
    },
    {
      name: '複合マークアップテスト',
      input: '# Title\n**Bold** and *italic* text with `code` and [link](url)\n- Item 1\n- Item 2',
      expected: 'Title Bold and italic text with code and link Item 1 Item 2'
    },
    {
      name: '空白・改行整理テスト',
      input: 'Too    many   spaces\n\n\n\nToo many newlines\n\n  \n  ',
      expected: 'Too many spaces\n\nToo many newlines'
    },
    {
      name: '複合テスト（絵文字+マークダウン+HTML）',
      input: '💡 **Grammar Check:** This is a `test` 🎯!\n- Feature 1 😊\n- <strong>Feature 2</strong> 🚀',
      expected: 'Grammar Check: This is a test ! Feature 1 Feature 2'
    },
    {
      name: '空文字テスト',
      input: '',
      expected: ''
    },
    {
      name: '絵文字のみテスト',
      input: '😊🎉💡🚀',
    },
    {
      name: 'マークダウンのみテスト',
      input: '**bold** *italic* `code`',
      expected: 'bold italic code'
    },
    {
      name: '空文字・空白のみテスト',
      input: '   🎉💡🔥   ',
      expected: ''
    }
  ];

  // テスト実行
  let passedTests = 0;
  let totalTests = testCases.length;

  testCases.forEach(testCase => {
    const result = cleanTextForSpeechTest(testCase.input);
    const passed = result === testCase.expected;
    
    if (passed) {
      passedTests++;
      console.log(`✅ ${testCase.name}: 合格`);
    } else {
      console.log(`❌ ${testCase.name}: 不合格`);
      console.log(`  入力: "${testCase.input}"`);
      console.log(`  期待: "${testCase.expected}"`);
      console.log(`  結果: "${result}"`);
    }
  });

  console.log(`\n🧪 テスト結果: ${passedTests}/${totalTests} 合格`);
  console.log('🏁 音声クリーニング機能のテスト完了');
  
  return {
    total: totalTests,
    passed: passedTests,
    failed: totalTests - passedTests,
    success: passedTests === totalTests
  };
};

// ブラウザのコンソールでtestSpeechCleaning()を実行してテストできます
if (typeof window !== 'undefined') {
  window.testSpeechCleaning = testSpeechCleaning;
}
