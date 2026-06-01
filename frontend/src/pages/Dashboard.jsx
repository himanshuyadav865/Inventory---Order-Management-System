import React, { useEffect, useState } from 'react';
import { dashboardService } from '../services/api';
import { useApp } from '../context/AppContext';
import StatCard from '../components/StatCard';
import { Package, Users, ShoppingCart, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useApp();

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.detail || 'Failed to load dashboard statistics.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-muted)' }}>Assembling dashboard analytics...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="empty-state">
        <div className="empty-icon">⚠️</div>
        <h3 className="empty-title">Failed to load Dashboard</h3>
        <p className="empty-desc">Check database connection and try reloading.</p>
        <button className="btn btn-primary" onClick={fetchStats}>Retry</button>
      </div>
    );
  }

  return (
    <div>
      {/* Cards Row */}
      <div className="stats-grid">
        <StatCard
          label="Total Products"
          value={stats.total_products}
          icon={<Package size={22} />}
          variant="primary"
        />
        <StatCard
          label="Active Customers"
          value={stats.total_customers}
          icon={<Users size={22} />}
          variant="secondary"
        />
        <StatCard
          label="Orders Processed"
          value={stats.total_orders}
          icon={<ShoppingCart size={22} />}
          variant="info"
        />
        <StatCard
          label="Low Stock Alert"
          value={stats.low_stock_products.length}
          icon={<AlertTriangle size={22} />}
          variant="warning"
        />
      </div>

      <div className="dashboard-sections">
        {/* Low Stock Section */}
        <div className="section-card">
          <div className="section-header">
            <h2 className="section-title">
              <AlertTriangle size={18} style={{ color: 'var(--warning)' }} />
              Low Stock Warnings
            </h2>
            <Link to="/products" className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>
              Manage Stock
            </Link>
          </div>

          {stats.low_stock_products.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem 1rem' }}>
              <div className="empty-icon" style={{ fontSize: '2rem' }}>🎉</div>
              <h3 className="empty-title" style={{ fontSize: '1rem' }}>All stock levels healthy</h3>
              <p className="empty-desc" style={{ fontSize: '0.8rem' }}>No products are currently under the warning threshold of 10 units.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Stock</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.low_stock_products.map((product) => (
                    <tr key={product.id}>
                      <td style={{ fontWeight: 600 }}>{product.name}</td>
                      <td style={{ fontFamily: 'monospace' }}>{product.sku}</td>
                      <td>{product.stock_quantity} units</td>
                      <td>
                        <span className={`badge ${product.stock_quantity === 0 ? 'badge-danger' : 'badge-warning'}`}>
                          {product.stock_quantity === 0 ? 'Out of Stock' : 'Low Stock'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Analytics Breakdown */}
        <div className="section-card">
          <div className="section-header">
            <h2 className="section-title">Activity Visualizer</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '0.5rem' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Proportional distribution of products, customers, and order history records:
            </p>
            
            {/* Custom Bar Graphs */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem', fontWeight: 600 }}>
                <span>Products Ratio</span>
                <span style={{ color: 'var(--primary)' }}>{stats.total_products} items</span>
              </div>
              <div style={{ height: '8px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  backgroundColor: 'var(--primary)', 
                  width: stats.total_products + stats.total_customers + stats.total_orders > 0 
                    ? `${(stats.total_products / (stats.total_products + stats.total_customers + stats.total_orders)) * 100}%` 
                    : '0%' 
                }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem', fontWeight: 600 }}>
                <span>Customers Ratio</span>
                <span style={{ color: 'var(--secondary)' }}>{stats.total_customers} users</span>
              </div>
              <div style={{ height: '8px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  backgroundColor: 'var(--secondary)', 
                  width: stats.total_products + stats.total_customers + stats.total_orders > 0 
                    ? `${(stats.total_customers / (stats.total_products + stats.total_customers + stats.total_orders)) * 100}%` 
                    : '0%' 
                }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem', fontWeight: 600 }}>
                <span>Orders Ratio</span>
                <span style={{ color: 'var(--info)' }}>{stats.total_orders} transactions</span>
              </div>
              <div style={{ height: '8px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  backgroundColor: 'var(--info)', 
                  width: stats.total_products + stats.total_customers + stats.total_orders > 0 
                    ? `${(stats.total_orders / (stats.total_products + stats.total_customers + stats.total_orders)) * 100}%` 
                    : '0%' 
                }}></div>
              </div>
            </div>
            
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'center' }}>
              <Link to="/orders" className="btn btn-primary" style={{ width: '100%', textDecoration: 'none' }}>
                Create New Order <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
