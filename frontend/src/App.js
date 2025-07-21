// ============================================================================
// メインアプリケーションコンポーネント
// 日本人向け英語会話練習アプリのメインファイルです
// リファクタリング後：機能別にコンポーネントとフックに分離
// ============================================================================

import React, { useState, useEffect } from 'react';
import './App.css';
import './styles/design-system.css';

// エラーハンドリング
import { 
  setupConsoleErrorFiltering, 
  detectProblematicExtensions, 
  showExtensionWarning 
} from './utils/errorHandling';

// カスタムフック
import { useSettings } from './hooks/useSettings';
import { useVoiceInput } from './hooks/useVoiceInput';
import { useVoiceOutput } from './hooks/useVoiceOutput';
import { useChat } from './hooks/useChat';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

// UIコンポーネント
import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/Header';
import SettingsPanel from './components/SettingsPanel';
import ChatBox from './components/ChatBox';
import InputArea from './components/InputArea';
import GeminiChat from './components/GeminiChat';
import InstantTranslation from './components/InstantTranslation';
import ListeningMode from './components/ListeningMode';

function App() {
  // ============================================================================
  // アプリケーション状態管理
  // ============================================================================
  
  // ユーザー入力テキストの状態
  const [input, setInput] = useState('');
  
  // モード切り替えの状態（'chat', 'translation', 'listening'）
  const [currentMode, setCurrentMode] = useState('chat');

  // ============================================================================
  // エラーハンドリングとブラウザ拡張機能の対応
  // Initialize error handling and browser extension compatibility
  // ============================================================================
  
  useEffect(() => {
    // コンソールエラーフィルタリングの設定
    // Setup console error filtering for third-party extensions
    setupConsoleErrorFiltering();
    
    // 問題のある拡張機能の検出
    // Detect problematic browser extensions
    const detectedExtensions = detectProblematicExtensions();
    if (detectedExtensions.length > 0) {
      showExtensionWarning(detectedExtensions);
    }
  }, []);

  // ============================================================================
  // カスタムフックによる状態管理
  // ============================================================================
  
  // 設定管理（音声機能）
  const {
    isVoiceInputEnabled,
    isVoiceOutputEnabled,
    isGrammarCheckEnabled, // 常にtrue
    speakingRate,
    voiceInputTimeout,
    voiceName,
    toggleVoiceInput,
    toggleVoiceOutput,
    updateSpeakingRate,
    resetSpeakingRateToDefault,
    updateVoiceInputTimeout,
    updateVoiceName
  } = useSettings();

  // 音声出力機能（読み上げ速度とvoiceNameを含む）
  const { speak, isSpeechLoading } = useVoiceOutput(isVoiceOutputEnabled, speakingRate, voiceName);

  // チャット機能（AI応答時に音声出力）
  const {
    messages,
    isLoading,
    messagesEndRef,
    sendMessage
  } = useChat(isGrammarCheckEnabled, speak);

  // 音声入力機能
  const {
    isListening,
    transcript,
    toggleListening,
    clearTranscript,
    isSupported: isVoiceSupported
  } = useVoiceInput(voiceInputTimeout);


  // ============================================================================
  // イベントハンドラー
  // ============================================================================

  /**
   * メッセージ送信の処理
   * 音声認識の結果またはテキスト入力を送信します
   */
  const handleSendMessage = async () => {
    const messageToSend = isListening ? transcript : input;
    
    // 型安全性チェックを追加
    if (!messageToSend || typeof messageToSend !== 'string' || !messageToSend.trim()) {
      console.log('No valid message to send');
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

  /**
   * モード切り替えの処理
   * @param {string} mode - 切り替え先のモード（'chat', 'translation', 'listening'）
   */
  const handleModeChange = (mode) => {
    setCurrentMode(mode);
    
    // モード切り替え時に入力をクリア
    setInput('');
    if (isListening) {
      clearTranscript();
    }
    
    console.log(`Mode changed to: ${mode}`);
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
  // UIレンダリング - 改善されたレイアウト
  // ============================================================================
  return (
    <ErrorBoundary fallbackComponent="App">
      <div className="App">
        {/* 改善されたヘッダー - より明確なナビゲーション */}
        <ErrorBoundary fallbackComponent="Header">
          <Header 
            currentMode={currentMode}
            onModeChange={handleModeChange}
          />
        </ErrorBoundary>

        {/* メインコンテナ - 改善されたレスポンシブレイアウト */}
        <div className="main-container">
          {/* モードに応じたコンテンツ表示 */}
          {currentMode === 'chat' ? (
            // チャットモード - 改善されたレイアウト
            <div className="chat-mode-layout">
              {/* 左側：折りたたみ可能な設定パネル */}
              <aside className="settings-sidebar">
                <ErrorBoundary fallbackComponent="SettingsPanel">
                  <SettingsPanel
                    isVoiceInputEnabled={isVoiceInputEnabled}
                    isVoiceOutputEnabled={isVoiceOutputEnabled}
                    speakingRate={speakingRate}
                    voiceInputTimeout={voiceInputTimeout}
                    voiceName={voiceName}
                    isVoiceSupported={isVoiceSupported}
                    isLoading={isLoading}
                    isSpeechLoading={isSpeechLoading}
                    onVoiceInputToggle={toggleVoiceInput}
                    onVoiceOutputToggle={toggleVoiceOutput}
                    onSpeakingRateChange={updateSpeakingRate}
                    onSpeakingRateReset={resetSpeakingRateToDefault}
                    onVoiceInputTimeoutChange={updateVoiceInputTimeout}
                    onVoiceNameChange={updateVoiceName}
                  />
                </ErrorBoundary>
              </aside>

              {/* 中央：メインチャットエリア */}
              <main className="chat-main">
                <div className="chat-container">
                  <ErrorBoundary fallbackComponent="ChatBox">
                    <ChatBox 
                      messages={messages}
                      isLoading={isLoading}
                      messagesEndRef={messagesEndRef}
                    />
                  </ErrorBoundary>
                  
                  <ErrorBoundary fallbackComponent="InputArea">
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
                  </ErrorBoundary>
                </div>
              </main>

              {/* 右側：Geminiチャット - オプショナルパネル */}
              <aside className="gemini-sidebar">
                <ErrorBoundary fallbackComponent="GeminiChat">
                  <GeminiChat />
                </ErrorBoundary>
              </aside>
            </div>
          ) : currentMode === 'translation' ? (
            // 瞬間英作文モード - フルワイドレイアウト
            <div className="translation-mode-layout">
              <main className="translation-main">
                <ErrorBoundary fallbackComponent="InstantTranslation">
                  <InstantTranslation 
                    isVoiceInputEnabled={isVoiceInputEnabled}
                    isVoiceSupported={isVoiceSupported}
                    voiceInputTimeout={voiceInputTimeout}
                  />
                </ErrorBoundary>
              </main>
            </div>
          ) : (
            // リスニングモード - フルワイドレイアウト
            <div className="listening-mode-layout">
              <main className="listening-main">
                <ErrorBoundary fallbackComponent="ListeningMode">
                  <ListeningMode 
                    isVoiceOutputEnabled={isVoiceOutputEnabled}
                    speakingRate={speakingRate}
                    voiceName={voiceName}
                  />
                </ErrorBoundary>
              </main>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
