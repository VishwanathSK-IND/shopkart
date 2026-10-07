import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import OrderFallback from "../components/OrderFallback";
import OrderStatusBadge from "../components/OrderStatusBadge";
import OrderSummary from "../components/OrderSummary";
import useOrder from "../hooks/useOrder";
import { formatDate, shortOrderId } from "../utils/format";

export default function OrderDetails() {
  const { id } = useParams();
  const { order, status, reload } = useOrder(id);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-10">
        <Link to="/orders" className="text-sm text-teal-600 hover:underline">
          ← My Orders
        </Link>

        {status !== "ready" ? (
          <div className="mt-6">
            <OrderFallback status={status} onRetry={reload} />
          </div>
        ) : (
          <>
            <div className="mt-4 mb-6 flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Order {shortOrderId(order._id)}
                </h1>
                <p className="text-sm text-gray-400 mt-1">
                  Placed on {formatDate(order.createdAt)}
                </p>
              </div>
              <OrderStatusBadge order={order} />
            </div>

            <div className="grid lg:grid-cols-3 gap-6 items-start">
              <div className="lg:col-span-2">
                {/* Purchase-time snapshot: these prices never change with the Product. */}
                <OrderSummary
                  items={order.items.map((item) => ({
                    key: item.product,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.image,
                  }))}
                  total={order.totalAmount}
                />
              </div>

              <div className="flex flex-col gap-6">
                <section className="bg-white rounded-2xl shadow-sm p-6">
                  <h2 className="text-base font-semibold text-gray-900">
                    Shipping Address
                  </h2>
                  <address className="not-italic text-sm text-gray-600 mt-3 space-y-0.5">
                    <p className="text-gray-900 font-medium">
                      {order.shippingAddress.fullName}
                    </p>
                    <p>{order.shippingAddress.addressLine1}</p>
                    <p>
                      {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                      {order.shippingAddress.pincode}
                    </p>
                    <p>Phone: {order.shippingAddress.phone}</p>
                  </address>
                </section>

                <section className="bg-white rounded-2xl shadow-sm p-6">
                  <h2 className="text-base font-semibold text-gray-900">Payment</h2>
                  <dl className="text-sm mt-3 space-y-2">
                    <div className="flex justify-between gap-4">
                      <dt className="text-gray-500">Status</dt>
                      <dd className="text-gray-900">{order.paymentStatus}</dd>
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
                </section>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
