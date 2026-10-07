import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import CheckoutForm, {
  EMPTY_ADDRESS,
  validateShippingAddress,
} from "../components/CheckoutForm";
import OrderSummary from "../components/OrderSummary";
import { useCart } from "../context/CartContext";
import { createPaymentOrder, verifyPayment } from "../services/api";
import loadRazorpayScript from "../utils/loadRazorpay";
import { formatPrice } from "../utils/format";

// idle -> starting (load script + create order) -> paying (Razorpay popup open)
// -> verifying (backend checks the signature) -> navigate to success page.
const BUTTON_LABELS = {
  starting: "Starting payment...",
  paying: "Complete payment in the popup...",
  verifying: "Verifying payment...",
};

export default function Checkout() {
  const { cartItems, loading, error, refreshCart, subtotal, clearCart } =
    useCart();
  const navigate = useNavigate();

  // Form state lives here because only the checkout page needs it.
  const [address, setAddress] = useState(EMPTY_ADDRESS);
  const [fieldErrors, setFieldErrors] = useState({});
  const [step, setStep] = useState("idle");
  const [paymentError, setPaymentError] = useState("");

  const busy = step !== "idle";

  const loadCart = useCallback(() => {
    refreshCart().then((status) => {
      if (status === "unauthorized") navigate("/login", { replace: true });
    });
  }, [refreshCart, navigate]);

  // Always review the latest prices and stock before paying.
  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
    // Clear a field's error as soon as the user edits it.
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleRequestError = (err, fallback) => {
    if (err.response?.status === 401) {
      navigate("/login", { replace: true });
      return;
    }
    setPaymentError(err.response?.data?.message || fallback);
    setStep("idle");
  };

  // Called by Razorpay after a successful payment. This is NOT proof of
  // payment: the response is sent to the backend, which verifies the signature.
  const confirmPayment = async (shopKartOrderId, response) => {
    setStep("verifying");
    setPaymentError("");

    try {
      const res = await verifyPayment({
        shopKartOrderId,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
      });

      // Backend has cleared the saved cart; mirror that in global state so
      // the Navbar shows Cart (0) immediately, without a refresh.
      clearCart();
      navigate(`/order-success/${res.data.order._id}`, { replace: true });
    } catch (err) {
      handleRequestError(
        err,
        "We could not verify your payment. Your cart has not been cleared."
      );
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (busy) return;

    // Client-side validation first: no request is sent if this fails.
    const errors = validateShippingAddress(address);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setPaymentError("");
    setStep("starting");

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      setPaymentError(
        "Unable to load the payment gateway. Check your connection and try again."
      );
      setStep("idle");
      return;
    }

    const shippingAddress = Object.fromEntries(
      Object.entries(address).map(([key, value]) => [key, value.trim()])
    );

    let data;
    try {
      const res = await createPaymentOrder(shippingAddress);
      data = res.data;
    } catch (err) {
      handleRequestError(err, "Unable to place your order. Please try again.");
      // Stock or availability may have changed; show the latest cart.
      refreshCart({ silent: true });
      return;
    }

    // Amount and order id come from the backend, never from React state.
    const razorpay = new window.Razorpay({
      key: data.key,
      amount: data.amount,
      currency: data.currency,
      name: "ShopKart",
      description: "ShopKart Order",
      order_id: data.razorpayOrderId,
      prefill: {
        name: shippingAddress.fullName,
        contact: shippingAddress.phone,
      },
      theme: { color: "#0d9488" },
      handler: (response) => confirmPayment(data.shopKartOrderId, response),
      modal: {
        // User closed the popup without completing payment.
        ondismiss: () => {
          setStep("idle");
          setPaymentError(
            (prev) =>
              prev ||
              "Payment was cancelled. Your cart has not been cleared."
          );
        },
      },
    });

    // Razorpay keeps the popup open so the user can retry with another method.
    razorpay.on("payment.failed", (response) => {
      setPaymentError(
        `Payment failed: ${response.error.description} Your cart has not been cleared. Please try again.`
      );
    });

    setStep("paying");
    razorpay.open();
  };

  const hasStockIssue = cartItems.some(
    ({ product, quantity }) => quantity > product.stock
  );
  const showLoading = loading && cartItems.length === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-xl font-semibold text-gray-900 mb-6">Checkout</h1>

        {error ? (
          <div className="text-center py-16">
            <p className="text-base font-medium text-gray-900">
              Unable to load your cart.
            </p>
            <button
              type="button"
              onClick={loadCart}
              className="mt-5 rounded-full bg-teal-600 text-white text-sm font-medium px-6 py-2 hover:bg-teal-700 transition"
            >
              Try Again
            </button>
          </div>
        ) : showLoading ? (
          <p className="text-sm text-gray-400">Loading checkout...</p>
        ) : cartItems.length === 0 ? (
          // Covers opening /checkout directly with an empty cart.
          <div className="text-center py-16">
            <p className="text-base font-medium text-gray-900">
              Your cart is empty
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Add some products before checking out.
            </p>
            <Link
              to="/products"
              className="mt-5 inline-block rounded-full bg-teal-600 text-white text-sm font-medium px-6 py-2 hover:bg-teal-700 transition"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handlePlaceOrder}
            noValidate
            className="grid lg:grid-cols-3 gap-6 items-start"
          >
            <div className="lg:col-span-2">
              <CheckoutForm
                values={address}
                errors={fieldErrors}
                disabled={busy}
                onChange={handleChange}
              />
            </div>

            <div className="lg:sticky lg:top-6">
              <OrderSummary
                items={cartItems.map(({ product, quantity }) => ({
                  key: product._id,
                  name: product.name,
                  price: product.price,
                  quantity,
                  image: product.image,
                }))}
                total={subtotal}
              >
                {hasStockIssue && (
                  <p className="text-xs text-amber-600 mt-4">
                    Some items exceed available stock.{" "}
                    <Link to="/cart" className="underline">
                      Update your cart
                    </Link>{" "}
                    to continue.
                  </p>
                )}

                {paymentError && (
                  <p
                    className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mt-4"
                    role="alert"
                  >
                    {paymentError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={busy || hasStockIssue}
                  className="mt-5 w-full rounded-full bg-teal-600 text-white text-sm font-medium py-3 hover:bg-teal-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {BUTTON_LABELS[step] ?? `Place Order · Pay ${formatPrice(subtotal)}`}
                </button>

                <p className="text-xs text-gray-400 mt-3 text-center">
                  Payments are processed securely by Razorpay (Test Mode).
                </p>

                <Link
                  to="/cart"
                  className="mt-2 block text-center text-sm text-teal-600 hover:underline"
                >
                  Back to Cart
                </Link>
              </OrderSummary>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
