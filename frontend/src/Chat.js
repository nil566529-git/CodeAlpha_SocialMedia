import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const API = 'https://dopaig-backend.onrender.com';
const socket = io(API);

function Chat({ user, onClose }) {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const messagesEndRef = useRef(null);

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${user.token}`
  };

  useEffect(() => {
    socket.emit('user_online', user.userId);
    fetchUsers();

    socket.on('receive_message', (data) => {
      setMessages(prev => [...prev, data]);
    });

    socket.on('online_users', (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.off('receive_message');
      socket.off('online_users');
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (selectedUser) fetchMessages();
  }, [selectedUser]);

  const fetchUsers = async () => {
    try {
      // Updated to the secure auth/users route
      const res = await fetch(`${API}/api/auth/users`, { headers: authHeaders });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data.filter(u => u._id !== user.userId) : []);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  const fetchMessages = async () => {
    try {
      // Updated to the secure chat route
      const res = await fetch(`${API}/api/chat/${selectedUser._id}`, { headers: authHeaders });
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch messages", err);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const socketData = {
      sender: user.userId,
      senderName: user.name,
      receiver: selectedUser._id,
      receiverName: selectedUser.name,
      text: newMessage,
      createdAt: new Date()
    };

    // Optimistically update UI
    socket.emit('send_message', socketData);
    setMessages(prev => [...prev, socketData]);
    setNewMessage('');

    // Save to secure backend
    await fetch(`${API}/api/chat/${selectedUser._id}`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ text: socketData.text, receiverName: socketData.receiverName })
    });
  };

  const timeFormat = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{
      position: 'fixed', bottom: '20px', right: '20px',
      width: '700px', height: '500px', background: 'rgba(10,10,10,0.95)',
      backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
      display: 'flex', zIndex: 1000, overflow: 'hidden', color: 'white'
    }}>
      {/* Users List */}
      <div style={{
        width: '240px', borderRight: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', flexDirection: 'column'
      }}>
        <div style={{
          padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>Messages</h3>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '18px', color: 'rgba(255,255,255,0.5)'
          }}>✕</button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {users.map(u => (
            <div key={u._id} onClick={() => setSelectedUser(u)} style={{
              padding: '12px 16px', cursor: 'pointer', display: 'flex',
              alignItems: 'center', gap: '12px', transition: 'background 0.2s',
              background: selectedUser?._id === u._id ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderBottom: '1px solid rgba(255,255,255,0.05)'
            }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f09433, #dc2743)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: '700', fontSize: '16px'
                }}>{u.name[0].toUpperCase()}</div>
                {onlineUsers.includes(u._id) && (
                  <div style={{
                    position: 'absolute', bottom: '1px', right: '1px',
                    width: '10px', height: '10px', borderRadius: '50%',
                    background: '#31a24c', border: '2px solid #0a0a0a'
                  }}/>
                )}
              </div>
              <div>
                <div style={{ fontWeight: '600', fontSize: '14px' }}>{u.name}</div>
                <div style={{ fontSize: '12px', color: onlineUsers.includes(u._id) ? '#31a24c' : 'rgba(255,255,255,0.4)' }}>
                  {onlineUsers.includes(u._id) ? 'Online' : 'Offline'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {!selectedUser ? (
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexDirection: 'column', color: 'rgba(255,255,255,0.4)'
          }}>
            <div style={{ fontSize: '50px', marginBottom: '10px' }}>💬</div>
            <p style={{ fontWeight: '600' }}>Select a friend to chat!</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div style={{
              padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.02)'
            }}>
              <div style={{
                width: '38px', height: '38px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #f09433, #dc2743)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: '700'
              }}>{selectedUser.name[0].toUpperCase()}</div>
              <div>
                <div style={{ fontWeight: '700' }}>{selectedUser.name}</div>
                <div style={{ fontSize: '12px', color: onlineUsers.includes(selectedUser._id) ? '#31a24c' : 'rgba(255,255,255,0.4)' }}>
                  {onlineUsers.includes(selectedUser._id) ? 'Online' : 'Offline'}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {messages.length === 0 && (
                <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', marginTop: '20px' }}>
                  Say hi to {selectedUser.name}! 👋
                </div>
              )}
              {messages.map((msg, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: msg.sender === user.userId ? 'flex-end' : 'flex-start'
                }}>
                  <div style={{
                    maxWidth: '70%', padding: '10px 14px', borderRadius: '18px',
                    background: msg.sender === user.userId
                      ? 'linear-gradient(135deg, #f09433, #dc2743)'
                      : 'rgba(255,255,255,0.1)',
                    color: 'white', fontSize: '14px', lineHeight: 1.5
                  }}>
                    <div>{msg.text}</div>
                    <div style={{
                      fontSize: '11px', marginTop: '4px', textAlign: 'right',
                      opacity: 0.7
                    }}>{timeFormat(msg.createdAt)}</div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div style={{
              padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', gap: '10px', alignItems: 'center', background: 'rgba(255,255,255,0.02)'
            }}>
              <input
                placeholder="Type a message..."
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && sendMessage()}
                style={{
                  flex: 1, padding: '10px 16px', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '24px', outline: 'none', fontSize: '14px',
                  background: 'rgba(255,255,255,0.05)', color: 'white'
                }}
              />
              <button onClick={sendMessage} style={{
                background: 'linear-gradient(135deg, #f09433, #dc2743)',
                color: 'white', border: 'none', width: '40px', height: '40px',
                borderRadius: '50%', cursor: 'pointer', fontSize: '18px',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>➤</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Chat;