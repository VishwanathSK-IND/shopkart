import { Link } from "react-router-dom";

// Loading / not-found / error screens shared by the single-order pages.
export default function OrderFallback({ status, onRetry }) {
  if (status === "loading") {
    return <p className="text-sm text-gray-400">Loading order...</p>;
  }

  return (
    <div className="text-center py-16">
      <p className="text-base font-medium text-gray-900">
        {status === "not-found" ? "Order not found." : "Unable to load this order."}
      </p>
      <div className="mt-5 flex justify-center gap-3">
        {status === "error" && (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-full bg-teal-600 text-white text-sm font-medium px-6 py-2 hover:bg-teal-700 transition"
          >
            Try Again
          </button>
        )}
        <Link
          to="/orders"
          className="rounded-full border border-gray-200 text-gray-700 text-sm font-medium px-6 py-2 hover:bg-gray-50 transition"
        >
          My Orders
        </Link>
      </div>
    </div>
  );
}
