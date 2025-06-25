// ============================================================================
// パフォーマンス監視ユーティリティ
// レンダリング、API呼び出し、メモリ使用量の監視
// ============================================================================

/**
 * パフォーマンス測定結果の保存
 */
const performanceMetrics = new Map();

/**
 * パフォーマンス測定を開始
 * @param {string} label - 測定ラベル
 */
export const startPerformanceMeasure = (label) => {
  if (process.env.NODE_ENV === 'development') {
    performance.mark(`${label}-start`);
  }
};

/**
 * パフォーマンス測定を終了し結果を記録
 * @param {string} label - 測定ラベル
 * @returns {number} 測定時間（ミリ秒）
 */
export const endPerformanceMeasure = (label) => {
  if (process.env.NODE_ENV === 'development') {
    const startMark = `${label}-start`;
    const endMark = `${label}-end`;
    const measureName = `${label}-measure`;
    
    performance.mark(endMark);
    performance.measure(measureName, startMark, endMark);
    
    const measure = performance.getEntriesByName(measureName)[0];
    const duration = measure.duration;
    
    // 結果を保存
    performanceMetrics.set(label, {
      label,
      duration,
      timestamp: Date.now()
    });
    
    console.log(`⏱️ Performance [${label}]: ${duration.toFixed(2)}ms`);
    
    // クリーンアップ
    performance.clearMarks(startMark);
    performance.clearMarks(endMark);
    performance.clearMeasures(measureName);
    
    return duration;
  }
  return 0;
};

/**
 * 関数実行時間を測定するデコレータ
 * @param {string} label - 測定ラベル
 * @param {Function} fn - 測定対象の関数
 * @returns {Function} ラップされた関数
 */
export const measurePerformance = (label, fn) => {
  return async (...args) => {
    startPerformanceMeasure(label);
    try {
      const result = await fn(...args);
      endPerformanceMeasure(label);
      return result;
    } catch (error) {
      endPerformanceMeasure(label);
      throw error;
    }
  };
};

/**
 * React コンポーネントのレンダリング時間を測定
 * @param {string} componentName - コンポーネント名
 */
export const measureRenderTime = (componentName) => {
  if (process.env.NODE_ENV === 'development') {
    return {
      onRenderStart: () => startPerformanceMeasure(`render-${componentName}`),
      onRenderEnd: () => endPerformanceMeasure(`render-${componentName}`)
    };
  }
  return {
    onRenderStart: () => {},
    onRenderEnd: () => {}
  };
};

/**
 * メモリ使用量を取得
 * @returns {Object} メモリ情報
 */
export const getMemoryUsage = () => {
  if ('memory' in performance) {
    const memory = performance.memory;
    return {
      used: Math.round(memory.usedJSHeapSize / 1024 / 1024 * 100) / 100, // MB
      total: Math.round(memory.totalJSHeapSize / 1024 / 1024 * 100) / 100, // MB
      limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024 * 100) / 100 // MB
    };
  }
  return null;
};

/**
 * パフォーマンス統計を取得
 * @returns {Object} パフォーマンス統計
 */
export const getPerformanceStats = () => {
  const stats = {
    measurements: Array.from(performanceMetrics.values()),
    memory: getMemoryUsage(),
    timestamp: Date.now()
  };
  
  if (process.env.NODE_ENV === 'development') {
    console.table(stats.measurements);
    if (stats.memory) {
      console.log('💾 Memory Usage:', stats.memory);
    }
  }
  
  return stats;
};

/**
 * パフォーマンスデータをクリア
 */
export const clearPerformanceData = () => {
  performanceMetrics.clear();
  console.log('🗑️ Performance data cleared');
};

/**
 * レンダリング最適化のためのReact用フック
 */
export const usePerformanceMonitor = (componentName) => {
  if (process.env.NODE_ENV === 'development') {
    const { onRenderStart, onRenderEnd } = measureRenderTime(componentName);
    
    React.useEffect(() => {
      onRenderStart();
      return onRenderEnd;
    });
    
    // メモリ使用量を定期的にログ出力
    React.useEffect(() => {
      const interval = setInterval(() => {
        const memory = getMemoryUsage();
        if (memory && memory.used > 50) { // 50MB以上で警告
          console.warn(`⚠️ High memory usage in ${componentName}:`, memory);
        }
      }, 30000); // 30秒間隔
      
      return () => clearInterval(interval);
    }, [componentName]);
  }
};

/**
 * バンドルサイズ分析用のimport追跡
 */
export const trackImport = (moduleName, size = null) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`📦 Import: ${moduleName}${size ? ` (${size} KB)` : ''}`);
  }
};
