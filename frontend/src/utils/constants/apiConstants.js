// ============================================================================
// API関連定数
// バックエンドAPIとの通信に関連する設定
// ============================================================================

export const API_CONFIG = {
  // 基本URL（環境変数から取得、フォールバックあり）
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  
  // APIエンドポイント
  ENDPOINTS: {
    WELCOME: '/api/welcome',
    RESPOND: '/api/respond',
    TTS: '/api/tts'
  },

  // リクエスト設定
  TIMEOUT: 30000, // 30秒
  MAX_RETRIES: 3,
  
  // HTTPヘッダー
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// デバッグ情報をコンソールに出力
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 API Configuration:', {
    BASE_URL: API_CONFIG.BASE_URL,
    REACT_APP_API_URL: process.env.REACT_APP_API_URL,
    ENDPOINTS: API_CONFIG.ENDPOINTS
  });
}
