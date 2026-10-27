import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export default function UserChatWidget() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const socket = io('http://localhost:3000', {
      auth: { token },
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('joinThread', {});
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('chatHistory', (data) => {
      setMessages(data.messages || []);
    });

    socket.on('newMessage', (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleSend(e) {
    e.preventDefault();
    if (!input.trim() || !socketRef.current) return;

    socketRef.current.emit('sendMessage', {
      content: input.trim(),
    });
    setInput('');
  }

  return (
    <div
      style={{
        border: '1px solid #ddd',
        borderRadius: '10px',
        backgroundColor: '#fff',
        marginBottom: '20px',
        overflow: 'hidden',
        fontFamily: 'sans-serif',
      }}
    >
      {/* Header Bar */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          backgroundColor: '#0f172a',
          color: '#fff',
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: connected ? '#22c55e' : '#ef4444',
              display: 'inline-block',
            }}
          />
          <strong>💬 Live Support Chat with Admin</strong>
        </div>
        <span style={{ fontSize: '12px', color: '#94a3b8' }}>
          {isOpen ? '▲ Hide' : '▼ Expand'}
        </span>
      </div>

      {isOpen && (
        <div style={{ padding: '16px' }}>
          {/* Message List */}
          <div
            style={{
              height: '220px',
              overflowY: 'auto',
              border: '1px solid #eee',
              borderRadius: '8px',
              padding: '12px',
              backgroundColor: '#f8fafc',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              marginBottom: '12px',
            }}
          >
            {messages.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', marginTop: '70px' }}>
                No messages yet. Say hello to the Admin!
              </p>
            ) : (
              messages.map((m) => {
                const isAdminMsg = m.senderRole === 'admin';
                return (
                  <div
                    key={m.id}
                    style={{
                      alignSelf: isAdminMsg ? 'flex-start' : 'flex-end',
                      maxWidth: '75%',
                      backgroundColor: isAdminMsg ? '#1e293b' : '#2563eb',
                      color: '#fff',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      fontSize: '13px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '11px',
                        fontWeight: 'bold',
                        marginBottom: '2px',
                        color: isAdminMsg ? '#fca5a5' : '#bfdbfe',
                      }}
                    >
                      {isAdminMsg ? '🛡️ Admin' : 'You'}
                    </div>
                    <div>{m.content}</div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message to Admin..."
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #ccc',
              }}
            />
            <button
              type="submit"
              style={{
                padding: '10px 18px',
                backgroundColor: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}