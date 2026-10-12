import { useState } from 'react';

export default function LoginPage({ onLogin, onSwitchToRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim() && password.trim()) {
      onLogin(username);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-box">
        <h1>Welcome Back</h1>
        <p>Sign in to access your Task Dashboard</p>
        <form onSubmit={handleSubmit} className="login-form">
          <input 
            type="text" 
            placeholder="Username" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Sign In</button>
        </form>
        <p className="auth-switch">
          Need an account? <span onClick={onSwitchToRegister}>Create one</span>
        </p>
      </div>
    </div>
  );
}