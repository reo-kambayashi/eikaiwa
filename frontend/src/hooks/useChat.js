// ============================================================================
// チャット機能用カスタムフック
// メッセージの送受信、会話履歴の管理を行います
// ============================================================================

import { useState, useCallback, useRef, useEffect } from 'react';
import { fetchWelcomeMessage, sendMessageToAI } from '../utils/api';

/**
 * チャット機能を管理するカスタムフック
 * @param {string} level - 英語レベル
 * @param {string} practiceType - 練習タイプ
 * @param {Function} onAIResponse - AI応答時のコールバック関数
 * @returns {Object} チャット状態と制御関数
 */
export const useChat = (level, practiceType, onAIResponse) => {
  // メッセージ履歴の管理
  const [messages, setMessages] = useState([]);
  
  // ローディング状態の管理
  const [isLoading, setIsLoading] = useState(false);
  
  // 自動スクロール用の参照
  const messagesEndRef = useRef(null);

  /**
   * メッセージリストの最下部にスクロールする関数
   */
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  /**
   * 新しいメッセージが追加されたときに自動スクロール
   */
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  /**
   * ウェルカムメッセージを取得してチャットを初期化する関数
   */
  const initializeChat = useCallback(async () => {
    try {
      console.log('Initializing chat with:', { level, practiceType });
      
      const welcomeText = await fetchWelcomeMessage(level, practiceType);
      const welcomeMessage = { 
        sender: 'AI Tutor', 
        text: welcomeText,
        timestamp: new Date().toISOString()
      };
      
      setMessages([welcomeMessage]);
      
      // AI応答コールバックがある場合は実行
      if (onAIResponse) {
        onAIResponse(welcomeText);
      }
      
      console.log('Chat initialized successfully');
      
    } catch (error) {
      console.error('Error initializing chat:', error);
      
      // エラー時のフォールバックメッセージ
      const fallbackMessage = {
        sender: 'AI Tutor',
        text: "Hello! Welcome to English Communication App! I'm here to help you practice English. How are you today?",
        timestamp: new Date().toISOString()
      };
      
      setMessages([fallbackMessage]);
      
      if (onAIResponse) {
        onAIResponse(fallbackMessage.text);
      }
    }
  }, [level, practiceType, onAIResponse]);

  /**
   * 設定が変更されたときにチャットを再初期化
   */
  useEffect(() => {
    initializeChat();
  }, [initializeChat]);

  /**
   * ユーザーメッセージを送信してAI応答を取得する関数
   * @param {string} messageText - 送信するメッセージ
   * @returns {Promise<boolean>} 送信成功/失敗
   */
  const sendMessage = useCallback(async (messageText) => {
    // 空メッセージやローディング中はスキップ
    if (!messageText || !messageText.trim() || isLoading) {
      console.log('Skipping send - empty message or loading');
      return false;
    }

    const trimmedMessage = messageText.trim();
    console.log('Sending message:', trimmedMessage);

    // ユーザーメッセージを履歴に追加
    const userMessage = {
      sender: 'You',
      text: trimmedMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prevMessages => [...prevMessages, userMessage]);
    setIsLoading(true);

    try {
      // AIに現在のメッセージと会話履歴を送信
      const aiResponse = await sendMessageToAI(
        trimmedMessage,
        level,
        practiceType,
        messages // 現在の会話履歴を含める
      );

      // AI応答を履歴に追加
      const aiMessage = {
        sender: 'AI Tutor',
        text: aiResponse,
        timestamp: new Date().toISOString()
      };

      setMessages(prevMessages => [...prevMessages, aiMessage]);

      // AI応答コールバックがある場合は実行
      if (onAIResponse) {
        onAIResponse(aiResponse);
      }

      console.log('Message sent successfully');
      return true;

    } catch (error) {
      console.error('Error sending message:', error);

      // エラーメッセージを表示
      const errorMessage = {
        sender: 'AI Tutor',
        text: error.message || 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
        isError: true
      };

      setMessages(prevMessages => [...prevMessages, errorMessage]);
      return false;

    } finally {
      setIsLoading(false);
    }
  }, [level, practiceType, messages, isLoading, onAIResponse]);

  /**
   * チャット履歴をクリアする関数
   */
  const clearMessages = useCallback(() => {
    console.log('Clearing chat messages');
    setMessages([]);
    // クリア後に新しいウェルカムメッセージを取得
    initializeChat();
  }, [initializeChat]);

  /**
   * 特定のメッセージを削除する関数
   * @param {number} messageIndex - 削除するメッセージのインデックス
   */
  const removeMessage = useCallback((messageIndex) => {
    setMessages(prevMessages => 
      prevMessages.filter((_, index) => index !== messageIndex)
    );
  }, []);

  /**
   * 最後のメッセージを取得する関数
   * @returns {Object|null} 最後のメッセージまたはnull
   */
  const getLastMessage = useCallback(() => {
    return messages.length > 0 ? messages[messages.length - 1] : null;
  }, [messages]);

  /**
   * AI応答のみを取得する関数
   * @returns {Array} AI応答のみの配列
   */
  const getAIMessages = useCallback(() => {
    return messages.filter(message => message.sender === 'AI Tutor');
  }, [messages]);

  /**
   * ユーザーメッセージのみを取得する関数
   * @returns {Array} ユーザーメッセージのみの配列
   */
  const getUserMessages = useCallback(() => {
    return messages.filter(message => message.sender === 'You');
  }, [messages]);

  return {
    // 状態
    messages,
    isLoading,
    messagesEndRef,
    
    // 主要機能
    sendMessage,
    clearMessages,
    removeMessage,
    
    // ユーティリティ
    getLastMessage,
    getAIMessages,
    getUserMessages,
    scrollToBottom
  };
};
