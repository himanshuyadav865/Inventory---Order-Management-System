import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService, customerService, productService } from '../services/api';
import { useApp } from '../context/AppContext';
import Modal from '../components/Modal';
import { Plus, Eye, Trash2, PlusCircle, Trash } from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Create order wizard state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [customersList, setCustomersList] = useState([]);
  const [productsList, setProductsList] = useState([]);
  
  // Wizard form data
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [orderItems, setOrderItems] = useState([
    { product_id: '', quantity: 1, max_stock: 0, price: 0, name: '' }
  ]);
  
  const { showToast } = useApp();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getAll();
      setOrders(data);
    } catch (err) {
      console.error(err);
      showToast('Failed to load orders history.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const openCreateWizard = async () => {
    try {
      // Load customers and products list for dropdowns
      const [customers, products] = await Promise.all([
        customerService.getAll(),
        productService.getAll()
      ]);
      setCustomersList(customers);
      setProductsList(products);
      
      // Reset form
      setSelectedCustomerId('');
      setOrderItems([{ product_id: '', quantity: 1, max_stock: 0, price: 0, name: '' }]);
      setErrors({});
      setIsAddOpen(true);
    } catch (err) {
      console.error(err);
      showToast('Failed to retrieve inventory or customer data to start order.', 'error');
    }
  };

  // Dynamic preview calculation
  const getOrderTotal = () => {
    return orderItems.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      const qty = parseInt(item.quantity) || 0;
      return sum + (price * qty);
    }, 0);
  };

  const handleProductSelect = (index, productId) => {
    const selectedProd = productsList.find(p => p.id === productId);
    const newItems = [...orderItems];
    
    if (selectedProd) {
      newItems[index] = {
        ...newItems[index],
        product_id: productId,
        max_stock: selectedProd.stock_quantity,
        price: selectedProd.price,
        name: selectedProd.name
      };
    } else {
      newItems[index] = { product_id: '', quantity: 1, max_stock: 0, price: 0, name: '' };
    }
    setOrderItems(newItems);
  };

  const handleQtyChange = (index, qty) => {
    const newItems = [...orderItems];
    newItems[index].quantity = parseInt(qty) || 0;
    setOrderItems(newItems);
  };

  const addOrderItemRow = () => {
    setOrderItems([...orderItems, { product_id: '', quantity: 1, max_stock: 0, price: 0, name: '' }]);
  };

  const removeOrderItemRow = (index) => {
    if (orderItems.length === 1) return;
    setOrderItems(orderItems.filter((_, idx) => idx !== index));
  };

  const [errors, setErrors] = useState({});
  const validateOrder = () => {
    const tempErrors = {};
    if (!selectedCustomerId) tempErrors.customer = 'Please select a customer';
    
    const itemErrors = [];
    orderItems.forEach((item, index) => {
      if (!item.product_id) {
        itemErrors[index] = 'Select a product';
      } else {
        if (item.quantity <= 0) {
          itemErrors[index] = 'Qty must be > 0';
        } else if (item.quantity > item.max_stock) {
          itemErrors[index] = `Insufficient stock (Available: ${item.max_stock})`;
        }
      }
    });

    if (itemErrors.length > 0) tempErrors.items = itemErrors;
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!validateOrder()) return;

    const payload = {
      customer_id: selectedCustomerId,
      items: orderItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity
      }))
    };

    try {
      await orderService.create(payload);
      showToast('Order created and stock updated successfully!');
      setIsAddOpen(false);
      fetchOrders();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.detail || 'Failed to place the order.', 'error');
    }
  };

  const handleDeleteOrder = async (id) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    try {
      await orderService.delete(id);
      showToast('Order record removed.');
      fetchOrders();
    } catch (err) {
      console.error(err);
      showToast('Failed to delete order.', 'error');
    }
  };

  return (
    <div>
      <div className="filter-bar" style={{ justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" onClick={openCreateWizard}>
          <Plus size={16} /> Create Order
        </button>
      </div>

      {loading && orders.length === 0 ? (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p style={{ color: 'var(--text-muted)' }}>Retrieving order logs...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🛒</div>
          <h3 className="empty-title">No orders recorded</h3>
          <p className="empty-desc">Create your first client order to start tracking sales and stock reductions.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items Count</th>
                <th>Total Value</th>
                <th>Date Placed</th>
                <th style={{ width: '120px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {order.id.substring(0, 8)}...
                  </td>
                  <td style={{ fontWeight: 600 }}>{order.customer_name}</td>
                  <td>
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--secondary)' }}>
                    ${parseFloat(order.total_amount).toFixed(2)}
                  </td>
                  <td>
                    {new Date(order.created_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
                      <button 
                        className="btn-icon" 
                        onClick={() => navigate(`/orders/${order.id}`)}
                        aria-label="View Order details"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        className="btn-icon btn-icon-danger" 
                        onClick={() => handleDeleteOrder(order.id)}
                        aria-label="Delete Order"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Order Wizard Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Create New Order"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsAddOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleCreateSubmit}>Place Order</button>
          </>
        }
      >
        <form onSubmit={handleCreateSubmit}>
          {/* Customer Selection */}
          <div className="form-group">
            <label className="form-label">Select Customer *</label>
            <select
              className="form-control"
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              required
            >
              <option value="">-- Select Customer --</option>
              {customersList.map(c => (
                <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>
              ))}
            </select>
            {errors.customer && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.customer}</span>}
          </div>

          <div style={{ margin: '1.5rem 0 0.5rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="form-label" style={{ margin: 0 }}>Order Items *</label>
            <button 
              type="button" 
              className="btn btn-secondary" 
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} 
              onClick={addOrderItemRow}
            >
              <PlusCircle size={14} /> Add Line Item
            </button>
          </div>

          {/* Dynamic Item List */}
          <div style={{ maxHeight: '35vh', overflowY: 'auto', marginBottom: '1.5rem', paddingRight: '4px' }}>
            {orderItems.map((item, index) => (
              <div key={index} className="wizard-item-row">
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label className="form-label" style={{ fontSize: '0.7rem', marginBottom: '0.25rem' }}>Product</label>
                  <select
                    className="form-control"
                    value={item.product_id}
                    onChange={(e) => handleProductSelect(index, e.target.value)}
                    required
                  >
                    <option value="">-- Select Product --</option>
                    {productsList.map(p => (
                      <option key={p.id} value={p.id} disabled={p.stock_quantity === 0}>
                        {p.name} (${parseFloat(p.price).toFixed(2)}) {p.stock_quantity === 0 ? '[Out of Stock]' : `[Stock: ${p.stock_quantity}]`}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label className="form-label" style={{ fontSize: '0.7rem', marginBottom: '0.25rem' }}>Quantity</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    value={item.quantity}
                    onChange={(e) => handleQtyChange(index, e.target.value)}
                    disabled={!item.product_id}
                    required
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '40px', paddingLeft: '4px' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Price</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-light)' }}>
                    ${(parseFloat(item.price) * (item.quantity || 0)).toFixed(2)}
                  </span>
                </div>

                <button
                  type="button"
                  className="btn-icon btn-icon-danger"
                  style={{ height: '38px', width: '38px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onClick={() => removeOrderItemRow(index)}
                  disabled={orderItems.length === 1}
                >
                  <Trash size={16} />
                </button>

                {errors.items && errors.items[index] && (
                  <div style={{ gridColumn: 'span 4', color: 'var(--danger)', fontSize: '0.7rem', marginTop: '-0.25rem' }}>
                    {errors.items[index]}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pricing Preview Summary Box */}
          <div className="order-summary-box">
            <div className="summary-row">
              <span>Items Count:</span>
              <span>{orderItems.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0)} units</span>
            </div>
            <div className="summary-row total">
              <span>Total Price Preview:</span>
              <span>${getOrderTotal().toFixed(2)}</span>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Orders;
