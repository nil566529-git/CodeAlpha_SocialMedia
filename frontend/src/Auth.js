import React, { useState } from 'react';

const API = 'https://dopaig-backend.onrender.com';

function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setMessage('');
    const url = isLogin ? `${API}/api/auth/login` : `${API}/api/auth/register`;
    const body = isLogin ? { email, password } : { name, username, email, password };
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setLoading(false);
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('name', data.name);
      localStorage.setItem('username', data.username);
      localStorage.setItem('userId', data.id);
      localStorage.setItem('avatar', data.avatar || '');
      onLogin(data);
    } else {
      setMessage(data.message);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'linear-gradient(145deg, #0a0a0a 0%, #1a0533 50%, #0d0d2b 100%)',
      fontFamily: "'Segoe UI', sans-serif", position: 'relative', overflow: 'hidden'
    }}>
      {/* Background blobs */}
      <div style={{
        position: 'absolute', width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(130,58,180,0.3) 0%, transparent 70%)',
        top: '-100px', left: '-100px', pointerEvents: 'none'
      }}/>
      <div style={{
        position: 'absolute', width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(64,93,230,0.3) 0%, transparent 70%)',
        bottom: '-50px', right: '300px', pointerEvents: 'none'
      }}/>
      <div style={{
        position: 'absolute', width: '300px', height: '300px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(225,48,108,0.2) 0%, transparent 70%)',
        top: '50%', right: '-50px', pointerEvents: 'none'
      }}/>

      {/* Left Panel */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '80px', position: 'relative', zIndex: 1
      }}>
        {/* Logo */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '64px', fontWeight: '900', margin: 0, letterSpacing: '-2px',
            background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>DOPA.IG</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px', marginTop: '8px' }}>
            Connect • Share • Inspire
          </p>
        </div>

        <h2 style={{ color: 'white', fontSize: '40px', fontWeight: '800', lineHeight: 1.2, marginBottom: '20px' }}>
          Share your world<br />
          <span style={{
            background: 'linear-gradient(135deg, #f09433, #dc2743, #bc1888)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>with DOPA.IG</span>
        </h2>

        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '17px', lineHeight: 1.8, marginBottom: '40px', maxWidth: '400px' }}>
          Join millions of people sharing photos, stories and connecting with friends around the world.
        </p>

        <div style={{ display: 'flex', gap: '40px', marginBottom: '50px' }}>
          {[['10M+', 'Users'], ['50M+', 'Posts'], ['100M+', 'Connections']].map(([n, l]) => (
            <div key={l}>
              <div style={{
                fontSize: '28px', fontWeight: '800',
                background: 'linear-gradient(135deg, #f09433, #dc2743)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
              }}>{n}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>{l}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            'Share photos and videos with friends',
            'Real-time messaging and chat',
            'Discover trending content',
            'Connect with people worldwide'
          ].map(item => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #f09433, #dc2743, #bc1888)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', color: 'white', fontWeight: 'bold'
              }}>✓</div>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px' }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div style={{
        width: '480px', display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '40px', position: 'relative', zIndex: 1
      }}>
        <div style={{
          width: '100%', maxWidth: '380px',
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px', padding: '40px',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
        }}>
          {/* Logo small */}
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h2 style={{
              fontSize: '32px', fontWeight: '900', margin: '0 0 8px',
              background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>DOPA.IG</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', margin: 0 }}>
              {isLogin ? 'Welcome back!' : 'Join DOPA.IG today'}
            </p>
          </div>

          {/* Toggle */}
          <div style={{
            display: 'flex', background: 'rgba(255,255,255,0.05)',
            borderRadius: '12px', padding: '4px', marginBottom: '28px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            {['Login', 'Register'].map(tab => (
              <button key={tab} onClick={() => { setIsLogin(tab === 'Login'); setMessage(''); }} style={{
                flex: 1, padding: '10px', border: 'none', borderRadius: '10px',
                cursor: 'pointer', fontWeight: '700', fontSize: '14px', transition: 'all 0.3s',
                background: (isLogin && tab === 'Login') || (!isLogin && tab === 'Register')
                  ? 'linear-gradient(135deg, #f09433, #dc2743, #bc1888)'
                  : 'transparent',
                color: 'white'
              }}>{tab}</button>
            ))}
          </div>

          {/* Inputs */}
          {!isLogin && (
            <>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: '600' }}>Full Name</label>
                <input placeholder="John Doe" value={name} onChange={e => setName(e.target.value)}
                  style={{
                    width: '100%', padding: '13px 16px', marginTop: '6px',
                    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '12px', fontSize: '15px', boxSizing: 'border-box',
                    outline: 'none', color: 'white'
                  }} />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: '600' }}>Username</label>
                <input placeholder="johndoe123" value={username} onChange={e => setUsername(e.target.value)}
                  style={{
                    width: '100%', padding: '13px 16px', marginTop: '6px',
                    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '12px', fontSize: '15px', boxSizing: 'border-box',
                    outline: 'none', color: 'white'
                  }} />
              </div>
            </>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: '600' }}>Email</label>
            <input placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)}
              style={{
                width: '100%', padding: '13px 16px', marginTop: '6px',
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '12px', fontSize: '15px', boxSizing: 'border-box',
                outline: 'none', color: 'white'
              }} />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: '600' }}>Password</label>
            <input placeholder="Min. 6 characters" type="password" value={password} onChange={e => setPassword(e.target.value)}
              style={{
                width: '100%', padding: '13px 16px', marginTop: '6px',
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '12px', fontSize: '15px', boxSizing: 'border-box',
                outline: 'none', color: 'white'
              }} />
          </div>

          {message && (
            <div style={{
              background: 'rgba(220,39,67,0.2)', color: '#ff6b8a', padding: '12px 16px',
              borderRadius: '10px', marginBottom: '20px', fontSize: '14px',
              border: '1px solid rgba(220,39,67,0.3)'
            }}>{message}</div>
          )}

          <button onClick={handleSubmit} disabled={loading} style={{
            width: '100%', padding: '14px',
            background: loading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
            color: 'white', border: 'none', borderRadius: '12px',
            fontSize: '16px', fontWeight: '800', cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading ? 'none' : '0 4px 20px rgba(220,39,67,0.4)',
            letterSpacing: '0.5px'
          }}>
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>

          <p style={{ textAlign: 'center', marginTop: '24px', color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span onClick={() => { setIsLogin(!isLogin); setMessage(''); }}
              style={{
                background: 'linear-gradient(135deg, #f09433, #dc2743)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                cursor: 'pointer', fontWeight: '700'
              }}>
              {isLogin ? 'Sign up free' : 'Sign in'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Auth;