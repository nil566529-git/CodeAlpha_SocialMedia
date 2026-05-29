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
    const res = await fetch(`${API}/api/users`);
    const data = await res.json();
    setUsers(Array.isArray(data) ? data.filter(u => u._id !== user.userId) : []);
  };

  const fetchMessages = async () => {
    const res = await fetch(`${API}/api/chat/${user.userId}/${selectedUser._id}`);
    const data = await res.json();
    setMessages(data);
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    const msgData = {
      sender: user.userId,
      senderName: user.name,
      receiver: selectedUser._id,
      receiverName: selectedUser.name,
      text: newMessage,
      createdAt: new Date()
    };

    await fetch(`${API}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msgData)
    });

    socket.emit('send_message', msgData);
    setMessages(prev => [...prev, msgData]);
    setNewMessage('');
  };

  const timeFormat = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{
      position: 'fixed', bottom: '20px', right: '20px',
      width: '700px', height: '500px', background: 'white',
      borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
      display: 'flex', zIndex: 1000, overflow: 'hidden'
    }}>
      {/* Users List */}
      <div style={{
        width: '240px', borderRight: '1px solid #e4e6eb',
        display: 'flex', flexDirection: 'column'
      }}>
        <div style={{
          padding: '16px', borderBottom: '1px solid #e4e6eb',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <h3 style={{ color: '#1c1e21', fontSize: '16px', fontWeight: '700' }}>Messages</h3>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '18px', color: '#65676b'
          }}>✕</button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {users.map(u => (
            <div key={u._id} onClick={() => setSelectedUser(u)} style={{
              padding: '12px 16px', cursor: 'pointer', display: 'flex',
              alignItems: 'center', gap: '12px',
              background: selectedUser?._id === u._id ? '#f0f2f5' : 'white',
              borderBottom: '1px solid #f0f2f5'
            }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #405de6, #833ab4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: '700', fontSize: '16px'
                }}>{u.name[0].toUpperCase()}</div>
                {onlineUsers.includes(u._id) && (
                  <div style={{
                    position: 'absolute', bottom: '1px', right: '1px',
                    width: '10px', height: '10px', borderRadius: '50%',
                    background: '#31a24c', border: '2px solid white'
                  }}/>
                )}
              </div>
              <div>
                <div style={{ fontWeight: '600', color: '#1c1e21', fontSize: '14px' }}>{u.name}</div>
                <div style={{ fontSize: '12px', color: onlineUsers.includes(u._id) ? '#31a24c' : '#65676b' }}>
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
            justifyContent: 'center', flexDirection: 'column', color: '#65676b'
          }}>
            <div style={{ fontSize: '50px', marginBottom: '10px' }}>💬</div>
            <p style={{ fontWeight: '600' }}>Select a friend to chat!</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div style={{
              padding: '14px 16px', borderBottom: '1px solid #e4e6eb',
              display: 'flex', alignItems: 'center', gap: '12px'
            }}>
              <div style={{
                width: '38px', height: '38px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #405de6, #833ab4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: '700'
              }}>{selectedUser.name[0].toUpperCase()}</div>
              <div>
                <div style={{ fontWeight: '700', color: '#1c1e21' }}>{selectedUser.name}</div>
                <div style={{ fontSize: '12px', color: onlineUsers.includes(selectedUser._id) ? '#31a24c' : '#65676b' }}>
                  {onlineUsers.includes(selectedUser._id) ? 'Online' : 'Offline'}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {messages.length === 0 && (
                <div style={{ textAlign: 'center', color: '#65676b', marginTop: '20px' }}>
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
                      ? 'linear-gradient(135deg, #405de6, #833ab4)'
                      : '#f0f2f5',
                    color: msg.sender === user.userId ? 'white' : '#1c1e21',
                    fontSize: '14px', lineHeight: 1.5
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
              padding: '12px 16px', borderTop: '1px solid #e4e6eb',
              display: 'flex', gap: '10px', alignItems: 'center'
            }}>
              <input
                placeholder="Type a message..."
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && sendMessage()}
                style={{
                  flex: 1, padding: '10px 16px', border: '2px solid #e4e6eb',
                  borderRadius: '24px', outline: 'none', fontSize: '14px',
                  background: '#f0f2f5'
                }}
              />
              <button onClick={sendMessage} style={{
                background: 'linear-gradient(135deg, #405de6, #833ab4)',
                color: 'white', border: 'none', width: '40px', height: '40px',
                borderRadius: '50%', cursor: 'pointer', fontSize: '18px'
              }}>➤</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Chat;