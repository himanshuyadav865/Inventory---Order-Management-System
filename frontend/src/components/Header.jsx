import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header = ({ toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const getTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard Overview';
    if (path.startsWith('/products')) return 'Product Inventory';
    if (path.startsWith('/customers')) return 'Customer Directory';
    if (path.startsWith('/orders/')) return 'Order Details';
    if (path.startsWith('/orders')) return 'Order Registry';
    return 'Management Console';
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error("Failed to log out", err);
    }
  };

  return (
    <header className="header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="menu-toggle" onClick={toggleSidebar} aria-label="Toggle Navigation Menu">
          <Menu size={24} />
        </button>
        <h1 className="header-title">{getTitle()}</h1>
      </div>
      
      <div className="header-actions">
        {currentUser && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(30, 41, 59, 0.5)', padding: '0.35rem 0.75rem', borderRadius: '9999px', border: '1px solid var(--border)' }}>
              <User size={14} style={{ color: 'var(--text-muted)' }}/>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: 500 }}>{currentUser.email}</span>
            </div>
            <button onClick={handleLogout} className="btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <LogOut size={14} /> Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
