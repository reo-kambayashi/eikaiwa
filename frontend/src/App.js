import { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  // Text currently entered by the user
  const [input, setInput] = useState('');
  // List of chat messages to display
  const [messages, setMessages] = useState([]);
  // Loading state for better UX
  const [isLoading, setIsLoading] = useState(false);
  // Reference for chat container auto-scroll
  const messagesEndRef = useRef(null);
  // English level selection
  const [level, setLevel] = useState('beginner');
  // Practice type selection
  const [practiceType, setPracticeType] = useState('conversation');
  // Voice input control
  const [isVoiceInputEnabled, setIsVoiceInputEnabled] = useState(false);
  // Voice output control
  const [isVoiceOutputEnabled, setIsVoiceOutputEnabled] = useState(false);
  // Speech recognition state
  const [isListening, setIsListening] = useState(false);
  // Speech recognition reference
  const recognitionRef = useRef(null);

  // Base URL for the backend. React reads environment variables starting with
  // REACT_APP_. We provide a fallback so the app works out of the box.
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  // Auto-scroll to bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize speech recognition when component mounts
  // This sets up the Web Speech API for voice input functionality
  useEffect(() => {
    // Check if browser supports speech recognition
    // webkitSpeechRecognition is for Chrome/Safari, SpeechRecognition is the standard
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      // Configuration for optimal English learning experience
      recognitionRef.current.continuous = false;  // Stop after each phrase for better control
      recognitionRef.current.interimResults = true;  // Show partial results while speaking
      recognitionRef.current.lang = 'en-US';  // Set to English for practice

      // Event handler for when speech recognition produces results
      // This processes both interim (partial) and final results
      recognitionRef.current.onresult = (event) => {
        // Convert the speech recognition results to text
        const transcript = Array.from(event.results)
          .map(result => result[0])  // Get the most confident result
          .map(result => result.transcript)  // Extract the text
          .join('');

        // Check if this is the final result (user stopped speaking)
        if (event.results[event.results.length - 1].isFinal) {
          setInput(transcript);  // Set the final text
          setIsListening(false);  // Stop the listening state
        } else {
          // Show interim results while user is still speaking
          // This provides real-time feedback to the user
          setInput(transcript);
        }
      };

      // Error handling for speech recognition
      // Provides user-friendly error messages for common issues
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        // Handle specific error types with helpful messages
        if (event.error === 'no-speech') {
          console.log('No speech detected - user may need to speak louder');
        } else if (event.error === 'audio-capture') {
          alert('Microphone access denied. Please allow microphone access to use voice input.');
        } else if (event.error === 'not-allowed') {
          alert('Microphone access not allowed. Please check your browser settings.');
        }
      };

      // Event handlers for speech recognition state changes
      recognitionRef.current.onstart = () => {
        console.log('Speech recognition started');
        setIsListening(true);  // Update UI to show listening state
      };

      recognitionRef.current.onend = () => {
        console.log('Speech recognition ended');
        setIsListening(false);  // Update UI to show stopped state
      };
    } else {
      // Fallback for browsers that don't support speech recognition
      console.warn('Speech recognition not supported in this browser');
    }

    // Cleanup function
    return () => {
      if (recognitionRef.current && isListening) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.error('Error stopping speech recognition on cleanup:', error);
        }
      }
    };
  }, []);

  // Text-to-speech function
  const speakText = async (text) => {
    if (!isVoiceOutputEnabled) return;
    
    try {
      const response = await fetch(`${API_URL}/api/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: text,
          voice_name: "en-US-Neural2-D",
          language_code: "en-US",
          speaking_rate: 1.0
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const audio = new Audio(`data:audio/mpeg;base64,${data.audio_data}`);
        audio.play();
      }
    } catch (error) {
      console.error('TTS Error:', error);
      // Fallback to browser TTS
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        speechSynthesis.speak(utterance);
      }
    }
  };

  // Toggle voice input
  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
        setIsListening(false);
      }
    } else {
      // Ensure we're not already listening before starting
      if (!isListening) {
        try {
          setInput('');
          recognitionRef.current.start();
          // Don't set isListening here - let onstart event handle it
        } catch (error) {
          console.error('Error starting speech recognition:', error);
          setIsListening(false);
          
          if (error.name === 'InvalidStateError') {
            // Recognition might already be running, force stop and retry
            try {
              recognitionRef.current.stop();
              setTimeout(() => {
                if (!isListening) {
                  try {
                    setInput('');
                    recognitionRef.current.start();
                  } catch (retryError) {
                    console.error('Error restarting speech recognition:', retryError);
                    setIsListening(false);
                  }
                }
              }, 200);
            } catch (stopError) {
              console.error('Error stopping recognition for retry:', stopError);
              setIsListening(false);
            }
          }
        }
      }
    }
  };

  // Fetch welcome message when component mounts or settings change
  useEffect(() => {
    fetchWelcomeMessage();
  }, [level, practiceType]);

  // Fetch welcome message from backend
  const fetchWelcomeMessage = async () => {
    try {
      const res = await fetch(`${API_URL}/api/welcome?level=${level}&practice_type=${practiceType}`);
      if (res.ok) {
        const data = await res.json();
        const welcomeMessage = { sender: 'AI Tutor', text: data.reply };
        setMessages([welcomeMessage]);
        // Speak the welcome message if voice output is enabled
        if (isVoiceOutputEnabled) {
          speakText(data.reply);
        }
      } else {
        // Fallback welcome message
        const fallbackMessage = `Hello! Welcome to English Communication App! I'm your ${level} level ${practiceType} practice partner. How are you today?`;
        setMessages([{ sender: 'AI Tutor', text: fallbackMessage }]);
        if (isVoiceOutputEnabled) {
          speakText(fallbackMessage);
        }
      }
    } catch (err) {
      console.error('Error fetching welcome message:', err);
      // Fallback welcome message
      const fallbackMessage = "Hello! Welcome to English Communication App! I'm here to help you practice English. How are you today?";
      setMessages([{ sender: 'AI Tutor', text: fallbackMessage }]);
      if (isVoiceOutputEnabled) {
        speakText(fallbackMessage);
      }
    }
  };

  // Send the message to the backend and handle the response  
  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMsg = { sender: 'You', text: input };
    setMessages((msgs) => [...msgs, userMsg]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);
    
    try {
      console.log('Sending request to:', `${API_URL}/api/respond`);
      const res = await fetch(`${API_URL}/api/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: currentInput,
          level: level,
          practice_type: practiceType
        }),
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      const aiResponse = { sender: 'AI Tutor', text: data.reply };
      setMessages((msgs) => [...msgs, aiResponse]);
      
      // Speak the AI response if voice output is enabled
      if (isVoiceOutputEnabled) {
        speakText(data.reply);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setMessages((msgs) => [
        ...msgs,
        { sender: 'AI Tutor', text: `Error contacting server: ${err.message}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Render chat UI
  return (
    <div className="App">
      <h1>English Communication App</h1>
      
      {/* Learning Settings Panel */}
      <div className="settings-panel">
        <div className="setting-group">
          <label htmlFor="level">English Level:</label>
          <select 
            id="level" 
            value={level} 
            onChange={(e) => setLevel(e.target.value)}
            disabled={isLoading}
          >
            <option value="beginner">Beginner (初級)</option>
            <option value="intermediate">Intermediate (中級)</option>
            <option value="advanced">Advanced (上級)</option>
          </select>
        </div>
        
        <div className="setting-group">
          <label htmlFor="practiceType">Practice Type:</label>
          <select 
            id="practiceType" 
            value={practiceType} 
            onChange={(e) => setPracticeType(e.target.value)}
            disabled={isLoading}
          >
            <option value="conversation">Conversation (会話)</option>
            <option value="grammar">Grammar (文法)</option>
            <option value="vocabulary">Vocabulary (語彙)</option>
            <option value="pronunciation">Pronunciation (発音)</option>
          </select>
        </div>

        {/* Voice Controls */}
        <div className="setting-group">
          <label>Voice Controls:</label>
          <div className="voice-controls">
            {('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) && (
              <label className="voice-toggle">
                <input
                  type="checkbox"
                  checked={isVoiceInputEnabled}
                  onChange={(e) => setIsVoiceInputEnabled(e.target.checked)}
                />
                Voice Input (音声入力)
              </label>
            )}
            <label className="voice-toggle">
              <input
                type="checkbox"
                checked={isVoiceOutputEnabled}
                onChange={(e) => setIsVoiceOutputEnabled(e.target.checked)}
              />
              Voice Output (音声出力)
            </label>
          </div>
        </div>
      </div>

      <div className="chat-box">
        {messages.map((m, idx) => (
          <div key={idx} className={`message ${m.sender.toLowerCase()}`}>
            <strong>{m.sender}: </strong>
            {m.text}
          </div>
        ))}
        {isLoading && (
          <div className="message ai-tutor loading">
            <strong>AI Tutor: </strong>
            <span className="typing-indicator">Typing...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={isListening ? "Listening..." : "Type a message and press Enter"}
          disabled={isLoading || isListening}
        />
        {isVoiceInputEnabled && recognitionRef.current && (
          <button 
            className={`voice-button ${isListening ? 'listening' : ''}`}
            onClick={toggleVoiceInput}
            disabled={isLoading}
            title={isListening ? "Stop listening" : "Start voice input"}
          >
            🎤
          </button>
        )}
        <button onClick={sendMessage} disabled={isLoading || !input.trim()}>
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </div>
      <div className="debug-info">
        <small>API URL: {API_URL}</small>
      </div>
    </div>
  );
}

export default App;
