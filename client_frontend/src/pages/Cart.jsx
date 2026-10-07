import { useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import CartItem from "../components/CartItem";
import { useCart } from "../context/CartContext";

export default function Cart() {
  const { cartItems, loading, error, refreshCart, totalUnits, subtotal } =
    useCart();
  const navigate = useNavigate();

  const loadCart = useCallback(() => {
    refreshCart().then((status) => {
      if (status === "unauthorized") navigate("/login", { replace: true });
    });
  }, [refreshCart, navigate]);

  // Re-sync the shared cart on open so the latest price and stock are shown.
  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const hasStockIssue = cartItems.some(
    ({ product, quantity }) => quantity > product.stock
  );

  // Only show the full-page loader the first time; on later visits the
  // existing items stay visible while the refresh runs.
  const showLoading = loading && cartItems.length === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900">My Cart</h1>
          {!showLoading && !error && cartItems.length > 0 && (
            <p className="text-sm text-gray-400 mt-1">
              {totalUnits} {totalUnits === 1 ? "item" : "items"} in your cart
            </p>
          )}
        </div>

        {error ? (
          <div className="text-center py-16">
            <p className="text-base font-medium text-gray-900">
              Unable to load your cart.
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Please check your connection and try again.
            </p>
            <button
              type="button"
              onClick={loadCart}
              className="mt-5 rounded-full bg-teal-600 text-white text-sm font-medium px-6 py-2 hover:bg-teal-700 transition"
            >
              Try Again
            </button>
          </div>
        ) : showLoading ? (
          <p className="text-sm text-gray-400">Loading your cart...</p>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl" aria-hidden="true">
              🛒
            </p>
            <p className="text-base font-medium text-gray-900 mt-3">
              Your cart is empty
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Looks like you haven&apos;t added anything yet.
            </p>
            <Link
              to="/products"
              className="mt-5 inline-block rounded-full bg-teal-600 text-white text-sm font-medium px-6 py-2 hover:bg-teal-700 transition"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 flex flex-col gap-4">
              {cartItems.map((item) => (
                <CartItem key={item.product._id} item={item} />
              ))}
            </div>

            <aside className="bg-white rounded-2xl shadow-sm p-6 lg:sticky lg:top-6">
              <h2 className="text-base font-semibold text-gray-900">
                Order Summary
              </h2>

              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Items</dt>
                  <dd className="text-gray-900">{totalUnits}</dd>
                </div>
                <div className="flex justify-between border-t border-gray-100 pt-3">
                  <dt className="font-medium text-gray-900">Subtotal</dt>
                  <dd className="font-semibold text-gray-900">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </dd>
                </div>
              </dl>

              {hasStockIssue && (
                <p className="text-xs text-amber-600 mt-4">
                  Some items exceed available stock. Update them to continue.
                </p>
              )}

              <button
                type="button"
                onClick={() => navigate("/checkout")}
                disabled={hasStockIssue}
                className="mt-5 w-full rounded-full bg-teal-600 text-white text-sm font-medium py-3 hover:bg-teal-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Proceed to Checkout
              </button>

              <Link
                to="/products"
                className="mt-3 block text-center text-sm text-teal-600 hover:underline"
              >
                Continue Shopping
              </Link>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
