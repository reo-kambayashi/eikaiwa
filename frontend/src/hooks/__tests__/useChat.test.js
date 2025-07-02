/**
 * Tests for useChat hook
 * 
 * Tests the main chat functionality including message sending,
 * conversation history management, and error handling.
 */

import { renderHook, act } from '@testing-library/react';
import useChat from '../useChat';

// Mock the API module
jest.mock('../../utils/api', () => ({
  sendMessage: jest.fn(),
  fetchWelcomeMessage: jest.fn()
}));

describe('useChat Hook', () => {
  const mockSendMessage = require('../../utils/api').sendMessage;
  const mockFetchWelcomeMessage = require('../../utils/api').fetchWelcomeMessage;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('initializes with empty messages and correct state', () => {
    const { result } = renderHook(() => useChat());
    
    expect(result.current.messages).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(typeof result.current.sendMessage).toBe('function');
    expect(typeof result.current.clearHistory).toBe('function');
  });

  test('sends message and updates conversation history', async () => {
    mockSendMessage.mockResolvedValue({ reply: 'AI response' });
    
    const { result } = renderHook(() => useChat());
    
    await act(async () => {
      await result.current.sendMessage('Hello');
    });
    
    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0]).toEqual({
      id: expect.any(String),
      text: 'Hello',
      sender: 'user',
      timestamp: expect.any(Date)
    });
    expect(result.current.messages[1]).toEqual({
      id: expect.any(String),
      text: 'AI response',
      sender: 'ai',
      timestamp: expect.any(Date)
    });
  });

  test('handles loading state correctly', async () => {
    mockSendMessage.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ reply: 'Response' }), 100)));
    
    const { result } = renderHook(() => useChat());
    
    act(() => {
      result.current.sendMessage('Hello');
    });
    
    expect(result.current.isLoading).toBe(true);
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 150));
    });
    
    expect(result.current.isLoading).toBe(false);
  });

  test('handles API errors gracefully', async () => {
    mockSendMessage.mockRejectedValue(new Error('API Error'));
    
    const { result } = renderHook(() => useChat());
    
    await act(async () => {
      await result.current.sendMessage('Hello');
    });
    
    expect(result.current.error).toBe('メッセージの送信に失敗しました。もう一度お試しください。');
    expect(result.current.isLoading).toBe(false);
  });

  test('clears conversation history', async () => {
    mockSendMessage.mockResolvedValue({ reply: 'AI response' });
    
    const { result } = renderHook(() => useChat());
    
    // Send a message first
    await act(async () => {
      await result.current.sendMessage('Hello');
    });
    
    expect(result.current.messages).toHaveLength(2);
    
    // Clear history
    act(() => {
      result.current.clearHistory();
    });
    
    expect(result.current.messages).toEqual([]);
  });

  test('fetches welcome message on initialization', async () => {
    mockFetchWelcomeMessage.mockResolvedValue({ reply: 'Welcome!' });
    
    const { result } = renderHook(() => useChat());
    
    await act(async () => {
      // Wait for welcome message to be fetched
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    expect(mockFetchWelcomeMessage).toHaveBeenCalled();
  });

  test('handles empty message input', async () => {
    const { result } = renderHook(() => useChat());
    
    await act(async () => {
      await result.current.sendMessage('');
    });
    
    // Should not send empty messages
    expect(result.current.messages).toHaveLength(0);
    expect(mockSendMessage).not.toHaveBeenCalled();
  });

  test('handles whitespace-only message input', async () => {
    const { result } = renderHook(() => useChat());
    
    await act(async () => {
      await result.current.sendMessage('   ');
    });
    
    // Should not send whitespace-only messages
    expect(result.current.messages).toHaveLength(0);
    expect(mockSendMessage).not.toHaveBeenCalled();
  });

  test('passes conversation history to API', async () => {
    mockSendMessage.mockResolvedValue({ reply: 'AI response' });
    
    const { result } = renderHook(() => useChat());
    
    // Send first message
    await act(async () => {
      await result.current.sendMessage('Hello');
    });
    
    // Send second message
    await act(async () => {
      await result.current.sendMessage('How are you?');
    });
    
    expect(mockSendMessage).toHaveBeenLastCalledWith(
      'How are you?',
      expect.arrayContaining([
        expect.objectContaining({ text: 'Hello', sender: 'user' }),
        expect.objectContaining({ text: 'AI response', sender: 'ai' })
      ])
    );
  });

  test('limits conversation history length', async () => {
    mockSendMessage.mockResolvedValue({ reply: 'AI response' });
    
    const { result } = renderHook(() => useChat());
    
    // Send many messages to test history limiting
    for (let i = 0; i < 15; i++) {
      await act(async () => {
        await result.current.sendMessage(`Message ${i}`);
      });
    }
    
    // Should limit history to prevent token overflow
    expect(result.current.messages.length).toBeLessThanOrEqual(20); // 10 pairs of user/ai messages
  });

  test('handles network timeout errors', async () => {
    mockSendMessage.mockRejectedValue(new Error('Network timeout'));
    
    const { result } = renderHook(() => useChat());
    
    await act(async () => {
      await result.current.sendMessage('Hello');
    });
    
    expect(result.current.error).toBeTruthy();
    expect(result.current.isLoading).toBe(false);
  });

  test('clears error state on successful message', async () => {
    mockSendMessage.mockRejectedValueOnce(new Error('API Error'))
                   .mockResolvedValueOnce({ reply: 'Success' });
    
    const { result } = renderHook(() => useChat());
    
    // First message fails
    await act(async () => {
      await result.current.sendMessage('Hello');
    });
    
    expect(result.current.error).toBeTruthy();
    
    // Second message succeeds
    await act(async () => {
      await result.current.sendMessage('Hello again');
    });
    
    expect(result.current.error).toBe(null);
  });
});