import React, { useState } from 'react';

export default function LoginPage({ onLoginSuccess, onSwitchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isError, setIsError] = useState(false);

  // 1. Handle Sign-In Form Submit (Valid & Invalid Logins)
  async function handleSignIn(e) {
    e.preventDefault();
    setStatusMessage('Signing in...');
    setIsError(false);

    try {
      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Triggers on Invalid Login (401) or Input Validation Error (400)
        setIsError(true);
        setStatusMessage(
          `Login Failed (${response.status}): ${
            Array.isArray(data.message) ? data.message.join(', ') : data.message
          }`
        );
        return;
      }

      // Valid Login: Save JWT token to localStorage
      localStorage.setItem('access_token', data.access_token);
      setIsError(false);
      setStatusMessage(`Success (200): ${data.message}! JWT saved to localStorage.`);

      // If your App.jsx passes an onLoginSuccess callback, trigger it
      if (onLoginSuccess) {
        onLoginSuccess(data.user, data.access_token);
      }
    } catch (error) {
      setIsError(true);
      setStatusMessage('Network error: Make sure NestJS backend is running on port 3000.');
    }
  }

  // 2. Test Protected Route with whatever token is currently stored (or passed in)
  async function testProtectedRoute(customToken) {
    const tokenToUse =
      customToken !== undefined ? customToken : localStorage.getItem('access_token');

    try {
      const response = await fetch('http://localhost:3000/tasks', {
        method: 'GET',
        headers: {
          ...(tokenToUse ? { Authorization: `Bearer ${tokenToUse}` } : {}),
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setIsError(true);
        setStatusMessage(`Blocked (${response.status}): ${data.message}`);
        return;
      }

      setIsError(false);
      setStatusMessage(
        `Authorized (200 OK): Successfully fetched ${data.length} tasks from protected API!`
      );
    } catch (error) {
      setIsError(true);
      setStatusMessage('Network error while testing protected route.');
    }
  }

  // Pre-signed expired JWT (signed with 'super-secret-jwt-key-2026' and an expired timestamp)
  const EXPIRED_TOKEN =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoidGVzdEB0ZXN0LmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjE3MDAwMDAwMDF9.4f_xXz7H2bKj8L1pQ9vR6mN3wT5yU0cE8aG2dF4hJ6k';

  return (
    <div style={{ maxWidth: '420px', margin: '40px auto', padding: '24px', border: '1px solid #ddd', borderRadius: '8px', fontFamily: 'sans-serif' }}>
      <h2 style={{ marginTop: 0 }}>Sign In</h2>

      {statusMessage && (
        <div
          style={{
            padding: '12px',
            marginBottom: '16px',
            borderRadius: '6px',
            backgroundColor: isError ? '#ffe6e6' : '#e6ffed',
            color: isError ? '#cc0000' : '#006622',
            border: `1px solid ${isError ? '#ff9999' : '#8cd9a0'}`,
            fontSize: '14px',
          }}
        >
          {statusMessage}
        </div>
      )}

      <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <button
          type="submit"
          style={{ padding: '10px', cursor: 'pointer', fontWeight: 'bold', marginTop: '4px' }}
        >
          Sign In
        </button>
      </form>

      {onSwitchToRegister && (
        <p style={{ marginTop: '12px', fontSize: '14px', textAlign: 'center' }}>
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            style={{ background: 'none', border: 'none', color: '#0066cc', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
          >
            Register here
          </button>
        </p>
      )}

      {/* DAY 30 AUTH REVIEW TEST PANEL */}
      <hr style={{ margin: '24px 0', border: 'none', borderTop: '1px solid #eee' }} />
      <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#555' }}>
        Day 30 Auth Review Tester
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          type="button"
          onClick={() => testProtectedRoute()}
          style={{ padding: '8px', cursor: 'pointer', fontSize: '13px' }}
        >
          1. Test Protected Route (Uses Saved Token)
        </button>

        <button
          type="button"
          onClick={() => testProtectedRoute(null)}
          style={{ padding: '8px', cursor: 'pointer', fontSize: '13px' }}
        >
          2. Test Unauthorized Access (No Token)
        </button>

        <button
          type="button"
          onClick={() => testProtectedRoute('fake.tampered.token123')}
          style={{ padding: '8px', cursor: 'pointer', fontSize: '13px' }}
        >
          3. Test Invalid / Tampered Token
        </button>

        <button
          type="button"
          onClick={() => testProtectedRoute(EXPIRED_TOKEN)}
          style={{ padding: '8px', cursor: 'pointer', fontSize: '13px' }}
        >
          4. Test Expired Token
        </button>
      </div>
    </div>
  );
}