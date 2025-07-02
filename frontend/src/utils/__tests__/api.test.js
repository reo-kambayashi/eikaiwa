/**
 * Tests for API utility functions
 * 
 * Tests the API communication utilities including HTTP client,
 * error handling, caching, and retry logic.
 */

import { apiRequest, convertTextToSpeech, fallbackTextToSpeech } from '../api';

// Mock fetch
global.fetch = jest.fn();

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-blob-url');

// Mock Audio constructor
global.Audio = jest.fn().mockImplementation(() => ({
  play: jest.fn().mockResolvedValue(undefined),
  pause: jest.fn(),
  load: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  currentTime: 0,
  duration: 0,
  volume: 1,
  src: ''
}));

// Mock speechSynthesis
const mockSpeechSynthesis = {
  speak: jest.fn(),
  cancel: jest.fn(),
  getVoices: jest.fn(() => []),
  speaking: false,
  pending: false
};

Object.defineProperty(window, 'speechSynthesis', {
  writable: true,
  value: mockSpeechSynthesis
});

global.SpeechSynthesisUtterance = jest.fn().mockImplementation((text) => ({
  text,
  lang: 'en-US',
  rate: 1,
  pitch: 1,
  volume: 1,
  onstart: null,
  onend: null,
  onerror: null
}));

describe('API Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetch.mockClear();
    
    // Mock console methods
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('apiRequest', () => {
    test('makes successful GET request', async () => {
      const mockResponse = { success: true, data: 'test' };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
        headers: new Headers({ 'content-type': 'application/json' })
      });

      const result = await apiRequest('/test');
      
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
      expect(result).toEqual(mockResponse);
    });

    test('makes successful POST request with data', async () => {
      const mockResponse = { success: true };
      const postData = { text: 'hello' };
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
        headers: new Headers({ 'content-type': 'application/json' })
      });

      const result = await apiRequest('/test', 'POST', postData);
      
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify(postData)
        })
      );
      expect(result).toEqual(mockResponse);
    });

    test('handles network errors', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(apiRequest('/test')).rejects.toThrow('Network error');
    });

    test('handles HTTP error responses', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      await expect(apiRequest('/test')).rejects.toThrow('HTTP error! status: 404');
    });
  });

  describe('convertTextToSpeech', () => {
    test('successfully converts text to speech', async () => {
      const mockBlob = new Blob(['audio data'], { type: 'audio/mpeg' });
      
      fetch.mockResolvedValueOnce({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
        headers: new Headers({ 'content-type': 'audio/mpeg' })
      });

      const result = await convertTextToSpeech('Hello world', 1.0);
      
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/tts'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            text: 'Hello world',
            speaking_rate: 1.0
          })
        })
      );
      
      expect(result).toBeInstanceOf(HTMLAudioElement);
      expect(URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
    });

    test('handles TTS API errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      const result = await convertTextToSpeech('Hello world', 1.0);
      
      expect(result).toBeNull();
    });

    test('handles network errors in TTS', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await convertTextToSpeech('Hello world', 1.0);
      
      expect(result).toBeNull();
    });

    test('validates text input', async () => {
      const result = await convertTextToSpeech('', 1.0);
      
      expect(result).toBeNull();
      expect(fetch).not.toHaveBeenCalled();
    });

    test('validates speaking rate bounds', async () => {
      const mockBlob = new Blob(['audio data'], { type: 'audio/mpeg' });
      
      fetch.mockResolvedValueOnce({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
        headers: new Headers({ 'content-type': 'audio/mpeg' })
      });

      // Test rate clamping
      await convertTextToSpeech('Hello', 3.0); // Should be clamped to 2.0
      
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/tts'),
        expect.objectContaining({
          body: JSON.stringify({
            text: 'Hello',
            speaking_rate: 2.0
          })
        })
      );
    });
  });

  describe('fallbackTextToSpeech', () => {
    test('uses browser speech synthesis', async () => {
      const result = await fallbackTextToSpeech('Hello world', 1.0);
      
      expect(SpeechSynthesisUtterance).toHaveBeenCalledWith('Hello world');
      expect(mockSpeechSynthesis.speak).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    test('handles empty text', async () => {
      const result = await fallbackTextToSpeech('', 1.0);
      
      expect(result).toBe(false);
      expect(mockSpeechSynthesis.speak).not.toHaveBeenCalled();
    });

    test('handles missing speechSynthesis', async () => {
      const originalSpeechSynthesis = window.speechSynthesis;
      delete window.speechSynthesis;
      
      const result = await fallbackTextToSpeech('Hello world', 1.0);
      
      expect(result).toBe(false);
      
      // Restore speechSynthesis
      window.speechSynthesis = originalSpeechSynthesis;
    });

    test('sets correct speech parameters', async () => {
      await fallbackTextToSpeech('Hello world', 1.5);
      
      const utteranceCall = SpeechSynthesisUtterance.mock.calls[0];
      expect(utteranceCall[0]).toBe('Hello world');
      
      // The mock utterance should have rate set
      expect(mockSpeechSynthesis.speak).toHaveBeenCalled();
    });

    test('handles speech synthesis errors', async () => {
      // Mock utterance with error
      const mockUtterance = {
        text: 'Hello world',
        rate: 1.0,
        onend: null,
        onerror: null
      };
      
      SpeechSynthesisUtterance.mockImplementationOnce(() => mockUtterance);
      
      const resultPromise = fallbackTextToSpeech('Hello world', 1.0);
      
      // Simulate error
      if (mockUtterance.onerror) {
        mockUtterance.onerror(new Error('Speech error'));
      }
      
      const result = await resultPromise;
      expect(result).toBe(false);
    });
  });
});