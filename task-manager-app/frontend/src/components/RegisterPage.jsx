import { useState } from 'react';

export default function RegisterPage({ onRegister, onSwitchToLogin }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim() && email.trim() && password.trim()) {
      onRegister(username);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-box">
        <h1>Create Account</h1>
        <p>Sign up to start managing your tasks</p>
        <form onSubmit={handleSubmit} className="login-form">
          <input 
            type="text" 
            placeholder="Username" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input 
            type="email" 
            placeholder="Email Address" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Sign Up</button>
        </form>
        <p className="auth-switch">
          Already have an account? <span onClick={onSwitchToLogin}>Sign In</span>
        </p>
      </div>
    </div>
  );
}