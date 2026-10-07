import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import OrderFallback from "../components/OrderFallback";
import OrderStatusBadge from "../components/OrderStatusBadge";
import useOrder from "../hooks/useOrder";
import { formatPrice } from "../utils/format";

export default function OrderSuccess() {
  const { id } = useParams();
  // Loaded from the backend so the page shows the saved order, and still works after a refresh.
  const { order, status, reload } = useOrder(id);
  const isPaid = order?.paymentStatus === "PAID";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-xl mx-auto px-4 py-12">
        {status !== "ready" ? (
          <OrderFallback status={status} onRetry={reload} />
        ) : (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <p className="text-5xl" aria-hidden="true">
              {isPaid ? "✅" : "⏳"}
            </p>
            <h1 className="text-xl font-semibold text-gray-900 mt-4">
              {isPaid ? "Order Placed Successfully" : "Payment not completed"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {isPaid
                ? "Your payment was verified and your order has been saved."
                : "This order has not been paid yet."}
            </p>

            <dl className="mt-6 text-sm text-left space-y-3 border-t border-gray-100 pt-6">
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Order ID</dt>
                <dd className="text-gray-900 font-mono text-xs break-all text-right">
                  {order._id}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Total</dt>
                <dd className="text-gray-900 font-semibold">
                  {formatPrice(order.totalAmount)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Status</dt>
                <dd>
                  <OrderStatusBadge order={order} />
                </dd>
              </div>
              {order.razorpayPaymentId && (
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">Payment ID</dt>
                  <dd className="text-gray-900 font-mono text-xs break-all text-right">
                    {order.razorpayPaymentId}
                  </dd>
                </div>
              )}
            </dl>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/orders"
                className="rounded-full bg-teal-600 text-white text-sm font-medium px-6 py-2.5 hover:bg-teal-700 transition"
              >
                View My Orders
              </Link>
              <Link
                to="/products"
                className="rounded-full border border-gray-200 text-gray-700 text-sm font-medium px-6 py-2.5 hover:bg-gray-50 transition"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
