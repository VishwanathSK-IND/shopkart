export const formatPrice = (amount) => `₹${amount.toLocaleString("en-IN")}`;

export const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

// Short, readable order reference, e.g. #A1B2C3D4.
export const shortOrderId = (id) => `#${id.slice(-8).toUpperCase()}`;
