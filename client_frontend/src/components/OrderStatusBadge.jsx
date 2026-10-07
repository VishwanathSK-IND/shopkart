const STYLES = {
  PLACED: "bg-teal-50 text-teal-700",
  CONFIRMED: "bg-blue-50 text-blue-700",
  SHIPPED: "bg-indigo-50 text-indigo-700",
  DELIVERED: "bg-green-50 text-green-700",
  PAYMENT_PENDING: "bg-amber-50 text-amber-700",
  PAYMENT_FAILED: "bg-red-50 text-red-600",
};

const LABELS = {
  PAYMENT_PENDING: "Payment pending",
  PAYMENT_FAILED: "Payment failed",
};

// Until payment is verified, the payment state is what matters to the user.
const getDisplayStatus = ({ paymentStatus, status }) => {
  if (paymentStatus === "FAILED") return "PAYMENT_FAILED";
  if (paymentStatus !== "PAID") return "PAYMENT_PENDING";
  return status;
};

export default function OrderStatusBadge({ order }) {
  const key = getDisplayStatus(order);

  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
        STYLES[key] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      {LABELS[key] ?? key}
    </span>
  );
}
