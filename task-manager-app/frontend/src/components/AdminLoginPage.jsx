import React, { useState } from 'react';

export default function AdminLoginPage({ onAdminLoginSuccess, onBackToUserLogin }) {
  const [email, setEmail] = useState('admin@kodex.com');
  const [password, setPassword] = useState('admin123');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleAdminSubmit(e) {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMsg(`Access Denied (${response.status}): ${data.message}`);
        setLoading(false);
        return;
      }

      // Store token & role
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user_role', 'admin');
      onAdminLoginSuccess(data.user);
    } catch (err) {
      setErrorMsg('Server connection failed. Is the NestJS backend running?');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'sans-serif',
        color: '#f8fafc',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: '#1e293b',
          padding: '32px',
          borderRadius: '12px',
          border: '1px solid #334155',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span
            style={{
              backgroundColor: '#dc2626',
              color: '#fff',
              padding: '4px 10px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: 'bold',
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}
          >
            Restricted Portal
          </span>
          <h2 style={{ margin: '12px 0 4px 0', fontSize: '24px', color: '#fff' }}>
            Admin Control Center
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
            Authorized administrators only
          </p>
        </div>

        {errorMsg && (
          <div
            style={{
              backgroundColor: '#450a0a',
              border: '1px solid #dc2626',
              color: '#fca5a5',
              padding: '12px',
              borderRadius: '6px',
              fontSize: '13px',
              marginBottom: '16px',
            }}
          >
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleAdminSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: '#cbd5e1' }}>
              Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #475569',
                backgroundColor: '#0f172a',
                color: '#fff',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: '#cbd5e1' }}>
              Security Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #475569',
                backgroundColor: '#0f172a',
                color: '#fff',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '12px',
              backgroundColor: '#dc2626',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '14px',
              marginTop: '4px',
            }}
          >
            {loading ? 'Verifying Privileges...' : '🔐 Enter Admin Console'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', borderTop: '1px solid #334155', paddingTop: '16px' }}>
          <button
            type="button"
            onClick={onBackToUserLogin}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: '13px',
              textDecoration: 'underline',
            }}
          >
            ← Return to Standard User Login
          </button>
        </div>
      </div>
    </div>
  );
}