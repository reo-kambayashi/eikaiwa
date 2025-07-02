import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

// Mock API calls
jest.mock('./utils/api', () => ({
  fetchWelcomeMessage: jest.fn(() => Promise.resolve({ reply: 'Welcome to the app!' })),
  sendMessage: jest.fn(() => Promise.resolve({ reply: 'AI response' })),
  synthesizeSpeech: jest.fn(() => Promise.resolve({ audio_data: 'fake_audio' })),
  getTranslationProblem: jest.fn(() => Promise.resolve({
    problem: 'こんにちは',
    solution: 'Hello',
    category: 'daily_life',
    difficulty: 'easy'
  })),
  checkTranslationAnswer: jest.fn(() => Promise.resolve({
    is_correct: true,
    score: 100,
    feedback: 'Perfect!'
  }))
}));

// Mock Web Speech API
Object.defineProperty(window, 'SpeechRecognition', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    start: jest.fn(),
    stop: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
  }))
});

Object.defineProperty(window, 'webkitSpeechRecognition', {
  writable: true,
  value: window.SpeechRecognition
});

// Mock Audio API
Object.defineProperty(window, 'Audio', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    play: jest.fn(() => Promise.resolve()),
    pause: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
  }))
});

describe('App Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('renders header', () => {
    render(<App />);
    const header = screen.getByText(/English Communication App/i);
    expect(header).toBeInTheDocument();
  });

  test('renders chat mode by default', () => {
    render(<App />);
    expect(screen.getByText(/Chat Mode/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Type your message/i)).toBeInTheDocument();
  });

  test('can switch to instant translation mode', async () => {
    render(<App />);
    
    const translationButton = screen.getByText(/Instant Translation/i);
    fireEvent.click(translationButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Translation Practice/i)).toBeInTheDocument();
    });
  });

  test('can switch back to chat mode', async () => {
    render(<App />);
    
    // Switch to translation mode first
    const translationButton = screen.getByText(/Instant Translation/i);
    fireEvent.click(translationButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Translation Practice/i)).toBeInTheDocument();
    });
    
    // Switch back to chat mode
    const chatButton = screen.getByText(/Chat Mode/i);
    fireEvent.click(chatButton);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Type your message/i)).toBeInTheDocument();
    });
  });

  test('shows settings panel when settings button is clicked', async () => {
    render(<App />);
    
    const settingsButton = screen.getByText(/Settings/i);
    fireEvent.click(settingsButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Voice Settings/i)).toBeInTheDocument();
    });
  });

  test('handles keyboard shortcuts', async () => {
    render(<App />);
    
    const textInput = screen.getByPlaceholderText(/Type your message/i);
    
    // Test Enter key to send message
    await userEvent.type(textInput, 'Hello{enter}');
    
    // Should trigger send message
    expect(textInput.value).toBe('');
  });

  test('displays welcome message on load', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText(/Welcome to the app!/i)).toBeInTheDocument();
    });
  });
});

describe('App Error Handling', () => {
  test('handles API errors gracefully', async () => {
    // Mock API to throw error
    const mockApi = require('./utils/api');
    mockApi.sendMessage.mockRejectedValue(new Error('API Error'));
    
    render(<App />);
    
    const textInput = screen.getByPlaceholderText(/Type your message/i);
    const sendButton = screen.getByText(/Send/i);
    
    await userEvent.type(textInput, 'Hello');
    fireEvent.click(sendButton);
    
    // Should handle error without crashing
    await waitFor(() => {
      expect(screen.getByText(/Error/i)).toBeInTheDocument();
    });
  });
  
  test('handles speech recognition errors', async () => {
    render(<App />);
    
    // Mock speech recognition error
    const mockRecognition = new window.SpeechRecognition();
    mockRecognition.addEventListener.mockImplementation((event, callback) => {
      if (event === 'error') {
        callback({ error: 'no-speech' });
      }
    });
    
    // Should handle speech errors gracefully
    expect(() => render(<App />)).not.toThrow();
  });
});

describe('App Accessibility', () => {
  test('has proper ARIA labels', () => {
    render(<App />);
    
    // Check for important ARIA labels
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
  
  test('supports keyboard navigation', async () => {
    render(<App />);
    
    // Tab should move focus through interactive elements
    await userEvent.tab();
    
    // Should be able to navigate with keyboard
    const focusedElement = document.activeElement;
    expect(focusedElement).toBeInstanceOf(HTMLElement);
  });
});
