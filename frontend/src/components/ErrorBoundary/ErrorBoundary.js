// ============================================================================
// エラーバウンダリーコンポーネント
// Reactコンポーネントのエラーをキャッチして優雅に処理
// Error Boundary Component for React error handling
// ============================================================================

import React from 'react';
import PropTypes from 'prop-types';
import { logError, isExtensionError } from '../../utils/errorHandling';
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      isExtensionRelated: false
    };
  }

  static getDerivedStateFromError(error) {
    // エラーが発生したときに状態を更新
    // Update state when an error occurs
    return { 
      hasError: true,
      isExtensionRelated: isExtensionError(error)
    };
  }

  componentDidCatch(error, errorInfo) {
    // エラーの詳細を保存
    // Store error details
    this.setState({
      error,
      errorInfo
    });

    // 拡張機能関連のエラーでない場合のみログに記録
    // Only log non-extension related errors
    if (!isExtensionError(error)) {
      logError(error, `ErrorBoundary: ${this.props.fallbackComponent || 'Unknown component'}`);
    }
  }

  render() {
    if (this.state.hasError) {
      // 拡張機能関連のエラーの場合は無視して子コンポーネントを表示
      // For extension-related errors, ignore and render children
      if (this.state.isExtensionRelated) {
        return this.props.children;
      }

      // カスタムフォールバックUIが提供されている場合
      // If custom fallback UI is provided
      if (this.props.fallback) {
        return React.createElement(this.props.fallback, {
          error: this.state.error,
          errorInfo: this.state.errorInfo,
          resetError: () => this.setState({ hasError: false, error: null, errorInfo: null })
        });
      }

      // デフォルトのエラーUI
      // Default error UI
      return (
        <div className="error-boundary">
          <div className="error-boundary__container">
            <h2 className="error-boundary__title">
              Something went wrong
              <br />
              何かエラーが発生しました
            </h2>
            <p className="error-boundary__message">
              An unexpected error occurred. Please refresh the page and try again.
              <br />
              予期しないエラーが発生しました。ページを更新して再度お試しください。
            </p>
            <button 
              className="error-boundary__button"
              onClick={() => window.location.reload()}
            >
              Refresh Page / ページを更新
            </button>
            {process.env.NODE_ENV === 'development' && (
              <details className="error-boundary__details">
                <summary>Error Details (Development)</summary>
                <pre className="error-boundary__error-text">
                  {this.state.error && this.state.error.toString()}
                  <br />
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.elementType,
  fallbackComponent: PropTypes.string
};

ErrorBoundary.defaultProps = {
  fallback: null,
  fallbackComponent: 'Unknown component'
};

export default ErrorBoundary;
