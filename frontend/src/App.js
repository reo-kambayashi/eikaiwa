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
        setMessages([{ sender: 'AI Tutor', text: data.reply }]);
      } else {
        // Fallback welcome message
        setMessages([{ 
          sender: 'AI Tutor', 
          text: `Hello! Welcome to English Communication App! I'm your ${level} level ${practiceType} practice partner. How are you today?` 
        }]);
      }
    } catch (err) {
      console.error('Error fetching welcome message:', err);
      // Fallback welcome message
      setMessages([{ 
        sender: 'AI Tutor', 
        text: "Hello! Welcome to English Communication App! I'm here to help you practice English. How are you today?" 
      }]);
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
      setMessages((msgs) => [...msgs, { sender: 'AI Tutor', text: data.reply }]);
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
          placeholder="Type a message and press Enter"
          disabled={isLoading}
        />
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
