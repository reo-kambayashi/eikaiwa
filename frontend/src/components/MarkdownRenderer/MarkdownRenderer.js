// ============================================================================
// マークダウンレンダラーコンポーネント
// チャットメッセージのマークダウン記法を安全に表示するコンポーネントです
// ============================================================================

import React, { memo } from 'react';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import './MarkdownRenderer.css';

/**
 * マークダウンレンダラーコンポーネント
 * @param {Object} props - コンポーネントプロパティ
 * @param {string} props.content - レンダリングするマークダウンコンテンツ
 * @param {string} props.className - 追加のCSSクラス名
 */
const MarkdownRenderer = ({ content, className = '' }) => {
  
  /**
   * カスタムコンポーネント定義
   * マークダウン要素をカスタマイズしてレンダリング
   */
  const components = {
    // コードブロックのスタイリング
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      
      return !inline && match ? (
        <SyntaxHighlighter
          style={oneLight}
          language={language}
          PreTag="div"
          className="code-block"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={`inline-code ${className || ''}`} {...props}>
          {children}
        </code>
      );
    },
    
    // リンクのセキュリティ対策
    a({ href, children, ...props }) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="markdown-link"
          {...props}
        >
          {children}
        </a>
      );
    },
    
    // 見出しのスタイリング
    h1: ({ children, ...props }) => (
      <h1 className="markdown-h1" {...props}>{children}</h1>
    ),
    h2: ({ children, ...props }) => (
      <h2 className="markdown-h2" {...props}>{children}</h2>
    ),
    h3: ({ children, ...props }) => (
      <h3 className="markdown-h3" {...props}>{children}</h3>
    ),
    h4: ({ children, ...props }) => (
      <h4 className="markdown-h4" {...props}>{children}</h4>
    ),
    h5: ({ children, ...props }) => (
      <h5 className="markdown-h5" {...props}>{children}</h5>
    ),
    h6: ({ children, ...props }) => (
      <h6 className="markdown-h6" {...props}>{children}</h6>
    ),
    
    // リストのスタイリング
    ul: ({ children, ...props }) => (
      <ul className="markdown-ul" {...props}>{children}</ul>
    ),
    ol: ({ children, ...props }) => (
      <ol className="markdown-ol" {...props}>{children}</ol>
    ),
    li: ({ children, ...props }) => (
      <li className="markdown-li" {...props}>{children}</li>
    ),
    
    // 引用のスタイリング
    blockquote: ({ children, ...props }) => (
      <blockquote className="markdown-blockquote" {...props}>
        {children}
      </blockquote>
    ),
    
    // テーブルのスタイリング（GFM拡張）
    table: ({ children, ...props }) => (
      <div className="table-wrapper">
        <table className="markdown-table" {...props}>
          {children}
        </table>
      </div>
    ),
    thead: ({ children, ...props }) => (
      <thead className="markdown-thead" {...props}>{children}</thead>
    ),
    tbody: ({ children, ...props }) => (
      <tbody className="markdown-tbody" {...props}>{children}</tbody>
    ),
    tr: ({ children, ...props }) => (
      <tr className="markdown-tr" {...props}>{children}</tr>
    ),
    th: ({ children, ...props }) => (
      <th className="markdown-th" {...props}>{children}</th>
    ),
    td: ({ children, ...props }) => (
      <td className="markdown-td" {...props}>{children}</td>
    ),
    
    // 段落のスタイリング
    p: ({ children, ...props }) => (
      <p className="markdown-p" {...props}>{children}</p>
    ),
    
    // 強調のスタイリング
    strong: ({ children, ...props }) => (
      <strong className="markdown-strong" {...props}>{children}</strong>
    ),
    em: ({ children, ...props }) => (
      <em className="markdown-em" {...props}>{children}</em>
    ),
    
    // 削除線（GFM拡張）
    del: ({ children, ...props }) => (
      <del className="markdown-del" {...props}>{children}</del>
    ),
    
    // 水平線
    hr: ({ ...props }) => (
      <hr className="markdown-hr" {...props} />
    ),
  };

  // 空のコンテンツの場合の処理
  if (!content || typeof content !== 'string') {
    return <span className="empty-content">No content</span>;
  }

  return (
    <div className={`markdown-renderer ${className}`}>
      <ReactMarkdown
        children={content}
        components={components}
        remarkPlugins={[remarkGfm]}
        // セキュリティ設定
        disallowedElements={['script', 'iframe', 'object', 'embed']}
        unwrapDisallowed={true}
      />
    </div>
  );
};

// PropTypesの定義
MarkdownRenderer.propTypes = {
  content: PropTypes.string.isRequired,
  className: PropTypes.string
};

// コンポーネント名を設定（デバッグ用）
MarkdownRenderer.displayName = 'MarkdownRenderer';

export default memo(MarkdownRenderer);
