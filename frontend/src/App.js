import React, { useState, useEffect, useRef } from 'react';
import Auth from './Auth';
import Chat from './Chat';

const API = 'https://dopaig-backend.onrender.com';

function App() {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    if (token) return {
      token,
      name: localStorage.getItem('name'),
      username: localStorage.getItem('username'),
      userId: localStorage.getItem('userId'),
      avatar: localStorage.getItem('avatar') || null
    };
    return null;
  });
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [postImage, setPostImage] = useState(null);
  const [postImagePreview, setPostImagePreview] = useState(null);
  const [commentText, setCommentText] = useState({});
  const [showChat, setShowChat] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState('home');
  const fileInputRef = useRef(null);
  const avatarInputRef = useRef(null);

  useEffect(() => {
    if (user) fetchPosts();
  }, [user]);

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${user?.token}`
  };

  const fetchPosts = async (pageNum = 1) => {
    try {
      const res = await fetch(`${API}/api/posts?page=${pageNum}&limit=10`, {
        headers: authHeaders
      });
      const data = await res.json();
      if (pageNum === 1) {
        setPosts(data.docs || []);
      } else {
        setPosts(prev => [...prev, ...(data.docs || [])]);
      }
      setHasMore(data.hasNextPage || false);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handleLogin = (data) => {
    setUser({
      token: data.token, name: data.name,
      username: data.username, userId: data.id,
      avatar: data.avatar || null
    });
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`${API}/api/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${user?.token}` },
      body: formData
    });
    const data = await res.json();
    return data.url;
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadImage(file);
    await fetch(`${API}/api/auth/profile`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ avatar: url })
    });
    localStorage.setItem('avatar', url);
    setUser({ ...user, avatar: url });
    setUploading(false);
  };

  const handlePostImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPostImage(file);
    setPostImagePreview(URL.createObjectURL(file));
  };

  const createPost = async () => {
    if (!newPost.trim() && !postImage) return;
    setUploading(true);
    let imageUrl = null;
    if (postImage) imageUrl = await uploadImage(postImage);
    await fetch(`${API}/api/posts`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ content: newPost, image: imageUrl, avatar: user.avatar })
    });
    setNewPost('');
    setPostImage(null);
    setPostImagePreview(null);
    setUploading(false);
    fetchPosts();
  };

  const likePost = async (postId) => {
    await fetch(`${API}/api/posts/${postId}/like`, {
      method: 'PUT', headers: authHeaders
    });
    fetchPosts();
  };

  const deletePost = async (postId) => {
    await fetch(`${API}/api/posts/${postId}`, {
      method: 'DELETE', headers: authHeaders
    });
    fetchPosts();
  };

  const addComment = async (postId) => {
    if (!commentText[postId]?.trim()) return;
    await fetch(`${API}/api/posts/${postId}/comment`, {
      method: 'POST', headers: authHeaders,
      body: JSON.stringify({ text: commentText[postId], avatar: user.avatar })
    });
    setCommentText({ ...commentText, [postId]: '' });
    fetchPosts();
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage);
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const Avatar = ({ name, avatar, size = 42, fontSize = 18 }) => (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: avatar ? 'transparent' : 'linear-gradient(135deg, #f09433, #dc2743, #bc1888)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'white', fontWeight: '700', fontSize,
      overflow: 'hidden', border: '2px solid rgba(255,255,255,0.1)'
    }}>
      {avatar
        ? <img src={avatar} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : name?.[0]?.toUpperCase()
      }
    </div>
  );

  if (!user) return <Auth onLogin={handleLogin} />;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(145deg, #0a0a0a 0%, #1a0533 50%, #0d0d2b 100%)',
      fontFamily: "'Segoe UI', sans-serif", color: 'white'
    }}>

      {/* Navbar */}
      <nav style={{
        background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(20px)',
        padding: '0 30px', height: '65px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <h1 style={{
          fontSize: '26px', fontWeight: '900', margin: 0, letterSpacing: '-1px',
          background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>DOPA.IG</h1>

        {/* Search bar */}
        <div style={{
          background: 'rgba(255,255,255,0.08)', borderRadius: '25px',
          padding: '8px 20px', display: 'flex', alignItems: 'center', gap: '10px',
          border: '1px solid rgba(255,255,255,0.1)', width: '250px'
        }}>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>🔍</span>
          <input placeholder="Search DOPA.IG" style={{
            background: 'transparent', border: 'none', outline: 'none',
            color: 'white', fontSize: '14px', width: '100%'
          }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button onClick={() => setShowChat(!showChat)} style={{
            background: showChat
              ? 'linear-gradient(135deg, #f09433, #dc2743, #bc1888)'
              : 'rgba(255,255,255,0.08)',
            color: 'white', border: '1px solid rgba(255,255,255,0.1)',
            padding: '8px 18px', borderRadius: '20px',
            cursor: 'pointer', fontWeight: '700', fontSize: '14px'
          }}>💬 Messages</button>

          <div style={{ position: 'relative', cursor: 'pointer' }}
            onClick={() => avatarInputRef.current.click()}>
            <Avatar name={user.name} avatar={user.avatar} size={38} fontSize={16} />
            <div style={{
              position: 'absolute', bottom: '-2px', right: '-2px',
              background: 'linear-gradient(135deg, #f09433, #dc2743)',
              borderRadius: '50%', width: '16px', height: '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '10px', color: 'white', border: '2px solid #0a0a0a'
            }}>+</div>
            <input ref={avatarInputRef} type="file" accept="image/*"
              onChange={handleAvatarChange} style={{ display: 'none' }} />
          </div>

          <div>
            <div style={{ color: 'white', fontWeight: '700', fontSize: '14px' }}>{user.name}</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>@{user.username}</div>
          </div>

          <button onClick={logout} style={{
            background: 'rgba(220,39,67,0.2)', color: '#ff6b8a',
            border: '1px solid rgba(220,39,67,0.3)', padding: '8px 16px',
            borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px'
          }}>Logout</button>
        </div>
      </nav>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px 20px' }}>

        {/* Create Post */}
        <div style={{
          background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '20px',
          marginBottom: '24px', border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <Avatar name={user.name} avatar={user.avatar} />
            <textarea
              value={newPost}
              onChange={e => setNewPost(e.target.value)}
              placeholder={`What's on your mind, ${user.name}? Use #hashtags!`}
              style={{
                flex: 1, border: 'none', outline: 'none', resize: 'none',
                fontSize: '16px', color: 'white', background: 'transparent',
                minHeight: '70px', fontFamily: 'inherit',
                '::placeholder': { color: 'rgba(255,255,255,0.3)' }
              }}
            />
          </div>

          {postImagePreview && (
            <div style={{ position: 'relative', marginTop: '12px' }}>
              <img src={postImagePreview} alt="preview" style={{
                width: '100%', borderRadius: '12px', maxHeight: '300px', objectFit: 'cover'
              }} />
              <button onClick={() => { setPostImage(null); setPostImagePreview(null); }} style={{
                position: 'absolute', top: '8px', right: '8px',
                background: 'rgba(0,0,0,0.7)', color: 'white', border: 'none',
                borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', fontSize: '14px'
              }}>✕</button>
            </div>
          )}

          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: '16px', paddingTop: '16px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <button onClick={() => fileInputRef.current.click()} style={{
              background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)',
              border: '1px solid rgba(255,255,255,0.1)', padding: '8px 16px',
              borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px'
            }}>📷 Photo</button>
            <input ref={fileInputRef} type="file" accept="image/*"
              onChange={handlePostImageChange} style={{ display: 'none' }} />
            <button onClick={createPost} disabled={uploading} style={{
              background: uploading ? 'rgba(255,255,255,0.1)'
                : 'linear-gradient(135deg, #f09433, #dc2743, #bc1888)',
              color: 'white', border: 'none', padding: '10px 28px',
              borderRadius: '10px', cursor: uploading ? 'not-allowed' : 'pointer',
              fontWeight: '800', fontSize: '15px',
              boxShadow: uploading ? 'none' : '0 4px 15px rgba(220,39,67,0.4)'
            }}>
              {uploading ? 'Uploading...' : 'Share'}
            </button>
          </div>
        </div>

        {/* Posts */}
        {posts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 40px', color: 'rgba(255,255,255,0.4)' }}>
            <div style={{ fontSize: '60px', marginBottom: '16px' }}>📸</div>
            <h3 style={{ color: 'white', marginBottom: '8px' }}>No posts yet!</h3>
            <p>Be the first to share something on DOPA.IG</p>
          </div>
        )}

        {posts.map(post => (
          <div key={post._id} style={{
            background: 'rgba(255,255,255,0.05)', borderRadius: '16px',
            marginBottom: '20px', border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(10px)', overflow: 'hidden'
          }}>
            {/* Post Header */}
            <div style={{
              padding: '16px 20px', display: 'flex',
              alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    padding: '2px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #f09433, #dc2743, #bc1888)'
                  }}>
                    <Avatar name={post.name} avatar={post.avatar} size={40} />
                  </div>
                </div>
                <div>
                  <div style={{ fontWeight: '700', color: 'white', fontSize: '15px' }}>{post.name}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                    @{post.username} · {timeAgo(post.createdAt)}
                  </div>
                </div>
              </div>
              {post.user === user.userId && (
                <button onClick={() => deletePost(post._id)} style={{
                  background: 'rgba(220,39,67,0.15)', color: '#ff6b8a',
                  border: '1px solid rgba(220,39,67,0.2)', borderRadius: '8px',
                  padding: '6px 12px', cursor: 'pointer', fontSize: '13px'
                }}>Delete</button>
              )}
            </div>

            {/* Post Content */}
            {post.content && (
              <p style={{
                color: 'rgba(255,255,255,0.85)', fontSize: '16px',
                lineHeight: 1.7, padding: '0 20px 16px'
              }}>
                {post.content}
              </p>
            )}

            {/* Post Image */}
            {post.image && (
              <img src={post.image} alt="post" style={{
                width: '100%', maxHeight: '450px', objectFit: 'cover'
              }} />
            )}

            {/* Hashtags */}
            {post.hashtags && post.hashtags.length > 0 && (
              <div style={{ padding: '10px 20px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {post.hashtags.map((tag, i) => (
                  <span key={i} style={{
                    background: 'rgba(240,148,51,0.15)', color: '#f09433',
                    fontSize: '13px', fontWeight: '600', padding: '3px 10px',
                    borderRadius: '20px', border: '1px solid rgba(240,148,51,0.2)'
                  }}>{tag}</span>
                ))}
              </div>
            )}

            {/* Likes & Comments count */}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '10px 20px', borderTop: '1px solid rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.4)', fontSize: '13px'
            }}>
              <span>❤️ {post.likes.length} likes</span>
              <span>💬 {post.comments.length} comments</span>
            </div>

            {/* Like Button */}
            <div style={{ padding: '10px 20px' }}>
              <button onClick={() => likePost(post._id)} style={{
                width: '100%', padding: '10px', border: 'none', borderRadius: '10px',
                cursor: 'pointer', fontWeight: '700', fontSize: '14px', transition: 'all 0.3s',
                background: post.likes.includes(user.userId)
                  ? 'linear-gradient(135deg, rgba(220,39,67,0.3), rgba(188,24,136,0.3))'
                  : 'rgba(255,255,255,0.05)',
                color: post.likes.includes(user.userId) ? '#ff6b8a' : 'rgba(255,255,255,0.5)',
                border: post.likes.includes(user.userId)
                  ? '1px solid rgba(220,39,67,0.3)'
                  : '1px solid rgba(255,255,255,0.08)'
              }}>
                {post.likes.includes(user.userId) ? '❤️ Liked' : '🤍 Like'}
              </button>
            </div>

            {/* Comments */}
            <div style={{ padding: '0 20px 16px' }}>
              {post.comments.map((comment, index) => (
                <div key={index} style={{
                  display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'flex-start'
                }}>
                  <Avatar name={comment.name} avatar={comment.avatar} size={30} fontSize={12} />
                  <div style={{
                    background: 'rgba(255,255,255,0.06)', borderRadius: '12px',
                    padding: '8px 12px', flex: 1,
                    border: '1px solid rgba(255,255,255,0.06)'
                  }}>
                    <span style={{ fontWeight: '700', color: 'white', fontSize: '13px' }}>{comment.name} </span>
                    <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>{comment.text}</span>
                  </div>
                </div>
              ))}

              {/* Add Comment */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '10px' }}>
                <Avatar name={user.name} avatar={user.avatar} size={30} fontSize={12} />
                <input
                  placeholder="Add a comment..."
                  value={commentText[post._id] || ''}
                  onChange={e => setCommentText({ ...commentText, [post._id]: e.target.value })}
                  onKeyPress={e => e.key === 'Enter' && addComment(post._id)}
                  style={{
                    flex: 1, padding: '9px 14px',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px',
                    background: 'rgba(255,255,255,0.06)', outline: 'none',
                    fontSize: '13px', color: 'white'
                  }}
                />
                <button onClick={() => addComment(post._id)} style={{
                  background: 'linear-gradient(135deg, #f09433, #dc2743)',
                  color: 'white', border: 'none', padding: '9px 16px',
                  borderRadius: '20px', cursor: 'pointer', fontWeight: '700', fontSize: '13px'
                }}>Post</button>
              </div>
            </div>
          </div>
        ))}

        {/* Load More */}
        {hasMore && (
          <button onClick={loadMore} style={{
            width: '100%', padding: '14px',
            background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
            cursor: 'pointer', fontWeight: '700', fontSize: '15px', marginBottom: '20px'
          }}>Load More Posts</button>
        )}

        {/* Footer */}
        <div style={{ textAlign: 'center', padding: '20px', color: 'rgba(255,255,255,0.2)', fontSize: '13px' }}>
          <span style={{
            background: 'linear-gradient(135deg, #f09433, #dc2743)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '800'
          }}>DOPA.IG</span> © 2026 · Made with ❤️ by {user.name}
        </div>
      </div>

      {/* Chat Widget */}
      {showChat && <Chat user={user} onClose={() => setShowChat(false)} />}
    </div>
  );
}

export default App;