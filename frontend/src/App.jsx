import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Toast from './components/Toast';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/*" element={
            <div className="app-container">
              {/* Left Navigation Panel */}
              <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
              
              {/* Right Content Panel */}
              <div className="main-content">
                <Header toggleSidebar={toggleSidebar} />
                <main className="content-body">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/customers" element={<Customers />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/orders/:id" element={<OrderDetail />} />
                  </Routes>
                </main>
              </div>
              
              {/* Toast Notification Layer */}
              <Toast />
            </div>
          } />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
