/**
 * Tests for useVoiceOutput hook
 * 
 * Tests the voice output functionality including TTS integration,
 * fallback mechanisms, and voice control features.
 */

import { renderHook, act } from '@testing-library/react';
import { useVoiceOutput } from '../useVoiceOutput';

// Mock the API utilities
jest.mock('../../utils/api', () => ({
  convertTextToSpeech: jest.fn(),
  fallbackTextToSpeech: jest.fn()
}));

describe('useVoiceOutput Hook', () => {
  const mockConvertTextToSpeech = require('../../utils/api').convertTextToSpeech;
  const mockFallbackTextToSpeech = require('../../utils/api').fallbackTextToSpeech;
  
  // Mock speechSynthesis API
  const mockSpeechSynthesis = {
    cancel: jest.fn(),
    speaking: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock speechSynthesis
    Object.defineProperty(window, 'speechSynthesis', {
      writable: true,
      value: mockSpeechSynthesis
    });
    
    // Mock console methods to avoid test output clutter
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('initializes with correct default state', () => {
    const { result } = renderHook(() => useVoiceOutput(true, 1.0));
    
    expect(typeof result.current.speak).toBe('function');
    expect(typeof result.current.stopSpeaking).toBe('function');
    expect(typeof result.current.isSpeaking).toBe('function');
    expect(result.current.isAvailable).toBe(true);
    expect(result.current.isEnabled).toBe(true);
  });

  test('detects when speech synthesis is not available', () => {
    delete window.speechSynthesis;
    
    const { result } = renderHook(() => useVoiceOutput(true, 1.0));
    
    expect(result.current.isAvailable).toBe(false);
  });

  test('returns false when voice output is disabled', async () => {
    const { result } = renderHook(() => useVoiceOutput(false, 1.0));
    
    let speakResult;
    await act(async () => {
      speakResult = await result.current.speak('Hello world');
    });
    
    expect(speakResult).toBe(false);
    expect(mockConvertTextToSpeech).not.toHaveBeenCalled();
  });

  test('returns false for invalid text input', async () => {
    const { result } = renderHook(() => useVoiceOutput(true, 1.0));
    
    const testCases = ['', '   ', null, undefined];
    
    for (const testCase of testCases) {
      let speakResult;
      await act(async () => {
        speakResult = await result.current.speak(testCase);
      });
      
      expect(speakResult).toBe(false);
    }
    
    expect(mockConvertTextToSpeech).not.toHaveBeenCalled();
  });

  test('uses Google TTS when available', async () => {
    const mockAudioElement = {
      play: jest.fn().mockResolvedValue(undefined),
      onended: null,
      onerror: null
    };
    
    mockConvertTextToSpeech.mockResolvedValue(mockAudioElement);
    
    const { result } = renderHook(() => useVoiceOutput(true, 1.5));
    
    const speakPromise = result.current.speak('Hello world');
    
    // Simulate successful playback
    await act(async () => {
      if (mockAudioElement.onended) {
        mockAudioElement.onended();
      }
    });
    
    const speakResult = await speakPromise;
    
    expect(mockConvertTextToSpeech).toHaveBeenCalledWith('Hello world', 1.5);
    expect(mockAudioElement.play).toHaveBeenCalled();
    expect(speakResult).toBe(true);
  });

  test('falls back to browser TTS when Google TTS fails', async () => {
    mockConvertTextToSpeech.mockResolvedValue(null);
    mockFallbackTextToSpeech.mockResolvedValue(true);
    
    const { result } = renderHook(() => useVoiceOutput(true, 1.0));
    
    let speakResult;
    await act(async () => {
      speakResult = await result.current.speak('Hello world');
    });
    
    expect(mockConvertTextToSpeech).toHaveBeenCalledWith('Hello world', 1.0);
    expect(mockFallbackTextToSpeech).toHaveBeenCalledWith('Hello world', 1.0);
    expect(speakResult).toBe(true);
  });

  test('handles Google TTS audio play error', async () => {
    const mockAudioElement = {
      play: jest.fn().mockRejectedValue(new Error('Play failed')),
      onended: null,
      onerror: null
    };
    
    mockConvertTextToSpeech.mockResolvedValue(mockAudioElement);
    mockFallbackTextToSpeech.mockImplementation(() => Promise.resolve(true));
    
    const { result } = renderHook(() => useVoiceOutput(true, 1.0));
    
    let speakResult;
    await act(async () => {
      speakResult = await result.current.speak('Hello world');
    });
    
    expect(mockFallbackTextToSpeech).toHaveBeenCalledWith('Hello world', 1.0);
    expect(speakResult).toBe(false);
  });

  test('handles Google TTS audio element error', async () => {
    const mockAudioElement = {
      play: jest.fn().mockResolvedValue(undefined),
      onended: null,
      onerror: null
    };
    
    mockConvertTextToSpeech.mockResolvedValue(mockAudioElement);
    mockFallbackTextToSpeech.mockImplementation(() => Promise.resolve(true));
    
    const { result } = renderHook(() => useVoiceOutput(true, 1.0));
    
    const speakPromise = result.current.speak('Hello world');
    
    // Simulate audio error
    await act(async () => {
      if (mockAudioElement.onerror) {
        mockAudioElement.onerror(new Error('Audio error'));
      }
    });
    
    const speakResult = await speakPromise;
    
    expect(mockFallbackTextToSpeech).toHaveBeenCalledWith('Hello world', 1.0);
    expect(speakResult).toBe(false);
  });

  test('handles complete TTS failure', async () => {
    mockConvertTextToSpeech.mockRejectedValue(new Error('TTS Error'));
    mockFallbackTextToSpeech.mockResolvedValue(true);
    
    const { result } = renderHook(() => useVoiceOutput(true, 1.0));
    
    let speakResult;
    await act(async () => {
      speakResult = await result.current.speak('Hello world');
    });
    
    expect(mockFallbackTextToSpeech).toHaveBeenCalledWith('Hello world', 1.0);
    expect(speakResult).toBe(true);
  });

  test('handles final fallback failure', async () => {
    mockConvertTextToSpeech.mockRejectedValue(new Error('TTS Error'));
    mockFallbackTextToSpeech.mockRejectedValue(new Error('Fallback Error'));
    
    const { result } = renderHook(() => useVoiceOutput(true, 1.0));
    
    let speakResult;
    await act(async () => {
      speakResult = await result.current.speak('Hello world');
    });
    
    expect(speakResult).toBe(false);
  });

  test('stops current speech synthesis', () => {
    const { result } = renderHook(() => useVoiceOutput(true, 1.0));
    
    act(() => {
      result.current.stopSpeaking();
    });
    
    expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
  });

  test('checks if speech is currently playing', () => {
    mockSpeechSynthesis.speaking = true;
    
    const { result } = renderHook(() => useVoiceOutput(true, 1.0));
    
    expect(result.current.isSpeaking()).toBe(true);
    
    mockSpeechSynthesis.speaking = false;
    expect(result.current.isSpeaking()).toBe(false);
  });

  test('handles missing speechSynthesis for isSpeaking check', () => {
    delete window.speechSynthesis;
    
    const { result } = renderHook(() => useVoiceOutput(true, 1.0));
    
    expect(result.current.isSpeaking()).toBe(false);
  });

  test('handles missing speechSynthesis for stopSpeaking', () => {
    delete window.speechSynthesis;
    
    const { result } = renderHook(() => useVoiceOutput(true, 1.0));
    
    // Should not throw error
    act(() => {
      result.current.stopSpeaking();
    });
  });

  test('uses correct speaking rate', async () => {
    mockConvertTextToSpeech.mockResolvedValue(null);
    mockFallbackTextToSpeech.mockResolvedValue(true);
    
    const { result } = renderHook(() => useVoiceOutput(true, 0.8));
    
    await act(async () => {
      await result.current.speak('Hello world');
    });
    
    expect(mockConvertTextToSpeech).toHaveBeenCalledWith('Hello world', 0.8);
    expect(mockFallbackTextToSpeech).toHaveBeenCalledWith('Hello world', 0.8);
  });

  test('handles non-string text input', async () => {
    const { result } = renderHook(() => useVoiceOutput(true, 1.0));
    
    let speakResult;
    await act(async () => {
      speakResult = await result.current.speak(123);
    });
    
    expect(speakResult).toBe(false);
    expect(mockConvertTextToSpeech).not.toHaveBeenCalled();
  });
});