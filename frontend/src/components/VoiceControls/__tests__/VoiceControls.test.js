/**
 * Tests for VoiceControls component
 * 
 * Tests the voice control button functionality including rendering states,
 * accessibility, and user interactions.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import VoiceControls from '../VoiceControls';

describe('VoiceControls Component', () => {
  const defaultProps = {
    isListening: false,
    isEnabled: true,
    isSupported: true,
    isLoading: false,
    onToggle: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders voice control button when supported and enabled', () => {
    render(<VoiceControls {...defaultProps} />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('title', 'Start Voice Input');
    expect(button).toHaveAttribute('aria-label', 'Start voice recognition');
  });

  test('does not render when not supported', () => {
    render(<VoiceControls {...defaultProps} isSupported={false} />);
    
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  test('does not render when not enabled', () => {
    render(<VoiceControls {...defaultProps} isEnabled={false} />);
    
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  test('shows listening state correctly', () => {
    render(<VoiceControls {...defaultProps} isListening={true} />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('listening');
    expect(button).toHaveAttribute('title', 'Stop Voice');
    expect(button).toHaveAttribute('aria-label', 'Stop voice recognition');
    
    // Check for listening indicator
    expect(button.querySelector('.listening-indicator')).toBeInTheDocument();
    expect(button.querySelector('.pulse-dot')).toBeInTheDocument();
  });

  test('shows loading state correctly', () => {
    render(<VoiceControls {...defaultProps} isLoading={true} />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('disabled');
    expect(button).toBeDisabled();
  });

  test('calls onToggle when clicked', () => {
    const mockOnToggle = jest.fn();
    render(<VoiceControls {...defaultProps} onToggle={mockOnToggle} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockOnToggle).toHaveBeenCalledTimes(1);
  });

  test('does not call onToggle when disabled/loading', () => {
    const mockOnToggle = jest.fn();
    render(<VoiceControls {...defaultProps} isLoading={true} onToggle={mockOnToggle} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockOnToggle).not.toHaveBeenCalled();
  });

  test('has proper CSS classes for different states', () => {
    const { rerender } = render(<VoiceControls {...defaultProps} />);
    
    let button = screen.getByRole('button');
    expect(button).toHaveClass('voice-button');
    expect(button).not.toHaveClass('listening');
    expect(button).not.toHaveClass('disabled');
    
    // Test listening state
    rerender(<VoiceControls {...defaultProps} isListening={true} />);
    button = screen.getByRole('button');
    expect(button).toHaveClass('voice-button', 'listening');
    
    // Test loading state
    rerender(<VoiceControls {...defaultProps} isLoading={true} />);
    button = screen.getByRole('button');
    expect(button).toHaveClass('voice-button', 'disabled');
  });

  test('contains microphone icon', () => {
    render(<VoiceControls {...defaultProps} />);
    
    const button = screen.getByRole('button');
    const micIcon = button.querySelector('.microphone-icon');
    expect(micIcon).toBeInTheDocument();
  });

  test('accessibility attributes are correct', () => {
    render(<VoiceControls {...defaultProps} />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label');
    expect(button).toHaveAttribute('title');
    
    // Test that aria-label and title change with listening state
    expect(button.getAttribute('aria-label')).toContain('Start voice recognition');
    expect(button.getAttribute('title')).toBe('Start Voice Input');
  });

  test('handles combined states correctly', () => {
    render(
      <VoiceControls 
        {...defaultProps} 
        isListening={true} 
        isLoading={true} 
      />
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('voice-button', 'listening', 'disabled');
    expect(button).toBeDisabled();
    expect(button.querySelector('.listening-indicator')).toBeInTheDocument();
  });
});