import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  withCredentials: true,
});

export const registerCustomer = (data) => api.post("/customers/register", data);

export const loginCustomer = (data) => api.post("/customers/login", data);

export const getCurrentCustomer = () => api.get("/customers/me");

export const logoutCustomer = () => api.post("/customers/logout");

export const getProducts = (params) => api.get("/products", { params });

export const getProduct = (id) => api.get(`/products/${id}`);

export const getWishlist = () => api.get("/wishlist");

export const addToWishlist = (productId) => api.post(`/wishlist/${productId}`);

export const removeFromWishlist = (productId) =>
  api.delete(`/wishlist/${productId}`);

export const getCart = () => api.get("/cart");

export const addToCart = (productId) => api.post(`/cart/${productId}`);

export const updateCartQuantity = (productId, quantity) =>
  api.patch(`/cart/${productId}`, { quantity });

export const removeFromCart = (productId) => api.delete(`/cart/${productId}`);

// Only the shipping address is sent. Items and the total are read from the
// server-side cart, so nothing price-related is trusted from the browser.
export const createPaymentOrder = (shippingAddress) =>
  api.post("/orders/create-payment-order", { shippingAddress });

export const verifyPayment = (data) => api.post("/orders/verify-payment", data);

export const getOrders = () => api.get("/orders");

export const getOrder = (id) => api.get(`/orders/${id}`);

export default api;
