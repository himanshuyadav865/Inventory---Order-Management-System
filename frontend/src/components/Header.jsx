import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';

const Header = ({ toggleSidebar }) => {
  const location = useLocation();

  const getTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard Overview';
    if (path.startsWith('/products')) return 'Product Inventory';
    if (path.startsWith('/customers')) return 'Customer Directory';
    if (path.startsWith('/orders/')) return 'Order Details';
    if (path.startsWith('/orders')) return 'Order Registry';
    return 'Management Console';
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
        {/* Actions can be added here in the future */}
      </div>
    </header>
  );
};

export default Header;
