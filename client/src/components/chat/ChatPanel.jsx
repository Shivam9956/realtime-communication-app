import React, { useState, useEffect, useRef } from 'react';
import { Send, Smile, User as UserIcon, Loader2 } from 'lucide-react';
import Button from '../common/Button';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export const ChatPanel = ({ meetingId }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [typingPeers, setTypingPeers] = useState([]);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 1. Fetch chat history on mount
  useEffect(() => {
    let isMounted = true;

    const fetchHistory = async () => {
      setIsLoadingHistory(true);
      try {
        const cleanId = meetingId?.trim().toLowerCase();
        const res = await api.request(`/chat/meeting/${cleanId}`);
        if (isMounted && res?.messages) {
          setMessages(res.messages);
        }
      } catch (err) {
        console.warn('Could not load chat history:', err.message);
      } finally {
        if (isMounted) {
          setIsLoadingHistory(false);
          setTimeout(scrollToBottom, 100);
        }
      }
    };

    fetchHistory();

    return () => {
      isMounted = false;
    };
  }, [meetingId]);

  // 2. Real-time Socket message & typing subscription
  useEffect(() => {
    if (!socket || !meetingId) return;

    const handleNewMessage = ({ message }) => {
      setMessages((prev) => [...prev, message]);
      setTimeout(scrollToBottom, 50);
    };

    const handlePeerTyping = ({ socketId, userName, isTyping }) => {
      setTypingPeers((prev) => {
        if (isTyping) {
          return prev.includes(userName) ? prev : [...prev, userName];
        } else {
          return prev.filter((name) => name !== userName);
        }
      });
    };

    socket.on('new-chat-message', handleNewMessage);
    socket.on('peer-typing', handlePeerTyping);

    return () => {
      socket.off('new-chat-message', handleNewMessage);
      socket.off('peer-typing', handlePeerTyping);
    };
  }, [socket, meetingId]);

  // Handle typing input
  const handleInputChange = (e) => {
    setInputText(e.target.value);

    if (socket && meetingId) {
      socket.emit('user-typing', { meetingId, isTyping: true });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('user-typing', { meetingId, isTyping: false });
      }, 1500);
    }
  };

  // Send message
  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!inputText.trim() || !socket || !meetingId) return;

    socket.emit('send-chat-message', {
      meetingId,
      text: inputText.trim(),
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socket.emit('user-typing', { meetingId, isTyping: false });

    setInputText('');
  };

  const formatTimestamp = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Messages List Area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem',
          paddingRight: '0.25rem',
        }}
      >
        {isLoadingHistory ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
            <Loader2 size={20} className="spin" style={{ margin: '0 auto 0.5rem' }} />
            <span style={{ fontSize: '0.85rem' }}>Loading messages...</span>
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No messages yet. Send a message to start chatting!
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender === user?.id || msg.sender?._id === user?.id;

            return (
              <div
                key={msg.id || msg._id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    marginBottom: '0.25rem',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    alignSelf: isMe ? 'flex-end' : 'flex-start',
                  }}
                >
                  <strong style={{ color: isMe ? 'var(--primary-light)' : 'var(--text-primary)' }}>
                    {isMe ? 'You' : msg.senderName}
                  </strong>
                  <span>{formatTimestamp(msg.createdAt || msg.timestamp)}</span>
                </div>

                <div
                  style={{
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    background: isMe ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-tertiary)',
                    border: isMe ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                    lineHeight: 1.4,
                    wordBreak: 'break-word',
                  }}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator */}
      {typingPeers.length > 0 && (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '0.35rem 0' }}>
          <em>{typingPeers.join(', ')} {typingPeers.length === 1 ? 'is' : 'are'} typing...</em>
        </div>
      )}

      {/* Input Box */}
      <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Send a message..."
          value={inputText}
          onChange={handleInputChange}
          style={{ fontSize: '0.875rem' }}
        />
        <Button
          type="submit"
          variant="primary"
          size="sm"
          icon={Send}
          disabled={!inputText.trim()}
        />
      </form>
    </div>
  );
};

export default ChatPanel;
