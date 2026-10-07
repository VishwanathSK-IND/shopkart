import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  addToCart as addToCartRequest,
  getCart,
  removeFromCart as removeFromCartRequest,
  updateCartQuantity as updateCartQuantityRequest,
} from "../services/api";

const CartContext = createContext(null);

// One shared source of truth for the cart. Navbar, Product Card, Cart Page and
// Order Summary all read from here instead of keeping their own copies.
export function CartProvider({ children }) {
  // Server state: always replaced with the cart returned by the backend.
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  // Per-item UI state: { [productId]: "adding" | "updating" | "removing" }.
  // Lets one cart row / product card show a spinner without blocking the rest.
  const [pendingItems, setPendingItems] = useState({});

  // Returns "ok" | "unauthorized" | "error" so pages can react (e.g. redirect).
  // `silent` re-syncs in the background without showing the loading state.
  const refreshCart = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setLoading(true);
      setError(false);
    }

    try {
      const res = await getCart();
      setCartItems(res.data.cart);
      setError(false);
      return "ok";
    } catch (err) {
      if (err.response?.status === 401) {
        // Not logged in: there is no cart to show, but that is not an error.
        setCartItems([]);
        return "unauthorized";
      }
      if (!silent) setError(true);
      return "error";
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  // Load the cart once when the app starts (covers page refresh).
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // Every mutation goes through here: mark the item as pending, call the API,
  // then replace global state with the cart the server returns. Errors are
  // re-thrown so the calling component can show its own message.
  const mutateCart = useCallback(
    async (productId, action, request) => {
      setPendingItems((prev) => ({ ...prev, [productId]: action }));

      try {
        const res = await request();
        setCartItems(res.data.cart);
        return res.data.cart;
      } catch (err) {
        // 404 means our copy is out of date (product deleted or already
        // removed in another tab), so re-sync with the server.
        if (err.response?.status === 404) {
          refreshCart({ silent: true });
        }
        throw err;
      } finally {
        setPendingItems((prev) => {
          const next = { ...prev };
          delete next[productId];
          return next;
        });
      }
    },
    [refreshCart]
  );

  const addToCart = useCallback(
    (productId) => mutateCart(productId, "adding", () => addToCartRequest(productId)),
    [mutateCart]
  );

  const updateQuantity = useCallback(
    (productId, quantity) =>
      mutateCart(productId, "updating", () =>
        updateCartQuantityRequest(productId, quantity)
      ),
    [mutateCart]
  );

  const removeFromCart = useCallback(
    (productId) =>
      mutateCart(productId, "removing", () => removeFromCartRequest(productId)),
    [mutateCart]
  );

  // Used on logout so the next user never sees the previous user's cart.
  const clearCart = useCallback(() => {
    setCartItems([]);
    setPendingItems({});
    setError(false);
  }, []);

  // Derived values: calculated from cartItems, never stored separately,
  // so they can never disagree with the items themselves.
  const { totalUnits, subtotal, quantityById } = useMemo(() => {
    let units = 0;
    let total = 0;
    const byId = {};

    for (const { product, quantity } of cartItems) {
      units += quantity;
      total += product.price * quantity;
      byId[product._id] = quantity;
    }

    return { totalUnits: units, subtotal: total, quantityById: byId };
  }, [cartItems]);

  const value = {
    cartItems,
    loading,
    error,
    pendingItems,
    itemCount: cartItems.length,
    totalUnits,
    subtotal,
    quantityById,
    refreshCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside a CartProvider");
  }

  return context;
}
