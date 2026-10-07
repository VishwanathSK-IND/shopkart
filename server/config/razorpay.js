import Razorpay from "razorpay";

let razorpay = null;

// Created lazily: ES module imports run before dotenv.config() in index.js,
// so the keys are not in process.env yet when this file is first loaded.
// Returns null when the keys are missing so callers can respond cleanly.
const getRazorpay = () => {
  const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;

  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    return null;
  }

  if (!razorpay) {
    razorpay = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });
  }

  return razorpay;
};

export default getRazorpay;
