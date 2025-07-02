/**
 * Tests for useProblemManager hook
 * 
 * Tests the translation problem management including problem fetching,
 * filtering, and state management.
 */

import { renderHook, act } from '@testing-library/react';
import useProblemManager from '../useProblemManager';

// Mock the API module
jest.mock('../../utils/api', () => ({
  getTranslationProblem: jest.fn()
}));

describe('useProblemManager Hook', () => {
  const mockGetTranslationProblem = require('../../utils/api').getTranslationProblem;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('initializes with correct default state', () => {
    const { result } = renderHook(() => useProblemManager());
    
    expect(result.current.currentProblem).toBe(null);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(typeof result.current.fetchProblem).toBe('function');
    expect(typeof result.current.clearProblem).toBe('function');
  });

  test('fetches problem successfully', async () => {
    const mockProblem = {
      problem: 'おはよう',
      solution: 'Good morning',
      category: 'daily_life',
      difficulty: 'easy'
    };
    
    mockGetTranslationProblem.mockResolvedValue(mockProblem);
    
    const { result } = renderHook(() => useProblemManager());
    
    await act(async () => {
      await result.current.fetchProblem();
    });
    
    expect(result.current.currentProblem).toEqual(mockProblem);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  test('handles loading state correctly', async () => {
    mockGetTranslationProblem.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        problem: 'test',
        solution: 'test',
        category: 'daily_life',
        difficulty: 'easy'
      }), 100))
    );
    
    const { result } = renderHook(() => useProblemManager());
    
    act(() => {
      result.current.fetchProblem();
    });
    
    expect(result.current.isLoading).toBe(true);
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 150));
    });
    
    expect(result.current.isLoading).toBe(false);
  });

  test('handles API errors gracefully', async () => {
    mockGetTranslationProblem.mockRejectedValue(new Error('API Error'));
    
    const { result } = renderHook(() => useProblemManager());
    
    await act(async () => {
      await result.current.fetchProblem();
    });
    
    expect(result.current.error).toBe('問題の取得に失敗しました。もう一度お試しください。');
    expect(result.current.currentProblem).toBe(null);
    expect(result.current.isLoading).toBe(false);
  });

  test('fetches problem with category filter', async () => {
    const mockProblem = {
      problem: 'Hello',
      solution: 'こんにちは',
      category: 'work',
      difficulty: 'medium'
    };
    
    mockGetTranslationProblem.mockResolvedValue(mockProblem);
    
    const { result } = renderHook(() => useProblemManager());
    
    await act(async () => {
      await result.current.fetchProblem({ category: 'work' });
    });
    
    expect(mockGetTranslationProblem).toHaveBeenCalledWith({ category: 'work' });
    expect(result.current.currentProblem).toEqual(mockProblem);
  });

  test('fetches problem with difficulty filter', async () => {
    const mockProblem = {
      problem: 'Hello',
      solution: 'こんにちは',
      category: 'daily_life',
      difficulty: 'hard'
    };
    
    mockGetTranslationProblem.mockResolvedValue(mockProblem);
    
    const { result } = renderHook(() => useProblemManager());
    
    await act(async () => {
      await result.current.fetchProblem({ difficulty: 'hard' });
    });
    
    expect(mockGetTranslationProblem).toHaveBeenCalledWith({ difficulty: 'hard' });
    expect(result.current.currentProblem).toEqual(mockProblem);
  });

  test('fetches problem with Eiken level filter', async () => {
    const mockProblem = {
      problem: 'Hello',
      solution: 'こんにちは',
      category: 'daily_life',
      difficulty: 'medium',
      eiken_level: 'pre-2'
    };
    
    mockGetTranslationProblem.mockResolvedValue(mockProblem);
    
    const { result } = renderHook(() => useProblemManager());
    
    await act(async () => {
      await result.current.fetchProblem({ eiken_level: 'pre-2' });
    });
    
    expect(mockGetTranslationProblem).toHaveBeenCalledWith({ eiken_level: 'pre-2' });
    expect(result.current.currentProblem).toEqual(mockProblem);
  });

  test('fetches problem with multiple filters', async () => {
    const mockProblem = {
      problem: 'Hello',
      solution: 'こんにちは',
      category: 'work',
      difficulty: 'hard',
      eiken_level: '2'
    };
    
    mockGetTranslationProblem.mockResolvedValue(mockProblem);
    
    const { result } = renderHook(() => useProblemManager());
    
    await act(async () => {
      await result.current.fetchProblem({
        category: 'work',
        difficulty: 'hard',
        eiken_level: '2'
      });
    });
    
    expect(mockGetTranslationProblem).toHaveBeenCalledWith({
      category: 'work',
      difficulty: 'hard',
      eiken_level: '2'
    });
    expect(result.current.currentProblem).toEqual(mockProblem);
  });

  test('clears current problem', () => {
    const mockProblem = {
      problem: 'test',
      solution: 'test',
      category: 'daily_life',
      difficulty: 'easy'
    };
    
    const { result } = renderHook(() => useProblemManager());
    
    // Set a problem first
    act(() => {
      result.current.currentProblem = mockProblem;
    });
    
    // Clear the problem
    act(() => {
      result.current.clearProblem();
    });
    
    expect(result.current.currentProblem).toBe(null);
    expect(result.current.error).toBe(null);
  });

  test('clears error state on successful fetch', async () => {
    mockGetTranslationProblem.mockRejectedValueOnce(new Error('API Error'))
                            .mockResolvedValueOnce({
                              problem: 'test',
                              solution: 'test',
                              category: 'daily_life',
                              difficulty: 'easy'
                            });
    
    const { result } = renderHook(() => useProblemManager());
    
    // First fetch fails
    await act(async () => {
      await result.current.fetchProblem();
    });
    
    expect(result.current.error).toBeTruthy();
    
    // Second fetch succeeds
    await act(async () => {
      await result.current.fetchProblem();
    });
    
    expect(result.current.error).toBe(null);
  });

  test('handles network timeout errors', async () => {
    mockGetTranslationProblem.mockRejectedValue(new Error('Network timeout'));
    
    const { result } = renderHook(() => useProblemManager());
    
    await act(async () => {
      await result.current.fetchProblem();
    });
    
    expect(result.current.error).toBeTruthy();
    expect(result.current.isLoading).toBe(false);
  });

  test('prevents multiple simultaneous API calls', async () => {
    mockGetTranslationProblem.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        problem: 'test',
        solution: 'test',
        category: 'daily_life',
        difficulty: 'easy'
      }), 100))
    );
    
    const { result } = renderHook(() => useProblemManager());
    
    // Start first fetch
    act(() => {
      result.current.fetchProblem();
    });
    
    expect(result.current.isLoading).toBe(true);
    
    const firstCallCount = mockGetTranslationProblem.mock.calls.length;
    
    // Try to start second fetch while first is in progress
    act(() => {
      result.current.fetchProblem();
    });
    
    // Should not make additional API call
    expect(mockGetTranslationProblem.mock.calls.length).toBe(firstCallCount);
  });

  test('handles invalid problem data', async () => {
    // Mock API returning invalid data
    mockGetTranslationProblem.mockResolvedValue({
      problem: '',
      solution: '',
      category: '',
      difficulty: ''
    });
    
    const { result } = renderHook(() => useProblemManager());
    
    await act(async () => {
      await result.current.fetchProblem();
    });
    
    // Should handle invalid data gracefully
    expect(result.current.error).toBeTruthy();
  });

  test('validates problem data structure', async () => {
    // Mock API returning incomplete data
    mockGetTranslationProblem.mockResolvedValue({
      problem: 'Hello'
      // Missing solution, category, difficulty
    });
    
    const { result } = renderHook(() => useProblemManager());
    
    await act(async () => {
      await result.current.fetchProblem();
    });
    
    // Should handle incomplete data
    expect(result.current.error).toBeTruthy();
  });

  test('handles long text problems', async () => {
    const longProblem = {
      problem: 'This is a very long problem text that contains multiple sentences and should be handled properly by the system. '.repeat(10),
      solution: 'This is a very long solution text that contains multiple sentences and should be handled properly by the system. '.repeat(10),
      category: 'daily_life',
      difficulty: 'hard'
    };
    
    mockGetTranslationProblem.mockResolvedValue(longProblem);
    
    const { result } = renderHook(() => useProblemManager());
    
    await act(async () => {
      await result.current.fetchProblem({ long_text: true });
    });
    
    expect(result.current.currentProblem).toEqual(longProblem);
    expect(result.current.error).toBe(null);
  });
});