import { formatPrice } from "../utils/format";

// Shared by Checkout (live cart) and Order Details (saved snapshot).
// items: [{ key, name, price, quantity, image }]
export default function OrderSummary({ items, total, children }) {
  return (
    <aside className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="text-base font-semibold text-gray-900">Order Summary</h2>

      <ul className="mt-4 divide-y divide-gray-100">
        {items.map(({ key, name, price, quantity, image }) => (
          <li key={key} className="flex items-center gap-3 py-3">
            <img
              src={image}
              alt=""
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "https://placehold.co/100x100?text=No+Image";
              }}
              className="w-12 h-12 rounded-lg object-cover bg-gray-100 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 truncate">{name}</p>
              <p className="text-xs text-gray-400">
                {formatPrice(price)} × {quantity}
              </p>
            </div>
            <p className="text-sm font-medium text-gray-900 whitespace-nowrap">
              {formatPrice(price * quantity)}
            </p>
          </li>
        ))}
      </ul>

      <div className="flex justify-between border-t border-gray-100 pt-4 mt-1">
        <span className="text-sm font-medium text-gray-900">Total</span>
        <span className="text-base font-semibold text-gray-900">
          {formatPrice(total)}
        </span>
      </div>

      {children}
    </aside>
  );
}
