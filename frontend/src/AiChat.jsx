import { useState, useRef, useEffect } from 'react';
import keycloak from './keycloak';

function AiChat() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleAsk = (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userMessage = { role: 'user', text: question };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setQuestion('');

    fetch('http://localhost:8080/api/ai/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${keycloak.token}`,
      },
      body: JSON.stringify({ question: userMessage.text }),
    })
      .then((response) => response.json())
      .then((data) => {
        setMessages((prev) => [...prev, { role: 'ai', text: data.answer }]);
      })
      .catch(() => {
        setMessages((prev) => [...prev, { role: 'ai', text: 'Sorry, something went wrong.' }]);
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.length === 0 && (
          <p className="empty-state">Ask me about your leave requests or attendance!</p>
        )}

        {messages.map((msg, index) => (
          <div key={index} className={`chat-row ${msg.role === 'user' ? 'chat-row-user' : 'chat-row-ai'}`}>
            {msg.role === 'ai' && <div className="chat-avatar">⏱</div>}
            <div className={`chat-bubble ${msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}`}>
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="chat-row chat-row-ai">
            <div className="chat-avatar">⏱</div>
            <div className="chat-bubble chat-bubble-ai chat-typing">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleAsk} className="chat-input-row">
        <input
          type="text"
          className="chat-input"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question..."
        />
        <button type="submit" className="btn btn-primary" disabled={loading}>
          Send
        </button>
      </form>
    </div>
  );
}

export default AiChat;