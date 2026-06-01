import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, UserPlus, AlertCircle } from 'lucide-react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card glass-panel">
        <div className="login-header">
          <div className="logo-icon-large">📦</div>
          <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="subtitle">
            {isLogin ? 'Sign in to your dashboard' : 'Join to manage your inventory'}
          </p>
        </div>

        {error && (
          <div className="error-alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary login-btn"
            disabled={loading}
          >
            {isLogin ? (
              <><LogIn size={18} /> Sign In</>
            ) : (
              <><UserPlus size={18} /> Sign Up</>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button" 
              className="btn-text" 
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>

      <style>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--bg-dark);
          padding: 1rem;
        }
        .login-card {
          width: 100%;
          max-width: 400px;
          padding: 2.5rem;
          border-radius: var(--radius-lg);
        }
        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .logo-icon-large {
          font-size: 3rem;
          margin-bottom: 1rem;
        }
        .subtitle {
          color: var(--text-muted);
          font-size: 0.9rem;
          margin-top: 0.5rem;
        }
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .login-btn {
          width: 100%;
          justify-content: center;
          margin-top: 0.5rem;
        }
        .error-alert {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(239, 68, 68, 0.1);
          color: var(--danger);
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          border: 1px solid rgba(239, 68, 68, 0.2);
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
        }
        .login-footer {
          margin-top: 2rem;
          text-align: center;
          color: var(--text-muted);
          font-size: 0.9rem;
        }
        .btn-text {
          background: none;
          border: none;
          color: var(--primary);
          cursor: pointer;
          font-weight: 500;
          padding: 0;
        }
        .btn-text:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
