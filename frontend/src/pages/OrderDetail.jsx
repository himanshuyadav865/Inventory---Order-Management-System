import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { orderService } from '../services/api';
import { useApp } from '../context/AppContext';
import { ArrowLeft, ShoppingBag, User, Calendar, DollarSign, Printer } from 'lucide-react';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useApp();

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const data = await orderService.getById(id);
        setOrder(data);
      } catch (err) {
        console.error(err);
        showToast('Failed to load order details.', 'error');
        navigate('/orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-muted)' }}>Retrieving order details...</p>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div>
      <div className="filter-bar">
        <Link to="/orders" className="btn btn-secondary">
          <ArrowLeft size={16} /> Back to Registry
        </Link>
        <button className="btn btn-primary" onClick={() => window.print()}>
          <Printer size={16} /> Print Invoice
        </button>
      </div>

      {/* Details Grid cards */}
      <div className="detail-grid">
        {/* Order Info Card */}
        <div className="detail-card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--primary)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
            <ShoppingBag size={18} />
            <span>Order Summary</span>
          </h3>
          <div className="detail-row">
            <span className="detail-label">Order Reference:</span>
            <span className="detail-value" style={{ fontFamily: 'monospace' }}>{order.id}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Placed On:</span>
            <span className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Calendar size={14} className="text-muted" />
              {new Date(order.created_at).toLocaleString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Status:</span>
            <span className="detail-value">
              <span className="badge badge-success">Processed / Paid</span>
            </span>
          </div>
        </div>

        {/* Customer Info Card */}
        <div className="detail-card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--secondary)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
            <User size={18} />
            <span>Customer Details</span>
          </h3>
          <div className="detail-row">
            <span className="detail-label">Customer Name:</span>
            <span className="detail-value">{order.customer_name}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Identifier URL:</span>
            <span className="detail-value" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{order.customer_id}</span>
          </div>
        </div>
      </div>

      {/* Order Line Items */}
      <div className="section-card">
        <div className="section-header">
          <h2 className="section-title">Invoice Line Items</h2>
        </div>
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Product Description</th>
                <th>SKU Code</th>
                <th style={{ textAlign: 'right' }}>Unit Price</th>
                <th style={{ textAlign: 'center' }}>Quantity</th>
                <th style={{ textAlign: 'right' }}>Line Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600 }}>{item.product_name}</td>
                  <td>
                    <span style={{ fontFamily: 'monospace', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>
                      {item.product_sku}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    ₹{parseFloat(item.unit_price).toFixed(2)}
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 600 }}>
                    {item.quantity} units
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--text-main)' }}>
                    ₹{(parseFloat(item.unit_price) * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
              {/* Grand Total Row */}
              <tr style={{ background: 'rgba(99, 102, 241, 0.05)', fontWeight: 'bold' }}>
                <td colSpan="3" style={{ borderBottom: 'none' }}></td>
                <td style={{ textAlign: 'center', borderBottom: 'none', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Total Invoice Amount
                </td>
                <td style={{ textAlign: 'right', borderBottom: 'none', color: 'var(--secondary)', fontSize: '1.2rem', fontFamily: 'var(--font-secondary)' }}>
                  ₹{parseFloat(order.total_amount).toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
