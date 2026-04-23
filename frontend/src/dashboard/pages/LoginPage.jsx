import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/LoginPage.css';

const LoginPage = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password }),
      });
      if (res.ok) {
        navigate('/dashboard');
      } else {
        setError('Invalid email or password.');
      }
    } catch {
      setError('Something went wrong, try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <a href="/" className="login-logo">Certi<span>save</span></a>
      <div className="login-card">
        <div className="login-tag">Welcome back</div>
        <h1 className="login-title">Sign in to your account</h1>
        <p className="login-sub">Don't have an account? <a href="/signup">Get started →</a></p>

        {error && <div className="login-error">{error}</div>}

        <div className="login-fields">
          <div className="login-field">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="john@yourfirm.co.uk"
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>
          <div className="login-field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Your password"
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>
        </div>

        <button onClick={handleSubmit} disabled={loading || !email || !password} className="login-btn">
          {loading ? 'Signing in...' : 'Sign in →'}
        </button>

        <a href="/forgot-password" className="login-forgot">Forgot your password?</a>
      </div>
    </div>
  );
};

export default LoginPage;