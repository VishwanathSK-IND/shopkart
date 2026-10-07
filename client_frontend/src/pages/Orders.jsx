import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import OrderCard from "../components/OrderCard";
import { getOrders } from "../services/api";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const loadOrders = useCallback(() => {
    setLoading(true);
    setError(false);

    getOrders()
      .then((res) => setOrders(res.data.orders))
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
    loadOrders();
  }, [loadOrders]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900">My Orders</h1>
          {!loading && !error && orders.length > 0 && (
            <p className="text-sm text-gray-400 mt-1">
              {orders.length} {orders.length === 1 ? "order" : "orders"}
            </p>
          )}
        </div>

        {loading ? (
          <p className="text-sm text-gray-400">Loading your orders...</p>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-base font-medium text-gray-900">
              Unable to load your orders.
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Please check your connection and try again.
            </p>
            <button
              type="button"
              onClick={loadOrders}
              className="mt-5 rounded-full bg-teal-600 text-white text-sm font-medium px-6 py-2 hover:bg-teal-700 transition"
            >
              Try Again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl" aria-hidden="true">
              📦
            </p>
            <p className="text-base font-medium text-gray-900 mt-3">
              You have not placed any orders yet.
            </p>
            <Link
              to="/products"
              className="mt-5 inline-block rounded-full bg-teal-600 text-white text-sm font-medium px-6 py-2 hover:bg-teal-700 transition"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
