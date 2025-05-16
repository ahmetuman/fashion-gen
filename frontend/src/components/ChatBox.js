import React, { useState } from 'react';
import { FaUser, FaRobot } from 'react-icons/fa';
import '../styles/ChatBox.css';
import GeneratedImage from './GeneratedImage';

const ChatBox = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const newUserMessage = {
      text: inputText,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newUserMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Send request to backend
      const response = await fetch('http://localhost:8000/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: newUserMessage.text }),
      });
      
      const data = await response.json();
      
      // Create AI response with the backend response and mock image
      const aiResponse = {
        text: "Here's a fashion design based on your description.",
        promptText: data.response, // Store the AI-generated prompt
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        image: 'https://placehold.co/400x500/3498db/ffffff?text=Fashion+Design'
      };
      
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error communicating with backend:', error);
      
      // Show error message if backend communication fails
      const errorResponse = {
        text: "Sorry, I couldn't process your request. Please try again later.",
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-box">
      <div className="chat-header">
        <h3>Fashion-Gen AI</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
      
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="empty-chat">
            <p>Send a message to start generating fashion designs!</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
              <div className="message-avatar">
                {msg.sender === 'user' ? <FaUser /> : <FaRobot />}
              </div>
              <div className="message-content">
                <div className="message-text">{msg.text}</div>
                {msg.promptText && (
                  <div className="prompt-text">
                    <span className="prompt-label">Generated prompt:</span>
                    <div className="prompt-content">{msg.promptText}</div>
                  </div>
                )}
                {msg.image && <GeneratedImage imageUrl={msg.image} />}
                <div className="message-time">{msg.timestamp}</div>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="message ai">
            <div className="message-avatar">
              <FaRobot />
            </div>
            <div className="message-content">
              <div className="loading-indicator">
                <span>Generating design</span>
                <div className="loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <form className="chat-input" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Describe a fashion item..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !inputText.trim()}>
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatBox; 