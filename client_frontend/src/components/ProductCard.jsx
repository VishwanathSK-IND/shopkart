import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { addToWishlist } from "../services/api";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product, saved = false }) {
  const inStock = product.stock > 0;
  const navigate = useNavigate();
  // "idle" | "saving" | "added" | "error"
  const [status, setStatus] = useState("idle");

  const isAdded = saved || status === "added";
  const isSaving = status === "saving";

  // Cart data comes from the shared CartContext, not a local copy.
  const { addToCart, pendingItems, quantityById } = useCart();
  const [cartError, setCartError] = useState("");
  const inCart = quantityById[product._id] ?? 0;
  const isAddingToCart = pendingItems[product._id] === "adding";
  const cartBusy = Boolean(pendingItems[product._id]);
  const atStockLimit = inStock && inCart >= product.stock;

  const handleAddToCart = async () => {
    if (cartBusy || !inStock || atStockLimit) return;
    setCartError("");

    try {
      await addToCart(product._id);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login", { replace: true });
      } else {
        setCartError(
          err.response?.data?.message || "Unable to add to cart. Please try again."
        );
      }
    }
  };

  const handleAddToWishlist = async () => {
    if (isSaving || isAdded) return;
    setStatus("saving");

    try {
      await addToWishlist(product._id);
      setStatus("added");
    } catch (err) {
      const code = err.response?.status;
      if (code === 401) {
        navigate("/login", { replace: true });
      } else if (code === 409) {
        // Already saved (e.g. from another tab) — treat as success.
        setStatus("added");
      } else {
        setStatus("error");
      }
    }
  };

  return (
    <div className="rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition flex flex-col">
      <div className="relative aspect-square bg-gray-100">
        <img
          src={product.image}
          alt={product.name}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "https://placehold.co/500x500?text=No+Image";
          }}
          className="w-full h-full object-cover"
        />
        <span
          className={`absolute top-3 right-3 text-lg ${
            isAdded ? "text-red-500" : "text-gray-400"
          }`}
          aria-hidden="true"
        >
          {isAdded ? "♥" : "♡"}
        </span>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
          {product.category}
        </p>
        <h3 className="text-sm font-medium text-gray-900 truncate">
          {product.name}
        </h3>
        <p className="text-sm font-semibold text-teal-600 mt-1">
          ₹{product.price.toLocaleString("en-IN")}
        </p>
        <p
          className={`text-xs mt-1 ${
            inStock ? "text-gray-400" : "text-red-500"
          }`}
        >
          {inStock ? `${product.stock} units left` : "Out of stock"}
        </p>
        <div className="mt-auto pt-3 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={cartBusy || !inStock || atStockLimit}
            className="rounded-full bg-teal-600 text-white text-sm font-medium py-2 hover:bg-teal-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {!inStock
              ? "Out of Stock"
              : isAddingToCart
              ? "Adding..."
              : atStockLimit
              ? `Max in Cart (${inCart})`
              : inCart > 0
              ? `Add Another (${inCart} in cart)`
              : "Add to Cart"}
          </button>
          {cartError && (
            <p className="text-xs text-red-500 text-center" role="alert">
              {cartError}
            </p>
          )}
          <Link
            to={`/products/${product._id}`}
            className="inline-flex items-center justify-center rounded-full border border-teal-600 text-teal-600 text-sm font-medium py-2 hover:bg-teal-50 transition"
          >
            View Details
          </Link>
          <button
            type="button"
            onClick={handleAddToWishlist}
            disabled={isSaving || isAdded}
            className={`rounded-full border text-sm font-medium py-2 transition disabled:cursor-not-allowed ${
              isAdded
                ? "border-red-200 bg-red-50 text-red-500"
                : "border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-60"
            }`}
          >
            {isSaving
              ? "⏳ Saving..."
              : isAdded
              ? "♥ Added to Wishlist"
              : "♡ Add to Wishlist"}
          </button>
          {status === "error" && (
            <p className="text-xs text-red-500 text-center" role="alert">
              Unable to save product. Please try again.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
