import { Link } from "react-router-dom";
import OrderStatusBadge from "./OrderStatusBadge";
import { formatDate, formatPrice, shortOrderId } from "../utils/format";

export default function OrderCard({ order }) {
  return (
    <article className="bg-white rounded-2xl shadow-sm p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">
            Order {shortOrderId(order._id)}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {formatDate(order.createdAt)}
          </p>
        </div>
        <OrderStatusBadge order={order} />
      </div>

      <ul className="mt-4 space-y-1">
        {order.items.map((item) => (
          <li key={item.product} className="text-sm text-gray-600">
            {item.name} × {item.quantity}
          </li>
        ))}
      </ul>

      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
        <p className="text-sm text-gray-500">
          Total:{" "}
          <span className="font-semibold text-gray-900">
            {formatPrice(order.totalAmount)}
          </span>
        </p>
        <Link
          to={`/orders/${order._id}`}
          className="rounded-full border border-gray-200 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          View Details
        </Link>
      </div>
    </article>
  );
}
