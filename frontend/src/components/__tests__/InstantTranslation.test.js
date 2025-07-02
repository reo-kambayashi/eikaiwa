/**
 * Tests for InstantTranslation component
 * 
 * Tests the instant translation functionality including
 * problem display, answer input, and result feedback.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InstantTranslation from '../InstantTranslation/InstantTranslation';

// Mock the API calls
jest.mock('../../utils/api', () => ({
  getTranslationProblem: jest.fn(),
  checkTranslationAnswer: jest.fn()
}));

// Mock the custom hooks
jest.mock('../../hooks/useProblemManager', () => ({
  __esModule: true,
  default: jest.fn()
}));

jest.mock('../../hooks/useAnswerChecker', () => ({
  __esModule: true,
  default: jest.fn()
}));

jest.mock('../../hooks/useInstantTranslationSettings', () => ({
  __esModule: true,
  default: jest.fn()
}));

describe('InstantTranslation Component', () => {
  const mockUseProblemManager = require('../../hooks/useProblemManager').default;
  const mockUseAnswerChecker = require('../../hooks/useAnswerChecker').default;
  const mockUseInstantTranslationSettings = require('../../hooks/useInstantTranslationSettings').default;

  const mockProblem = {
    problem: 'こんにちは',
    solution: 'Hello',
    category: 'daily_life',
    difficulty: 'easy'
  };

  const mockResult = {
    is_correct: true,
    score: 95,
    feedback: 'Excellent! Your translation is correct.'
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock hook return values
    mockUseProblemManager.mockReturnValue({
      currentProblem: mockProblem,
      isLoading: false,
      error: null,
      fetchProblem: jest.fn(),
      clearProblem: jest.fn()
    });

    mockUseAnswerChecker.mockReturnValue({
      result: null,
      isChecking: false,
      error: null,
      checkAnswer: jest.fn(),
      clearResult: jest.fn()
    });

    mockUseInstantTranslationSettings.mockReturnValue({
      settings: {
        category: 'daily_life',
        difficulty: 'easy',
        eiken_level: null,
        long_text: false
      },
      updateSettings: jest.fn()
    });
  });

  test('renders without crashing', () => {
    render(<InstantTranslation />);
    expect(screen.getByText(/Translation Practice/i)).toBeInTheDocument();
  });

  test('displays problem correctly', () => {
    render(<InstantTranslation />);
    
    expect(screen.getByText('こんにちは')).toBeInTheDocument();
    expect(screen.getByText(/daily_life/i)).toBeInTheDocument();
    expect(screen.getByText(/easy/i)).toBeInTheDocument();
  });

  test('shows loading state when fetching problem', () => {
    mockUseProblemManager.mockReturnValue({
      currentProblem: null,
      isLoading: true,
      error: null,
      fetchProblem: jest.fn(),
      clearProblem: jest.fn()
    });

    render(<InstantTranslation />);
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('shows error state when problem fetch fails', () => {
    mockUseProblemManager.mockReturnValue({
      currentProblem: null,
      isLoading: false,
      error: 'Failed to fetch problem',
      fetchProblem: jest.fn(),
      clearProblem: jest.fn()
    });

    render(<InstantTranslation />);
    
    expect(screen.getByText(/Failed to fetch problem/i)).toBeInTheDocument();
  });

  test('allows user to input answer', async () => {
    render(<InstantTranslation />);
    
    const answerInput = screen.getByPlaceholderText(/Enter your translation/i);
    await userEvent.type(answerInput, 'Hello');
    
    expect(answerInput.value).toBe('Hello');
  });

  test('submits answer when check button is clicked', async () => {
    const mockCheckAnswer = jest.fn();
    mockUseAnswerChecker.mockReturnValue({
      result: null,
      isChecking: false,
      error: null,
      checkAnswer: mockCheckAnswer,
      clearResult: jest.fn()
    });

    render(<InstantTranslation />);
    
    const answerInput = screen.getByPlaceholderText(/Enter your translation/i);
    const checkButton = screen.getByText(/Check Answer/i);
    
    await userEvent.type(answerInput, 'Hello');
    fireEvent.click(checkButton);
    
    expect(mockCheckAnswer).toHaveBeenCalledWith('こんにちは', 'Hello', 'Hello');
  });

  test('shows checking state when answer is being validated', () => {
    mockUseAnswerChecker.mockReturnValue({
      result: null,
      isChecking: true,
      error: null,
      checkAnswer: jest.fn(),
      clearResult: jest.fn()
    });

    render(<InstantTranslation />);
    
    expect(screen.getByText(/Checking/i)).toBeInTheDocument();
  });

  test('displays result after answer is checked', () => {
    mockUseAnswerChecker.mockReturnValue({
      result: mockResult,
      isChecking: false,
      error: null,
      checkAnswer: jest.fn(),
      clearResult: jest.fn()
    });

    render(<InstantTranslation />);
    
    expect(screen.getByText(/Excellent! Your translation is correct./i)).toBeInTheDocument();
    expect(screen.getByText(/95/)).toBeInTheDocument();
  });

  test('shows next problem button after answer is checked', () => {
    mockUseAnswerChecker.mockReturnValue({
      result: mockResult,
      isChecking: false,
      error: null,
      checkAnswer: jest.fn(),
      clearResult: jest.fn()
    });

    render(<InstantTranslation />);
    
    expect(screen.getByText(/Next Problem/i)).toBeInTheDocument();
  });

  test('fetches new problem when next button is clicked', async () => {
    const mockFetchProblem = jest.fn();
    const mockClearResult = jest.fn();
    
    mockUseProblemManager.mockReturnValue({
      currentProblem: mockProblem,
      isLoading: false,
      error: null,
      fetchProblem: mockFetchProblem,
      clearProblem: jest.fn()
    });

    mockUseAnswerChecker.mockReturnValue({
      result: mockResult,
      isChecking: false,
      error: null,
      checkAnswer: jest.fn(),
      clearResult: mockClearResult
    });

    render(<InstantTranslation />);
    
    const nextButton = screen.getByText(/Next Problem/i);
    fireEvent.click(nextButton);
    
    expect(mockFetchProblem).toHaveBeenCalled();
    expect(mockClearResult).toHaveBeenCalled();
  });

  test('shows settings panel when settings button is clicked', async () => {
    render(<InstantTranslation />);
    
    const settingsButton = screen.getByText(/Settings/i);
    fireEvent.click(settingsButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Category/i)).toBeInTheDocument();
      expect(screen.getByText(/Difficulty/i)).toBeInTheDocument();
    });
  });

  test('updates settings when changed', async () => {
    const mockUpdateSettings = jest.fn();
    mockUseInstantTranslationSettings.mockReturnValue({
      settings: {
        category: 'daily_life',
        difficulty: 'easy',
        eiken_level: null,
        long_text: false
      },
      updateSettings: mockUpdateSettings
    });

    render(<InstantTranslation />);
    
    const settingsButton = screen.getByText(/Settings/i);
    fireEvent.click(settingsButton);
    
    await waitFor(() => {
      const categorySelect = screen.getByDisplayValue(/daily_life/i);
      expect(categorySelect).toBeInTheDocument();
    });
  });

  test('handles answer checking errors gracefully', () => {
    mockUseAnswerChecker.mockReturnValue({
      result: null,
      isChecking: false,
      error: 'Failed to check answer',
      checkAnswer: jest.fn(),
      clearResult: jest.fn()
    });

    render(<InstantTranslation />);
    
    expect(screen.getByText(/Failed to check answer/i)).toBeInTheDocument();
  });

  test('disables check button when answer is empty', () => {
    render(<InstantTranslation />);
    
    const checkButton = screen.getByText(/Check Answer/i);
    expect(checkButton).toBeDisabled();
  });

  test('enables check button when answer is provided', async () => {
    render(<InstantTranslation />);
    
    const answerInput = screen.getByPlaceholderText(/Enter your translation/i);
    const checkButton = screen.getByText(/Check Answer/i);
    
    await userEvent.type(answerInput, 'Hello');
    
    expect(checkButton).not.toBeDisabled();
  });

  test('clears answer input after getting new problem', async () => {
    const mockFetchProblem = jest.fn();
    
    mockUseProblemManager.mockReturnValue({
      currentProblem: mockProblem,
      isLoading: false,
      error: null,
      fetchProblem: mockFetchProblem,
      clearProblem: jest.fn()
    });

    mockUseAnswerChecker.mockReturnValue({
      result: mockResult,
      isChecking: false,
      error: null,
      checkAnswer: jest.fn(),
      clearResult: jest.fn()
    });

    render(<InstantTranslation />);
    
    const answerInput = screen.getByPlaceholderText(/Enter your translation/i);
    await userEvent.type(answerInput, 'Hello');
    
    const nextButton = screen.getByText(/Next Problem/i);
    fireEvent.click(nextButton);
    
    expect(answerInput.value).toBe('');
  });

  test('handles keyboard shortcuts', async () => {
    const mockCheckAnswer = jest.fn();
    mockUseAnswerChecker.mockReturnValue({
      result: null,
      isChecking: false,
      error: null,
      checkAnswer: mockCheckAnswer,
      clearResult: jest.fn()
    });

    render(<InstantTranslation />);
    
    const answerInput = screen.getByPlaceholderText(/Enter your translation/i);
    await userEvent.type(answerInput, 'Hello{enter}');
    
    expect(mockCheckAnswer).toHaveBeenCalled();
  });

  test('shows correct/incorrect visual feedback', () => {
    const incorrectResult = {
      is_correct: false,
      score: 60,
      feedback: 'Close, but not quite right. Try again!'
    };

    mockUseAnswerChecker.mockReturnValue({
      result: incorrectResult,
      isChecking: false,
      error: null,
      checkAnswer: jest.fn(),
      clearResult: jest.fn()
    });

    render(<InstantTranslation />);
    
    expect(screen.getByText(/Close, but not quite right. Try again!/i)).toBeInTheDocument();
    expect(screen.getByText(/60/)).toBeInTheDocument();
  });

  test('handles long text problems correctly', () => {
    const longTextProblem = {
      problem: 'This is a very long Japanese text that should be displayed properly even when it contains multiple sentences and complex grammar structures. It should wrap correctly and remain readable.',
      solution: 'This is a very long English text that should be displayed properly even when it contains multiple sentences and complex grammar structures. It should wrap correctly and remain readable.',
      category: 'daily_life',
      difficulty: 'hard'
    };

    mockUseProblemManager.mockReturnValue({
      currentProblem: longTextProblem,
      isLoading: false,
      error: null,
      fetchProblem: jest.fn(),
      clearProblem: jest.fn()
    });

    render(<InstantTranslation />);
    
    expect(screen.getByText(longTextProblem.problem)).toBeInTheDocument();
  });

  test('displays Eiken level when specified', () => {
    const eikenProblem = {
      ...mockProblem,
      eiken_level: 'pre-2'
    };

    mockUseProblemManager.mockReturnValue({
      currentProblem: eikenProblem,
      isLoading: false,
      error: null,
      fetchProblem: jest.fn(),
      clearProblem: jest.fn()
    });

    render(<InstantTranslation />);
    
    expect(screen.getByText(/pre-2/i)).toBeInTheDocument();
  });
});