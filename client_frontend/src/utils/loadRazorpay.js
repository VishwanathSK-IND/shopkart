const CHECKOUT_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

let scriptPromise = null;

// Loads Razorpay Standard Checkout once. Resolves true when window.Razorpay is
// ready, false if the script could not load (offline, blocked by an ad blocker...).
export default function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve(true);

  if (!scriptPromise) {
    scriptPromise = new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = CHECKOUT_SCRIPT_URL;
      script.async = true;

      script.onload = () => resolve(Boolean(window.Razorpay));
      script.onerror = () => {
        // Allow a retry on the next click instead of caching the failure.
        script.remove();
        scriptPromise = null;
        resolve(false);
      };

      document.body.appendChild(script);
    });
  }

  return scriptPromise;
}
