// ============================================================================
// 定数定義ファイル（統合版）
// 個別の定数ファイルから必要な定数をまとめて再エクスポート
// ============================================================================

// 個別の定数ファイルからインポート
export * from './constants';

// 後方互換性のための旧定数構造もサポート
// 既存のコードが動作し続けるように、主要な定数を直接エクスポート
export { API_CONFIG } from './constants/apiConstants';
export { DEFAULT_SETTINGS, SETTINGS_LIMITS, STORAGE_KEYS } from './constants/settingsConstants';
export { SPEECH_RECOGNITION_CONFIG, TTS_CONFIG } from './constants/speechConstants';
export { KEYBOARD_SHORTCUTS, UI_MESSAGES, ANIMATION_CONFIG, TEXT_PROCESSING } from './constants/uiConstants';
