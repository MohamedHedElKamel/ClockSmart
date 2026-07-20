import { useState } from 'react';
import keycloak from './keycloak';

function AiChat() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

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
    <div>
      <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '10px' }}>
        {messages.length === 0 && <p style={{ opacity: 0.6 }}>Ask me about your leave requests or attendance!</p>}
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              textAlign: msg.role === 'user' ? 'right' : 'left',
              margin: '8px 0',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                padding: '8px 12px',
                borderRadius: '12px',
                background: msg.role === 'user' ? '#60a5fa' : '#e5e7eb',
                color: msg.role === 'user' ? 'white' : 'black',
                maxWidth: '80%',
              }}
            >
              {msg.text}
            </span>
          </div>
        ))}
        {loading && <p style={{ opacity: 0.6 }}>Thinking...</p>}
      </div>

      <form onSubmit={handleAsk} style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question..."
          style={{ flex: 1 }}
        />
        <button type="submit" disabled={loading}>
          Send
        </button>
      </form>
    </div>
  );
}

export default AiChat;