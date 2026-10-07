import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function CartItem({ item }) {
  const { product, quantity } = item;
  const { updateQuantity, removeFromCart, pendingItems } = useCart();
  const navigate = useNavigate();
  // Error for this row only; other rows are unaffected.
  const [error, setError] = useState("");

  const pending = pendingItems[product._id];
  const busy = Boolean(pending);
  const outOfStock = product.stock === 0;
  // Stock can drop after the item was added; the latest stock always wins.
  const overStock = quantity > product.stock;
  const lineTotal = product.price * quantity;

  const run = async (action) => {
    setError("");
    try {
      await action();
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login", { replace: true });
      } else {
        setError(
          err.response?.data?.message || "Unable to update cart. Please try again."
        );
      }
    }
  };

  const handleDecrease = () => {
    // If stock fell below the cart quantity, step straight down to what's available.
    const next = overStock ? product.stock : quantity - 1;
    run(() => updateQuantity(product._id, next));
  };

  const handleIncrease = () => {
    run(() => updateQuantity(product._id, quantity + 1));
  };

  const handleRemove = () => {
    run(() => removeFromCart(product._id));
  };

  return (
    <div
      className={`flex gap-4 bg-white rounded-2xl shadow-sm p-4 transition ${
        pending === "removing" ? "opacity-50" : ""
      }`}
    >
      <Link
        to={`/products/${product._id}`}
        className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-xl overflow-hidden bg-gray-100"
      >
        <img
          src={product.image}
          alt={product.name}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "https://placehold.co/500x500?text=No+Image";
          }}
          className="w-full h-full object-cover"
        />
      </Link>

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wide text-gray-400">
              {product.category}
            </p>
            <Link
              to={`/products/${product._id}`}
              className="block text-sm font-medium text-gray-900 truncate hover:text-teal-600"
            >
              {product.name}
            </Link>
            <p className="text-sm text-gray-500 mt-0.5">
              ₹{product.price.toLocaleString("en-IN")} each
            </p>
          </div>
          <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
            ₹{lineTotal.toLocaleString("en-IN")}
          </p>
        </div>

        {outOfStock ? (
          <p className="text-xs text-red-500 mt-1">
            Out of stock. Please remove this item.
          </p>
        ) : overStock ? (
          <p className="text-xs text-amber-600 mt-1">
            Only {product.stock} left in stock. Please reduce the quantity.
          </p>
        ) : (
          <p className="text-xs text-gray-400 mt-1">
            {product.stock} units available
          </p>
        )}

        <div className="mt-auto pt-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-full border border-gray-200">
              <button
                type="button"
                onClick={handleDecrease}
                disabled={busy || quantity <= 1 || outOfStock}
                aria-label={`Decrease quantity of ${product.name}`}
                className="w-8 h-8 rounded-full text-gray-600 hover:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed"
              >
                −
              </button>
              <span className="w-8 text-center text-sm font-medium text-gray-900">
                {quantity}
              </span>
              <button
                type="button"
                onClick={handleIncrease}
                disabled={busy || quantity >= product.stock}
                aria-label={`Increase quantity of ${product.name}`}
                className="w-8 h-8 rounded-full text-gray-600 hover:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
            {pending === "updating" && (
              <span className="text-xs text-gray-400">Updating...</span>
            )}
          </div>

          <button
            type="button"
            onClick={handleRemove}
            disabled={busy}
            className="text-sm font-medium text-red-500 hover:text-red-600 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {pending === "removing" ? "Removing..." : "Remove"}
          </button>
        </div>

        {error && (
          <p className="text-xs text-red-500 mt-2" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
