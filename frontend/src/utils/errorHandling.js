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

/**
 * サードパーティ拡張機能のエラーパターンを定義
 * Third-party extension error patterns
 */
const EXTENSION_ERROR_PATTERNS = [
  // Grammarly extension errors
  /grm ERROR.*iterable.*Not supported.*in app messages/i,
  /grammarly/i,
  
  // LastPass extension errors  
  /lastpass/i,
  /lp-.*error/i,
  
  // Adblock extension errors
  /adblock/i,
  /ublock/i,
  
  // Other common extension patterns
  /extension.*error/i,
  /chrome-extension/i,
  /moz-extension/i,
  /webkit-masked-url/i,
  
  // Generic content script errors
  /content.*script.*error/i,
  /injected.*script.*error/i
];

/**
 * エラーがサードパーティ拡張機能によるものかを判定
 * Check if error is caused by third-party browser extensions
 */
export const isExtensionError = (error) => {
  if (!error) return false;
  
  const errorString = String(error.message || error.stack || error);
  return EXTENSION_ERROR_PATTERNS.some(pattern => pattern.test(errorString));
};

/**
 * コンソールエラーフィルタリングの設定
 * Setup console error filtering to suppress extension errors
 */
export const setupConsoleErrorFiltering = () => {
  // 元のconsole.errorを保存
  const originalConsoleError = console.error;
  
  // カスタムconsole.errorでラップ
  console.error = (...args) => {
    // エラーメッセージを文字列として結合
    const errorMessage = args.join(' ');
    
    // 拡張機能のエラーかチェック
    if (isExtensionError({ message: errorMessage })) {
      // 開発環境でのみ拡張機能エラーを表示（デバッグ用）
      if (process.env.NODE_ENV === 'development') {
        originalConsoleError('🔧 [Filtered Extension Error]:', ...args);
      }
      return; // エラーを表示しない
    }
    
    // アプリケーション自体のエラーは通常通り表示
    originalConsoleError(...args);
  };
  
  // グローバルエラーハンドラーの設定
  window.addEventListener('error', (event) => {
    if (isExtensionError(event.error)) {
      event.preventDefault(); // エラーの伝播を防ぐ
      return;
    }
    
    // アプリケーションエラーは通常通り処理
    logError(event.error, 'Global error handler');
  });
  
  // Promise rejectionのハンドラー
  window.addEventListener('unhandledrejection', (event) => {
    if (isExtensionError(event.reason)) {
      event.preventDefault(); // エラーの伝播を防ぐ
      return;
    }
    
    // アプリケーションエラーは通常通り処理
    logError(event.reason, 'Unhandled promise rejection');
  });
};

/**
 * ブラウザ拡張機能の検出
 * Detect problematic browser extensions
 */
export const detectProblematicExtensions = () => {
  const detectedExtensions = [];
  
  // Grammarly検出
  if (document.querySelector('grammarly-desktop-integration') || 
      window.grammarly || 
      document.querySelector('[data-grammarly-extension]')) {
    detectedExtensions.push('Grammarly');
  }
  
  // LastPass検出
  if (document.querySelector('[data-lastpass-extension]') ||
      window.lpVault ||
      document.querySelector('#lp-pom-root')) {
    detectedExtensions.push('LastPass');
  }
  
  // AdBlock系の検出
  if (window.adblockSuspended || 
      document.querySelector('[data-adblock-key]')) {
    detectedExtensions.push('AdBlock');
  }
  
  return detectedExtensions;
};

/**
 * 拡張機能による干渉の警告表示
 * Show warning about extension interference
 */
export const showExtensionWarning = (extensions) => {
  if (extensions.length === 0) return;
  
  const warningMessage = `
以下のブラウザ拡張機能が検出されました。
アプリの動作に影響する可能性があります：

${extensions.join(', ')}

問題が発生する場合は、これらの拡張機能を一時的に無効にしてお試しください。

The following browser extensions were detected.
They may interfere with the app's functionality:

${extensions.join(', ')}

If you experience issues, please try temporarily disabling these extensions.
  `;
  
  // 開発環境でのみ警告を表示
  if (process.env.NODE_ENV === 'development') {
    console.warn('🔧 Extension Warning:', warningMessage);
  }
  
  return warningMessage;
};
