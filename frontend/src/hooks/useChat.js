// ============================================================================
// チャット機能用カスタムフック
// メッセージの送受信、会話履歴の管理を行います
// ============================================================================

import { useState, useCallback, useRef, useEffect } from 'react';
import { sendMessageToAI } from '../utils/api';

/**
 * チャット機能を管理するカスタムフック
 * @param {boolean} isGrammarCheckEnabled - 文法チェック機能の有効状態
 * @param {Function} onAIResponse - AI応答時のコールバック関数
 * @returns {Object} チャット状態と制御関数
 */
export const useChat = (isGrammarCheckEnabled, onAIResponse) => {
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
   * チャットを初期化する関数（ウェルカムメッセージなし）
   */
  const initializeChat = useCallback(async () => {
    console.log('Initializing chat without welcome message');
    
    // 空のメッセージ配列で初期化
    setMessages([]);
    
    console.log('Chat initialized successfully (empty state)');
  }, []);

  /**
   * コンポーネントマウント時の初期化のみ実行
   */
  useEffect(() => {
    initializeChat();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 空の依存配列で初回のみ実行（initializeChatは意図的に依存関係から除外）

  /**
   * ユーザーメッセージを送信してAI応答を取得する関数
   * @param {string} messageText - 送信するメッセージ
   * @returns {Promise<boolean>} 送信成功/失敗
   */
  const sendMessage = useCallback(async (messageText) => {
    // 厳密な型チェックと検証
    if (!messageText) {
      console.log('Skipping send - no message provided');
      return false;
    }

    if (typeof messageText !== 'string') {
      console.log('Skipping send - message is not a string:', typeof messageText, messageText);
      return false;
    }

    const trimmedMessage = messageText.trim();
    if (!trimmedMessage) {
      console.log('Skipping send - message is empty after trim');
      return false;
    }

    if (isLoading) {
      console.log('Skipping send - already loading');
      return false;
    }

    console.log('Sending message:', trimmedMessage);

    // ユーザーメッセージを履歴に追加
    const userMessage = {
      sender: 'You',
      text: trimmedMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prevMessages => {
      const updatedMessages = [...prevMessages, userMessage];
      console.log('Updated messages with user message:', updatedMessages.length);
      return updatedMessages;
    });
    
    setIsLoading(true);

    try {
      // AIに現在のメッセージと会話履歴を送信
      // 注意: ここでは現在のmessages状態を使用（ユーザーメッセージ追加前の状態）
      const aiResponse = await sendMessageToAI(
        trimmedMessage,
        messages, // 現在の会話履歴を使用
        isGrammarCheckEnabled // 文法チェック設定を含める
      );

      console.log('✅ AI response received:', aiResponse);

      // AI応答を履歴に追加（オブジェクトからreplyプロパティを安全に抽出）
      let aiResponseText = 'I apologize, but I cannot respond right now.';
      
      if (aiResponse && typeof aiResponse === 'object') {
        if (typeof aiResponse.reply === 'string' && aiResponse.reply.trim()) {
          aiResponseText = aiResponse.reply.trim();
        } else if (typeof aiResponse === 'string') {
          aiResponseText = aiResponse.trim();
        }
      } else if (typeof aiResponse === 'string' && aiResponse.trim()) {
        aiResponseText = aiResponse.trim();
      }

      const aiMessage = {
        sender: 'AI Tutor',
        text: aiResponseText, // 文字列として確実に格納
        timestamp: new Date().toISOString(),
        // 追加情報（今後の機能拡張用）
        suggestions: aiResponse?.suggestions || [],
        grammarFeedback: aiResponse?.grammarFeedback || null,
        confidence: aiResponse?.confidence || 0
      };

      setMessages(prevMessages => {
        const finalMessages = [...prevMessages, aiMessage];
        console.log('Final messages with AI response:', finalMessages.length);
        return finalMessages;
      });

      // AI応答コールバックがある場合は実行（安全な文字列を渡す）
      if (onAIResponse && typeof onAIResponse === 'function') {
        onAIResponse(aiResponseText);
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
  }, [messages, isLoading, isGrammarCheckEnabled, onAIResponse]);

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
