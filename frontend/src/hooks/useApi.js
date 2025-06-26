// ============================================================================
// 汎用API呼び出しカスタムフック
// エラーハンドリング、ローディング状態、キャッシュ機能を統合
// ============================================================================

import { useState, useCallback, useRef } from 'react';
import { API_CONFIG } from '../utils/constants/apiConstants';

/**
 * 汎用的なAPI呼び出しフック
 * @param {Object} options - オプション設定
 * @param {boolean} options.enableCache - キャッシュを有効にするか
 * @param {number} options.cacheTimeout - キャッシュのタイムアウト（ミリ秒）
 * @returns {Object} API操作の状態と関数
 */
export const useApi = ({ enableCache = false, cacheTimeout = 5 * 60 * 1000 } = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  
  // キャッシュ管理
  const cacheRef = useRef(new Map());

  /**
   * キャッシュキーを生成
   * @param {string} url - API URL
   * @param {Object} options - リクエストオプション
   * @returns {string} キャッシュキー
   */
  const generateCacheKey = useCallback((url, options) => {
    const method = options?.method || 'GET';
    const body = options?.body || '';
    return `${method}:${url}:${body}`;
  }, []);

  /**
   * キャッシュから取得
   * @param {string} cacheKey - キャッシュキー
   * @returns {Object|null} キャッシュされたデータ
   */
  const getFromCache = useCallback((cacheKey) => {
    if (!enableCache) return null;
    
    const cached = cacheRef.current.get(cacheKey);
    if (!cached) return null;
    
    const now = Date.now();
    if (now - cached.timestamp > cacheTimeout) {
      cacheRef.current.delete(cacheKey);
      return null;
    }
    
    return cached.data;
  }, [enableCache, cacheTimeout]);

  /**
   * キャッシュに保存
   * @param {string} cacheKey - キャッシュキー
   * @param {any} data - 保存するデータ
   */
  const setCache = useCallback((cacheKey, data) => {
    if (!enableCache) return;
    
    cacheRef.current.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  }, [enableCache]);

  /**
   * 汎用的なAPI呼び出し
   * @param {string} endpoint - APIエンドポイント
   * @param {Object} options - fetchオプション
   * @param {Object} config - 追加設定
   * @param {Function} config.onSuccess - 成功時のコールバック
   * @param {Function} config.onError - エラー時のコールバック
   * @param {any} config.fallbackData - フォールバックデータ
   * @returns {Promise<any>} APIレスポンス
   */
  const apiCall = useCallback(async (endpoint, options = {}, config = {}) => {
    const { onSuccess, onError, fallbackData } = config;
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    const cacheKey = generateCacheKey(url, options);

    // キャッシュチェック
    const cachedData = getFromCache(cacheKey);
    if (cachedData) {
      setData(cachedData);
      return cachedData;
    }

    setIsLoading(true);
    setError(null);

    try {
      const defaultOptions = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      };

      const response = await fetch(url, defaultOptions);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      
      // キャッシュに保存
      setCache(cacheKey, responseData);
      
      setData(responseData);
      
      if (onSuccess) {
        onSuccess(responseData);
      }

      return responseData;

    } catch (err) {
      console.error(`API Error for ${endpoint}:`, err);
      setError(err.message);

      if (onError) {
        onError(err);
      }

      // フォールバックデータがある場合は使用
      if (fallbackData !== undefined) {
        setData(fallbackData);
        return fallbackData;
      }

      throw err;

    } finally {
      setIsLoading(false);
    }
  }, [generateCacheKey, getFromCache, setCache]);

  /**
   * GET リクエスト
   * @param {string} endpoint - APIエンドポイント
   * @param {Object} config - 設定
   * @returns {Promise<any>} APIレスポンス
   */
  const get = useCallback((endpoint, config = {}) => {
    return apiCall(endpoint, { method: 'GET' }, config);
  }, [apiCall]);

  /**
   * POST リクエスト
   * @param {string} endpoint - APIエンドポイント
   * @param {any} body - リクエストボディ
   * @param {Object} config - 設定
   * @returns {Promise<any>} APIレスポンス
   */
  const post = useCallback((endpoint, body = null, config = {}) => {
    return apiCall(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : null
    }, config);
  }, [apiCall]);

  /**
   * PUT リクエスト
   * @param {string} endpoint - APIエンドポイント
   * @param {any} body - リクエストボディ
   * @param {Object} config - 設定
   * @returns {Promise<any>} APIレスポンス
   */
  const put = useCallback((endpoint, body = null, config = {}) => {
    return apiCall(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : null
    }, config);
  }, [apiCall]);

  /**
   * DELETE リクエスト
   * @param {string} endpoint - APIエンドポイント
   * @param {Object} config - 設定
   * @returns {Promise<any>} APIレスポンス
   */
  const del = useCallback((endpoint, config = {}) => {
    return apiCall(endpoint, { method: 'DELETE' }, config);
  }, [apiCall]);

  /**
   * キャッシュをクリア
   * @param {string} pattern - クリアするキーのパターン（省略時は全クリア）
   */
  const clearCache = useCallback((pattern = null) => {
    if (!pattern) {
      cacheRef.current.clear();
      return;
    }

    const keys = Array.from(cacheRef.current.keys());
    keys.forEach(key => {
      if (key.includes(pattern)) {
        cacheRef.current.delete(key);
      }
    });
  }, []);

  /**
   * エラーをクリア
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * データをリセット
   */
  const resetData = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    isLoading,
    error,
    data,
    apiCall,
    get,
    post,
    put,
    delete: del,
    clearCache,
    clearError,
    resetData
  };
};