import { useState } from 'react';
import './Auth.css';

export default function Auth({ mode, onSwitch, onAuth, onBack }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isLogin = mode === 'login';

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    if (!isLogin) {
      if (!name.trim()) { setError('Please enter your name.'); return; }
      if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
      if (password !== confirm) { setError('Passwords do not match.'); return; }
    }

    setLoading(true);

    setTimeout(() => {
      try {
        const users = JSON.parse(localStorage.getItem('learnlyft_users') || '[]');

        if (isLogin) {
          const found = users.find(u => u.email === email && u.password === password);
          if (!found) { setError('Invalid email or password.'); setLoading(false); return; }
          onAuth({ name: found.name, email: found.email });
        } else {
          if (users.find(u => u.email === email)) { setError('An account with this email already exists.'); setLoading(false); return; }
          users.push({ name: name.trim(), email: email.trim(), password });
          localStorage.setItem('learnlyft_users', JSON.stringify(users));
          onAuth({ name: name.trim(), email: email.trim() });
        }
      } catch {
        setError('Something went wrong. Please try again.');
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="auth">
      <div className="auth__card animate-fade-in">
        {/* Back button */}
        <button className="auth__back" onClick={onBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back
        </button>

        {/* Logo */}
        <div className="auth__logo">
          <span className="auth__logo-icon">🚀</span>
          <span className="auth__logo-text">Learn<span className="auth__logo-accent">Lyft</span></span>
        </div>

        <h2 className="auth__title">{isLogin ? 'Welcome Back' : 'Create Your Account'}</h2>
        <p className="auth__subtitle">{isLogin ? 'Log in to continue your learning journey' : 'Join LearnLyft and start studying smarter'}</p>

        {error && <div className="auth__error">{error}</div>}

        <form className="auth__form" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="auth__field">
              <label htmlFor="auth-name">Full Name</label>
              <input id="auth-name" type="text" placeholder="Hruddayansh" value={name} onChange={e => setName(e.target.value)} autoComplete="name" />
            </div>
          )}
          <div className="auth__field">
            <label htmlFor="auth-email">Email</label>
            <input id="auth-email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" autoFocus />
          </div>
          <div className="auth__field">
            <label htmlFor="auth-pass">Password</label>
            <input id="auth-pass" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} autoComplete={isLogin ? 'current-password' : 'new-password'} />
          </div>
          {!isLogin && (
            <div className="auth__field">
              <label htmlFor="auth-confirm">Confirm Password</label>
              <input id="auth-confirm" type="password" placeholder="••••••••" value={confirm} onChange={e => setConfirm(e.target.value)} autoComplete="new-password" />
            </div>
          )}
          <button type="submit" className="auth__submit" disabled={loading}>
            {loading ? (
              <span className="auth__spinner" />
            ) : (
              isLogin ? 'Log In' : 'Create Account'
            )}
          </button>
        </form>

        <div className="auth__switch">
          {isLogin ? (
            <>Don&apos;t have an account? <button onClick={() => onSwitch('signup')}>Sign Up</button></>
          ) : (
            <>Already have an account? <button onClick={() => onSwitch('login')}>Log In</button></>
          )}
        </div>

        <div className="auth__footer">
          <span>Made by <strong>CoreStar</strong> · Owned by <strong>Hruddayansh</strong></span>
        </div>
      </div>
    </div>
  );
}
