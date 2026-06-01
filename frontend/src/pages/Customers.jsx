import React, { useState, useEffect } from 'react';
import { customerService } from '../services/api';
import { useApp } from '../context/AppContext';
import Modal from '../components/Modal';
import { Plus, Search, Trash2 } from 'lucide-react';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({ full_name: '', email: '', phone: '' });
  const [errors, setErrors] = useState({});
  
  const { showToast } = useApp();

  const fetchCustomers = async (searchTerm = '') => {
    try {
      setLoading(true);
      const data = await customerService.getAll(searchTerm);
      setCustomers(data);
    } catch (err) {
      console.error(err);
      showToast('Failed to retrieve customer list.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCustomers(search);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const validateForm = () => {
    const tempErrors = {};
    if (!formData.full_name.trim()) tempErrors.full_name = 'Full name is required';
    
    if (!formData.email.trim()) {
      tempErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        tempErrors.email = 'Enter a valid email address';
      }
    }
    
    if (!formData.phone.trim()) {
      tempErrors.phone = 'Phone number is required';
    } else if (formData.phone.trim().length < 5) {
      tempErrors.phone = 'Phone number must be at least 5 digits';
    }
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      await customerService.create(formData);
      showToast('Customer registered successfully!');
      setIsAddOpen(false);
      setFormData({ full_name: '', email: '', phone: '' });
      fetchCustomers(search);
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.detail || 'Failed to register customer. Ensure email is unique.', 'error');
    }
  };

  const handleDeleteClick = (customer) => {
    setSelectedCustomer(customer);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await customerService.delete(selectedCustomer.id);
      showToast('Customer record deleted.');
      setIsDeleteOpen(false);
      setSelectedCustomer(null);
      fetchCustomers(search);
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.detail || 'Failed to delete customer profile.', 'error');
    }
  };

  return (
    <div>
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setFormData({ full_name: '', email: '', phone: '' });
            setErrors({});
            setIsAddOpen(true);
          }}
        >
          <Plus size={16} /> Add Customer
        </button>
      </div>

      {loading && customers.length === 0 ? (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p style={{ color: 'var(--text-muted)' }}>Retrieving customers database...</p>
        </div>
      ) : customers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3 className="empty-title">No customers found</h3>
          <p className="empty-desc">
            {search ? "No profiles matched your search term." : "Get started by registering your first customer profile."}
          </p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Email Address</th>
                <th>Phone Number</th>
                <th>Created At</th>
                <th style={{ width: '80px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td style={{ fontWeight: 600 }}>{customer.full_name}</td>
                  <td>{customer.email}</td>
                  <td>{customer.phone}</td>
                  <td style={{ color: 'var(--text-muted)' }}>
                    {new Date(customer.created_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <button 
                        className="btn-icon btn-icon-danger" 
                        onClick={() => handleDeleteClick(customer)} 
                        aria-label="Delete Customer"
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

      {/* Add Customer Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Register Customer"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsAddOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAddSubmit}>Create Customer</button>
          </>
        }
      >
        <form onSubmit={handleAddSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              name="full_name"
              className="form-control"
              value={formData.full_name}
              onChange={handleInputChange}
              required
            />
            {errors.full_name && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.full_name}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="name@example.com"
              required
            />
            {errors.email && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.email}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number *</label>
            <input
              type="tel"
              name="phone"
              className="form-control"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="e.g. +1 (555) 123-4567"
              required
            />
            {errors.phone && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.phone}</span>}
          </div>
        </form>
      </Modal>

      {/* Delete Customer Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Customer Profile"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsDeleteOpen(false)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleDeleteConfirm}>Delete Customer</button>
          </>
        }
      >
        <p style={{ color: 'var(--text-light)', marginBottom: '0.5rem' }}>
          Are you sure you want to delete the profile of <strong>{selectedCustomer?.full_name}</strong>?
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          WARNING: Deleting this customer will automatically cascade delete all their associated orders. This cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default Customers;
