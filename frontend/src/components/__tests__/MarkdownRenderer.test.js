// ============================================================================
// マークダウンレンダラーコンポーネントのテスト
// ============================================================================

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MarkdownRenderer from '../MarkdownRenderer';

describe('MarkdownRenderer Component', () => {
  
  /**
   * 基本的なテキストのレンダリングテスト
   */
  test('renders plain text correctly', () => {
    const plainText = 'Hello, world!';
    render(<MarkdownRenderer content={plainText} />);
    
    expect(screen.getByText('Hello, world!')).toBeInTheDocument();
  });

  /**
   * マークダウン記法のテスト - 太字
   */
  test('renders bold text correctly', () => {
    const boldText = 'This is **bold** text.';
    render(<MarkdownRenderer content={boldText} />);
    
    const boldElement = screen.getByText('bold');
    expect(boldElement).toBeInTheDocument();
    expect(boldElement.tagName).toBe('STRONG');
    expect(boldElement).toHaveClass('markdown-strong');
  });

  /**
   * マークダウン記法のテスト - 斜体
   */
  test('renders italic text correctly', () => {
    const italicText = 'This is *italic* text.';
    render(<MarkdownRenderer content={italicText} />);
    
    const italicElement = screen.getByText('italic');
    expect(italicElement).toBeInTheDocument();
    expect(italicElement.tagName).toBe('EM');
    expect(italicElement).toHaveClass('markdown-em');
  });

  /**
   * マークダウン記法のテスト - インラインコード
   */
  test('renders inline code correctly', () => {
    const codeText = 'Use `console.log()` to debug.';
    render(<MarkdownRenderer content={codeText} />);
    
    const codeElement = screen.getByText('console.log()');
    expect(codeElement).toBeInTheDocument();
    expect(codeElement.tagName).toBe('CODE');
    expect(codeElement).toHaveClass('inline-code');
  });

  /**
   * マークダウン記法のテスト - 見出し
   */
  test('renders headers correctly', () => {
    const headerText = '# Main Title\n## Subtitle\n### Section';
    render(<MarkdownRenderer content={headerText} />);
    
    expect(screen.getByText('Main Title')).toBeInTheDocument();
    expect(screen.getByText('Subtitle')).toBeInTheDocument();
    expect(screen.getByText('Section')).toBeInTheDocument();
    
    expect(screen.getByText('Main Title').tagName).toBe('H1');
    expect(screen.getByText('Subtitle').tagName).toBe('H2');
    expect(screen.getByText('Section').tagName).toBe('H3');
  });

  /**
   * マークダウン記法のテスト - リスト
   */
  test('renders lists correctly', () => {
    const listText = '- Item 1\n- Item 2\n- Item 3';
    render(<MarkdownRenderer content={listText} />);
    
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
    
    const listElement = screen.getByText('Item 1').closest('ul');
    expect(listElement).toHaveClass('markdown-ul');
  });

  /**
   * マークダウン記法のテスト - 番号付きリスト
   */
  test('renders ordered lists correctly', () => {
    const orderedListText = '1. First\n2. Second\n3. Third';
    render(<MarkdownRenderer content={orderedListText} />);
    
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
    expect(screen.getByText('Third')).toBeInTheDocument();
    
    const listElement = screen.getByText('First').closest('ol');
    expect(listElement).toHaveClass('markdown-ol');
  });

  /**
   * マークダウン記法のテスト - 引用
   */
  test('renders blockquotes correctly', () => {
    const quoteText = '> This is a quote\n> with multiple lines';
    render(<MarkdownRenderer content={quoteText} />);
    
    const quoteElement = screen.getByText('This is a quote with multiple lines').closest('blockquote');
    expect(quoteElement).toBeInTheDocument();
    expect(quoteElement).toHaveClass('markdown-blockquote');
  });

  /**
   * マークダウン記法のテスト - リンク
   */
  test('renders links correctly', () => {
    const linkText = 'Visit [Google](https://google.com) for search.';
    render(<MarkdownRenderer content={linkText} />);
    
    const linkElement = screen.getByText('Google');
    expect(linkElement).toBeInTheDocument();
    expect(linkElement.tagName).toBe('A');
    expect(linkElement).toHaveAttribute('href', 'https://google.com');
    expect(linkElement).toHaveAttribute('target', '_blank');
    expect(linkElement).toHaveAttribute('rel', 'noopener noreferrer');
    expect(linkElement).toHaveClass('markdown-link');
  });

  /**
   * 空のコンテンツの処理テスト
   */
  test('handles empty content gracefully', () => {
    render(<MarkdownRenderer content="" />);
    
    expect(screen.getByText('No content')).toBeInTheDocument();
    expect(screen.getByText('No content')).toHaveClass('empty-content');
  });

  /**
   * null/undefinedコンテンツの処理テスト
   */
  test('handles null and undefined content gracefully', () => {
    const { rerender } = render(<MarkdownRenderer content={null} />);
    expect(screen.getByText('No content')).toBeInTheDocument();
    
    rerender(<MarkdownRenderer content={undefined} />);
    expect(screen.getByText('No content')).toBeInTheDocument();
  });

  /**
   * カスタムCSSクラスの適用テスト
   */
  test('applies custom className correctly', () => {
    const customClass = 'custom-markdown-style';
    const { container } = render(<MarkdownRenderer content="Test content" className={customClass} />);
    
    const rendererElement = container.querySelector('.markdown-renderer');
    expect(rendererElement).toHaveClass('markdown-renderer');
    expect(rendererElement).toHaveClass(customClass);
  });

  /**
   * XSS対策のテスト - スクリプトタグの無効化
   */
  test('sanitizes dangerous content by removing script tags', () => {
    const dangerousContent = 'Safe content <script>alert("xss")</script> more content';
    render(<MarkdownRenderer content={dangerousContent} />);
    
    // スクリプトタグは除去され、安全なコンテンツのみ表示される
    expect(screen.getByText(/Safe content.*more content/)).toBeInTheDocument();
    expect(screen.queryByText('alert("xss")')).not.toBeInTheDocument();
  });

  /**
   * 日本語と英語の混在テキストのテスト
   */
  test('renders mixed Japanese and English content correctly', () => {
    const mixedText = 'こんにちは **Hello** 世界 *world*！';
    render(<MarkdownRenderer content={mixedText} />);
    
    expect(screen.getByText('こんにちは')).toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('世界')).toBeInTheDocument();
    expect(screen.getByText('world')).toBeInTheDocument();
    
    expect(screen.getByText('Hello').tagName).toBe('STRONG');
    expect(screen.getByText('world').tagName).toBe('EM');
  });

  /**
   * 長いテキストの処理テスト
   */
  test('handles long content correctly', () => {
    const longContent = 'Lorem ipsum '.repeat(100) + '**important text**';
    render(<MarkdownRenderer content={longContent} />);
    
    expect(screen.getByText('important text')).toBeInTheDocument();
    expect(screen.getByText('important text').tagName).toBe('STRONG');
  });
});
