// ============================================================================
// エラーハンドリングユーティリティ
// アプリケーション全体で使用するエラー処理関数
// ============================================================================

/**
 * エラータイプの定義
 */
export const ERROR_TYPES = {
  NETWORK: 'NETWORK_ERROR',
  API: 'API_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  SPEECH_RECOGNITION: 'SPEECH_RECOGNITION_ERROR',
  SPEECH_SYNTHESIS: 'SPEECH_SYNTHESIS_ERROR',
  STORAGE: 'STORAGE_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
};

/**
 * カスタムエラークラス
 */
export class AppError extends Error {
  constructor(message, type = ERROR_TYPES.UNKNOWN, details = null) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * ネットワークエラーを判定
 */
export const isNetworkError = (error) => {
  return (
    error.code === 'NETWORK_ERROR' ||
    error.message.includes('fetch') ||
    error.message.includes('network') ||
    !navigator.onLine
  );
};

/**
 * エラーをユーザーフレンドリーなメッセージに変換
 */
export const getErrorMessage = (error) => {
  if (!error) return 'An unknown error occurred';

  // AppErrorの場合
  if (error instanceof AppError) {
    switch (error.type) {
      case ERROR_TYPES.NETWORK:
        return 'Network connection problem. Please check your internet connection.';
      case ERROR_TYPES.API:
        return 'Server is temporarily unavailable. Please try again later.';
      case ERROR_TYPES.SPEECH_RECOGNITION:
        return 'Voice recognition failed. Please try speaking again.';
      case ERROR_TYPES.SPEECH_SYNTHESIS:
        return 'Voice output failed. Please check your audio settings.';
      case ERROR_TYPES.VALIDATION:
        return error.message;
      case ERROR_TYPES.STORAGE:
        return 'Failed to save settings. Please check browser storage permissions.';
      default:
        return error.message;
    }
  }

  // 標準エラーの場合
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return 'Network connection problem. Please check your internet connection.';
  }

  if (error.name === 'AbortError') {
    return 'Request was cancelled. Please try again.';
  }

  if (error.message) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
};

/**
 * エラーをログに記録
 */
export const logError = (error, context = '') => {
  const errorInfo = {
    message: error.message || 'Unknown error',
    type: error.type || ERROR_TYPES.UNKNOWN,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href
  };

  // 開発環境では詳細ログ
  if (process.env.NODE_ENV === 'development') {
    console.error('🚨 Error occurred:', errorInfo);
  } else {
    // 本番環境では基本情報のみ
    console.error('Error:', error.message, 'Context:', context);
  }

  // TODO: 本番環境では外部ログサービスに送信
  // sendToLogService(errorInfo);
};

/**
 * 非同期関数を安全に実行
 */
export const safeAsync = async (asyncFn, fallbackValue = null) => {
  try {
    return await asyncFn();
  } catch (error) {
    logError(error, 'safeAsync');
    return fallbackValue;
  }
};

/**
 * プロミスのタイムアウト処理
 */
export const withTimeout = (promise, timeoutMs = 10000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new AppError('Request timeout', ERROR_TYPES.NETWORK)), timeoutMs)
    )
  ]);
};

/**
 * リトライ処理付きの非同期実行
 */
export const withRetry = async (asyncFn, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await asyncFn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // 指数バックオフでリトライ間隔を増加
      const waitTime = delay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError;
};
