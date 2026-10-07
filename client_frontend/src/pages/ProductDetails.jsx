import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getProduct } from "../services/api";
import { useCart } from "../context/CartContext";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const { addToCart, pendingItems, quantityById } = useCart();
  const [cartError, setCartError] = useState("");

  const inCart = quantityById[id] ?? 0;
  const isAdding = pendingItems[id] === "adding";

  const handleAddToCart = async () => {
    setCartError("");
    try {
      await addToCart(id);
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

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(false);
    setNotFound(false);

    getProduct(id)
      .then((res) => {
        if (isMounted) setProduct(res.data.product);
      })
      .catch((err) => {
        if (!isMounted) return;
        if (err.response?.status === 401) {
          navigate("/login", { replace: true });
        } else if (err.response?.status === 404 || err.response?.status === 400) {
          setNotFound(true);
        } else {
          setError(true);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-10">
        <Link to="/products" className="text-sm text-teal-600 hover:underline">
          ← Back to Products
        </Link>

        <div className="mt-4">
          {loading ? (
            <p className="text-sm text-gray-400">Loading product...</p>
          ) : error ? (
            <p className="text-sm text-red-500">
              Something went wrong while loading the product.
            </p>
          ) : notFound ? (
            <p className="text-sm text-gray-400">Product not found.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-8 bg-white rounded-2xl shadow-sm p-6">
              <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "https://placehold.co/500x500?text=No+Image";
                  }}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex flex-col">
                <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
                  {product.category}
                </p>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {product.name}
                </h1>
                <p className="text-2xl font-semibold text-teal-600 mt-3">
                  ₹{product.price.toLocaleString("en-IN")}
                </p>
                <p className="text-sm text-gray-500 mt-4 leading-relaxed">
                  {product.description}
                </p>
                <p
                  className={`text-sm mt-4 ${
                    product.stock > 0 ? "text-gray-500" : "text-red-500"
                  }`}
                >
                  {product.stock > 0
                    ? `${product.stock} units in stock`
                    : "Out of stock"}
                </p>
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={
                    product.stock === 0 ||
                    Boolean(pendingItems[id]) ||
                    inCart >= product.stock
                  }
                  className="mt-6 rounded-full bg-teal-600 text-white text-sm font-medium py-3 hover:bg-teal-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {product.stock === 0
                    ? "Out of Stock"
                    : isAdding
                    ? "Adding..."
                    : inCart >= product.stock
                    ? `Max in Cart (${inCart})`
                    : inCart > 0
                    ? "Add Another"
                    : "Add to Cart"}
                </button>
                {inCart > 0 && (
                  <Link
                    to="/cart"
                    className="mt-3 text-center text-sm text-teal-600 hover:underline"
                  >
                    {inCart} in your cart · View Cart
                  </Link>
                )}
                {cartError && (
                  <p className="mt-2 text-xs text-red-500 text-center" role="alert">
                    {cartError}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
