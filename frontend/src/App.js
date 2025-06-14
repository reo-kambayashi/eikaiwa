import { useState } from 'react';
import './App.css';

function App() {
  // Text currently entered by the user
  const [input, setInput] = useState('');
  // List of chat messages to display
  const [messages, setMessages] = useState([]);

  // Send the message to the backend and handle the response
  const sendMessage = async () => {
    if (!input) return;
    const userMsg = { sender: 'You', text: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput('');
    try {
      const res = await fetch('/api/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input }),
      });
      const data = await res.json();
      setMessages((msgs) => [...msgs, { sender: 'Bot', text: data.reply }]);
    } catch (err) {
      setMessages((msgs) => [
        ...msgs,
        { sender: 'Bot', text: 'Error contacting server.' },
      ]);
    }
  };

  // Render chat UI
  return (
    <div className="App">
      <h1>English Communication App</h1>
      <div className="chat-box">
        {messages.map((m, idx) => (
          <div key={idx} className="message">
            <strong>{m.sender}: </strong>
            {m.text}
          </div>
        ))}
      </div>
      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message"
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default App;
