import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";
import { getProducts, getWishlist } from "../services/api";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    getProducts()
      .then((res) => {
        const unique = [...new Set(res.data.products.map((p) => p.category))].sort();
        setCategories(unique);
      })
      .catch(() => {});

    // Mark already-saved products; if this fails, cards simply start as "Add".
    getWishlist()
      .then((res) => setWishlistIds(new Set(res.data.wishlist.map((p) => p._id))))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(false);

    const params = {};
    if (search.trim()) params.search = search.trim();
    if (category) params.category = category;

    const timeoutId = setTimeout(() => {
      getProducts(params)
        .then((res) => {
          if (isMounted) setProducts(res.data.products);
        })
        .catch((err) => {
          if (!isMounted) return;
          if (err.response?.status === 401) {
            navigate("/login", { replace: true });
          } else {
            setError(true);
          }
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [search, category, navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Products</h1>

          <div className="flex flex-wrap items-center gap-3">
            <SearchBar value={search} onChange={setSearch} />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-gray-400">Loading products...</p>
        ) : error ? (
          <p className="text-sm text-red-500">
            Something went wrong while loading products.
          </p>
        ) : products.length === 0 ? (
          <p className="text-sm text-gray-400">No products found.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                saved={wishlistIds.has(product._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
