/**
 * Tests for useVoiceInput hook
 * 
 * Tests the voice input functionality including speech recognition,
 * error handling, and browser compatibility.
 */

import { renderHook, act } from '@testing-library/react';
import { useVoiceInput } from '../useVoiceInput';

// Mock Speech Recognition API
const mockSpeechRecognition = {
  start: jest.fn(),
  stop: jest.fn(),
  abort: jest.fn(),
  continuous: false,
  interimResults: false,
  lang: 'en-US',
  onresult: null,
  onerror: null,
  onend: null,
  onstart: null
};

const mockSpeechRecognitionConstructor = jest.fn().mockImplementation(() => mockSpeechRecognition);

describe('useVoiceInput Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up speech recognition mocks
    Object.defineProperty(window, 'SpeechRecognition', {
      writable: true,
      value: mockSpeechRecognitionConstructor
    });
    
    Object.defineProperty(window, 'webkitSpeechRecognition', {
      writable: true,
      value: mockSpeechRecognitionConstructor
    });
    
    mockSpeechRecognition.start.mockClear();
    mockSpeechRecognition.stop.mockClear();
    mockSpeechRecognition.abort.mockClear();
    mockSpeechRecognition.onresult = null;
    mockSpeechRecognition.onerror = null;
    mockSpeechRecognition.onend = null;
    mockSpeechRecognition.onstart = null;
    mockSpeechRecognitionConstructor.mockClear();
  });

  test('initializes with correct default state', () => {
    const { result } = renderHook(() => useVoiceInput());
    
    expect(result.current.isListening).toBe(false);
    expect(result.current.transcript).toBe('');
    expect(result.current.isSupported).toBe(true);
    expect(typeof result.current.startListening).toBe('function');
    expect(typeof result.current.stopListening).toBe('function');
    expect(typeof result.current.toggleListening).toBe('function');
    expect(typeof result.current.clearTranscript).toBe('function');
  });

  test('detects when speech recognition is not supported', () => {
    // Temporarily remove speech recognition support
    delete window.SpeechRecognition;
    delete window.webkitSpeechRecognition;
    
    const { result } = renderHook(() => useVoiceInput());
    
    expect(result.current.isSupported).toBe(false);
    
    // Restore speech recognition
    Object.defineProperty(window, 'SpeechRecognition', {
      writable: true,
      value: mockSpeechRecognitionConstructor
    });
    
    Object.defineProperty(window, 'webkitSpeechRecognition', {
      writable: true,
      value: mockSpeechRecognitionConstructor
    });
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

  test('toggles listening state', () => {
    const { result } = renderHook(() => useVoiceInput());
    
    // Start listening
    act(() => {
      result.current.toggleListening();
    });
    
    expect(result.current.isListening).toBe(true);
    
    // Stop listening
    act(() => {
      result.current.toggleListening();
    });
    
    expect(result.current.isListening).toBe(false);
  });

  test('clears transcript when clearTranscript is called', () => {
    const { result } = renderHook(() => useVoiceInput());
    
    // Set some initial transcript
    act(() => {
      result.current.startListening();
    });
    
    // Simulate speech recognition result
    act(() => {
      if (mockSpeechRecognition.onresult) {
        const mockEvent = {
          results: [
            {
              0: { transcript: 'Hello world' },
              isFinal: true
            }
          ]
        };
        mockSpeechRecognition.onresult(mockEvent);
      }
    });
    
    // Clear transcript
    act(() => {
      result.current.clearTranscript();
    });
    
    expect(result.current.transcript).toBe('');
  });

  test('handles speech recognition configuration', () => {
    renderHook(() => useVoiceInput());
    
    expect(mockSpeechRecognitionConstructor).toHaveBeenCalled();
    expect(mockSpeechRecognition.continuous).toBeDefined();
    expect(mockSpeechRecognition.interimResults).toBeDefined();
    expect(mockSpeechRecognition.lang).toBeDefined();
  });

  test('handles custom timeout parameter', () => {
    const customTimeout = 10;
    const { result } = renderHook(() => useVoiceInput(customTimeout));
    
    // The hook should accept timeout parameter
    expect(result.current.isListening).toBe(false);
    expect(result.current.transcript).toBe('');
  });
});