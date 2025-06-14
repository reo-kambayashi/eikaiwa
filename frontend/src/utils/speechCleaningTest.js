// ============================================================================
// 音声クリーニング機能のテストファイル
// この機能の動作を確認するためのテストコード
// ============================================================================

import { cleanTextForSpeech } from './api';

/**
 * 音声クリーニング機能のテストを実行
 */
export const testSpeechCleaning = () => {
  console.log('🧪 音声クリーニング機能のテスト開始');
  
  const testCases = [
    {
      name: '絵文字除去テスト',
      input: 'Hello! 😊 How are you today? 🎉 Great to see you! 💡',
      expected: 'Hello! How are you today? Great to see you!'
    },
    {
      name: 'マークダウン記法除去テスト',
      input: 'This is **bold text** and this is *italic text* and `code snippet`.',
      expected: 'This is bold text and this is italic text and code snippet.'
    },
    {
      name: 'コードブロック除去テスト',
      input: 'Here is some code: ```javascript\nconsole.log("hello");\n``` And this is after.',
      expected: 'Here is some code: And this is after.'
    },
    {
      name: 'HTMLタグ除去テスト',
      input: 'This is <strong>bold</strong> and <em>italic</em> text.',
      expected: 'This is bold and italic text.'
    },
    {
      name: '記号置換テスト',
      input: 'I am here w/ you & we can work @ the office + more tasks.',
      expected: 'I am here with you and we can work at the office plus more tasks.'
    },
    {
      name: '箇条書き除去テスト',
      input: '• First item\n• Second item\n- Third item\n1. Fourth item',
      expected: 'First item Second item Third item Fourth item'
    },
    {
      name: '複合テスト',
      input: '💡 **Grammar Check:** This is a `test` & it works w/ emojis 🎯!\n• Feature 1\n• Feature 2',
      expected: 'Grammar Check: This is a test and it works with emojis ! Feature 1 Feature 2'
    },
    {
      name: '空文字・空白のみテスト',
      input: '   🎉💡🔥   ',
      expected: ''
    }
  ];
  
  let passedTests = 0;
  let totalTests = testCases.length;
  
  testCases.forEach((testCase, index) => {
    const result = cleanTextForSpeech(testCase.input);
    const passed = result.trim() === testCase.expected.trim();
    
    console.log(`\n${index + 1}. ${testCase.name}:`);
    console.log(`   入力: "${testCase.input}"`);
    console.log(`   期待: "${testCase.expected}"`);
    console.log(`   結果: "${result}"`);
    console.log(`   判定: ${passed ? '✅ PASS' : '❌ FAIL'}`);
    
    if (passed) {
      passedTests++;
    }
  });
  
  console.log(`\n📊 テスト結果: ${passedTests}/${totalTests} 通過`);
  console.log(`成功率: ${(passedTests / totalTests * 100).toFixed(1)}%`);
  
  return passedTests === totalTests;
};

// ブラウザのコンソールでtestSpeechCleaning()を実行してテストできます
if (typeof window !== 'undefined') {
  window.testSpeechCleaning = testSpeechCleaning;
}
