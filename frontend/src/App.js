// ============================================================================
// メインアプリケーションコンポーネント
// 日本人向け英語会話練習アプリのメインファイルです
// リファクタリング後：機能別にコンポーネントとフックに分離
// ============================================================================

import React, { useState } from 'react';
import './App.css';

// カスタムフック
import { useSettings } from './hooks/useSettings';
import { useVoiceInput } from './hooks/useVoiceInput';
import { useVoiceOutput } from './hooks/useVoiceOutput';
import { useChat } from './hooks/useChat';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

// UIコンポーネント
import SettingsPanel from './components/SettingsPanel';
import ChatBox from './components/ChatBox';
import InputArea from './components/InputArea';

// 定数とユーティリティ
import { API_CONFIG } from './utils/constants';

function App() {
  // ユーザー入力テキストの状態
  const [input, setInput] = useState('');

  // ============================================================================
  // カスタムフックによる状態管理
  // ============================================================================
  
  // 設定管理（英語レベル、練習タイプ、音声機能）
  const {
    level,
    practiceType,
    isVoiceInputEnabled,
    isVoiceOutputEnabled,
    isGrammarCheckEnabled,
    speakingRate,
    updateLevel,
    updatePracticeType,
    toggleVoiceInput,
    toggleVoiceOutput,
    toggleGrammarCheck,
    updateSpeakingRate,
    resetSpeakingRateToDefault
  } = useSettings();

  // 音声出力機能（読み上げ速度を含む）
  const { speak } = useVoiceOutput(isVoiceOutputEnabled, speakingRate);

  // チャット機能（AI応答時に音声出力）
  const {
    messages,
    isLoading,
    messagesEndRef,
    sendMessage
  } = useChat(level, practiceType, isGrammarCheckEnabled, speak);

  // 音声入力機能
  const {
    isListening,
    transcript,
    toggleListening,
    clearTranscript,
    isSupported: isVoiceSupported
  } = useVoiceInput();

  // ============================================================================
  // イベントハンドラー
  // ============================================================================

  /**
   * メッセージ送信の処理
   * 音声認識の結果またはテキスト入力を送信します
   */
  const handleSendMessage = async () => {
    const messageToSend = isListening ? transcript : input;
    
    if (!messageToSend.trim()) {
      console.log('No message to send');
      return;
    }

    console.log('Sending message:', messageToSend);

    // 先に入力をクリア（送信前にクリア）
    if (isListening) {
      clearTranscript();
    }
    setInput('');

    // メッセージを送信
    const success = await sendMessage(messageToSend);
    
    if (success) {
      console.log('Message sent successfully');
    } else {
      console.error('Failed to send message');
      // 送信に失敗した場合は入力値を復元
      setInput(messageToSend);
    }
  };

  /**
   * 音声入力の切り替え処理
   */
  const handleVoiceToggle = () => {
    const success = toggleListening();
    
    if (!success) {
      console.error('Failed to toggle voice input');
    }
  };

  /**
   * 入力値の変更処理
   * @param {string} value - 新しい入力値
   */
  const handleInputChange = (value) => {
    setInput(value);
  };

  // ============================================================================
  // キーボードショートカット
  // ============================================================================
  
  useKeyboardShortcuts({
    isVoiceInputEnabled,
    isListening,
    isLoading,
    onVoiceInputStart: handleVoiceToggle
  });

  // ============================================================================
  // 音声認識結果の入力への反映
  // ============================================================================
  
  // 音声認識の結果を入力フィールドに反映
  React.useEffect(() => {
    if (isListening && transcript) {
      setInput(transcript);
    }
  }, [transcript, isListening]);

  // ============================================================================
  // UIレンダリング
  // ============================================================================
  return (
    <div className="App">
      <h1>English Communication App</h1>
      
      {/* 学習設定パネル */}
      <SettingsPanel
        level={level}
        practiceType={practiceType}
        isVoiceInputEnabled={isVoiceInputEnabled}
        isVoiceOutputEnabled={isVoiceOutputEnabled}
        isGrammarCheckEnabled={isGrammarCheckEnabled}
        speakingRate={speakingRate}
        isVoiceSupported={isVoiceSupported}
        isLoading={isLoading}
        onLevelChange={updateLevel}
        onPracticeTypeChange={updatePracticeType}
        onVoiceInputToggle={toggleVoiceInput}
        onVoiceOutputToggle={toggleVoiceOutput}
        onGrammarCheckToggle={toggleGrammarCheck}
        onSpeakingRateChange={updateSpeakingRate}
        onSpeakingRateReset={resetSpeakingRateToDefault}
      />

      {/* チャット表示エリア */}
      <ChatBox 
        messages={messages}
        isLoading={isLoading}
        messagesEndRef={messagesEndRef}
      />

      {/* メッセージ入力エリア */}
      <InputArea
        value={input}
        isListening={isListening}
        isLoading={isLoading}
        isVoiceInputEnabled={isVoiceInputEnabled}
        isVoiceSupported={isVoiceSupported}
        onChange={handleInputChange}
        onSend={handleSendMessage}
        onVoiceToggle={handleVoiceToggle}
      />

      {/* デバッグ情報 */}
      <div className="debug-info">
        <small>API URL: {API_CONFIG.BASE_URL}</small>
        {/* 開発時の追加デバッグ情報 */}
        {process.env.NODE_ENV === 'development' && (
          <>
            <br />
            <small>Voice Supported: {isVoiceSupported ? 'Yes' : 'No'}</small>
            <br />
            <small>Listening: {isListening ? 'Yes' : 'No'}</small>
            <br />
            <small>Messages Count: {messages.length}</small>
            <br />
            <small>Current Input: "{input}"</small>
            <br />
            <small>Transcript: "{transcript}"</small>
            <br />
            <small>Speaking Rate: {speakingRate.toFixed(1)}x</small>
            <br />
            <small>Grammar Check: {isGrammarCheckEnabled ? 'Enabled' : 'Disabled'}</small>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
