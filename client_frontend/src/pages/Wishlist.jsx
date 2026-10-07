import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import WishlistCard from "../components/WishlistCard";
import { getWishlist, removeFromWishlist } from "../services/api";

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [removeErrors, setRemoveErrors] = useState({});
  const navigate = useNavigate();

  const loadWishlist = useCallback(() => {
    setLoading(true);
    setError(false);

    getWishlist()
      .then((res) => setWishlist(res.data.wishlist))
      .catch((err) => {
        if (err.response?.status === 401) {
          navigate("/login", { replace: true });
        } else {
          setError(true);
        }
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const handleRemove = async (productId) => {
    if (removingId) return;
    setRemovingId(productId);
    setRemoveErrors((prev) => ({ ...prev, [productId]: null }));

    try {
      await removeFromWishlist(productId);
      setWishlist((prev) => prev.filter((p) => p._id !== productId));
    } catch (err) {
      const code = err.response?.status;
      if (code === 401) {
        navigate("/login", { replace: true });
      } else if (code === 404) {
        // Already gone on the server — keep the UI in sync.
        setWishlist((prev) => prev.filter((p) => p._id !== productId));
      } else {
        setRemoveErrors((prev) => ({
          ...prev,
          [productId]: "Unable to remove product. Please try again.",
        }));
      }
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900">My Wishlist</h1>
          {!loading && !error && (
            <p className="text-sm text-gray-400 mt-1">
              {wishlist.length} {wishlist.length === 1 ? "product" : "products"}{" "}
              saved
            </p>
          )}
        </div>

        {loading ? (
          <p className="text-sm text-gray-400">Loading your wishlist...</p>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-base font-medium text-gray-900">
              Something went wrong.
            </p>
            <p className="text-sm text-gray-500 mt-1">
              We couldn't load your wishlist.
            </p>
            <button
              type="button"
              onClick={loadWishlist}
              className="mt-5 rounded-full bg-teal-600 text-white text-sm font-medium px-6 py-2 hover:bg-teal-700 transition"
            >
              Try Again
            </button>
          </div>
        ) : wishlist.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl" aria-hidden="true">
              ❤️
            </p>
            <p className="text-base font-medium text-gray-900 mt-3">
              Your wishlist is empty
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Save products you love and find them here later.
            </p>
            <Link
              to="/products"
              className="mt-5 inline-block rounded-full bg-teal-600 text-white text-sm font-medium px-6 py-2 hover:bg-teal-700 transition"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {wishlist.map((product) => (
              <WishlistCard
                key={product._id}
                product={product}
                removing={removingId === product._id}
                error={removeErrors[product._id]}
                onRemove={handleRemove}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
