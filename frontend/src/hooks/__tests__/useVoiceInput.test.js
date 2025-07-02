/**
 * Tests for useVoiceInput hook
 * 
 * Tests the voice input functionality including speech recognition,
 * error handling, and browser compatibility.
 */

import { renderHook, act } from '@testing-library/react';
import useVoiceInput from '../useVoiceInput';

// Mock Speech Recognition API
const mockSpeechRecognition = {
  start: jest.fn(),
  stop: jest.fn(),
  abort: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  continuous: false,
  interimResults: false,
  lang: 'en-US'
};

const mockSpeechRecognitionConstructor = jest.fn().mockImplementation(() => mockSpeechRecognition);

Object.defineProperty(window, 'SpeechRecognition', {
  writable: true,
  value: mockSpeechRecognitionConstructor
});

Object.defineProperty(window, 'webkitSpeechRecognition', {
  writable: true,
  value: mockSpeechRecognitionConstructor
});

describe('useVoiceInput Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSpeechRecognition.addEventListener.mockClear();
    mockSpeechRecognition.removeEventListener.mockClear();
  });

  test('initializes with correct default state', () => {
    const { result } = renderHook(() => useVoiceInput());
    
    expect(result.current.isListening).toBe(false);
    expect(result.current.transcript).toBe('');
    expect(result.current.error).toBe(null);
    expect(result.current.isSupported).toBe(true);
    expect(typeof result.current.startListening).toBe('function');
    expect(typeof result.current.stopListening).toBe('function');
  });

  test('detects when speech recognition is not supported', () => {
    // Temporarily remove speech recognition support
    const originalSpeechRecognition = window.SpeechRecognition;
    const originalWebkitSpeechRecognition = window.webkitSpeechRecognition;
    
    delete window.SpeechRecognition;
    delete window.webkitSpeechRecognition;
    
    const { result } = renderHook(() => useVoiceInput());
    
    expect(result.current.isSupported).toBe(false);
    
    // Restore speech recognition
    window.SpeechRecognition = originalSpeechRecognition;
    window.webkitSpeechRecognition = originalWebkitSpeechRecognition;
  });

  test('starts listening when startListening is called', () => {
    const { result } = renderHook(() => useVoiceInput());
    
    act(() => {
      result.current.startListening();
    });
    
    expect(mockSpeechRecognition.start).toHaveBeenCalled();
    expect(result.current.isListening).toBe(true);
  });

  test('stops listening when stopListening is called', () => {
    const { result } = renderHook(() => useVoiceInput());
    
    // Start listening first
    act(() => {
      result.current.startListening();
    });
    
    // Then stop
    act(() => {
      result.current.stopListening();
    });
    
    expect(mockSpeechRecognition.stop).toHaveBeenCalled();
    expect(result.current.isListening).toBe(false);
  });

  test('handles speech recognition results', () => {
    const { result } = renderHook(() => useVoiceInput());
    
    act(() => {
      result.current.startListening();
    });
    
    // Simulate speech recognition result
    const mockEvent = {
      results: [
        {
          0: { transcript: 'Hello world' },
          isFinal: true
        }
      ]
    };
    
    act(() => {
      // Find the onresult callback and call it
      const resultCallback = mockSpeechRecognition.addEventListener.mock.calls
        .find(call => call[0] === 'result')[1];
      resultCallback(mockEvent);
    });
    
    expect(result.current.transcript).toBe('Hello world');
  });

  test('handles interim results', () => {
    const { result } = renderHook(() => useVoiceInput());
    
    act(() => {
      result.current.startListening();
    });
    
    // Simulate interim result
    const mockEvent = {
      results: [
        {
          0: { transcript: 'Hello' },
          isFinal: false
        }
      ]
    };
    
    act(() => {
      const resultCallback = mockSpeechRecognition.addEventListener.mock.calls
        .find(call => call[0] === 'result')[1];
      resultCallback(mockEvent);
    });
    
    expect(result.current.transcript).toBe('Hello');
  });

  test('handles speech recognition errors', () => {
    const { result } = renderHook(() => useVoiceInput());
    
    act(() => {
      result.current.startListening();
    });
    
    // Simulate error
    const mockErrorEvent = {
      error: 'no-speech'
    };
    
    act(() => {
      const errorCallback = mockSpeechRecognition.addEventListener.mock.calls
        .find(call => call[0] === 'error')[1];
      errorCallback(mockErrorEvent);
    });
    
    expect(result.current.error).toBeTruthy();
    expect(result.current.isListening).toBe(false);
  });

  test('handles different error types appropriately', () => {
    const { result } = renderHook(() => useVoiceInput());
    
    const errorTypes = [
      'no-speech',
      'audio-capture',
      'not-allowed',
      'network'
    ];
    
    errorTypes.forEach(errorType => {
      act(() => {
        result.current.startListening();
      });
      
      const mockErrorEvent = { error: errorType };
      
      act(() => {
        const errorCallback = mockSpeechRecognition.addEventListener.mock.calls
          .find(call => call[0] === 'error')[1];
        errorCallback(mockErrorEvent);
      });
      
      expect(result.current.error).toBeTruthy();
      expect(result.current.isListening).toBe(false);
    });
  });

  test('automatically stops listening on end event', () => {
    const { result } = renderHook(() => useVoiceInput());
    
    act(() => {
      result.current.startListening();
    });
    
    expect(result.current.isListening).toBe(true);
    
    // Simulate end event
    act(() => {
      const endCallback = mockSpeechRecognition.addEventListener.mock.calls
        .find(call => call[0] === 'end')[1];
      endCallback();
    });
    
    expect(result.current.isListening).toBe(false);
  });

  test('clears transcript when starting new listening session', () => {
    const { result } = renderHook(() => useVoiceInput());
    
    // Set initial transcript
    act(() => {
      result.current.startListening();
    });
    
    const mockEvent = {
      results: [
        {
          0: { transcript: 'Previous text' },
          isFinal: true
        }
      ]
    };
    
    act(() => {
      const resultCallback = mockSpeechRecognition.addEventListener.mock.calls
        .find(call => call[0] === 'result')[1];
      resultCallback(mockEvent);
    });
    
    expect(result.current.transcript).toBe('Previous text');
    
    // Stop and start again
    act(() => {
      result.current.stopListening();
    });
    
    act(() => {
      result.current.startListening();
    });
    
    expect(result.current.transcript).toBe('');
  });

  test('handles permission denied error', () => {
    const { result } = renderHook(() => useVoiceInput());
    
    act(() => {
      result.current.startListening();
    });
    
    const mockErrorEvent = { error: 'not-allowed' };
    
    act(() => {
      const errorCallback = mockSpeechRecognition.addEventListener.mock.calls
        .find(call => call[0] === 'error')[1];
      errorCallback(mockErrorEvent);
    });
    
    expect(result.current.error).toContain('マイクへのアクセス');
  });

  test('handles network error', () => {
    const { result } = renderHook(() => useVoiceInput());
    
    act(() => {
      result.current.startListening();
    });
    
    const mockErrorEvent = { error: 'network' };
    
    act(() => {
      const errorCallback = mockSpeechRecognition.addEventListener.mock.calls
        .find(call => call[0] === 'error')[1];
      errorCallback(mockErrorEvent);
    });
    
    expect(result.current.error).toContain('ネットワーク');
  });

  test('cleans up event listeners on unmount', () => {
    const { unmount } = renderHook(() => useVoiceInput());
    
    expect(mockSpeechRecognition.addEventListener).toHaveBeenCalled();
    
    unmount();
    
    expect(mockSpeechRecognition.removeEventListener).toHaveBeenCalled();
  });

  test('prevents multiple simultaneous listening sessions', () => {
    const { result } = renderHook(() => useVoiceInput());
    
    act(() => {
      result.current.startListening();
    });
    
    const startCallCount = mockSpeechRecognition.start.mock.calls.length;
    
    // Try to start again while already listening
    act(() => {
      result.current.startListening();
    });
    
    // Should not call start again
    expect(mockSpeechRecognition.start.mock.calls.length).toBe(startCallCount);
  });

  test('configures speech recognition with correct settings', () => {
    renderHook(() => useVoiceInput());
    
    expect(mockSpeechRecognitionConstructor).toHaveBeenCalled();
    expect(mockSpeechRecognition.continuous).toBe(false);
    expect(mockSpeechRecognition.interimResults).toBe(true);
    expect(mockSpeechRecognition.lang).toBe('en-US');
  });
});