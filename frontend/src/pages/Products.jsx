import React, { useState, useEffect } from 'react';
import { productService } from '../services/api';
import { useApp } from '../context/AppContext';
import Modal from '../components/Modal';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  // Active product states for edit/delete
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({ name: '', sku: '', price: '', stock_quantity: 0 });
  const [errors, setErrors] = useState({});
  
  const { showToast } = useApp();

  const fetchProducts = async (searchTerm = '') => {
    try {
      setLoading(true);
      const data = await productService.getAll(searchTerm);
      setProducts(data);
    } catch (err) {
      console.error(err);
      showToast('Failed to retrieve product list.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts(search);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const validateForm = () => {
    const tempErrors = {};
    if (!formData.name.trim()) tempErrors.name = 'Product name is required';
    
    if (!formData.sku.trim()) {
      tempErrors.sku = 'SKU is required';
    } else if (formData.sku.trim().length < 3) {
      tempErrors.sku = 'SKU must be at least 3 characters';
    }
    
    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      tempErrors.price = 'Price must be a valid number greater than 0';
    }
    
    const qtyNum = parseInt(formData.stock_quantity);
    if (isNaN(qtyNum) || qtyNum < 0) {
      tempErrors.stock_quantity = 'Stock quantity cannot be negative';
    }
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'stock_quantity' ? parseInt(value) || 0 : value,
    }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      await productService.create(formData);
      showToast('Product added successfully!');
      setIsAddOpen(false);
      setFormData({ name: '', sku: '', price: '', stock_quantity: 0 });
      fetchProducts(search);
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.detail || 'Failed to add product. Ensure SKU is unique.', 'error');
    }
  };

  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      price: product.price.toString(),
      stock_quantity: product.stock_quantity,
    });
    setErrors({});
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await productService.update(selectedProduct.id, formData);
      showToast('Product updated successfully!');
      setIsEditOpen(false);
      setSelectedProduct(null);
      fetchProducts(search);
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.detail || 'Failed to update product.', 'error');
    }
  };

  const handleDeleteClick = (product) => {
    setSelectedProduct(product);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await productService.delete(selectedProduct.id);
      showToast('Product removed successfully.');
      setIsDeleteOpen(false);
      setSelectedProduct(null);
      fetchProducts(search);
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.detail || 'Failed to delete product. It may be part of an order.', 'error');
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
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setFormData({ name: '', sku: '', price: '', stock_quantity: 0 });
            setErrors({});
            setIsAddOpen(true);
          }}
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {loading && products.length === 0 ? (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p style={{ color: 'var(--text-muted)' }}>Retrieving products database...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3 className="empty-title">No products found</h3>
          <p className="empty-desc">
            {search ? "No products matched your search term." : "Get started by adding your first product to the catalog."}
          </p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>SKU Code</th>
                <th>Unit Price</th>
                <th>Available Stock</th>
                <th style={{ width: '100px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td style={{ fontWeight: 600 }}>{product.name}</td>
                  <td>
                    <span style={{ fontFamily: 'monospace', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>
                      {product.sku}
                    </span>
                  </td>
                  <td style={{ fontWeight: 500, color: 'var(--secondary)' }}>
                    ${parseFloat(product.price).toFixed(2)}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>{product.stock_quantity} units</span>
                      <span className={`badge ${product.stock_quantity <= 10 ? 'badge-danger' : 'badge-success'}`}>
                        {product.stock_quantity <= 10 ? 'Low Stock' : 'In Stock'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
                      <button className="btn-icon" onClick={() => handleEditClick(product)} aria-label="Edit Product">
                        <Edit2 size={16} />
                      </button>
                      <button className="btn-icon btn-icon-danger" onClick={() => handleDeleteClick(product)} aria-label="Delete Product">
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

      {/* Add Product Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add New Product"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsAddOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAddSubmit}>Create Product</button>
          </>
        }
      >
        <form onSubmit={handleAddSubmit}>
          <div className="form-group">
            <label className="form-label">Product Name *</label>
            <input
              type="text"
              name="name"
              className="form-control"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            {errors.name && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.name}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">SKU *</label>
            <input
              type="text"
              name="sku"
              className="form-control"
              value={formData.sku}
              onChange={handleInputChange}
              placeholder="e.g. LAPTOP-PRO-15"
              required
            />
            {errors.sku && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.sku}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Price ($) *</label>
            <input
              type="number"
              name="price"
              step="0.01"
              className="form-control"
              value={formData.price}
              onChange={handleInputChange}
              required
            />
            {errors.price && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.price}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Initial Stock *</label>
            <input
              type="number"
              name="stock_quantity"
              className="form-control"
              value={formData.stock_quantity}
              onChange={handleInputChange}
              required
            />
            {errors.stock_quantity && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.stock_quantity}</span>}
          </div>
        </form>
      </Modal>

      {/* Edit Product Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Product"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsEditOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleEditSubmit}>Save Changes</button>
          </>
        }
      >
        <form onSubmit={handleEditSubmit}>
          <div className="form-group">
            <label className="form-label">Product Name *</label>
            <input
              type="text"
              name="name"
              className="form-control"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            {errors.name && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.name}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">SKU *</label>
            <input
              type="text"
              name="sku"
              className="form-control"
              value={formData.sku}
              onChange={handleInputChange}
              required
            />
            {errors.sku && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.sku}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Price ($) *</label>
            <input
              type="number"
              name="price"
              step="0.01"
              className="form-control"
              value={formData.price}
              onChange={handleInputChange}
              required
            />
            {errors.price && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.price}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Available Stock *</label>
            <input
              type="number"
              name="stock_quantity"
              className="form-control"
              value={formData.stock_quantity}
              onChange={handleInputChange}
              required
            />
            {errors.stock_quantity && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.stock_quantity}</span>}
          </div>
        </form>
      </Modal>

      {/* Delete Product Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Confirm Deletion"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsDeleteOpen(false)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleDeleteConfirm}>Delete Product</button>
          </>
        }
      >
        <p style={{ color: 'var(--text-light)', marginBottom: '0.5rem' }}>
          Are you sure you want to delete the product <strong>{selectedProduct?.name}</strong> (SKU: <code>{selectedProduct?.sku}</code>)?
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          This operation cannot be undone. You will not be able to delete the product if it is already referenced in customer orders.
        </p>
      </Modal>
    </div>
  );
};

export default Products;
