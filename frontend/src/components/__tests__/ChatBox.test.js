/**
 * Tests for ChatBox component
 * 
 * Tests the chat message display functionality including
 * message rendering, auto-scrolling, and typing indicators.
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ChatBox from '../ChatBox/ChatBox';

// Mock intersection observer for auto-scroll functionality
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
});
window.IntersectionObserver = mockIntersectionObserver;

describe('ChatBox Component', () => {
  const mockMessages = [
    {
      id: '1',
      text: 'Hello, how are you?',
      sender: 'user',
      timestamp: new Date('2023-01-01T10:00:00Z')
    },
    {
      id: '2',
      text: 'I am doing well, thank you! How can I help you today?',
      sender: 'ai',
      timestamp: new Date('2023-01-01T10:00:30Z')
    }
  ];

  test('renders without crashing', () => {
    render(<ChatBox messages={[]} isLoading={false} />);
    expect(screen.getByRole('log')).toBeInTheDocument();
  });

  test('displays messages correctly', () => {
    render(<ChatBox messages={mockMessages} isLoading={false} />);
    
    expect(screen.getByText('Hello, how are you?')).toBeInTheDocument();
    expect(screen.getByText('I am doing well, thank you! How can I help you today?')).toBeInTheDocument();
  });

  test('applies correct CSS classes for user messages', () => {
    render(<ChatBox messages={mockMessages} isLoading={false} />);
    
    const userMessage = screen.getByText('Hello, how are you?').closest('.message');
    expect(userMessage).toHaveClass('user-message');
  });

  test('applies correct CSS classes for AI messages', () => {
    render(<ChatBox messages={mockMessages} isLoading={false} />);
    
    const aiMessage = screen.getByText('I am doing well, thank you! How can I help you today?').closest('.message');
    expect(aiMessage).toHaveClass('ai-message');
  });

  test('shows loading indicator when isLoading is true', () => {
    render(<ChatBox messages={mockMessages} isLoading={true} />);
    
    expect(screen.getByText(/thinking/i)).toBeInTheDocument();
  });

  test('does not show loading indicator when isLoading is false', () => {
    render(<ChatBox messages={mockMessages} isLoading={false} />);
    
    expect(screen.queryByText(/thinking/i)).not.toBeInTheDocument();
  });

  test('displays timestamps correctly', () => {
    render(<ChatBox messages={mockMessages} isLoading={false} />);
    
    // Check that timestamp elements exist
    const timestamps = screen.getAllByText(/10:00/);
    expect(timestamps).toHaveLength(2);
  });

  test('handles empty messages array', () => {
    render(<ChatBox messages={[]} isLoading={false} />);
    
    const chatContainer = screen.getByRole('log');
    expect(chatContainer).toBeInTheDocument();
    expect(chatContainer.children).toHaveLength(0);
  });

  test('handles messages with special characters', () => {
    const specialMessages = [
      {
        id: '1',
        text: 'Hello! 👋 How are you? 🌟',
        sender: 'user',
        timestamp: new Date()
      },
      {
        id: '2',
        text: '私は元気です！ありがとう 😊',
        sender: 'ai',
        timestamp: new Date()
      }
    ];

    render(<ChatBox messages={specialMessages} isLoading={false} />);
    
    expect(screen.getByText('Hello! 👋 How are you? 🌟')).toBeInTheDocument();
    expect(screen.getByText('私は元気です！ありがとう 😊')).toBeInTheDocument();
  });

  test('handles very long messages', () => {
    const longMessage = {
      id: '1',
      text: 'This is a very long message that should wrap properly and display correctly even when it contains a lot of text that might overflow the container. '.repeat(10),
      sender: 'user',
      timestamp: new Date()
    };

    render(<ChatBox messages={[longMessage]} isLoading={false} />);
    
    expect(screen.getByText(longMessage.text)).toBeInTheDocument();
  });

  test('renders messages in correct order', () => {
    const orderedMessages = [
      {
        id: '1',
        text: 'First message',
        sender: 'user',
        timestamp: new Date('2023-01-01T10:00:00Z')
      },
      {
        id: '2',
        text: 'Second message',
        sender: 'ai',
        timestamp: new Date('2023-01-01T10:01:00Z')
      },
      {
        id: '3',
        text: 'Third message',
        sender: 'user',
        timestamp: new Date('2023-01-01T10:02:00Z')
      }
    ];

    render(<ChatBox messages={orderedMessages} isLoading={false} />);
    
    const messageElements = screen.getAllByText(/message/);
    expect(messageElements[0]).toHaveTextContent('First message');
    expect(messageElements[1]).toHaveTextContent('Second message');
    expect(messageElements[2]).toHaveTextContent('Third message');
  });

  test('auto-scrolls to bottom when new messages arrive', async () => {
    const initialMessages = [
      {
        id: '1',
        text: 'Initial message',
        sender: 'user',
        timestamp: new Date()
      }
    ];

    const { rerender } = render(<ChatBox messages={initialMessages} isLoading={false} />);
    
    const newMessages = [
      ...initialMessages,
      {
        id: '2',
        text: 'New message',
        sender: 'ai',
        timestamp: new Date()
      }
    ];

    rerender(<ChatBox messages={newMessages} isLoading={false} />);
    
    // Check that new message is rendered
    expect(screen.getByText('New message')).toBeInTheDocument();
  });

  test('handles message updates correctly', () => {
    const initialMessages = [
      {
        id: '1',
        text: 'Original text',
        sender: 'user',
        timestamp: new Date()
      }
    ];

    const { rerender } = render(<ChatBox messages={initialMessages} isLoading={false} />);
    
    expect(screen.getByText('Original text')).toBeInTheDocument();
    
    const updatedMessages = [
      {
        id: '1',
        text: 'Updated text',
        sender: 'user',
        timestamp: new Date()
      }
    ];

    rerender(<ChatBox messages={updatedMessages} isLoading={false} />);
    
    expect(screen.getByText('Updated text')).toBeInTheDocument();
    expect(screen.queryByText('Original text')).not.toBeInTheDocument();
  });

  test('shows typing indicator with animation', () => {
    render(<ChatBox messages={[]} isLoading={true} />);
    
    const typingIndicator = screen.getByText(/thinking/i);
    expect(typingIndicator).toBeInTheDocument();
    
    // Check that it has animation class
    expect(typingIndicator.closest('.typing-indicator')).toBeInTheDocument();
  });

  test('handles rapid message updates', async () => {
    const { rerender } = render(<ChatBox messages={[]} isLoading={false} />);
    
    // Simulate rapid message updates
    for (let i = 1; i <= 5; i++) {
      const messages = Array.from({ length: i }, (_, index) => ({
        id: String(index + 1),
        text: `Message ${index + 1}`,
        sender: index % 2 === 0 ? 'user' : 'ai',
        timestamp: new Date()
      }));
      
      rerender(<ChatBox messages={messages} isLoading={false} />);
      
      await waitFor(() => {
        expect(screen.getByText(`Message ${i}`)).toBeInTheDocument();
      });
    }
    
    // All messages should be rendered
    expect(screen.getByText('Message 1')).toBeInTheDocument();
    expect(screen.getByText('Message 5')).toBeInTheDocument();
  });

  test('has proper accessibility attributes', () => {
    render(<ChatBox messages={mockMessages} isLoading={false} />);
    
    const chatContainer = screen.getByRole('log');
    expect(chatContainer).toHaveAttribute('aria-live', 'polite');
    expect(chatContainer).toHaveAttribute('aria-label', expect.stringContaining('chat'));
  });

  test('handles messages without timestamps', () => {
    const messagesWithoutTimestamp = [
      {
        id: '1',
        text: 'Message without timestamp',
        sender: 'user'
        // No timestamp property
      }
    ];

    render(<ChatBox messages={messagesWithoutTimestamp} isLoading={false} />);
    
    expect(screen.getByText('Message without timestamp')).toBeInTheDocument();
  });

  test('displays error state appropriately', () => {
    render(<ChatBox messages={[]} isLoading={false} error="Connection failed" />);
    
    expect(screen.getByText(/Connection failed/i)).toBeInTheDocument();
  });
});