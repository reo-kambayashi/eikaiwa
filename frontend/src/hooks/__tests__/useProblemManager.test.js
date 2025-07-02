/**
 * Tests for useProblemManager hook
 * 
 * Tests the translation problem management including problem fetching,
 * filtering, and state management.
 */

import { renderHook, act } from '@testing-library/react';
import { useProblemManager } from '../useProblemManager';

// Mock the useApi hook
jest.mock('../useApi', () => ({
  useApi: jest.fn()
}));

describe('useProblemManager Hook', () => {
  const mockUseApi = require('../useApi').useApi;
  const mockGet = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseApi.mockReturnValue({
      get: mockGet,
      isLoading: false
    });
  });

  test('initializes with correct default state', () => {
    const { result } = renderHook(() => useProblemManager());
    
    expect(result.current.currentProblem).toBe(null);
    expect(result.current.isLoading).toBe(false);
    expect(typeof result.current.fetchNewProblem).toBe('function');
    expect(typeof result.current.clearProblemHistory).toBe('function');
    expect(typeof result.current.resetCurrentProblem).toBe('function');
  });

  test('fetches problem successfully', async () => {
    const mockProblem = {
      japanese: 'おはよう',
      english: 'Good morning',
      category: 'daily_life',
      difficulty: 'easy'
    };
    
    mockGet.mockResolvedValue(mockProblem);
    
    const { result } = renderHook(() => useProblemManager());
    
    await act(async () => {
      await result.current.fetchNewProblem();
    });
    
    expect(result.current.currentProblem).toEqual(mockProblem);
  });

  test('handles loading state correctly', () => {
    mockUseApi.mockReturnValue({
      get: mockGet,
      isLoading: true
    });
    
    const { result } = renderHook(() => useProblemManager());
    
    expect(result.current.isLoading).toBe(true);
  });

  test('handles API errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockGet.mockRejectedValue(new Error('API Error'));
    
    const { result } = renderHook(() => useProblemManager());
    
    await act(async () => {
      await result.current.fetchNewProblem();
    });
    
    // API error should be logged but not crash the app
    expect(consoleSpy).toHaveBeenCalledWith('予期しないエラー:', expect.any(Error));
    // The problem should still be null since the error happened before setting the problem
    expect(result.current.currentProblem).toBe(null);
    
    consoleSpy.mockRestore();
  });

  test('fetches problem with category filter', async () => {
    const mockProblem = {
      japanese: 'Hello',
      english: 'こんにちは',
      category: 'work',
      difficulty: 'medium'
    };
    
    mockGet.mockResolvedValue(mockProblem);
    
    const { result } = renderHook(() => useProblemManager());
    
    await act(async () => {
      await result.current.fetchNewProblem('all', 'work');
    });
    
    expect(result.current.currentProblem).toEqual(mockProblem);
  });

  test('fetches problem with difficulty filter', async () => {
    const mockProblem = {
      japanese: 'Hello',
      english: 'こんにちは',
      category: 'daily_life',
      difficulty: 'hard'
    };
    
    mockGet.mockResolvedValue(mockProblem);
    
    const { result } = renderHook(() => useProblemManager());
    
    await act(async () => {
      await result.current.fetchNewProblem('hard');
    });
    
    expect(result.current.currentProblem).toEqual(mockProblem);
  });

  test('fetches problem with multiple filters', async () => {
    const mockProblem = {
      japanese: 'Hello',
      english: 'こんにちは',
      category: 'work',
      difficulty: 'hard'
    };
    
    mockGet.mockResolvedValue(mockProblem);
    
    const { result } = renderHook(() => useProblemManager());
    
    await act(async () => {
      await result.current.fetchNewProblem('hard', 'work', 'pre-2', true);
    });
    
    expect(result.current.currentProblem).toEqual(mockProblem);
  });

  test('clears current problem', () => {
    const { result } = renderHook(() => useProblemManager());
    
    // Reset the problem
    act(() => {
      result.current.resetCurrentProblem();
    });
    
    expect(result.current.currentProblem).toBe(null);
  });

  test('manages problem history', async () => {
    const mockProblem = {
      japanese: 'test',
      english: 'test',
      category: 'daily_life',
      difficulty: 'easy'
    };
    
    mockGet.mockResolvedValue(mockProblem);
    
    const { result } = renderHook(() => useProblemManager());
    
    await act(async () => {
      await result.current.fetchNewProblem();
    });
    
    expect(result.current.problemHistory).toHaveLength(1);
    
    act(() => {
      result.current.clearProblemHistory();
    });
    
    expect(result.current.problemHistory).toHaveLength(0);
  });

});