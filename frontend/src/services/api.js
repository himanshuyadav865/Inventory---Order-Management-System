import axios from 'axios';

// Resolve backend API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Bypass-Tunnel-Reminder': 'true'
  },
});


export const dashboardService = {
  getStats: async () => {
    const response = await api.get('/dashboard');
    return response.data;
  },
};

export const productService = {
  getAll: async (search = '') => {
    const response = await api.get('/products', {
      params: search ? { search } : {},
    });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
  create: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },
  update: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },
  delete: async (id) => {
    await api.delete(`/products/${id}`);
  },
};

export const customerService = {
  getAll: async (search = '') => {
    const response = await api.get('/customers', {
      params: search ? { search } : {},
    });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },
  create: async (customerData) => {
    const response = await api.post('/customers', customerData);
    return response.data;
  },
  delete: async (id) => {
    await api.delete(`/customers/${id}`);
  },
};

export const orderService = {
  getAll: async () => {
    const response = await api.get('/orders');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },
  create: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },
  delete: async (id) => {
    await api.delete(`/orders/${id}`);
  },
};

export default api;
